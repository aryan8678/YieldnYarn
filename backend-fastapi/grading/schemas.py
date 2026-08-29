from datetime import datetime
from typing import Optional

from pydantic import BaseModel


class GradeRequest(BaseModel):
    listing_id: int


class GradeResponse(BaseModel):
    listing_id: int
    grading_result_id: Optional[int] = None
    attribute_scores: dict
    overall_confidence: float
    needs_verification: bool
    method: str
    created_at: Optional[datetime] = None
    persistence_error: Optional[str] = None


class GradingStatusResponse(BaseModel):
    listing_id: int
    status: str  # NOT_GRADED | VERIFICATION_PENDING | GRADED
    confidence_score: Optional[float] = None
    attribute_scores: Optional[dict] = None
    source: Optional[str] = None
    created_at: Optional[datetime] = None
