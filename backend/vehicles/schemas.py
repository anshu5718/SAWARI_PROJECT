# vehicles/schemas.py
from typing import Optional
from ninja import Schema


class VehicleSchema(Schema):
    name: str
    vehicle_type: str
    capacity: int
    cost_per_day: int
    registration_number: str
    description: str = ''


class VehicleEditSchema(Schema):
    name: Optional[str] = None
    description: Optional[str] = None
    cost_per_day: Optional[float] = None


class VehicleDetailSchema(Schema):
    id: int
    name: str
    description: str
    cost_per_day: str
    vehicle_image: Optional[str] = None
