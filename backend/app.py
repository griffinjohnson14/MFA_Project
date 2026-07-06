from flask import Flask, request, jsonify, session
from flask_cors import CORS
from dotenv import load_dotenv
from datetime import datetime, timedelta
import os

# Module imports
from database import get_db, init_db
from auth import hash_password, verify_password, generate_otp, get_otp_expiration, is_otp_expired
from sms import send_otp_sms
from email_notify import send_login_notification, send_otp_email
from audit import log_event

# Load environment variables from .env file
load_dotenv()

app = Flask(__name__)

# Secret key for session management through Flask sessions.
app.secret_key = os.getenv('FLASK_SECRET_KEY', 'fallback_dev_key')
app.config['SESSION_COOKIE_SAMESITE'] = 'None'
app.config['SESSION_COOKIE_SECURE'] = True
app.config['SESSION_COOKIE_HTTPONLY'] = True

# CORS lets the frontend communicate with the backend.
CORS(app, resources={r"/*": {"origins": ["http://localhost:3000", "http://127.0.0.1:3000", "https://localhost:3000", "https://127.0.0.1:3000"]}}, supports_credentials=True)

# Maximum number of failed login attempts before lockout and lockout duration in minutes.
MAX_FAILED_ATTEMPTS = 6
LOCKOUT_MINUTES = 20

# Registration endpoint, client sends username, password, and phone number. Password is hashed before storing in the database.
@app.route('/register', methods=['POST'])
def register():
    data = request.get_json()

    username = data.get('username')
    password = data.get('password')
    phone = data.get('phone')
    email = data.get('email')

    # Validation to make sure all required fields are provided.
    if not all([username, password, phone, email]):
        return jsonify({'error': 'All fields are required'}), 400

    try:
        conn = get_db()
        cursor = conn.cursor()

        # Check if the username already exists in the database. Parameterized query to prevent SQL injection.
        cursor.execute('SELECT id FROM users WHERE username = ?', (username,))
        if cursor.fetchone():
            conn.close()
            return jsonify({'error': 'Username already exists'}), 409
        
        # Password is hashed before storing in the database for security.
        password_hash = hash_password(password)

        cursor.execute('INSERT INTO users (username, password_hash, phone, email) VALUES (?, ?, ?, ?)', (username, password_hash, phone, email))

        # Log the registration event for auditing purposes.
        user_id = cursor.lastrowid
        conn.commit() 
        conn.close()

        log_event('REGISTER', True, user_id=user_id, ip_address=request.remote_addr)

        return jsonify({'message': 'Registration successful'}), 201

    except Exception as e:
        print(f"Registration error: {e}")
        return jsonify({'error': 'Registration failed'}), 500
    
# Username and password are checked; if valid, an OTP is generated and sent to the user's email.
@app.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    username = data.get('username')
    password = data.get('password')

    if not all([username, password]):
        return jsonify({'error': 'Username and password are required'}), 400

    try:
        conn = get_db()
        cursor = conn.cursor()

        # Parameterized query to prevent SQL injection. Fetch user details based on the provided username.
        cursor.execute('SELECT * FROM users WHERE username = ?', (username,))
        user = cursor.fetchone()

        if not user:
            log_event('LOGIN_FAIL', False, ip_address=request.remote_addr)
            return jsonify({'error': 'Invalid credentials'}), 401
        
        # Check if the user is currently locked out due to too many failed login attempts.
        if user['locked_until']:
            locked_until = datetime.strptime(user['locked_until'], '%Y-%m-%d %H:%M:%S')
            if datetime.utcnow() < locked_until:
                log_event('LOGIN_FAIL', False, user_id=user['id'], ip_address=request.remote_addr)
                return jsonify({'error': f'Account locked. Try again after {user["locked_until"]}'}), 423

        # Verify the provided password against the stored hashed password.
        if not verify_password(password, user['password_hash']):
            # Increment failed attempts counter.
            new_attempts = user['failed_attempts'] + 1
            
            if new_attempts >= MAX_FAILED_ATTEMPTS:
                # Lock account for LOCKOUT_MINUTES.
                locked_until = (datetime.utcnow() + timedelta(minutes=LOCKOUT_MINUTES)).strftime('%Y-%m-%d %H:%M:%S')
                cursor.execute('UPDATE users SET failed_attempts = ?, locked_until = ? WHERE id = ?', (new_attempts, locked_until, user['id']))
                log_event('ACCOUNT_LOCKED', False, user_id=user['id'], ip_address=request.remote_addr)
            else:
                cursor.execute('UPDATE users SET failed_attempts = ? WHERE id = ?', (new_attempts, user['id']))
                log_event('LOGIN_FAIL', False, user_id=user['id'], ip_address=request.remote_addr)

            conn.commit()
            conn.close()
            return jsonify({'error': 'Invalid credentials'}), 401
        
        # If the password is correct, generate an OTP and store it in the database with a 5-minute expiration.
        # Reset failed attempts counter and clear any lockout status.
        otp_code = generate_otp()
        expires_at = get_otp_expiration()

        cursor.execute('INSERT INTO otp_codes (user_id, code, expires_at) VALUES (?, ?, ?)', (user['id'], otp_code, expires_at))
        cursor.execute('UPDATE users SET failed_attempts = 0, locked_until = NULL WHERE id = ?', (user['id'],))

        conn.commit()
        conn.close()

        # Send the OTP to the user's email address for verification.
        send_otp_email(user['email'], otp_code)
        log_event('OTP_SENT', True, user_id=user['id'], ip_address=request.remote_addr)

        # User ID is stored in the session to track the user during the OTP verification step.
        session['awaiting_user_id'] = user['id']
        session['awaiting_username'] = user['username']

        return jsonify({'message': 'A OTP has been sent to your registered email address'}), 200

    except Exception as e:
        print(f"Login error: {e}")
        return jsonify({'error': 'Login failed'}), 500
    

