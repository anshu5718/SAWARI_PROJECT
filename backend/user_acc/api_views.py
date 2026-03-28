from datetime import date
from django.conf import settings
from django.contrib.auth import authenticate, login, logout, get_user_model
from django.forms import Form
from django.contrib.auth.hashers import make_password
from django.http import JsonResponse
from django.shortcuts import get_object_or_404
from django.core.mail import send_mail
from ninja.security import django_auth
from reservation.models import Reservation
from user_acc.models import User_profile
from user_acc.schemas import LoginPayload, ForgetPasswordPayload, SignupPayload
from user_acc.serializers import VehicleSerializer,PasswordResetSchema
from vehicles.models import Vehicle
from user_acc.utilis import forgot_password_email
from django.middleware.csrf import get_token
from sawari.ninja_api import api


User = get_user_model()


@api.get("/get-csrf-token/")
def get_csrf_token(request):
    """
    Returns a CSRF token for the given request.

    The CSRF token is used to prevent cross-site request forgery attacks.
    It is a unique token that is generated for each request and is
    required to be included in the headers of the request in order to
    validate the request.

    :param request: The request object
    :return: A JSON response containing the CSRF token
    :rtype: JsonResponse
    """
    return JsonResponse({"csrfToken": get_token(request)})


@api.post("/login/")
def login_api(request, data: LoginPayload):
    """
    Logs a user in and returns a JSON response containing a success flag,
    a redirect URL, and user information.

    :param request: The request object
    :param data: A LoginPayload object containing the username and password
    :return: A JSON response containing the success flag, redirect URL, and user information
    :rtype: JsonResponse
    """
    username = data.username
    password = data.password
    user = authenticate(request, username=username, password=password)
    if user is not None:
        login(request, user)
        if user.user_type == "admin":
            redirect_url = "/admin"
        elif user.user_type == "customer":
            redirect_url = "/viewer-homepage"
        else:
            redirect_url = "/driver-homepage"
        return {
            "success": True,
            "redirect_url": redirect_url,
            "user": {
                "username": user.username,
                "full_name": f"{user.first_name} {user.last_name}".strip()
                or user.username,
                "user_type": user.user_type,
            },
        }
    return {"success": False, "message": "Invalid username or password"}


@api.post("/logout/", auth=django_auth)
def logout_api(request):
    """
    Logs out the current user and returns a JSON response containing a success flag and a message.

    :return: A JSON response containing the success flag and message
    :rtype: JsonResponse
    """
    logout(request)
    return {"success": True, "message": "Logged out successfully"}


@api.post("/signup/")
def signup_api(request, data: SignupPayload):
    # Use model_dump as requested
    """
    Creates a new user account.

    :param request: The request object
    :param data: A SignupPayload object containing the username, email, first name, last name, password, and user type
    :return: A JSON response containing a success flag and a message
    :rtype: JsonResponse
    """
    user_data = data.model_dump()

    # Extract the password and hash it
    raw_password = user_data.pop("password")

    if User_profile.objects.filter(username=user_data["username"]).exists():
        return {"success": False, "message": "Username already exists"}

    User_profile.objects.create(**user_data, password=make_password(raw_password))
    return {"success": True, "message": "Account created successfully"}


@api.post("/forgot-password/")
def forgot_password_api(request, email: ForgetPasswordPayload):
    """
    Sends a one-time password (OTP) to the user's email address.

    :param request: The request object
    :param email: A ForgetPasswordPayload object containing the email address to which the OTP should be sent
    :return: A JSON response containing a success flag and a message
    :rtype: JsonResponse
    """
    try:
        email = email.email
        forgot_password_email(email)
        return {"success": True, "message": "OTP sent"}
    except Exception as e:
        return {"success": False, "message": str(e)}


@api.post("/otp-confirmation/")
def otp_confirmation_api(request, otp: str = Form(...)):
    """
    Confirms the OTP sent to the user's email address.

    :param request: The request object
    :param otp: The OTP sent to the user's email address
    :return: A JSON response containing a success flag and a message
    :rtype: JsonResponse
    """
    user_id = 1
    if user_id is None:
        return {"success": False, "message": "Invalid OTP"}
    return {"success": True, "user_id": user_id}


@api.post("/set-new-password/")
def set_new_password_api(request, data: PasswordResetSchema):
    """
    Resets a user's password.

    :param request: The request object
    :param data: A PasswordResetSchema object containing the email address and new password
    :return: A JSON response containing a success flag and a message
    :rtype: JsonResponse
    """
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


@api.get("/viewer-homepage/")
def viewer_homepage_api(request):
    """
    Returns a list of vehicles that are active and KYC approved.

    :return: A JSON response containing a list of vehicles
    :rtype: JsonResponse
    """
    vehicles = Vehicle.objects.filter(is_active=True, kyc_approved=True)
    serializer = VehicleSerializer(vehicles, many=True, context={"request": request})
    return {"vehicles": serializer.data}


@api.post("/booking-cancel/{reservation_id}/", auth=django_auth)
def booking_cancel_api(request, reservation_id: int):
    """
    Cancels a booking.

    :param request: The request object
    :param reservation_id: The ID of the booking to be cancelled
    :return: A JSON response containing a success flag and a message
    :rtype: JsonResponse
    """
    reservation = get_object_or_404(Reservation, id=reservation_id, user=request.user)
    days_until_start = (reservation.start_date - date.today()).days

    if (
        reservation.status in ["pending", "approved", "completed"]
        and days_until_start > 2
    ):
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
