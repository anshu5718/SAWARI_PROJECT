# schemas/auth.py
from typing import Literal
from pydantic import EmailStr, Field
from ninja import Schema


# ── Auth Payloads (incoming requests) 
class LoginPayload(Schema):
    username: str 
    password: str 



class ForgetPasswordPayload(Schema):
    email: EmailStr


class PasswordResetSchema(Schema):
    email: EmailStr
    password1: str 
    password2: str


class OTPSchema(Schema):
    otp: str = Field(..., min_length=4, max_length=8)


# ── Auth Responses (outgoing responses) 
class LoginSchema(Schema):
    success: bool
    message: str
    redirect_url: str | None = None


# ── Vehicle Schemas 
class VehicleOut(Schema):
    id: int
    name: str
    vehicle_type: str
    vehicle_image: str | None = None
    capacity: int
    registration_number: str
    description: str
    cost_per_day: float
    citizenship_number: str
    license_number: str
    kyc_approved: bool
    current_status: str
    is_booked: bool

class SignupPayload(Schema):
    username: str
    email: str
    password: str
    phone_number: str
    user_type: str = "customer"  # default value

    # Optional: Add validation
    class Config:
        extra = "forbid"  

class UpdateUserPayload(Schema):
    phone_number: str | None = None
    username: str | None = None
    
