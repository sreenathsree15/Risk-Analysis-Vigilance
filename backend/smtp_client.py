import os
import smtplib
import json
import logging
import time
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart

# Standard logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("SMTP_Client")

# Retrieve configuration from environment variables
SMTP_HOST = os.getenv("SMTP_HOST", "")
SMTP_PORT = int(os.getenv("SMTP_PORT", "587"))
SMTP_USERNAME = os.getenv("SMTP_USERNAME", "")
SMTP_PASSWORD = os.getenv("SMTP_PASSWORD", "")
SMTP_FROM_EMAIL = os.getenv("SMTP_FROM_EMAIL", "no-reply@vigilance.gov.in")

OUTBOX_FILE = "local_email_outbox.json"

def send_reset_email(to_email: str, reset_link: str) -> bool:
    """
    Sends a password reset email using standard smtplib.
    If no SMTP host is configured, falls back to a clean mock mode logging out to a local JSON file.
    """
    subject = "Vigilance Monitoring System - Password Reset Request"
    body_text = f"""
Hello,

A password reset request was initiated for your Vigilance Monitoring System account.
Please click the link below to reset your password. This link is valid for 1 hour.

Reset Link: {reset_link}

If you did not make this request, please ignore this email.

Secure Access System,
Government Department of Vigilance
"""

    body_html = f"""
<html>
  <body style="font-family: sans-serif; color: #1e293b; line-height: 1.6; max-width: 500px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; rounded: 8px;">
    <div style="text-align: center; border-bottom: 2px solid #3b82f6; padding-bottom: 12px; margin-bottom: 20px;">
      <h2 style="color: #1e3a8a; margin: 0;">Vigilance Monitoring System</h2>
      <span style="font-size: 11px; font-weight: bold; color: #2563eb; text-transform: uppercase; letter-spacing: 0.05em;">Secure Outbox Notification</span>
    </div>
    <p>Hello,</p>
    <p>A password reset request was initiated for your account. Please click the button below to reset your password (valid for 1 hour):</p>
    <div style="text-align: center; margin: 24px 0;">
      <a href="{reset_link}" style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; font-weight: bold; border-radius: 6px; font-size: 14px; display: inline-block;">Reset Password</a>
    </div>
    <p style="font-size: 12px; color: #64748b;">Or copy and paste this URL into your browser:</p>
    <p style="font-size: 11px; font-family: monospace; background-color: #f1f5f9; padding: 8px; border-radius: 4px; word-break: break-all; color: #475569;">{reset_link}</p>
    <hr style="border: 0; border-top: 1px solid #f1f5f9; margin: 24px 0;" />
    <p style="font-size: 11px; color: #94a3b8; text-align: center;">Secure Access System &bull; Government Department of Vigilance</p>
  </body>
</html>
"""

    # If no SMTP_HOST is defined, write mail content to local JSON file for easy developer inspection
    if not SMTP_HOST:
        logger.info("[MOCK MODE] SMTP_HOST is not configured. Saving password reset link to local outbox log.")
        
        email_record = {
            "to": to_email,
            "subject": subject,
            "reset_link": reset_link,
            "body_text": body_text,
            "timestamp": int(time.time())
        }

        # Handle appending/creating local JSON database
        records = []
        if os.path.exists(OUTBOX_FILE):
            try:
                with open(OUTBOX_FILE, "r") as f:
                    records = json.load(f)
                    if not isinstance(records, list):
                        records = []
            except Exception:
                records = []
                
        records.append(email_record)
        
        with open(OUTBOX_FILE, "w") as f:
            json.dump(records, f, indent=2)
            
        print("\n" + "="*80)
        print(f" [MOCK SMTP OUTBOX] EMAIL TO: {to_email}")
        print(f" RESET LINK SENT: {reset_link}")
        print("="*80 + "\n")
        return True

    # Real SMTP send
    try:
        msg = MIMEMultipart("alternative")
        msg["Subject"] = subject
        msg["From"] = SMTP_FROM_EMAIL
        msg["To"] = to_email

        part1 = MIMEText(body_text, "plain")
        part2 = MIMEText(body_html, "html")
        msg.attach(part1)
        msg.attach(part2)

        server = smtplib.SMTP(SMTP_HOST, SMTP_PORT)
        server.ehlo()
        server.starttls()
        server.ehlo()
        
        if SMTP_USERNAME and SMTP_PASSWORD:
            server.login(SMTP_USERNAME, SMTP_PASSWORD)
            
        server.sendmail(SMTP_FROM_EMAIL, to_email, msg.as_string())
        server.quit()
        logger.info(f"Successfully sent password reset email via SMTP to: {to_email}")
        return True
    except Exception as e:
        logger.error(f"Error sending email via SMTP to {to_email}: {e}")
        return False
