# admin_panel/api_views.py
from django.shortcuts import get_object_or_404
from django.utils import timezone
from ninja.security import django_auth

from admin_panel.schemas import (
    DashboardSchema,
    AdminVehicleSchema,
    AdminVehicleDetailSchema,
    AdminUserSchema,
    AdminUserDetailSchema,
    AdminBookingSchema,
    BookingDetailSchema,
    VehicleBookingSchema,
    RecentBookingSchema,
)
from reservation.models import Reservation
from user_acc.models import User_profile
from vehicles.models import Vehicle
from sawari.ninja_api import api


def is_admin(request):
    return request.user.is_authenticated and request.user.user_type == "admin"


# ── Dashboard ─────────────────────────────────────────────────────────
@api.get("/admin/dashboard/", response=DashboardSchema, auth=django_auth)
def admin_dashboard_api(request):
    if not is_admin(request):
        return {"success": False, "message": "Unauthorized"}

    recent = Reservation.objects.order_by("-id")[:5]
    data = DashboardSchema(
        total_vehicles=Vehicle.objects.count(),
        pending_kyc=Vehicle.objects.filter(kyc_approved=False).count(),
        total_bookings=Reservation.objects.count(),
        total_users=User_profile.objects.filter(user_type="customer").count(),
        total_drivers=User_profile.objects.filter(user_type="driver").count(),
        recent_bookings=[
            RecentBookingSchema(
                id=r.id,
                vehicle=r.vehicle.name,
                user=r.user.username,
                status=r.status,
                start_date=str(r.start_date),
                end_date=str(r.end_date),
            )
            for r in recent
        ],
    )
    return data.model_dump()


# ── Vehicles ──────────────────────────────────────────────────────────
@api.get("/admin/vehicles/", response=list[AdminVehicleSchema], auth=django_auth)
def admin_vehicles_api(request):
    if not is_admin(request):
        return []

    vehicles = Vehicle.objects.all().order_by("-kyc_submitted_at")
    return [
        AdminVehicleSchema(
            id=v.id,
            name=v.name,
            vehicle_type=v.vehicle_type,
            owner=v.owner.username,
            registration_number=v.registration_number,
            citizenship_number=v.citizenship_number,
            license_number=v.license_number,
            kyc_approved=v.kyc_approved,
            is_active=v.is_active,
            vehicle_image=(
                request.build_absolute_uri(v.vehicle_image.url)
                if v.vehicle_image
                else None
            ),
        ).model_dump()
        for v in vehicles
    ]


@api.post("/admin/approve-kyc/{vehicle_id}/", auth=django_auth)
def admin_approve_kyc_api(request, vehicle_id: int):
    if not is_admin(request):
        return {"success": False, "message": "Unauthorized"}

    vehicle = get_object_or_404(Vehicle, id=vehicle_id)
    vehicle.kyc_approved = True
    vehicle.is_active = True
    vehicle.kyc_approved_at = timezone.now()
    vehicle.save()
    return {"success": True, "message": "Vehicle approved."}


@api.post("/admin/reject-kyc/{vehicle_id}/", auth=django_auth)
def admin_reject_kyc_api(request, vehicle_id: int):
    if not is_admin(request):
        return {"success": False, "message": "Unauthorized"}

    vehicle = get_object_or_404(Vehicle, id=vehicle_id)
    vehicle.kyc_approved = False
    vehicle.is_active = False
    vehicle.save()
    return {"success": True, "message": "Vehicle rejected."}


@api.get("/admin/vehicles/{vehicle_id}/", auth=django_auth)
def admin_vehicle_detail_api(request, vehicle_id: int):
    if not is_admin(request):
        return {"success": False, "message": "Unauthorized"}

    vehicle = get_object_or_404(Vehicle, id=vehicle_id)
    bookings = Reservation.objects.filter(vehicle=vehicle).order_by("-id")

    vehicle_data = AdminVehicleDetailSchema(
        id=vehicle.id,
        name=vehicle.name,
        vehicle_type=vehicle.vehicle_type,
        capacity=vehicle.capacity,
        cost_per_day=str(vehicle.cost_per_day),
        registration_number=vehicle.registration_number,
        citizenship_number=vehicle.citizenship_number,
        license_number=vehicle.license_number,
        description=vehicle.description or "",
        owner=vehicle.owner.username,
        kyc_approved=vehicle.kyc_approved,
        is_active=vehicle.is_active,
        kyc_submitted_at=str(vehicle.kyc_submitted_at),
        vehicle_image=(
            request.build_absolute_uri(vehicle.vehicle_image.url)
            if vehicle.vehicle_image
            else None
        ),
    )

    bookings_data = [
        VehicleBookingSchema(
            id=b.id,
            user=b.user.username,
            status=b.status,
            start_date=str(b.start_date),
            end_date=str(b.end_date),
            amount=str(b.amount) if b.amount else None,
        ).model_dump()
        for b in bookings
    ]

    return {"vehicle": vehicle_data.model_dump(), "bookings": bookings_data}


