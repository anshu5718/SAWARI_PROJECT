from django.core.mail import EmailMessage, send_mail
from django.conf import settings
import os

def send_approval_email(reservation):
    vehicle = reservation.vehicle  # Define vehicle from the reservation
    
    subject = 'Reservation Approved'
    body = (
        f'Your reservation of {vehicle.vehicle_type} '
        f'from {reservation.start_date} to {reservation.end_date} has been approved.\n\n'
        f'Please pay the amount to complete the booking. '
        f'Rate: {reservation.vehicle.cost_per_day} per day. '
        f'Please upload the payment proof in the payment section.'
    )

    email = EmailMessage(
        subject=subject,
        body=body,
        from_email=settings.DEFAULT_FROM_EMAIL,
        to=[reservation.user.email],
    )


    email.send()

def send_rejection_emails(user_email, owner_email, vehicle_info, dates, reason):
    subject = 'Reservation Rejected'
    message = f'Your reservation of {vehicle_info} from {dates} has been rejected. Reason: {reason}'
    
    send_mail(subject, message, settings.DEFAULT_FROM_EMAIL, [user_email])
   
    send_mail(subject, message, settings.DEFAULT_FROM_EMAIL, [owner_email])


def send_status_update_email(reservation, action):
    vehicle = reservation.vehicle
    
    if action == "approved":
        total_cost = vehicle.cost_per_day * (reservation.end_date - reservation.start_date).days
        subject = 'Reservation Approved'
        body = f'Your reservation of {vehicle.vehicle_type} from {reservation.start_date} to {reservation.end_date} has been approved.\n\nAmount: Rs. {total_cost}'
        email = EmailMessage(subject, body, settings.DEFAULT_FROM_EMAIL, [reservation.user.email])
   
        email.send()
        
    elif action == "completed":
        subject = 'Reservation Completed'
        body = f'Your reservation of {vehicle.vehicle_type} from {reservation.start_date} to {reservation.end_date} has been completed. Thank you!'
        send_mail(subject, body, settings.DEFAULT_FROM_EMAIL, [reservation.user.email])

def booking_notification_mail(user_email, vehicle_info, dates, amount):
    subject = 'New Booking'
    message = f'You have a new booking for {vehicle_info} from {dates}. Amount: Rs. {amount}'
    send_mail(subject, message, settings.DEFAULT_FROM_EMAIL, [user_email])
