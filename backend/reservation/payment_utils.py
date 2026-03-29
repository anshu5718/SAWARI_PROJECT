import time
import requests
from django.conf import settings


def initiate_khalti_payment(payment):
    url = "https://a.khalti.com/api/v2/epayment/initiate/"

    paisa_amount = int(payment.amount * 100)
    if paisa_amount < 1000:
        paisa_amount = 1000 

    unique_order_id = f"PAY_{payment.id}_{int(time.time())}"

    payload = {
        "return_url": "http://localhost:3000/payment-success/", 
        "website_url": "http://localhost:3000/",
        "amount": paisa_amount,
        "purchase_order_id": unique_order_id,
        "purchase_order_name": "Vehicle Reservation"
    }

    headers = {
        "Authorization": f"Key {settings.KHALTI_SECRET_KEY}",
        "Content-Type": "application/json"
    }

    try:
        response = requests.post(url, json=payload, headers=headers)
        data = response.json()
        
        if not data.get("payment_url"):
            print(f"Khalti Validation Error: {data}")
            return None

        payment.pidx = data.get("pidx")
        payment.save()
        return data.get("payment_url")

    except Exception as e:
        print(f"Request failed: {e}")
        return None

def verify_khalti_payment(pidx):

    url = "https://a.khalti.com/api/v2/epayment/lookup/"

    headers = {
        "Authorization": f"Key {settings.KHALTI_SECRET_KEY}"
    }

    response = requests.post(url, json={"pidx": pidx}, headers=headers)

    return response.json()
