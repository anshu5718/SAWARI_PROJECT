from ninja import Schema

class VehicleSchema(Schema):
    vehicle_name: str
    vehicle_type: str
    capacity: int
    cost_per_day: int
    registration_number: str
    description: str = None



