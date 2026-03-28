from typing import Optional
from pydantic import BaseModel
from rest_framework import serializers
from .models import Vehicle

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

class VehicleEditSchema(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    cost_per_day: Optional[float] = None
