import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
import os
from dotenv import load_dotenv

load_dotenv()

smtp_password = os.getenv('SMTP_PASSWORD')
smtp_email = os.getenv('SMTP_EMAIL')

# This function sends an email notification to the user with the provided subject and body.
def send_login_notification(to_email, username):
    try:
        msg = MIMEMultipart()
        msg['From'] = smtp_email
        msg['To'] = to_email
        msg['Subject'] = "MFA System || Successful Login Detected"

        body = f"""
            Hello {username},

            A successful login to your account was detected. If this was you, you can safely ignore this message. If this was not you, please take immediate action to secure your account.
            """
        msg.attach(MIMEText(body, 'plain'))

        # Port 587 is the default port for sending emails using SMTP with STARTTLS encryption.
        server = smtplib.SMTP('smtp.gmail.com', 587)
        server.starttls()
        server.login(smtp_email, smtp_password)
        text = msg.as_string()
        server.sendmail(smtp_email, to_email, text)
        server.quit()

        print(f"Login notification email sent successfully to {to_email}.")
        return True

    # Logs any exceptions that occur during the email sending process.
    except Exception as e:
        print(f"Error sending email: {e}")
        return False
    
# This function sends an email containing the one-time password (OTP) to the user for verification purposes.
def send_otp_email(to_email, otp_code):
    try:
        msg = MIMEMultipart()
        msg['From'] = smtp_email
        msg['To'] = to_email
        msg['Subject'] = "MFA System - Your Verification Code"

        body = f""" Hello, Your one-time verification code is: {otp_code} This code expires in 5 minutes. Do not share it with anyone. If you did not request this code, someone may be attempting to access your account.
        - MFA Security System """

        msg.attach(MIMEText(body, 'plain'))

        server = smtplib.SMTP('smtp.gmail.com', 587)
        server.starttls()
        server.login(smtp_email, smtp_password)
        server.sendmail(smtp_email, to_email, msg.as_string())
        server.quit()

        print(f"OTP email sent successfully to {to_email}")
        return True

    except Exception as e:
        print(f"Error sending OTP email: {e}")
        return False