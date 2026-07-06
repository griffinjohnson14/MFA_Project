# MFA System

This repository is for my MFA project, built for CSC154 during the summer of 2026. The goal of the project was to create a working example of multi-factor authentication and show some of the core security ideas covered in class. The app uses a two-step login process where a user signs in with a username and password, then receives a one-time password by email to verify their identity before being allowed into the dashboard.

## About the Project

This project is meant to show a few important security concepts in a simple, easy-to-follow way. It includes password hashing, one-time passwords, account lockouts after repeated failed attempts, session-based authentication, audit logging, and HTTPS support.

## What the Project Includes

- User registration with bcrypt password hashing so plain-text passwords are never stored
- Two-factor login through a password check followed by OTP verification
- One-time passwords that expire after 5 minutes and can only be used once
- Account lockout after 6 failed login attempts, with a 20-minute lockout period
- Audit logging for login attempts, successes, failures, and logouts
- Email notifications for successful logins and OTP delivery
- Parameterized SQL queries to help prevent SQL injection
- HTTPS support through a self-signed certificate for local development

## Tech Stack

- Frontend: React
- Backend: Flask
- Database: SQLite
- Security: bcrypt, Flask sessions, HTTPS/SSL
- Email: SMTP through Gmail

## Project Structure

```text
backend/
  app.py
  auth.py
  database.py
  email_notify.py
  sms.py
  audit.py
frontend/
  src/
    App.js
    Login.jsx
    Register.jsx
    VerifyOTP.jsx
    Dashboard.jsx
```

## Prerequisites

Before running the project, make sure you have:

- Python 3.8 or higher
- Node.js and npm
- A Gmail account with 2-Step Verification enabled
- A Gmail app password for SMTP

## Backend Setup

### 1. Clone the repository

```bash
git clone https://github.com/griffinjohnson14/MFA_Project.git
cd MFA_Project
```

### 2. Create and activate a Python virtual environment

```bash
cd backend
python -m venv .venv
```

Windows:

```powershell
.venv\Scripts\activate
```

macOS/Linux:

```bash
source .venv/bin/activate
```

### 3. Install the backend dependencies

```bash
pip install flask flask-cors bcrypt python-dotenv pyopenssl
```

### 4. Create the .env file

Create a file called `.env` inside the backend folder with the following contents:

```env
FLASK_SECRET_KEY=your_secret_key_here
SMTP_EMAIL=your_gmail@gmail.com
SMTP_PASSWORD=your_gmail_app_password
```

> The SMTP password should be a Gmail app password, not your normal Gmail password.

### 5. Generate a local HTTPS certificate

From inside the backend folder, run:

```bash
python -c "
from OpenSSL import crypto
k = crypto.PKey()
k.generate_key(crypto.TYPE_RSA, 2048)
cert = crypto.X509()
cert.get_subject().CN = 'localhost'
cert.set_serial_number(1)
cert.gmtime_adj_notBefore(0)
cert.gmtime_adj_notAfter(365*24*60*60)
cert.set_issuer(cert.get_subject())
cert.set_pubkey(k)
cert.sign(k, 'sha256')
open('cert.pem', 'wb').write(crypto.dump_certificate(crypto.FILETYPE_PEM, cert))
open('key.pem', 'wb').write(crypto.dump_privatekey(crypto.FILETYPE_PEM, k))
print('Done')
"
```

### 6. Start the Flask backend

```bash
python app.py
```

The backend should start at:

```text
https://127.0.0.1:5000
```

Before using the frontend, open that URL once in your browser and accept the self-signed certificate warning.

## Frontend Setup

### 1. Install the frontend dependencies

Open a second terminal and run:

```bash
cd ../frontend
npm install
```

### 2. Start the React frontend

```bash
npm start
```

The app should open at:

```text
http://localhost:3000
```

## How to Use the App

1. Open the app in your browser.
2. Click Register here and create an account.
3. Sign in with your username and password.
4. Check your email for the one-time password.
5. Enter the code on the verification screen.
6. If everything works, you will be taken to the dashboard.

## Notes

- The current MFA flow is email-based.
- The backend uses SQLite to store users and OTP data.
- Parameterized queries are used to help reduce the risk of SQL injection.
- If the certificate files are not present, the backend will still run, but without HTTPS.

## AI Usage Disclosure

I used AI throughout the development of this project, mainly for help with code generation, debugging, and cleaning up the structure of the project. I reviewed and adjusted the generated code myself before implementing it, and I made sure the security decisions and final design still matched the course material and the requirements of the assignment.

The AI assistance was used roughly as follows:
- About 65% for code generation
- About 20% for debugging
- About 15% for design and documentation help

## Final Note

This project was a fun way for me to build something practical while also showing the security ideas we talked about in class. I cleaned up the code, tested the flow, and made sure the project was easy to understand and follow.
