from django.core.mail import send_mail
from django.conf import settings

def send_otp(email, otp):
    subject = 'Your Password Reset OTP'
    message = f'Your OTP for password reset is: {otp}'
    email_from = settings.EMAIL_HOST_USER
    recipient_list = [email]
    
    # Use fail_silently=False during development to see errors
    send_mail(subject, message, email_from, recipient_list, fail_silently=False)
