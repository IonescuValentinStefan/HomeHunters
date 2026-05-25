import requests

url = "http://127.0.0.1:8000/calculate-price"

payloads = [
    {
        "firstName": "Ion",
        "lastName": "Popescu",
        "email": "ion@example.com",
        "phone": "0712345678",
        "propertyType": "apartment",
        "transactionType": "renting",
        "furnished": "furnished",
        "address": "Strada Exemplu 1",
        "rooms": 2,
        "bathrooms": 1,
        "surfaceArea": 50.0,
        "amenities": ["wifi", "air-conditioning"],
        "customAmenities": [],
        "title": "Apartament mic",
        "description": "Mic și luminos",
        "price": 0.0
    },
    {
        "firstName": "Maria",
        "lastName": "Ionescu",
        "email": "maria@example.com",
        "phone": "0722222222",
        "propertyType": "house",
        "transactionType": "renting",
        "furnished": "unfurnished",
        "address": "Strada Test 2",
        "rooms": 5,
        "bathrooms": 2,
        "surfaceArea": 150.0,
        "amenities": ["parking", "garden"],
        "customAmenities": [],
        "title": "Casă spațioasă",
        "description": "Perfectă pentru familie",
        "price": 0.0
    }
]

for i, data in enumerate(payloads, start=1):
    response = requests.post(url, json=data)
    if response.ok:
        print(f"✅ Predicție {i}: {response.json()['price']} €")
    else:
        print(f"❌ Eroare la predicția {i}: {response.status_code} – {response.text}")
