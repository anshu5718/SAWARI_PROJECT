# schemas.py
from datetime import date
from typing import Literal

from pydantic import BaseModel, Field

class ReservationStatusUpdate(BaseModel):
    action: str = Field(..., pattern="^(approved|completed|available|pending)$")

class ReservationStatusUpdate(BaseModel):
    action: str

class RejectionSchema(BaseModel):
    reason: str = "No specific reason provided."

class StatusUpdateSchema(BaseModel):
    action: Literal['available', 'pending', 'approved', 'completed']


class BookingSchema(BaseModel):
    vehicle_id: int
    start_date: date
    end_date: date
    purpose: str = ''
    pickup_location: str = ''
    dropoff_location: str = ''

class ReservationSchema(BaseModel):
    id: int
    status: str
    start_date: date
    end_date: date
    vehicle_type: str
    user_email: str

    class Config:
        from_attributes = True

