import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split, cross_val_score, StratifiedKFold
from sklearn.preprocessing import StandardScaler
from sklearn.linear_model import LogisticRegression
from sklearn.ensemble import RandomForestClassifier
from xgboost import XGBClassifier
from sklearn.metrics import classification_report, roc_auc_score, precision_score, recall_score, f1_score
from imblearn.over_sampling import SMOTE
import pickle
import os

def load_and_preprocess_data(filepath):
    df = pd.read_csv(filepath)
    # Target variable
    df['Attrition'] = df['Attrition'].map({'Yes': 1, 'No': 0})
    
    # Drop irrelevant features
    df = df.drop(['EmployeeCount', 'Over18', 'StandardHours', 'EmployeeNumber'], axis=1, errors='ignore')
    
    # Separate numeric and categorical
    numeric_cols = df.select_dtypes(include=['int64', 'float64']).columns.tolist()
    if 'Attrition' in numeric_cols:
        numeric_cols.remove('Attrition')
    categorical_cols = df.select_dtypes(include=['object', 'str']).columns.tolist()
    
    # One-hot encode categorical features
    df = pd.get_dummies(df, columns=categorical_cols, drop_first=True)
    
    X = df.drop('Attrition', axis=1)
    y = df['Attrition']
    
    return X, y

def train():
    print("Loading data...")
    # Adjust path if running from root
    dataset_path = 'Dataset/dataset.csv' if os.path.exists('Dataset/dataset.csv') else '../Dataset/dataset.csv'
    X, y = load_and_preprocess_data(dataset_path)
    
    print("Splitting data...")
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42, stratify=y)
    
    print("Scaling features...")
    scaler = StandardScaler()
    X_train_scaled = scaler.fit_transform(X_train)
    X_test_scaled = scaler.transform(X_test)
    
    print("Applying SMOTE to handle imbalance...")
    smote = SMOTE(random_state=42)
    X_train_resampled, y_train_resampled = smote.fit_resample(X_train_scaled, y_train)  # type: ignore
    
    models = {
        "Logistic Regression": LogisticRegression(random_state=42, max_iter=1000),
        "Random Forest": RandomForestClassifier(random_state=42, n_estimators=100),
        "XGBoost": XGBClassifier(random_state=42, eval_metric='logloss')
    }
    
    best_model = None
    best_f1 = 0
    best_name = ""
    
    for name, model in models.items():
        print(f"\n--- Training {name} ---")
        model.fit(X_train_resampled, y_train_resampled)
        
        y_pred = model.predict(X_test_scaled)
        y_pred_proba = model.predict_proba(X_test_scaled)[:, 1]
        
        precision = precision_score(y_test, y_pred)
        recall = recall_score(y_test, y_pred)
        f1 = f1_score(y_test, y_pred)
        roc_auc = roc_auc_score(y_test, y_pred_proba)
        
        print(f"Precision: {precision:.4f}")
        print(f"Recall:    {recall:.4f}")
        print(f"F1 Score:  {f1:.4f}")
        print(f"ROC-AUC:   {roc_auc:.4f}")
        
        if f1 > best_f1:
            best_f1 = f1
            best_model = model
            best_name = name
            
    print(f"\nBest Model: {best_name} (F1: {best_f1:.4f})")
    
    print("Saving best model and scaler...")
    # Keep the feature names and their default values (medians/modes) to allow partial form inputs later
    feature_names = list(X.columns)
    defaults = X.median().to_dict()
    
    model_data = {
        'model': best_model,
        'scaler': scaler,
        'features': feature_names,
        'defaults': defaults,
        'model_name': best_name
    }
    
    with open('Model/model.pkl', 'wb') as f:
        pickle.dump(model_data, f)
    
    print("Done! Saved to Model/model.pkl")

if __name__ == "__main__":
    train()
