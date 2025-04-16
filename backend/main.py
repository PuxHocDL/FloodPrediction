from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from model import predict_flood, get_data_stats, get_rainfall_distribution, load_model_and_importance
from fastapi.middleware.cors import CORSMiddleware
import os

app = FastAPI()


app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class FloodInput(BaseModel):
    rainfall_mm: float
    temperature_c: float
    humidity_percent: float
    river_discharge_m3s: float
    water_level_m: float
    elevation_m: float
    land_cover: str
    soil_type: str
    population_density: float
    infrastructure: int
    historical_floods: int

    def to_model_dict(self):
        return {
            'Rainfall (mm)': self.rainfall_mm,
            'Temperature (°C)': self.temperature_c,
            'Humidity (%)': self.humidity_percent,
            'River Discharge (m³/s)': self.river_discharge_m3s,
            'Water Level (m)': self.water_level_m,
            'Elevation (m)': self.elevation_m,
            'Land Cover': self.land_cover,
            'Soil Type': self.soil_type,
            'Population Density': self.population_density,
            'Infrastructure': self.infrastructure,
            'Historical Floods': self.historical_floods
        }


@app.get("/data-info")
def data_info():
    return get_data_stats()

@app.get("/rainfall-distribution")
def rainfall_distribution():
    return get_rainfall_distribution()


@app.get("/feature-importance")
def feature_importance():
    _, importance = load_model_and_importance()
    return importance


@app.post("/predict")
def predict(input_data: FloodInput):
    try:

        data = input_data.to_model_dict()

        required_fields = [
            'Rainfall (mm)', 'Temperature (°C)', 'Humidity (%)', 'River Discharge (m³/s)',
            'Water Level (m)', 'Elevation (m)', 'Land Cover', 'Soil Type',
            'Population Density', 'Infrastructure', 'Historical Floods'
        ]
        for field in required_fields:
            if field not in data or data[field] is None:
                raise ValueError(f"Thiếu field: {field}")

        result = predict_flood(data)
        return result
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Lỗi: {str(e)}")
    
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)