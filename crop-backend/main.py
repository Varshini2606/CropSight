from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import joblib
import numpy as np

# Load models
scaler = joblib.load("scaler.pkl")
model = joblib.load("knn.pkl")

# FastAPI app
app = FastAPI()

# Allow CORS for your frontend (http://localhost:3000)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # or ["*"] to allow all origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Request schema
class NPKRequest(BaseModel):
    n: float
    p: float
    k: float
    temperature: float
    humidity: float
    ph: float
    #soil: float

# Root endpoint
@app.get("/")
def root():
    return {"message": "Crop Prediction API is running"}

# Predict endpoint
@app.post("/predict")
def predict_crop(data: NPKRequest):
    try:
        # Static default values for the missing 4 features
        # temperature = 25.0    # Default temperature in Celsius
        # humidity = 65.0       # Default humidity percentage
        # ph = 6.5              # Default pH level
        rainfall = 100.0      # Default rainfall in mm
        # Combine the 3 provided features with the 4 static features
        input_data = np.array([[
            data.n, data.p, data.k,
            data.temperature, data.humidity, data.ph,rainfall
        ]])

        print(f"Input data shape: {input_data.shape}, values: {input_data}")
        scaled = scaler.transform(input_data)
        prediction = model.predict(scaled)
        return {"crop": prediction[0]}
    except Exception as e:
        print(f"Error during prediction: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e)) 