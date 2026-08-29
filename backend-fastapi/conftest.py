import sys
from pathlib import Path

# Ensure `backend-fastapi/` is importable as the root package dir (e.g. `db`,
# `matching.allocation`) regardless of the directory pytest is invoked from.
sys.path.insert(0, str(Path(__file__).resolve().parent))
