from twilio.rest import Client
import os
from dotenv import load_dotenv

load_dotenv()

# This will pull the Twilio credentials from the .env file, which is not included in version control for security reasons.
account_sid = os.getenv('TWILIO_ACCOUNT_SID')
auth_token = os.getenv('TWILIO_AUTH_TOKEN')
twilio_number = os.getenv('TWILIO_PHONE_NUMBER')

# One time password (OTP) sending function, which is utilizing  the Twilio API to send SMS messages. 
def send_otp_sms(to_phone_number, otp_code):
    try:
        client = Client(account_sid, auth_token)
        
        message = client.messages.create(
            body=f"Your MFA verification code is: {otp_code}. This code expires in 5 minutes.",
            from_=twilio_number,
            to=to_phone_number
        )
        
        print(f"SMS sent successfully. Message SID: {message.sid}")
        return True
    
    # Logs any exceptions that occur during the SMS sending process.
    except Exception as e:
        print(f"Failed to send SMS: {e}")
        return False



