from pydantic import BaseModel


class FindMatchesRequest(BaseModel):
    requirement_id: int


class AllocateRequest(BaseModel):
    requirement_id: int
    strategy: str = "greedy"
