import sqlite3
import os

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DATABASE_PATH = os.path.join(BASE_DIR, '..', 'database', 'mfa.db')

# This audit log will collect all the important secruity events that occur in the application.
def log_event(event_type, success, user_id=None, ip_address=None):
    try:
        conn = sqlite3.connect(DATABASE_PATH)
        cursor = conn.cursor()

        # Parameterized query to prevent SQL injection attacks. Input goes through the query parameters instead of being directly concatenated into the SQL string.
        cursor.execute('''
            INSERT INTO audit_log (user_id, event_type, ip_address, success)
            VALUES (?, ?, ?, ?)
        ''', (user_id, event_type, ip_address, 1 if success else 0))
        
        conn.commit()
        conn.close()
        
    # Print logging failures.
    except Exception as e:
        print(f"Audit log error: {e}")