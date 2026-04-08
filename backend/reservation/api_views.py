from django.shortcuts import get_object_or_404
from django.http import HttpResponseRedirect, JsonResponse
from reservation.payment_utils import initiate_khalti_payment, verify_khalti_payment
from reservation.schemas import RejectionSchema, ReservationSchema
from reservation.utils import (
    send_rejection_emails,
    send_status_update_email,
    booking_notification_mail,
)
from .models import Reservation, Payment
from sawari.ninja_api import api
from ninja import Schema
from datetime import date
from ninja.security import django_auth
from vehicles.models import Vehicle
from .schemas import BookingDetailsSchema, BookingSchema


@api.post("/create-payment/{reservation_id}/", auth=django_auth)
def create_payment_api(request, reservation_id: int):
    reservation = get_object_or_404(Reservation, id=reservation_id, user=request.user)

    if not reservation.amount:
        days = (reservation.end_date - reservation.start_date).days
        reservation.amount = days * reservation.vehicle.cost_per_day
        reservation.save()

    payment, created = Payment.objects.get_or_create(
        reservation=reservation, defaults={"amount": reservation.amount}
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


@api.post("/reject-booking/{reservation_id}/", auth=django_auth)
def reject_booking_api(request, reservation_id: int, data: RejectionSchema):
    reservation = get_object_or_404(
        Reservation, id=reservation_id, vehicle__owner=request.user
    )
    vehicle = reservation.vehicle
    vehicle.is_booked = False
    vehicle.save()

    vehicle_info = reservation.vehicle.vehicle_type
    dates = f"{reservation.start_date} to {reservation.end_date}"
    user_email = reservation.user.email
    owner_email = reservation.vehicle.owner.email

    reservation.delete()

    send_rejection_emails(
        user_email, owner_email, vehicle_info, dates, data.model_dump()["reason"]
    )

    return {"success": True, "message": "Reservation rejected."}


@api.get("/user-booking/", auth=django_auth)
def user_booking_api(request):
    reservations = Reservation.objects.filter(user=request.user)

    data = [
        {
            "id": r.id,
            "vehicle": r.vehicle.name,
            "owner": r.vehicle.owner.username,
            "vehicle_type": r.vehicle.vehicle_type,
            "start_date": r.start_date,
            "end_date": r.end_date,
            "pickup_location": r.pickup_location,
            "dropoff_location": r.dropoff_location,
            "status": r.status,
            "payment_status": r.payment.status if hasattr(r, "payment") else "None",
        }
        for r in reservations
    ]
    return {"reservations": data}


@api.patch("/update-status/{reservation_id}/", auth=django_auth)
def update_status_api(request, reservation_id: int, payload: ReservationSchema):
    data = payload.model_dump()
    action = data["action"]

    reservation = get_object_or_404(
        Reservation, id=reservation_id, vehicle__owner=request.user
    )
    reservation.status = action
    reservation.save()

    # ADD THIS
    vehicle = reservation.vehicle
    if action == "approved":
        vehicle.is_booked = True
        vehicle.save()
    elif action in ("completed", "finished"):
        vehicle.is_booked = False
        vehicle.save()

    send_status_update_email(reservation, action)
    return {"success": True, "new_status": action}


@api.post("/book-vehicle/", auth=django_auth)
def book_vehicle_api(request, payload: BookingSchema):

    vehicle = get_object_or_404(
        Vehicle, id=payload.vehicle_id, is_active=True, kyc_approved=True
    )
    if vehicle.is_booked:
        return {"success": False, "message": "This vehicle is currently booked and unavailable."}

    reservation = Reservation.objects.create(
        user=request.user,
        vehicle=vehicle,
        start_date=payload.start_date,
        end_date=payload.end_date,
        purpose=payload.purpose,
        pickup_location=payload.pickup_location,
        dropoff_location=payload.dropoff_location,
        status="pending",
    )
    booking_notification_mail(
        vehicle.owner.email,
        vehicle.vehicle_type,
        f"{payload.start_date} to {payload.end_date}",
        reservation.amount,
    )
    return {"success": True, "reservation_id": reservation.id}


@api.get("/driver-bookings/", auth=django_auth)
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
            "payment_status": r.payment.status if hasattr(r, "payment") else None,
        }
        for r in reservations
    ]
    return data


@api.get(
    "/booking-details/{reservation_id}/",
    auth=django_auth,
    response=BookingDetailsSchema,
)
def booking_details_api(request, reservation_id: int):
    reservation = get_object_or_404(Reservation, id=reservation_id)

    schema = BookingDetailsSchema(
        id=reservation.id,
        vehicle=reservation.vehicle.name,
        vehicle_type=reservation.vehicle.vehicle_type,

        owner=reservation.vehicle.owner.username,

        customer=reservation.user.username,
        pickup_location=reservation.pickup_location,
        dropoff_location=reservation.dropoff_location,

        start_date=str(reservation.start_date),
        end_date=str(reservation.end_date),

        status=reservation.status,
        amount=str(reservation.amount) if reservation.amount else None,

        payment_status=(
            reservation.payment.status if hasattr(reservation, "payment") else None
        ),
    )

    return schema.model_dump()
