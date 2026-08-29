# ML Training — MSME Marketplace Grading Pipeline

Scripts and notebooks used to fine-tune the grading models consumed by
`backend-fastapi/grading/`. See `implementation_plan.md` §9 for full architecture.

## Pipeline

```
Evidence Upload → Django (file storage) → FastAPI (grading trigger)
                                              ↓
                                    OpenCV preprocessing (scripts/preprocess.py)
                                              ↓
                                    MobileNetV3 (classification) / YOLOv8n (detection)
                                              ↓
                                    Confidence score + attribute grades
                                              ↓
                              confidence ≥ 80%?  → grading_results (AI)
                              confidence < 80%?  → verification queue
```

## Grading attributes by vertical

| Vertical | ML-gradeable | Not ML-gradeable (manual/instrument) |
|---|---|---|
| Agriculture (e.g. wheat) | `foreign_matter` (visual defect detection) | `moisture_content`, `grade_standard` |
| Textiles (e.g. cotton fabric) | `defect_rate` (weaving defects, stains, holes) | `gsm`, `thread_count` |

## Model selection

| Model | Params | Size | CPU inference | GPU inference | Use case |
|---|---|---|---|---|---|
| MobileNetV3-Small | 2.5M | 10MB | ~15ms | ~3ms | Grade classification |
| YOLOv8n | 3.2M | 6MB | ~30ms | ~5ms | Defect/foreign-matter localization |

## Training plan

1. Start from pretrained weights (ImageNet for MobileNetV3, COCO for YOLOv8n) for general
   feature extraction — expect low initial accuracy and heavy verifier routing.
2. As verifier-confirmed results accumulate (target: 200+ labeled images per class), fine-tune
   on `data/` (not checked into git — see `.gitignore`).
3. Fine-tuning runs locally on an RTX 3050 6GB, well within VRAM budget for both models.

## Setup

```bash
cd ml-training
python3 -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
```

## Layout

```
notebooks/    Exploratory training/eval notebooks
scripts/      Reusable preprocessing + training/eval scripts
data/         Local-only training data (gitignored)
```
