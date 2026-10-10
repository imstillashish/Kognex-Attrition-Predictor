from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from typing import List
import pickle
import pandas as pd
import os

app = FastAPI(title="Kognex API")

# Allow CORS for React frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # For dev only
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load model artifacts
model_path = os.path.join(os.path.dirname(__file__), '../Model/model.pkl')
try:
    with open(model_path, 'rb') as f:
        model_data = pickle.load(f)
        
    model = model_data['model']
    scaler = model_data['scaler']
    features = model_data['features']
    defaults = model_data['defaults']
except Exception as e:
    print(f"Error loading model: {e}")
    model = None
    features = []
    defaults = {}

@app.get("/api/")
def read_root():
    return {"status": "running", "model_loaded": model is not None}

@app.get("/api/dataset_stats")
def get_dataset_stats():
    try:
        data_path = os.path.join(os.path.dirname(__file__), '../Dataset/dataset.csv')
        df = pd.read_csv(data_path)
        
        dept_attrition = df.groupby('Department')['Attrition'].value_counts().unstack().fillna(0).to_dict('index')
        avg_income = df.groupby('Attrition')['MonthlyIncome'].mean().to_dict()
        
        df['DistanceGroup'] = pd.cut(df['DistanceFromHome'], bins=[0, 5, 10, 20, 50], labels=['0-5', '6-10', '11-20', '21+'])
        dist_attrition = df.groupby('DistanceGroup')['Attrition'].value_counts().unstack().fillna(0).to_dict('index')

        role_attrition = df.groupby('JobRole')['Attrition'].value_counts().unstack().fillna(0).to_dict('index')
        
        return {
            "department_attrition": dept_attrition,
            "average_income": avg_income,
            "distance_attrition": {str(k): v for k, v in dist_attrition.items()},
            "role_attrition": role_attrition
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/predict")
def predict(data: dict):
    if model is None:
        raise HTTPException(status_code=500, detail="Model not loaded")
        
    try:
        input_data = {}
        for feature in features:
            val = data.get(feature)
            if val is None or (isinstance(val, str) and val.strip() == "") or (isinstance(val, float) and pd.isna(val)):
                input_data[feature] = [defaults.get(feature, 0)]
            else:
                if isinstance(val, str) and val.isdigit():
                    val = int(val)
                input_data[feature] = [val]

                
        df = pd.DataFrame(input_data)
        df = df[features]
        X_scaled = scaler.transform(df)
        
        prediction = int(model.predict(X_scaled)[0])
        probability = float(model.predict_proba(X_scaled)[0][1])
        
        # Explainable AI: Feature impact
        impacts = []
        if hasattr(model, 'coef_'):
            coefs = model.coef_[0]
            for i, feature in enumerate(features):
                impact = coefs[i] * X_scaled[0][i]
                impacts.append({"feature": feature, "impact": float(impact)})
            impacts.sort(key=lambda x: abs(x["impact"]), reverse=True)
            top_drivers = impacts[:3]
        else:
            top_drivers = []
        
        return {
            "attrition": "Yes" if prediction == 1 else "No",
            "risk_probability": probability,
            "prediction_code": prediction,
            "top_drivers": top_drivers
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.post("/api/predict_batch")
def predict_batch(data_list: List[dict]):
    if model is None:
        raise HTTPException(status_code=500, detail="Model not loaded")
    
    try:
        rows = []
        for data in data_list:
            row_data = {}
            for feature in features:
                val = data.get(feature)
                if val is None or (isinstance(val, str) and val.strip() == "") or (isinstance(val, float) and pd.isna(val)):
                    row_data[feature] = defaults.get(feature, 0)
                else:
                    if isinstance(val, str) and val.isdigit():
                        val = int(val)
                    row_data[feature] = val
            rows.append(row_data)
        
        df = pd.DataFrame(rows)
        df = df[features]
        X_scaled = scaler.transform(df)
        
        predictions = model.predict(X_scaled)
        probabilities = model.predict_proba(X_scaled)[:, 1]
        
        results = []
        for i, (pred, prob) in enumerate(zip(predictions, probabilities)):
            impacts = []
            if hasattr(model, 'coef_'):
                coefs = model.coef_[0]
                for j, feature in enumerate(features):
                    impact = coefs[j] * X_scaled[i][j]
                    impacts.append({"feature": feature, "impact": float(impact)})
                impacts.sort(key=lambda x: abs(x["impact"]), reverse=True)
                top_drivers = impacts[:3]
            else:
                top_drivers = []

            # Include original data for easy rendering on frontend
            orig_data = data_list[i]
            results.append({
                "original_data": orig_data,
                "attrition": "Yes" if pred == 1 else "No",
                "risk_probability": float(prob),
                "prediction_code": int(pred),
                "top_drivers": top_drivers
            })
            
        return {"results": results}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
