from fastapi import APIRouter
from pydantic import BaseModel
from app.services.autonomous_engine import check_autonomous_events

router = APIRouter(prefix="/simulator", tags=["simulator"])

class SimulatorRequest(BaseModel):
    current_date: str
    location: str
    base_budget: float

@router.post("/autonomous-events")
def get_autonomous_events(req: SimulatorRequest):
    # Daily overhead explicitly hardcoded for simulator sync
    daily_overhead = 150000 
    
    result = check_autonomous_events(
        req.current_date, 
        req.location, 
        req.base_budget, 
        daily_overhead
    )
    
    return result
