from datetime import timedelta
from django.utils import timezone
from django.db import models
from django.conf import settings
from vehicles.models import Vehicle
import uuid

class Reservation(models.Model):
    STATUS_CHOICES = [
        ('available', 'available'),
        ('pending', 'pending'),
        ('approved', 'approved'),
        ('completed', 'completed'),
        
    ]

    vehicle = models.ForeignKey(Vehicle, on_delete=models.CASCADE, related_name='reservations')
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='reservations')
    start_date = models.DateField()
    end_date = models.DateField()
    purpose = models.CharField(max_length=255)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='available')
    created_at = models.DateTimeField(auto_now_add=True)
    amount = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    pickup_location = models.CharField(max_length=255, blank=True)
    dropoff_location = models.CharField(max_length=255, blank=True)
    
    def save(self, *args, **kwargs):
        if not self.amount:
            days = (self.end_date - self.start_date).days
            self.amount = days * self.vehicle.cost_per_day
        super().save(*args, **kwargs)

    def can_user_cancel(self):
        """User can cancel if more than 2 days remain."""
        return timezone.now().date() <= self.start_date - timedelta(days=2)

    def can_owner_cancel(self):
        """Owner can cancel if more than 5 days remain."""
        return timezone.now().date() <= self.start_date - timedelta(days=5)



class Payment(models.Model):

    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('completed', 'Completed'),
        ('failed', 'Failed'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)

    reservation = models.OneToOneField(
        Reservation,
        on_delete=models.CASCADE,
        related_name='payment'
    )

    amount = models.DecimalField(max_digits=10, decimal_places=2)

    pidx = models.CharField(max_length=100, blank=True, null=True)
    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default='pending'
    )

    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Payment for Reservation {self.reservation.id}"
