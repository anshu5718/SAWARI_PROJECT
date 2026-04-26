# admin_panel/schemas.py
from typing import Optional
from ninja import Schema
from pydantic.v1 import ConfigDict


class RecentBookingSchema(Schema):
    id: int
    vehicle: str
    user: str
    status: str
    start_date: str
    end_date: str


class DashboardSchema(Schema):
    total_vehicles: int
    pending_kyc: int
    total_bookings: int
    total_users: int
    total_drivers: int
    recent_bookings: list[RecentBookingSchema]


class AdminVehicleSchema(Schema):
    id: int
    name: str
    vehicle_type: str
    owner: str
    registration_number: str
    citizenship_number: str
    license_number: str
    kyc_approved: bool
    is_active: bool
    is_booked: bool
    vehicle_image: Optional[str] = None



class AdminVehicleDetailSchema(Schema):
    id: int
    name: str
    vehicle_type: str
    capacity: int
    cost_per_day: str
    registration_number: str
    citizenship_number: str
    license_number: str
    description: str
    owner: str
    kyc_approved: bool
    is_active: bool
    kyc_submitted_at: str
    vehicle_image: Optional[str] = None


class AdminUserSchema(Schema):
    id: int
    username: str
    email: str
    user_type: str
    is_active: bool
    date_joined: str


class AdminUserDetailSchema(Schema):
    id: int
    username: str
    email: str
    phone_number: Optional[str] = None
    first_name: str
    last_name: str
    user_type: str
    is_active: bool
    date_joined: str
    last_login: str


class AdminBookingSchema(Schema):
    model_config = ConfigDict(from_attributes=True)
    id: int
    vehicle: str
    owner: str
    user: str
    status: str
    payment_status: str
    start_date: str
    end_date: str


class BookingDetailSchema(Schema):
    model_config = ConfigDict(from_attributes=True)
    id: int
    vehicle: str
    owner: str
    owner_phone_number: str
    user: str
    customer_phone_number: str
    status: str
    payment_status: str
    start_date: str
    end_date: str
    amount: Optional[str] = None
    pickup_location: str
    dropoff_location: str


class VehicleBookingSchema(Schema):
    id: int
    user: str
    status: str
    start_date: str
    end_date: str
    amount: Optional[str] = None
