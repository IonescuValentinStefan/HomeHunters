from fastapi import FastAPI
from pydantic import BaseModel
from typing import List, Optional
import joblib
import pandas as pd
from ai_recommender import recommend_with_ai
from recommendation_weighted import rank_properties_by_similarity_weighted as rank_properties_by_similarity

model_rent, amenities_list = joblib.load("models/model_renting.pkl")
model_sell, _ = joblib.load("models/model_selling.pkl")

# Define request body model with all fields
class FormData(BaseModel):
    firstName: Optional[str] = None
    lastName: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    propertyType: Optional[str] = None
    transactionType: Optional[str] = None
    furnished: Optional[str] = None
    address: Optional[str] = None
    rooms: int
    bathrooms: Optional[int] = None
    surfaceArea: Optional[float] = None
    amenities: Optional[List[str]] = None
    customAmenities: Optional[List[str]] = None
    title: Optional[str] = None
    description: Optional[str] = None
    price: Optional[float] = None

class Property(BaseModel):
    id: str
    title: str
    description: str
    surfaceArea: float = 0.0
    rooms: int
    bathrooms: int = 1
    amenities: Optional[List[str]] = None
    transactionType: str
    furnished: Optional[str] = "unknown"
    propertyType: Optional[str] = "unknown"
    price: Optional[float] = None

class RecommendationRequest(BaseModel):
    all_properties: List[Property]
    favorite_properties: List[Property]

# Create app
app = FastAPI()

@app.get("/")
def read_root():
    return {"message": "Hello from FastAPI"}

@app.post("/calculate-price")
def calculate_price(data: FormData):
    print("Received data:", data.dict())

    # Choose model based on transaction type
    transaction_type = data.transactionType
    if transaction_type == "renting":
        model = model_rent
    elif transaction_type == "selling":
        model = model_sell
    else:
        return {"error": "transactionType must be 'renting' or 'selling'"}

    # Build input dictionary
    input_dict = {
        "propertyType": data.propertyType,
        "furnished": data.furnished,
        "address": data.address,
        "rooms": data.rooms,
        "bathrooms": data.bathrooms,
        "surfaceArea": data.surfaceArea,
        "rooms_x2": data.rooms,
        "rooms_x3": data.rooms,
    }

    # Add each amenity as binary feature
    for amenity in amenities_list:
        input_dict[f"amenity_{amenity}"] = int(data.amenities and amenity in data.amenities)

    # Convert to DataFrame
    input_df = pd.DataFrame([input_dict])

    print("Input sent to model:")
    print(input_df.T)

    # Predict
    predicted_price = model.predict(input_df)[0]

    predicted_price = int(round(predicted_price))

    print(f"Predicted price for {data.propertyType} ({transaction_type}): {predicted_price}")

    return {
        "price": predicted_price
    }

@app.post("/recommend")
async def recommend_ai(request: RecommendationRequest):
    print("Recommendation input:", request.dict())

    return rank_properties_by_similarity(
            request.all_properties,
            request.favorite_properties
        )