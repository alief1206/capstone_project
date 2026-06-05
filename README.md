# EatSistent

EatSistent adalah aplikasi web rekomendasi nutrisi personal. Aplikasi ini membantu pengguna mencatat makanan, melihat progres kebutuhan kalori, dan mendapatkan insight nutrisi berbasis profil tubuh serta tujuan kesehatan.

## Cara Download ZIP dari GitHub

1. Buka halaman repository GitHub EatSistent.
2. Klik tombol **Code**.
3. Pilih **Download ZIP**.
4. Extract file ZIP, lalu buka folder project di terminal.

Repository ini disiapkan agar bisa di-install dan dijalankan dari nol oleh assessor tanpa membutuhkan file `.env` asli, `node_modules`, build output, cache, atau kredensial sensitif.

## Tech Stack

- Frontend: React, Vite, Tailwind CSS
- Backend: Node.js, Express.js, Prisma
- Database: MySQL
- AI Service: Python, TensorFlow/Keras
- Dashboard Data Science: Streamlit, Pandas, Plotly

## Prasyarat

Pastikan perangkat sudah memiliki:

- Node.js 20 atau versi LTS terbaru
- npm
- MySQL Server
- Python 3.10 atau lebih baru
- pip

## Struktur Folder

```text
capstone_project/
|-- README.md
|-- .env.example
|-- .gitignore
|-- package.json
|-- package-lock.json
|-- prisma/
|   `-- schema.prisma
|-- server/
|   |-- controllers/
|   |-- middlewares/
|   `-- routes/
|-- src/
|   |-- assets/
|   |-- components/
|   |-- context/
|   |-- hooks/
|   |-- pages/
|   |-- services/
|   `-- utils/
|-- ai_services/
|   |-- app.py
|   |-- food_classifier.py
|   |-- nutri_predictor.py
|   `-- requirements.txt
|-- data-science/
|   `-- data/
|       |-- dashboard.py
|       |-- requirements.txt
|       |-- nutrition_dataset/
|       `-- user_dataset/
`-- tests/
```

## Setup dari Nol

1. Download ZIP dari GitHub atau clone repository:

```bash
git clone https://github.com/alief1206/capstone_project.git
cd capstone_project
```

Jika menggunakan ZIP, masuk ke folder hasil extract:

```bash
cd capstone_project
```

2. Install dependencies JavaScript:

```bash
npm install
```

3. Siapkan environment:

```bash
cp .env.example .env
```

Isi nilai di `.env` sesuai konfigurasi lokal. File `.env` tidak perlu dan tidak boleh diupload ke GitHub.

Contoh konfigurasi minimal lokal:

```env
DATABASE_URL="mysql://root:password_mysql@localhost:3306/eatsistent_db"
JWT_SECRET="ganti_dengan_secret_lokal"
PORT=5000
NODE_ENV="development"
FRONTEND_URL="http://localhost:5173"
AI_NUTRITION_URL="http://127.0.0.1:8000/predict-nutrition"
AI_FOOD_CLASS_URL="http://127.0.0.1:8000/predict-food-class"
EMAIL_USER="your_email@example.com"
EMAIL_PASS="your_email_app_password"
VITE_API_BASE_URL="http://localhost:5000/api/v1"
GOOGLE_CLIENT_ID="your_google_oauth_client_id.apps.googleusercontent.com"
VITE_GOOGLE_CLIENT_ID="your_google_oauth_client_id.apps.googleusercontent.com"
GOOGLE_API_KEY="your_google_api_key"
VITE_GOOGLE_API_KEY="your_google_api_key"
APP_TIME_ZONE="Asia/Jakarta"
```

4. Buat database MySQL:

```sql
CREATE DATABASE eatsistent_db;
```

5. Generate Prisma Client:

```bash
npm run prisma:generate
```

6. Jalankan migrasi database:

```bash
npm run prisma:migrate:deploy
```

7. Jalankan backend:

```bash
npm run start
```

8. Jalankan frontend pada terminal lain:

```bash
npm run dev
```

9. Buka aplikasi di browser:

```text
http://localhost:5173
```

## Menjalankan AI Service

Install dependencies Python:

```bash
pip install -r ai_services/requirements.txt
```

Jalankan service:

```bash
cd ai_services
uvicorn app:app --reload --host 127.0.0.1 --port 8000
```

AI service berjalan di:

```text
http://127.0.0.1:8000
```

Jika file model tidak tersedia di repository, download artifact model dari storage eksternal yang disediakan tim, lalu letakkan di folder berikut:

```text
ai_services/model ai/model1/
ai_services/model ai/model2/
```

## Menjalankan Dashboard Data Science

Install dependencies dashboard:

```bash
pip install -r data-science/data/requirements.txt
```

Jalankan Streamlit:

```bash
streamlit run data-science/data/dashboard.py
```

## Environment Variables

Template environment tersedia di `.env.example`. Variabel yang perlu disiapkan:

```text
DATABASE_URL=
JWT_SECRET=
PORT=
FRONTEND_URL=
AI_NUTRITION_URL=
AI_FOOD_CLASS_URL=
EMAIL_USER=
EMAIL_PASS=
VITE_API_BASE_URL=
GOOGLE_CLIENT_ID=
VITE_GOOGLE_CLIENT_ID=
```

File `.env.example` hanya berisi nama variabel dan contoh nilai non-sensitif. Password, token, API key, dan secret asli hanya boleh disimpan di `.env` lokal atau secret manager platform deploy.

## Model ML

File model seperti `.keras`, `.h5`, dan `.pkl` tidak disimpan di GitHub karena ukurannya besar dan dapat membuat repository berat. Simpan artifact model di Google Drive atau storage eksternal, lalu download ke folder yang dibutuhkan saat menjalankan AI service secara lokal.

Daftar artifact yang dibutuhkan AI service:

```text
ai_services/model ai/model1/best_nutri_model.keras
ai_services/model ai/model1/eatsistent_artifacts.pkl
ai_services/model ai/model2/food_classifier_model.keras
ai_services/model ai/model2/food_classifier_artifacts.pkl
```

## Scripts

```bash
npm run dev
npm run build
npm run start
npm run test
npm run prisma:generate
npm run prisma:migrate:deploy
```

## Testing

Jalankan test:

```bash
npm run test
```

## Catatan Git

- Upload source code, konfigurasi aman, `.env.example`, dan dokumentasi.
- Jangan upload `.env`, `node_modules/`, `dist/`, virtual environment, cache, atau model artifact besar.
- Gunakan `.gitignore` untuk menjaga repository tetap bersih dan aman.
- Jika ingin mengumpulkan ZIP, gunakan tombol **Code -> Download ZIP** di GitHub setelah semua perubahan dipush.
