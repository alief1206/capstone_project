import pickle
from pathlib import Path

import numpy as np
import tensorflow as tf


class NutriPredictor:
    def __init__(self):
        # Lokasi file ini: ai_services/nutri_predictor.py
        BASE_DIR = Path(__file__).resolve().parent

        # Karena folder model kamu sekarang:
        # ai_services/model ai/model1/
        self.model_path = BASE_DIR / "model ai" / "model1" / "best_nutri_model.keras"
        self.artifacts_path = BASE_DIR / "model ai" / "model1" / "eatsistent_artifacts.pkl"

        if not self.model_path.exists():
            raise FileNotFoundError(f"File model tidak ditemukan: {self.model_path}")

        if not self.artifacts_path.exists():
            raise FileNotFoundError(f"File artifacts tidak ditemukan: {self.artifacts_path}")

        with open(self.artifacts_path, "rb") as f:
            artifacts = pickle.load(f)

        # Load model
        self.model = tf.keras.models.load_model(self.model_path, compile=False)

        # Load scaler dan encoder
        self.x_scaler = artifacts["x_scaler"]
        self.y_scaler = artifacts["y_scaler"]
        self.le_dict = artifacts["le_dict"]

    def _encode_category(self, column_name, value):
        """
        Mengubah input kategori dari user menjadi angka sesuai LabelEncoder.
        Dibuat fleksibel agar tidak terlalu sensitif huruf besar/kecil.
        """
        encoder = self.le_dict[column_name]
        allowed_values = list(encoder.classes_)

        # Cek exact match
        if value in allowed_values:
            return encoder.transform([value])[0]

        # Cek case-insensitive match
        for allowed in allowed_values:
            if str(value).lower() == str(allowed).lower():
                return encoder.transform([allowed])[0]

        raise ValueError(
            f"Nilai '{value}' tidak valid untuk '{column_name}'. "
            f"Pilihan yang tersedia: {allowed_values}"
        )

    def predict(
        self,
        tinggi_cm,
        berat_kg,
        usia,
        jenis_kelamin,
        activity_level,
        target_user
    ):
        # Encode fitur kategori
        jenis_kelamin_encoded = self._encode_category("jenis_kelamin", jenis_kelamin)
        activity_encoded = self._encode_category("activity_level", activity_level)
        target_encoded = self._encode_category("target_user", target_user)

        # Urutan fitur harus sama seperti saat training
        x = np.array([[
            tinggi_cm,
            berat_kg,
            usia,
            jenis_kelamin_encoded,
            activity_encoded,
            target_encoded
        ]], dtype=np.float32)

        # Scaling input
        x_scaled = self.x_scaler.transform(x).astype(np.float32)

        # Prediksi
        y_scaled = self.model.predict(x_scaled, verbose=0)

        # Balikkan ke skala asli
        y_pred = self.y_scaler.inverse_transform(y_scaled)[0]

        return {
            "target_kalori": round(float(y_pred[0]), 0),
            "target_protein": round(float(y_pred[1]), 1),
            "target_karbo": round(float(y_pred[2]), 1),
            "target_lemak": round(float(y_pred[3]), 1)
        }
