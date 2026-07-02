import bcrypt
import random
import string
from datetime import datetime, timedelta


# Bcrypt instead of SHA-256 to make it computationally expensive for attackers to brute-force passwords that may have been stolen from the database.
# We are using a slow hash intentionally to make it harder for attackers to guess passwords.
def hash_password(plain_password):
    salt = bcrypt.gensalt()
    hashed = bcrypt.hashpw(plain_password.encode('utf-8'), salt)
    return hashed.decode('utf-8')

def verify_password(plain_password, stored_hash):
    return bcrypt.checkpw(plain_password.encode('utf-8'), stored_hash.encode('utf-8'))



# Makes a one time password as a string of 6 digits for the 2FA.
def generate_otp():
    return ''.join(random.choices(string.digits, k=6))


# The one time passwords expire after 5 minutes to enhance security and reduce the risk of unauthorized access and to ensure that users are actively engaged in the authentication process.
def get_otp_expiration():
    expiration_time = datetime.utcnow() + timedelta(minutes=5)
    return expiration_time.strftime('%Y-%m-%d %H:%M:%S')

# Checks to see if the one time password has expired by comparing the current UTC time with the expiration time of the OTP.
def is_otp_expired(expires_at_str):
    expires_at = datetime.strptime(expires_at_str, '%Y-%m-%d %H:%M:%S')
    return datetime.utcnow() > expires_at