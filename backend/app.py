from flask import Flask, request, jsonify, session
from flask_cors import CORS
from dotenv import load_dotenv
from datetime import datetime, timedelta
import os

# Module imports
from database import get_db, init_db
from auth import hash_password, verify_password, generate_otp, get_otp_expiration, is_otp_expired
from sms import send_otp_sms
from email_notify import send_login_notification
from audit import log_event

# Load environment variables from .env file
load_dotenv

app = Flask(__name__)

# Secret key for session management through Flask sessions.
app.secret_key = os.getenv('FLASK_SECRET_KEY', 'fallback_dev_key')

# CORS lets the frontend communicate with the backend.
CORS(app, supports_credentials=True)

# Maximum number of failed login attempts before lockout and lockout duration in minutes.
MAX_FAILED_ATTEMPTS = 6
LOCKOUT_MINUTES = 20