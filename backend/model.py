import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from sklearn.preprocessing import OneHotEncoder, StandardScaler
from sklearn.compose import ColumnTransformer
from sklearn.pipeline import Pipeline
from sklearn.metrics import accuracy_score, classification_report
import pickle
import os

DATA_PATH = "flood_risk_dataset_india.csv"

def train_and_save_model():
    """Huấn luyện mô hình Random Forest, chuẩn hóa dữ liệu số, mã hóa one-hot cho categorical features, và đánh giá trên tập test."""
    # Đọc dữ liệu
    df = pd.read_csv(DATA_PATH)
    
    # Đặc trưng và mục tiêu
    features = ['Rainfall (mm)', 'Temperature (°C)', 'Humidity (%)', 'River Discharge (m³/s)', 
                'Water Level (m)', 'Elevation (m)', 'Land Cover', 'Soil Type', 
                'Population Density', 'Infrastructure', 'Historical Floods']
    target = 'Flood Occurred'
    
    X = df[features]
    y = df[target]
    
    # Kiểm tra tỷ lệ lũ
    flood_ratio = y.mean()
    print(f"Flood Ratio (proportion of Flood Occurred = 1): {flood_ratio:.4f}")
    
    # Chia dữ liệu thành tập huấn luyện và kiểm tra
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
    
    # Xác định đặc trưng số và categorical
    categorical_features = ['Land Cover', 'Soil Type']
    numeric_features = [col for col in features if col not in categorical_features]
    
    # Tạo preprocessor:
    # - Chuẩn hóa các feature số bằng StandardScaler
    # - Mã hóa one-hot các feature categorical
    preprocessor = ColumnTransformer(
        transformers=[
            ('num', StandardScaler(), numeric_features),
            ('cat', OneHotEncoder(drop='first', sparse_output=False, handle_unknown='ignore'), categorical_features)
        ])
    
    # Pipeline cho mô hình Random Forest
    classification_model = Pipeline([
        ('preprocessor', preprocessor),
        ('classifier', RandomForestClassifier(n_estimators=100, random_state=42, class_weight='balanced'))
    ])
    
    # Huấn luyện mô hình
    classification_model.fit(X_train, y_train)
    
    # Đánh giá trên tập test
    y_pred = classification_model.predict(X_test)
    accuracy = accuracy_score(y_test, y_pred)
    report = classification_report(y_test, y_pred, output_dict=True)
    
    print(f"Test Accuracy: {accuracy:.4f}")
    print("Classification Report on Test Set:")
    print(f"Precision (No Flood): {report['0']['precision']:.4f}")
    print(f"Recall (No Flood): {report['0']['recall']:.4f}")
    print(f"F1-Score (No Flood): {report['0']['f1-score']:.4f}")
    print(f"Precision (Flood): {report['1']['precision']:.4f}")
    print(f"Recall (Flood): {report['1']['recall']:.4f}")
    print(f"F1-Score (Flood): {report['1']['f1-score']:.4f}")
    
    # Lưu mô hình
    with open('classification_model.pkl', 'wb') as f:
        pickle.dump(classification_model, f)
    
    return classification_model, X_train, X_test, y_train, y_test, df

def load_model_and_importance():
    """Tải mô hình đã lưu và tính feature importance."""
    # Load mô hình
    with open('classification_model.pkl', 'rb') as f:
        model = pickle.load(f)
    
    # Tính feature importance từ Random Forest
    feature_importance = model.named_steps['classifier'].feature_importances_
    
    # Định nghĩa feature names
    numeric_features = ['Rainfall (mm)', 'Temperature (°C)', 'Humidity (%)', 'River Discharge (m³/s)', 
                        'Water Level (m)', 'Elevation (m)', 'Population Density', 'Infrastructure', 
                        'Historical Floods']
    categorical_features = ['Land Cover', 'Soil Type']
    feature_names = numeric_features + list(
        model.named_steps['preprocessor']
        .named_transformers_['cat']
        .get_feature_names_out(categorical_features)
    )
    
    # Chuẩn hóa feature importance
    total_importance = feature_importance.sum()
    if total_importance > 0:
        feature_importance = feature_importance / total_importance
    else:
        feature_importance = np.zeros_like(feature_importance)  # Tránh chia cho 0
    
    return model, dict(zip(feature_names, feature_importance))

def predict_flood(input_data):
    """Dự đoán lũ từ dữ liệu đầu vào."""
    model, _ = load_model_and_importance()
    
    input_df = pd.DataFrame([input_data])
    
    prob = model.predict_proba(input_df)[0][1]
    prediction = model.predict(input_df)[0]
    
    return {"prediction": int(prediction), "probability": float(prob)}

def get_data_stats():
    """Lấy thống kê dữ liệu."""
    df = pd.read_csv(DATA_PATH)
    stats = {
        "total_rows": len(df),
        "rainfall_mean": df['Rainfall (mm)'].mean(),
        "rainfall_range": [df['Rainfall (mm)'].min(), df['Rainfall (mm)'].max()],
        "flood_ratio": df['Flood Occurred'].mean()
    }
    return stats

def get_rainfall_distribution():
    """Lấy phân phối lượng mưa."""
    df = pd.read_csv(DATA_PATH)
    bins = np.histogram(df['Rainfall (mm)'], bins=20)[1].tolist()
    counts = np.histogram(df['Rainfall (mm)'], bins=20)[0].tolist()
    return {"bins": bins, "counts": counts}

if __name__ == "__main__":
    if not os.path.exists('classification_model.pkl'):
        model, X_train, X_test, y_train, y_test, df = train_and_save_model()
        print("Model trained and saved as 'classification_model.pkl'.")
    else:
        print("Model already exists at 'classification_model.pkl'.")