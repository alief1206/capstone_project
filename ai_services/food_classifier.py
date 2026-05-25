import pickle
from pathlib import Path

import numpy as np
import tensorflow as tf
from tensorflow.keras import layers


class NutritionAttentionLayer(layers.Layer):
    """
    Custom layer dari model training.
    Wajib ada supaya file .keras bisa diload di backend.
    """

    def __init__(self, units=64, **kwargs):
        super().__init__(**kwargs)
        self.units = units
        self.W = None
        self.b = None
        self.context_vector = None

    def build(self, input_shape):
        feat_dim = int(input_shape[-1])

        self.W = self.add_weight(
            name="attention_W",
            shape=(feat_dim, self.units),
            initializer="glorot_uniform",
            trainable=True
        )

        self.b = self.add_weight(
            name="attention_b",
            shape=(self.units,),
            initializer="zeros",
            trainable=True
        )

        self.context_vector = self.add_weight(
            name="context_vector",
            shape=(self.units, 1),
            initializer="glorot_uniform",
            trainable=True
        )

        super().build(input_shape)

    def call(self, inputs, training=None):
        score = tf.nn.tanh(tf.matmul(inputs, self.W) + self.b)
        attention_weight = tf.nn.softmax(
            tf.matmul(score, self.context_vector),
            axis=0
        )
        return inputs * attention_weight

    def get_config(self):
        config = super().get_config()
        config.update({"units": self.units})
        return config


class FoodClassifier:
    def __init__(self):
        base_dir = Path(__file__).resolve().parent

        self.model_path = (
            base_dir
            / "model ai"
            / "model2"
            / "food_classifier_model.keras"
        )

        self.artifacts_path = (
            base_dir
            / "model ai"
            / "model2"
            / "food_classifier_artifacts.pkl"
        )

        if not self.model_path.exists():
            raise FileNotFoundError(
                f"Model 2 tidak ditemukan: {self.model_path}"
            )

        if not self.artifacts_path.exists():
            raise FileNotFoundError(
                f"Artifacts model 2 tidak ditemukan: {self.artifacts_path}"
            )

        self.model = tf.keras.models.load_model(
            self.model_path,
            custom_objects={
                "NutritionAttentionLayer": NutritionAttentionLayer
            },
            compile=False
        )

        with open(self.artifacts_path, "rb") as f:
            artifacts = pickle.load(f)

        self.scaler = artifacts["scaler"]
        self.class_names = artifacts["class_names"]

        if "feature_order" in artifacts:
            self.feature_order = artifacts["feature_order"]
        elif "feature_cols" in artifacts:
            self.feature_order = artifacts["feature_cols"]
        else:
            raise KeyError(
                "Artifacts harus punya key 'feature_order' atau 'feature_cols'."
            )

    def predict(self, data: dict):
        """
        data harus dictionary.
        Contoh:
        {
            "Energi": 250,
            "Protein": 15,
            "Lemak": 5,
            "Karbohidrat": 30,
            "Serat": 4
        }
        """

        x = np.array(
            [
                [
                    float(data.get(feature, 0))
                    for feature in self.feature_order
                ]
            ],
            dtype=np.float32
        )

        x_scaled = self.scaler.transform(x)

        probabilities = self.model.predict(x_scaled, verbose=0)[0]

        predicted_index = int(np.argmax(probabilities))

        if isinstance(self.class_names, dict):
            predicted_class = self.class_names.get(
                predicted_index,
                str(predicted_index)
            )
        else:
            predicted_class = self.class_names[predicted_index]

        probability_result = {}

        for i, prob in enumerate(probabilities):
            if isinstance(self.class_names, dict):
                class_label = self.class_names.get(i, str(i))
            else:
                class_label = self.class_names[i]

            probability_result[str(class_label)] = float(prob)

        return {
            "predicted_index": predicted_index,
            "predicted_class": predicted_class,
            "confidence": float(probabilities[predicted_index]),
            "probabilities": probability_result
        }


food_classifier = FoodClassifier()


def predict_food_class(data: dict):
    return food_classifier.predict(data)