# ── Users ─────────────────────────────────────────────────────────────
@api.get("/admin/users/", response=list[AdminUserSchema], auth=django_auth)
def admin_users_api(request):
    if not is_admin(request):
        return []

    users = User_profile.objects.all().order_by("-date_joined")
    return [
        AdminUserSchema(
            id=u.id,
            username=u.username,
            email=u.email,
            user_type=u.user_type,
            is_active=u.is_active,
            date_joined=str(u.date_joined),
        ).model_dump()
        for u in users
    ]


@api.post("/admin/deactivate-user/{user_id}/", auth=django_auth)
def admin_deactivate_user_api(request, user_id: int):
    if not is_admin(request):
        return {"success": False, "message": "Unauthorized"}

    user = get_object_or_404(User_profile, id=user_id)
    user.is_active = not user.is_active
    user.save()
    status = "activated" if user.is_active else "deactivated"
    return {"success": True, "message": f"User {status}."}


@api.get("/admin/users/{user_id}/", auth=django_auth)
def admin_user_detail_api(request, user_id: int):
    if not is_admin(request):
        return {"success": False, "message": "Unauthorized"}

    user = get_object_or_404(User_profile, id=user_id)

    bookings = []
    if user.user_type == "customer":
        bookings = [
            BookingDetailSchema(
                id=b.id,
                vehicle=b.vehicle.name,
                status=b.status,
                start_date=str(b.start_date),
                end_date=str(b.end_date),
                amount=str(b.amount) if b.amount else None,
                pickup_location=b.pickup_location or "—",
                dropoff_location=b.dropoff_location or "—",
            ).model_dump()
            for b in Reservation.objects.filter(user=user).order_by("-id")
        ]

    vehicles = []
    if user.user_type == "driver":
        vehicles = [
            AdminVehicleDetailSchema(
                id=v.id,
                name=v.name,
                vehicle_type=v.vehicle_type,
                capacity=v.capacity,
                cost_per_day=str(v.cost_per_day),
                registration_number=v.registration_number,
                citizenship_number=v.citizenship_number,
                license_number=v.license_number,
                description=v.description or "",
                owner=v.owner.username,
                kyc_approved=v.kyc_approved,
                is_active=v.is_active,
                kyc_submitted_at=str(v.kyc_submitted_at),
                vehicle_image=(
                    request.build_absolute_uri(v.vehicle_image.url)
                    if v.vehicle_image
                    else None
                ),
            ).model_dump()
            for v in Vehicle.objects.filter(owner=user).order_by("-id")
        ]

    user_data = AdminUserDetailSchema(
        id=user.id,
        username=user.username,
        email=user.email,
        first_name=user.first_name,
        last_name=user.last_name,
        user_type=user.user_type,
        is_active=user.is_active,
        date_joined=str(user.date_joined),
        last_login=str(user.last_login) if user.last_login else "—",
    )

    return {
        "user": user_data.model_dump(),
        "bookings": bookings,
        "vehicles": vehicles,
    }


# ── Bookings ──────────────────────────────────────────────────────────
@api.get("/admin/bookings/", response=list[AdminBookingSchema], auth=django_auth)
def admin_bookings_api(request):
    if not is_admin(request):
        return []

    reservations = Reservation.objects.all().order_by("-id")
    return [
        AdminBookingSchema(
            id=r.id,
            vehicle=r.vehicle.name,
            user=r.user.username,
            status=r.status,
            payment_status=r.payment_status,
            start_date=str(r.start_date),
            end_date=str(r.end_date),
        ).model_dump()
        for r in reservations
    ]


@api.get("/admin/bookings/{booking_id}/", auth=django_auth)
def admin_booking_detail_api(request, booking_id: int):
    if not is_admin(request):
        return {"success": False, "message": "Unauthorized"}

    booking = get_object_or_404(Reservation, id=booking_id)
    booking_data = BookingDetailSchema(
        id=booking.id,
        vehicle=booking.vehicle.name,
        user=booking.user.username,
        status=booking.status,
        payment_status=booking.payment_status,
        start_date=str(booking.start_date),
        end_date=str(booking.end_date),
        amount=str(booking.amount) if booking.amount else None,
        pickup_location=booking.pickup_location or "—",
        dropoff_location=booking.dropoff_location or "—",
    )
    return booking_data.model_dump()
