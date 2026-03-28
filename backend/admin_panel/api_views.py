from django.shortcuts import get_object_or_404

from user_acc.models import User_profile
from vehicles.models import Vehicle
from sawari.ninja_api import api

def is_admin(request):
    return request.user.is_authenticated and request.user.user_type == 'admin'

# --- Dashboard ---
@api.get("/admin/dashboard/")
def admin_dashboard_api(request):
    if not is_admin(request):
        return {"success": False, "message": "Unauthorized"}
    from reservation.models import Reservation
    return {
        "total_vehicles": Vehicle.objects.count(),
        "pending_kyc": Vehicle.objects.filter(kyc_approved=False).count(),
        "total_bookings": Reservation.objects.count(),
        "total_users": User_profile.objects.filter(user_type='customer').count(),
        "total_drivers": User_profile.objects.filter(user_type='driver').count(),
        "recent_bookings": [
            {
                "id": r.id,
                "vehicle": r.vehicle.name,
                "user": r.user.username,
                "status": r.status,
                "start_date": str(r.start_date),
                "end_date": str(r.end_date),
            }
            for r in Reservation.objects.order_by('-id')[:5]
        ]
    }

# --- Vehicles ---
@api.get("/admin/vehicles/")
def admin_vehicles_api(request):
    if not is_admin(request):
        return {"success": False, "message": "Unauthorized"}
    vehicles = Vehicle.objects.all().order_by('-kyc_submitted_at')
    return {"vehicles": [
        {
            "id": v.id,
            "name": v.name,
            "vehicle_type": v.vehicle_type,
            "owner": v.owner.username,
            "registration_number": v.registration_number,
            "citizenship_number": v.citizenship_number,
            "license_number": v.license_number,
            "kyc_approved": v.kyc_approved,
            "is_active": v.is_active,
            "vehicle_image": request.build_absolute_uri(v.vehicle_image.url) if v.vehicle_image else None,
        }
        for v in vehicles
    ]}

@api.post("/admin/approve-kyc/{vehicle_id}/")
def admin_approve_kyc_api(request, vehicle_id: int):
    if not is_admin(request):
        return {"success": False, "message": "Unauthorized"}
    from django.utils import timezone
    vehicle = get_object_or_404(Vehicle, id=vehicle_id)
    vehicle.kyc_approved = True
    vehicle.is_active = True
    vehicle.kyc_approved_at = timezone.now()
    vehicle.save()
    return {"success": True, "message": "Vehicle approved."}

@api.post("/admin/reject-kyc/{vehicle_id}/")
def admin_reject_kyc_api(request, vehicle_id: int):
    if not is_admin(request):
        return {"success": False, "message": "Unauthorized"}
    vehicle = get_object_or_404(Vehicle, id=vehicle_id)
    vehicle.kyc_approved = False
    vehicle.is_active = False
    vehicle.save()
    return {"success": True, "message": "Vehicle rejected."}

# --- Users ---
@api.get("/admin/users/")
def admin_users_api(request):
    if not is_admin(request):
        return {"success": False, "message": "Unauthorized"}
    users = User_profile.objects.all().order_by('-date_joined')
    return {"users": [
        {
            "id": u.id,
            "username": u.username,
            "email": u.email,
            "user_type": u.user_type,
            "is_active": u.is_active,
            "date_joined": str(u.date_joined),
        }
        for u in users
    ]}

@api.post("/admin/deactivate-user/{user_id}/")
def admin_deactivate_user_api(request, user_id: int):
    if not is_admin(request):
        return {"success": False, "message": "Unauthorized"}
    user = get_object_or_404(User_profile, id=user_id)
    user.is_active = not user.is_active
    user.save()
    status = "activated" if user.is_active else "deactivated"
    return {"success": True, "message": f"User {status}."}

# --- Bookings ---
@api.get("/admin/bookings/")
def admin_bookings_api(request):
    if not is_admin(request):
        return {"success": False, "message": "Unauthorized"}
    from reservation.models import Reservation
    reservations = Reservation.objects.all().order_by('-id')
    return {"bookings": [
        {
            "id": r.id,
            "vehicle": r.vehicle.name,
            "user": r.user.username,
            "status": r.status,
            "payment_status": getattr(r, 'payment_status', 'unpaid'),
            "start_date": str(r.start_date),
            "end_date": str(r.end_date),
        }
        for r in reservations
    ]}

@api.get("/admin/users/{user_id}/")
def admin_user_detail_api(request, user_id: int):
    if not is_admin(request):
        return {"success": False, "message": "Unauthorized"}
    from reservation.models import Reservation
    user = get_object_or_404(User_profile, id=user_id)
    
    # Get bookings if customer
    bookings = []
    if user.user_type == 'customer':
        bookings = [
            {
                "id": b.id,
                "vehicle": b.vehicle.name,
                "status": b.status,
                "start_date": str(b.start_date),
                "end_date": str(b.end_date),
                "amount": str(b.amount) if b.amount else None,
                "pickup_location": b.pickup_location or '—',
                "dropoff_location": b.dropoff_location or '—',
            }
            for b in Reservation.objects.filter(user=user).order_by('-id')
        ]

    # Get vehicles if driver
    vehicles = []
    if user.user_type == 'driver':
        vehicles = [
            {
                "id": v.id,
                "name": v.name,
                "vehicle_type": v.vehicle_type,
                "registration_number": v.registration_number,
                "capacity": v.capacity,
                "cost_per_day": str(v.cost_per_day),
                "kyc_approved": v.kyc_approved,
                "is_active": v.is_active,
                "citizenship_number": v.citizenship_number,
                "license_number": v.license_number,
                "vehicle_image": request.build_absolute_uri(v.vehicle_image.url) if v.vehicle_image else None,
            }
            for v in Vehicle.objects.filter(owner=user).order_by('-id')
        ]

    return {
        "user": {
            "id": user.id,
            "username": user.username,
            "email": user.email,
            "first_name": user.first_name,
            "last_name": user.last_name,
            "user_type": user.user_type,
            "is_active": user.is_active,
            "date_joined": str(user.date_joined),
            "last_login": str(user.last_login) if user.last_login else '—',
        },
        "bookings": bookings,
        "vehicles": vehicles,
    }

@api.get("/admin/vehicles/{vehicle_id}/")
def admin_vehicle_detail_api(request, vehicle_id: int):
    if not is_admin(request):
        return {"success": False, "message": "Unauthorized"}
    from reservation.models import Reservation
    vehicle = get_object_or_404(Vehicle, id=vehicle_id)
    bookings = Reservation.objects.filter(vehicle=vehicle).order_by('-id')
    return {
        "vehicle": {
            "id": vehicle.id,
            "name": vehicle.name,
            "vehicle_type": vehicle.vehicle_type,
            "capacity": vehicle.capacity,
            "cost_per_day": str(vehicle.cost_per_day),
            "registration_number": vehicle.registration_number,
            "citizenship_number": vehicle.citizenship_number,
            "license_number": vehicle.license_number,
            "description": vehicle.description or '',
            "owner": vehicle.owner.username,
            "kyc_approved": vehicle.kyc_approved,
            "is_active": vehicle.is_active,
            "kyc_submitted_at": str(vehicle.kyc_submitted_at),
            "vehicle_image": request.build_absolute_uri(vehicle.vehicle_image.url) if vehicle.vehicle_image else None,
        },
        "bookings": [
            {
                "id": b.id,
                "user": b.user.username,
                "status": b.status,
                "start_date": str(b.start_date),
                "end_date": str(b.end_date),
                "amount": str(b.amount) if b.amount else None,
            }
            for b in bookings
        ]
    }
