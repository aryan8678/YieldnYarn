"""OpenCV preprocessing pipeline for grading evidence images.

Shared by ml-training (offline fine-tuning) and backend-fastapi/grading
(online inference) so preprocessing stays identical between train and serve.
See implementation_plan.md Section 9.4.
"""

from __future__ import annotations

import cv2
import numpy as np
from numpy.typing import NDArray


def extract_gabor_features(gray: NDArray[np.uint8], n_orientations: int = 4) -> NDArray[np.floating]:
    """Apply a bank of Gabor filters and return the mean response per orientation.

    Used to characterize texture (fabric weave patterns, grain surface texture).
    """
    features = []
    ksize = 31
    for i in range(n_orientations):
        theta = i * np.pi / n_orientations
        kernel = cv2.getGaborKernel((ksize, ksize), sigma=4.0, theta=theta, lambd=10.0, gamma=0.5, psi=0)
        filtered = cv2.filter2D(gray, cv2.CV_8UC3, kernel)
        features.append(float(np.mean(filtered)))
    return np.array(features, dtype=np.float64)


def preprocess_evidence(image_path: str) -> dict:
    """Preprocess a single evidence image for grading (ML input + classical features).

    Returns a dict with:
      - tensor: (224, 224, 3) float array normalized to [0, 1], model-ready
      - color_features: HSV 2D histogram (hue x saturation)
      - texture_features: Gabor filter bank response (texture/weave/grain patterns)
      - edge_density: fraction of pixels detected as edges (proxy for defects/foreign matter)
    """
    img = cv2.imread(image_path)
    if img is None:
        raise ValueError(f"Could not read image at {image_path!r}")

    # 1. Color analysis (dominant colors, uniformity)
    hsv = cv2.cvtColor(img, cv2.COLOR_BGR2HSV)
    color_histogram = cv2.calcHist([hsv], [0, 1], None, [180, 256], [0, 180, 0, 256])

    # 2. Texture analysis (Gabor filters for fabric, grain patterns)
    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    gabor_features = extract_gabor_features(gray)

    # 3. Edge detection (defect boundaries)
    edges = cv2.Canny(gray, 50, 150)
    edge_density = float(np.sum(edges > 0) / edges.size)

    # 4. Resize for model input
    resized = cv2.resize(img, (224, 224))
    normalized = resized / 255.0

    return {
        "tensor": normalized,
        "color_features": color_histogram,
        "texture_features": gabor_features,
        "edge_density": edge_density,
    }


if __name__ == "__main__":
    import sys

    if len(sys.argv) != 2:
        print("Usage: python preprocess.py <image_path>")
        raise SystemExit(1)

    result = preprocess_evidence(sys.argv[1])
    print(f"tensor shape: {result['tensor'].shape}")
    print(f"edge_density: {result['edge_density']:.4f}")
    print(f"texture_features: {result['texture_features']}")
