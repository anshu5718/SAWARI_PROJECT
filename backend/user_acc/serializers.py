from rest_framework import serializers

from pydantic import BaseModel, EmailStr
from vehicles.models import Vehicle

class LoginSchema(BaseModel):
    success: bool
    message: str
    redirect_url: str = None



class OTPSchema(BaseModel):
    otp: str

class PasswordResetSchema(BaseModel):
    email: EmailStr
    password1: str
    password2: str


class VehicleSerializer(serializers.ModelSerializer):
    current_status = serializers.ReadOnlyField()
    vehicle_image = serializers.SerializerMethodField()

    def get_vehicle_image(self, obj):
        request = self.context.get('request')
        if obj.vehicle_image and request:
            return request.build_absolute_uri(obj.vehicle_image.url)
        return None

    class Meta:
        model = Vehicle
        fields = [
            'id', 'name', 'vehicle_type', 'vehicle_image', 'capacity',
            'registration_number', 'description', 'cost_per_day',
            'citizenship_number', 'license_number', 'kyc_approved',
            'current_status'
        ]
        read_only_fields = ['is_active', 'kyc_approved', 'kyc_approved_at']
