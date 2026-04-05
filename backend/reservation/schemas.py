# schemas.py
from datetime import date
from typing import Literal

from pydantic import BaseModel, ConfigDict



# ── Status / Action Schemas 
class StatusUpdateSchema(BaseModel):
    action: Literal['available', 'pending', 'approved', 'completed']


class RejectionSchema(BaseModel):
    reason: str = "No specific reason provided."


# ── Booking Schemas 
class BookingSchema(BaseModel):
    vehicle_id: int
    start_date: date
    end_date: date
    purpose: str = ''
    pickup_location: str = ''
    dropoff_location: str = ''


# ── Reservation Schemas 
class ReservationSchema(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    status: str
    start_date: date
    end_date: date
    vehicle_type: str
    user_email: str
