from django.shortcuts import get_object_or_404
from django.http import HttpResponseRedirect, JsonResponse
from reservation.payment_utils import initiate_khalti_payment, verify_khalti_payment
from reservation.schemas import RejectionSchema, ReservationSchema
from reservation.utils import send_rejection_emails, send_status_update_email, booking_notification_mail
from .models import Reservation, Payment
from sawari.ninja_api import api
from ninja import Schema
from datetime import date
from ninja.security import django_auth
from vehicles.models import Vehicle

class BookingSchema(Schema):
    vehicle_id: int
    start_date: date    
    end_date: date
    purpose: str = ''


@api.post("/create-payment/{reservation_id}/")
def create_payment_api(request, reservation_id: int):
    reservation = get_object_or_404(Reservation, id=reservation_id, user=request.user)

    if not reservation.amount:
        days = (reservation.end_date - reservation.start_date).days
        reservation.amount = days * reservation.vehicle.cost_per_day
        reservation.save()

    payment, created = Payment.objects.get_or_create(
        reservation=reservation,
        defaults={'amount': reservation.amount}
    )

    payment_url = initiate_khalti_payment(payment)
    
    return {"success": True, "payment_url": payment_url}


@api.get("/payment-success/")
def payment_success_api(request, pidx: str):
    """
    Handles the redirect from Khalti, verifies the transaction,
    updates the database, and redirects the user home.
    """
   
    payment = get_object_or_404(Payment, pidx=pidx)
    
   
    response = verify_khalti_payment(pidx)
    
    
    
    if response.get("status") == "Completed":
        payment.status = "completed" 
        payment.save()
        
        res = payment.reservation
        res.status = "completed"
        res.is_paid = True
        res.save()
            
        return {"success": True}

   
    return {"success": False}

@api.post("/reject-booking/{reservation_id}/")
def reject_booking_api(request, reservation_id: int, data: RejectionSchema):
    reservation = get_object_or_404(Reservation, id=reservation_id, vehicle__owner=request.user)
    
    vehicle_info = reservation.vehicle.vehicle_type
    dates = f"{reservation.start_date} to {reservation.end_date}"
    user_email = reservation.user.email
    owner_email = reservation.vehicle.owner.email
    
    reservation.delete()
    
    send_rejection_emails(user_email, owner_email, vehicle_info, dates, data.model_dump()['reason'])
    
    return {"success": True, "message": "Reservation rejected."}


@api.get("/user-booking/")
def user_booking_api(request):
    reservations = Reservation.objects.filter(user=request.user)
    
    data = [
        {
            "id": r.id,
            "vehicle": r.vehicle.vehicle_type,
            "start_date": r.start_date,
            "end_date": r.end_date,
            "status": r.status,
            "payment_status": r.payment.status if hasattr(r, 'payment') else 'None',
        }
        for r in reservations
    ]
    return {"reservations": data}

@api.post("/update-status/{reservation_id}/")
def update_status_api(request, reservation_id: int, payload: ReservationSchema):
    data = payload.model_dump()
    action = data['action']
    
    reservation = get_object_or_404(Reservation, id=reservation_id, vehicle__owner=request.user)
    reservation.status = action
    reservation.save()
    
    send_status_update_email(reservation, action)
    return {"success": True, "new_status": action}


@api.post("/book-vehicle/")
def book_vehicle_api(request, payload: BookingSchema):
    
    vehicle = get_object_or_404(Vehicle, id=payload.vehicle_id, is_active=True, kyc_approved=True)
    
    reservation = Reservation.objects.create(
        user=request.user,
        vehicle=vehicle,
        start_date=payload.start_date,
        end_date=payload.end_date,
        purpose=payload.purpose,
        status='pending',
    )
    booking_notification_mail(vehicle.owner.email, vehicle.vehicle_type, f"{payload.start_date} to {payload.end_date}", reservation.amount)
    return {"success": True, "reservation_id": reservation.id}


@api.get("/driver-bookings/")
def driver_bookings_api(request):
    if request.user.user_type != "driver":
        return []
    
    reservations = Reservation.objects.filter(vehicle__owner=request.user)
    
    data = [
        {
            "id": r.id,
            "vehicle": r.vehicle.name,
            "vehicle_type": r.vehicle.vehicle_type,
            "customer": r.user.username,
            "start_date": r.start_date,
            "end_date": r.end_date,
            "status": r.status,
            "amount": str(r.amount) if r.amount else None,
            "payment_status": r.payment.status if hasattr(r, 'payment') else None,
        }
        for r in reservations
    ]
    return data

