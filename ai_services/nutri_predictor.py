import pickle
import numpy as np
import tensorflow as tf


class NutriPredictor:
    def __init__(
        self,
        model_path="models/model1/best_nutri_model.keras",
        artifacts_path="models/model1/eatsistent_artifacts.pkl"
    ):
        with open(artifacts_path, "rb") as f:
            art = pickle.load(f)

        self.model = tf.keras.models.load_model(model_path)
        self.x_scaler = art["x_scaler"]
        self.y_scaler = art["y_scaler"]
        self.le_dict = art["le_dict"]

    def predict(
        self,
        tinggi_cm,
        berat_kg,
        usia,
        jenis_kelamin,
        activity_level,
        target_user
    ):
        gender_encoded = self.le_dict["jenis_kelamin"].transform([jenis_kelamin])[0]
        activity_encoded = self.le_dict["activity_level"].transform([activity_level])[0]
        target_encoded = self.le_dict["target_user"].transform([target_user])[0]

        x = np.array([[
            tinggi_cm,
            berat_kg,
            usia,
            gender_encoded,
            activity_encoded,
            target_encoded
        ]], dtype=np.float32)

        x_scaled = self.x_scaler.transform(x).astype(np.float32)

        y_scaled = self.model.predict(x_scaled, verbose=0)
        y_pred = self.y_scaler.inverse_transform(y_scaled)[0]

        return {
            "target_kalori": round(float(y_pred[0]), 0),
            "target_protein": round(float(y_pred[1]), 1),
            "target_karbo": round(float(y_pred[2]), 1),
            "target_lemak": round(float(y_pred[3]), 1)
        }
