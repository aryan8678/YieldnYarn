"""ML grading pipeline (implementation_plan.md §9).

Lazily imports the heavy ML stack (opencv-python, torch, torchvision,
ultralytics, numpy — see requirements-ml.txt) so the base service stays fast
to install and boots cleanly without them. When unavailable, grading falls
back to a deterministic stub result (clearly logged) so the rest of the
system — DB writes, verification-queue routing, API contracts — can still be
exercised end-to-end without the ML dependencies installed.

TODO: once requirements-ml.txt is installed, replace the OpenCV-feature
proxy heuristic below with real MobileNetV3-Small / YOLOv8n inference using
weights fine-tuned by ml-training/ (see §9.3).
"""
from __future__ import annotations

import importlib.util
import logging
from pathlib import Path
from typing import Callable, Optional

logger = logging.getLogger("grading.pipeline")

# confidence < 80% -> route to verification queue (§9.1)
CONFIDENCE_VERIFICATION_THRESHOLD = 0.80

# Kept in sync with ml-training/scripts/preprocess.py rather than duplicated —
# we dynamically load that file's `preprocess_evidence()` function so both
# training and serving share identical preprocessing logic.
_PREPROCESS_MODULE_PATH = Path(__file__).resolve().parents[2] / "ml-training" / "scripts" / "preprocess.py"


def _load_preprocess_evidence() -> Optional[Callable[[str], dict]]:
    """Best-effort dynamic import of `preprocess_evidence` from ml-training.

    Returns None (never raises) if opencv/numpy aren't installed, the file
    is missing, or import otherwise fails — callers should fall back to the
    stub grading path in that case.
    """
    if not _PREPROCESS_MODULE_PATH.exists():
        logger.warning("preprocess.py not found at %s", _PREPROCESS_MODULE_PATH)
        return None
    try:
        spec = importlib.util.spec_from_file_location("ml_training_preprocess", _PREPROCESS_MODULE_PATH)
        if spec is None or spec.loader is None:
            return None
        module = importlib.util.module_from_spec(spec)
        spec.loader.exec_module(module)  # raises ImportError if cv2/numpy missing
        return module.preprocess_evidence
    except ImportError as exc:
        logger.warning(
            "ML deps not installed (%s) -> falling back to stub grading. "
            "TODO: pip install -r requirements-ml.txt and plug in trained weights from ml-training/.",
            exc,
        )
        return None
    except Exception:
        logger.exception("Unexpected error loading preprocess_evidence; falling back to stub grading")
        return None


def _stub_result(attribute_names: list[str], reason: str) -> dict:
    logger.warning(
        "Using deterministic stub grading result (%s). "
        "TODO: pip install -r requirements-ml.txt and plug in trained weights from ml-training/.",
        reason,
    )
    confidence = 0.75  # deliberately below the 80%% threshold -> routes to verification
    scores = {name: confidence for name in attribute_names}
    return {
        "attribute_scores": scores,
        "overall_confidence": confidence,
        "needs_verification": confidence < CONFIDENCE_VERIFICATION_THRESHOLD,
        "method": f"stub-fallback ({reason})",
    }


def grade_attributes(evidence_paths: list[str], ml_attribute_names: list[str]) -> dict:
    """Grade the ML-gradeable attributes for a listing from its evidence images.

    Args:
        evidence_paths: local file paths of uploaded IMAGE evidence for the listing.
        ml_attribute_names: names of attributes flagged `gradeable_by_ml: true`
            in the vertical's grading_schema (§3.1). Non-ML attributes, e.g.
            moisture_content, thread_count, require manual/instrument entry
            and are out of scope here.

    Returns:
        dict with keys: attribute_scores (dict[str, float] in [0, 1]),
        overall_confidence (float in [0, 1]), needs_verification (bool),
        method (str, human-readable description of how scores were derived).
    """
    if not ml_attribute_names:
        return _stub_result([], reason="no ML-gradeable attributes configured for this vertical")

    preprocess_evidence = _load_preprocess_evidence()
    if preprocess_evidence is None:
        return _stub_result(ml_attribute_names, reason="requirements-ml.txt not installed")

    if not evidence_paths:
        return _stub_result(ml_attribute_names, reason="no image evidence uploaded")

    edge_densities: list[float] = []
    for path in evidence_paths:
        try:
            features = preprocess_evidence(path)
            edge_densities.append(features["edge_density"])
        except Exception as exc:
            logger.warning("Failed to preprocess evidence %s: %s", path, exc)

    if not edge_densities:
        return _stub_result(ml_attribute_names, reason="all evidence files failed to preprocess")

    avg_edge_density = sum(edge_densities) / len(edge_densities)
    # TODO: replace with real MobileNetV3/YOLOv8n inference (§9.3). This is a
    # crude interim proxy pending trained weights: fewer detected edges is
    # treated as fewer visible defects/foreign matter, scored inversely to
    # edge density and clipped to [0, 1].
    proxy_score = max(0.0, min(1.0, 1.0 - avg_edge_density))
    scores = {name: round(proxy_score, 4) for name in ml_attribute_names}
    confidence = round(proxy_score, 4)

    return {
        "attribute_scores": scores,
        "overall_confidence": confidence,
        "needs_verification": confidence < CONFIDENCE_VERIFICATION_THRESHOLD,
        "method": "opencv-heuristic-proxy (pretrained model weights not yet plugged in)",
    }
