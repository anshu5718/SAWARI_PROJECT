# vehicles/api_views.py
from django.db import IntegrityError
from django.shortcuts import get_object_or_404
from ninja import Form, File, Body
from ninja.security import django_auth
from typing import Optional
from ninja.files import UploadedFile

from sawari.ninja_api import api
from vehicles.schemas import VehicleEditSchema, VehicleDetailSchema
from user_acc.schemas import VehicleOut
from .models import Vehicle


@api.post("/register-vehicle/", auth=django_auth)
def register_vehicle_api(
    request,
    # Form + File cannot use schema — multipart upload limitation
    name: str = Form(...),
    vehicle_type: str = Form(...),
    capacity: int = Form(...),
    cost_per_day: float = Form(...),
    registration_number: str = Form(...),
    citizenship_number: str = Form(...),
    license_number: str = Form(...),
    description: str = Form(''),
    vehicle_image: Optional[UploadedFile] = File(None),
):
    if request.user.user_type != 'driver':
        return {"success": False, "message": "Only drivers can register vehicles."}

    try:
        vehicle = Vehicle.objects.create(
            owner=request.user,
            name=name,
            vehicle_type=vehicle_type,
            capacity=capacity,
            cost_per_day=cost_per_day,
            registration_number=registration_number,
            citizenship_number=citizenship_number,
            license_number=license_number,
            description=description,
        )
    except IntegrityError:
        return {"success": False, "message": "A vehicle with this registration number already exists."}

    if vehicle_image:
        vehicle.vehicle_image.save(vehicle_image.name, vehicle_image, save=True)

    return {"success": True, "message": "Vehicle submitted for approval!"}


@api.get("/driver-homepage/", response=list[VehicleOut], auth=django_auth)
def driver_homepage_api(request):
    vehicles = Vehicle.objects.filter(owner=request.user, is_active=True, kyc_approved=True)
    result = []
    for v in vehicles:
        result.append({
            "id": v.id,
            "name": v.name,
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


@api.get("/edit-vehicle/{vehicle_id}/", response=VehicleDetailSchema, auth=django_auth)
def get_vehicle_api(request, vehicle_id: int):
    vehicle = get_object_or_404(Vehicle, id=vehicle_id, owner=request.user)
    return {
        "id": vehicle.id,
        "name": vehicle.name,
        "description": vehicle.description or '',
        "cost_per_day": str(vehicle.cost_per_day),
        "vehicle_image": request.build_absolute_uri(vehicle.vehicle_image.url) if vehicle.vehicle_image else None,
    }


@api.patch("/edit-vehicle/{vehicle_id}/", auth=django_auth)
def update_vehicle_api(request, vehicle_id: int, data: VehicleEditSchema = Body(...)):
    vehicle = get_object_or_404(Vehicle, id=vehicle_id, owner=request.user)
    payload = data.model_dump(exclude_unset=True)
    for field, value in payload.items():
        setattr(vehicle, field, value)

    vehicle.save()
    return {"success": True, "message": "Vehicle updated successfully."}


@api.post("/edit-vehicle-image/{vehicle_id}/", auth=django_auth)
def update_vehicle_image_api(request, vehicle_id: int):
    vehicle = get_object_or_404(Vehicle, id=vehicle_id, owner=request.user)
    if 'vehicle_image' in request.FILES:
        vehicle.vehicle_image = request.FILES['vehicle_image']
        vehicle.save()
    return {"success": True, "message": "Image updated successfully."}


@api.delete("/delete-vehicle/{vehicle_id}/", auth=django_auth)
def delete_vehicle_api(request, vehicle_id: int):
    vehicle = get_object_or_404(Vehicle, id=vehicle_id, owner=request.user)
    if vehicle.is_booked:                          
        return {"success": False, "message": "Cannot delete a currently booked vehicle."}
    vehicle.delete()
    return {"success": True, "message": "Vehicle deleted successfully."}
