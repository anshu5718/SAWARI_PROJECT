# user_acc/api_views.py
from datetime import date

from django.conf import settings
from django.contrib.auth import authenticate, login, logout, get_user_model
from django.contrib.auth.hashers import make_password
from django.core.mail import send_mail
from django.http import JsonResponse
from django.middleware.csrf import get_token
from django.shortcuts import get_object_or_404
from ninja import Body
from ninja.security import django_auth

from reservation.models import Reservation
from sawari.ninja_api import api
from user_acc.models import User_profile
from user_acc.schemas import (
    LoginPayload,
    ForgetPasswordPayload,
    SignupPayload,
    OTPSchema,
    PasswordResetSchema,
    UpdateUserPayload,
    VehicleOut,
)
from user_acc.utilis import forgot_password_email
from vehicles.models import Vehicle

User = get_user_model()


@api.get("/get-csrf-token/")
def get_csrf_token(request):
    return JsonResponse({"csrfToken": get_token(request)})


@api.post("/login/")
def login_api(request, data: LoginPayload = Body(...)):
    user = authenticate(request, username=data.username, password=data.password)
    if user is not None:
        login(request, user)
        redirect_map = {
            "admin": "/admin",
            "customer": "/viewer-homepage",
        }
        redirect_url = redirect_map.get(user.user_type, "/driver-homepage")
        return {
            "success": True,
            "redirect_url": redirect_url,
            "user": {
                "username": user.username,
                "user_type": user.user_type,
                "email": user.email,
                "phone_number": user.phone_number,
            },
        }
    return {"success": False, "message": "Invalid username or password"}


@api.post("/logout/", auth=django_auth)
def logout_api(request):
    logout(request)
    return {"success": True, "message": "Logged out successfully"}


@api.post("/signup/")
def signup_api(request, data: SignupPayload = Body(...)):
    user_dict = data.model_dump()
    raw_password = user_dict.pop("password")
    phone = user_dict.get("phone_number")

    if User_profile.objects.filter(phone_number=phone).exists():
        return {"success": False, "message": "Phone number already exists"}

    User_profile.objects.create(**user_dict, password=make_password(raw_password))
    return {"success": True, "message": "Account created successfully"}


@api.post("/forgot-password/")
def forgot_password_api(request, data: ForgetPasswordPayload = Body(...)):
    try:
        forgot_password_email(data.email)
        return {"success": True, "message": "OTP sent"}
    except Exception as e:
        return {"success": False, "message": str(e)}


@api.post("/otp-confirmation/")
def otp_confirmation_api(request, data: OTPSchema = Body(...)):
    user_id = 1  # TODO: implement real OTP verification logic
    if user_id is None:
        return {"success": False, "message": "Invalid OTP"}
    return {"success": True, "user_id": user_id}


@api.post("/set-new-password/")
def set_new_password_api(request, data: PasswordResetSchema = Body(...)):
    if data.password1 != data.password2:
        return {"success": False, "message": "Passwords do not match"}
    try:
        user = User_profile.objects.get(email=data.email)
        user.set_password(data.password1)
        user.save()
        return {"success": True, "message": "Password updated successfully"}
    except User_profile.DoesNotExist:
        return {"success": False, "message": "User not found"}
    except Exception as e:
        return {"success": False, "message": f"An error occurred: {str(e)}"}


@api.get("/viewer-homepage/", response=list[VehicleOut])
def viewer_homepage_api(request):
    vehicles = Vehicle.objects.filter(is_active=True, kyc_approved=True)
    result = []
    for v in vehicles:
        result.append({
            "id": v.id,
            "name": v.name,
            "owner": v.owner.username,
            "vehicle_type": v.vehicle_type,
            "vehicle_image": request.build_absolute_uri(v.vehicle_image.url) if v.vehicle_image else None,
            "capacity": v.capacity,
            "registration_number": v.registration_number,
            "description": v.description,
            "cost_per_day": float(v.cost_per_day),
            "citizenship_number": v.citizenship_number,
            "license_number": v.license_number,
            "kyc_approved": v.kyc_approved,
            "current_status": v.current_status,
            "is_booked": v.is_booked,
        })
    return result

@api.post("/booking-cancel/{reservation_id}/", auth=django_auth)
def booking_cancel_api(request, reservation_id: int):
    reservation = get_object_or_404(Reservation, id=reservation_id, user=request.user)
    days_until_start = (reservation.start_date - date.today()).days

    if reservation.status in ["pending", "approved", "completed"] and days_until_start > 2:
        reservation.status = "cancelled"
        reservation.save()
        try:
            send_mail(
                subject="Booking Cancelled",
                message=f"Your booking for {reservation.vehicle} has been cancelled.",
                from_email=settings.DEFAULT_FROM_EMAIL,
                recipient_list=[reservation.user.email],
            )
            send_mail(
                subject="Booking Cancelled by User",
                message=f"Booking for {reservation.vehicle} was cancelled by the user.",
                from_email=settings.DEFAULT_FROM_EMAIL,
                recipient_list=[reservation.vehicle.owner.email],
            )
        except Exception as e:
            print(f"Email failed: {e}")
        return {"success": True, "message": "Booking cancelled successfully."}

    return {"success": False, "message": "You cannot cancel this booking."}

@api.put("/update-user/", auth=django_auth)
def update_user_api(request, data: UpdateUserPayload = Body(...)):
    user = request.user
    if data.phone_number is not None:
        user.phone_number = data.phone_number
    if data.username is not None:
        user.username = data.username
    user.save()

    return {
        "id": user.id,
        "full_name": user.username,
        "email": user.email,
        "phone": user.phone_number,
    }
    

