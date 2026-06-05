# EatSistent

EatSistent adalah aplikasi web rekomendasi nutrisi personal. Aplikasi ini membantu pengguna mencatat makanan, melihat progres kebutuhan kalori, dan mendapatkan insight nutrisi berbasis profil tubuh serta tujuan kesehatan.

## Tech Stack

- Frontend: React, Vite, Tailwind CSS
- Backend: Node.js, Express.js, Prisma
- Database: MySQL
- AI Service: Python, TensorFlow/Keras
- Dashboard Data Science: Streamlit, Pandas, Plotly

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

## Setup Project

1. Clone repository:

```bash
git clone https://github.com/alief1206/capstone_project.git
cd capstone_project
```

2. Install dependencies Node.js:

```bash
npm install
```

3. Siapkan environment:

```bash
cp .env.example .env
```

Isi nilai di `.env` sesuai konfigurasi lokal. Jangan upload file `.env` ke GitHub.

4. Generate Prisma Client:

```bash
npm run prisma:generate
```

5. Jalankan migrasi database:

```bash
npm run prisma:migrate:deploy
```

6. Jalankan backend:

```bash
npm run start
```

7. Jalankan frontend pada terminal lain:

```bash
npm run dev
```

## Menjalankan AI Service

Install dependencies Python:

```bash
pip install -r ai_services/requirements.txt
```

Jalankan service:

```bash
python ai_services/app.py
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

Template environment tersedia di `.env.example`. Variabel penting:

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
