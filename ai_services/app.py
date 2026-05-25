from fastapi import FastAPI, HTTPException
from pydantic import BaseModel

from nutri_predictor import NutriPredictor
from food_classifier import predict_food_class


app = FastAPI(title="EatSistent AI Service")

predictor = NutriPredictor()


class NutritionRequest(BaseModel):
    tinggi_cm: float
    berat_kg: float
    usia: int
    jenis_kelamin: str
    activity_level: str
    target_user: str


class FoodClassifierRequest(BaseModel):
    data: dict


@app.get("/")
def home():
    return {
        "service": "EatSistent AI Service",
        "status": "running",
        "available_models": [
            "Model 1 - Nutrition Predictor",
            "Model 2 - Food Classifier"
        ]
    }


@app.post("/predict-nutrition")
def predict_nutrition(payload: NutritionRequest):
    try:
        prediction = predictor.predict(
            tinggi_cm=payload.tinggi_cm,
            berat_kg=payload.berat_kg,
            usia=payload.usia,
            jenis_kelamin=payload.jenis_kelamin,
            activity_level=payload.activity_level,
            target_user=payload.target_user
        )

        return {
            "success": True,
            "model": "Model 1 - Nutrition Predictor",
            "input": payload.model_dump(),
            "prediction": prediction
        }

    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@app.post("/predict-food-class")
def predict_food(payload: FoodClassifierRequest):
    try:
        prediction = predict_food_class(payload.data)

        return {
            "success": True,
            "model": "Model 2 - Food Classifier",
            "input": payload.data,
            "prediction": prediction
        }

    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))