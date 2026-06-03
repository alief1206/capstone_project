import os
import warnings


def configure_ai_runtime():
    os.environ.setdefault("TF_CPP_MIN_LOG_LEVEL", "2")
    os.environ.setdefault("TF_ENABLE_ONEDNN_OPTS", "0")

    warnings.filterwarnings(
        "ignore",
        message="TensorFlow GPU support is not available on native Windows*",
        category=Warning
    )


def quiet_tensorflow(tf_module):
    tf_module.get_logger().setLevel("ERROR")
