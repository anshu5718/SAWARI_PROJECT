import requests
from django.conf import settings


def initiate_khalti_payment(payment):

    url = "https://a.khalti.com/api/v2/epayment/initiate/"

    payload = {
        "return_url": "http://localhost:3000/payment-success",     
        "website_url": "http://localhost:3000/",  
        "amount": int(payment.amount * 100),
        "purchase_order_id": str(payment.id),
        "purchase_order_name": "Vehicle Reservation Payment"
    }

    headers = {
        "Authorization": f"Key {settings.KHALTI_SECRET_KEY}",
        "Content-Type": "application/json"
    }

    response = requests.post(url, json=payload, headers=headers)
    data = response.json()

    payment.pidx = data.get("pidx")
    payment.save()

    return data.get("payment_url")


def verify_khalti_payment(pidx):

    url = "https://a.khalti.com/api/v2/epayment/lookup/"

    headers = {
        "Authorization": f"Key {settings.KHALTI_SECRET_KEY}"
    }

    response = requests.post(url, json={"pidx": pidx}, headers=headers)

    return response.json()
