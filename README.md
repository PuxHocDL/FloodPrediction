# FloodPrediction

**FloodPrediction** là dự án dự đoán nguy cơ lũ lụt sử dụng máy học và giao diện web.

- **Backend:** Python + FastAPI, sử dụng mô hình Random Forest, chuẩn hóa dữ liệu và mã hóa one-hot.
- **Frontend:** ReactJS, giao diện thân thiện giúp người dùng nhập dữ liệu và gọi API dự đoán lũ.
- **Mục tiêu:** Hỗ trợ nhận diện các khu vực có nguy cơ lũ dựa trên các yếu tố môi trường như lượng mưa, dòng chảy sông, độ cao, và đặc điểm đất đai.

---

## Yêu cầu hệ thống

- **Hệ điều hành:** Windows, macOS, hoặc Linux  
- **Python:** >= 3.8  
- **Node.js:** 16.x trở lên (bao gồm npm)  
- **Git:** Để clone repository  
- **Dung lượng đĩa:** ~1GB (cho dataset, môi trường ảo và node_modules)

---

## Hướng dẫn cài đặt

### Bước 1: Clone repository

```bash
git clone https://github.com/PuxHocDL/FloodPrediction.git
cd FloodPrediction
```
### Bước 2: Cài đặt backend (Python)

```bash
# Tạo môi trường ảo
python -m venv backend/venv

# Kích hoạt môi trường ảo
# Windows
backend\venv\Scripts\activate
# macOS/Linux
source backend/venv/bin/activate

# Cài đặt phụ thuộc
pip install -r backend/requirements.txt
```
## Kiểm tra dataset
Đảm bảo file flood_risk_dataset_india.csv nằm trong thư mục backend/.

### Bước 3: Cài đặt frontend (React)

```bash
cd frontend
npm install
```

## Chạy dự án
### Chạy backend
```bash
# Từ thư mục gốc, đảm bảo môi trường ảo đã được kích hoạt
python backend/main.py
```
Server sẽ chạy tại http://localhost:8000.
Nếu mô hình classification_model.pkl chưa tồn tại, script sẽ tự động huấn luyện và lưu mô hình.
## Cách sử dụng
### Gọi API trực tiếp (backend)
#### Endpoint chính: /predict

#### Phương thức: POST

#### Body (JSON):

```bash
{
  "rainfall_mm": 200.0,
  "temperature_c": 30.0,
  "humidity_percent": 60.0,
  "river_discharge_m3s": 3000.0,
  "water_level_m": 5.0,
  "elevation_m": 100.0,
  "land_cover": "Urban",
  "soil_type": "Clay",
  "population_density": 5000.0,
  "infrastructure": 1,
  "historical_floods": 1
}
```
#### Phản hồi:
```bash
{
  "prediction": 1,
  "probability": 0.75
}
```
+ prediction: 1 (có lũ) hoặc 0 (không lũ)
+ probability: Xác suất xảy ra lũ (giá trị từ 0.0 đến 1.0)

## Sử dụng giao diện (Frontend)
+ Mở trình duyệt tại http://localhost:8000

+ Nhập dữ liệu (lượng mưa, nhiệt độ, v.v.) vào form

+ Nhấn nút Dự đoán để xem kết quả (có/không lũ và xác suất)
