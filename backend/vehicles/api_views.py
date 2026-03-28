
from django.db import IntegrityError
from django.shortcuts import get_object_or_404
from ninja.responses import Response

from ninja import Form, File
from typing import Optional
from ninja.files import UploadedFile
from vehicles.serializers import VehicleEditSchema, VehicleSerializer
from .models import Vehicle
from ninja.security import django_auth

from sawari.ninja_api import api

@api.post("/register-vehicle/", auth=django_auth, include_in_schema=False)
def register_vehicle_api(
    request,
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
        return Response(
                {"success": False, "message": "A vehicle with this registration number already exists."},
                status_code=400
            )
    if vehicle_image:
        vehicle.vehicle_image.save(vehicle_image.name, vehicle_image, save=True)

    return {"success": True, "message": "Vehicle submitted for approval!"}

@api.get("/driver-homepage/")
def driver_homepage_api(request):
    vehicles = Vehicle.objects.filter(owner=request.user, is_active=True, kyc_approved=True)
    serializer = VehicleSerializer(vehicles, many=True, context={'request': request})
    return {"vehicles": serializer.data}


@api.get("/edit-vehicle/{vehicle_id}/")
def get_vehicle_api(request, vehicle_id: int):
    vehicle = get_object_or_404(Vehicle, id=vehicle_id, owner=request.user)
    return {
        "id": vehicle.id,
        "name": vehicle.name,
        "description": vehicle.description or '',
        "cost_per_day": str(vehicle.cost_per_day),
        "vehicle_image": request.build_absolute_uri(vehicle.vehicle_image.url) if vehicle.vehicle_image else None,
    }

@api.patch("/edit-vehicle/{vehicle_id}/")
def update_vehicle_api(request, vehicle_id: int, data: VehicleEditSchema):
    vehicle = get_object_or_404(Vehicle, id=vehicle_id, owner=request.user)
    if data.name is not None:
        vehicle.name = data.name
    if data.description is not None:
        vehicle.description = data.description
    if data.cost_per_day is not None:
        vehicle.cost_per_day = data.cost_per_day
    vehicle.save()
    return {"success": True, "message": "Vehicle updated successfully."}

@api.post("/edit-vehicle-image/{vehicle_id}/")
def update_vehicle_image_api(request, vehicle_id: int):
    vehicle = get_object_or_404(Vehicle, id=vehicle_id, owner=request.user)
    print('FILES:', request.FILES)
    if 'vehicle_image' in request.FILES:
        vehicle.vehicle_image = request.FILES['vehicle_image']
        vehicle.save()
    return {"success": True, "message": "Image updated successfully."}


@api.delete("/delete-vehicle/{vehicle_id}/")
def delete_vehicle_api(request, vehicle_id: int):
    vehicle = get_object_or_404(Vehicle, id=vehicle_id, owner=request.user)
    if vehicle.current_status == 'available':
        vehicle.delete()
    else:
        return {"success": False, "message": "Vehicle is already booked."}
    return {"success": True, "message": "Vehicle deleted successfully."}
