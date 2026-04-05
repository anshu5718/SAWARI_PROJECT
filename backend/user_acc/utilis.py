# user_acc/utils.py
from .background_task import send_otp
from .models import OTP


def is_email_valid(email: str) -> bool:
    """Returns True if email is valid, False otherwise."""
    if not email or '@' not in email:
        return False  # was inverted before — returning True for invalid emails
    return True


def forgot_password_email(email: str):
    try:
        new_otp = OTP.otp_generator(email)
    except Exception as e:
        raise Exception(str(e))
    send_otp(email, new_otp.otp)