# OTP verification endpoint, client sends the OTP received via email. If the OTP is valid and not expired, the user is logged in successfully.
@app.route('/verify-otp', methods=['POST'])
def verify_otp():
    data = request.get_json()
    otp_submitted = data.get('otp')

    # Checks that the user actually completed step 1 first.
    if 'awaiting_user_id' not in session:
        return jsonify({'error': 'No active login session. Please login first.'}), 401

    user_id = session['awaiting_user_id']
    username = session['awaiting_username']

    if not otp_submitted:
        return jsonify({'error': 'OTP code is required'}), 400

    try:
        conn = get_db()
        cursor = conn.cursor()

        # Grabs the most recent OTP for the user from the database to verify against the submitted OTP.
        cursor.execute('SELECT * FROM otp_codes WHERE user_id = ? AND used = 0 ORDER BY created_at DESC LIMIT 1', (user_id,))

        otp_record = cursor.fetchone()

        if not otp_record:
            conn.close()
            return jsonify({'error': 'No valid OTP found. Please login again.'}), 401
        
        # Check if the OTP has expired.
        if is_otp_expired(otp_record['expires_at']):
            log_event('OTP_EXPIRED', False, user_id=user_id, ip_address=request.remote_addr)
            conn.close()
            return jsonify({'error': 'OTP has expired. Please login again.'}), 401

        # Check if the submitted OTP matches the one stored in the database.
        if otp_submitted != otp_record['code']:
            log_event('LOGIN_FAIL', False, user_id=user_id, ip_address=request.remote_addr)
            conn.close()
            return jsonify({'error': 'Invalid OTP code'}), 401

        # Mark the OTP as used in the database to prevent reuse and replay attacks.
        cursor.execute('UPDATE otp_codes SET used = 1 WHERE id = ?', (otp_record['id'],))

        conn.commit()

        # Gets the user's email from the database to send a login notification.
        cursor.execute('SELECT email FROM users WHERE id = ?', (user_id,))
        user = cursor.fetchone()
        conn.close()

        # Sends a login notification email to the user.
        send_login_notification(user['email'], username)

        # Logs the successful login event for auditing purposes.
        log_event('LOGIN_SUCCESS', True, user_id=user_id, ip_address=request.remote_addr)

        # Clear session keys for awaiting user and mark user as authenticated.
        session.pop('awaiting_user_id', None)
        session.pop('awaiting_username', None)
        session['user_id'] = user_id
        session['username'] = username
        session['authenticated'] = True

        return jsonify({ 'message': f'Welcome {username}! You have logged in.', 'username': username}), 200

    except Exception as e:
        print(f"OTP verification error: {e}")
        return jsonify({'error': 'Verification failed'}), 500


# Access Granted endpoint, only accessible to authenticated users. Returns a welcome message with the username.
@app.route('/dashboard', methods=['GET'])
def dashboard():
    if not session.get('authenticated'):
        return jsonify({'error': 'Access denied. Please log in.'}), 401

    return jsonify({
        'message': f'Welcome to the dashboard, {session["username"]}!',
        'status': 'authenticated'
    }), 200


# Logout endpoint, clears the session and logs the logout event for auditing purposes.
@app.route('/logout', methods=['POST'])
def logout():
    username = session.get('username', 'Unknown')
    user_id = session.get('user_id')

    session.clear()

    log_event('LOGOUT', True, user_id=user_id, ip_address=request.remote_addr)

    return jsonify({'message': 'Logged out successfully'}), 200

# Start the Flask application, initializing the database if it doesn't exist. Sets the application to run in debug mode on port 5000.
if __name__ == '__main__':
    init_db()
    app.run(debug=True, port=5000, ssl_context=('cert.pem', 'key.pem'))