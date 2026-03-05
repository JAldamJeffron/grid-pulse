from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.models.database import get_db
from app.models.database_models import HistoricalData
from typing import Dict, Any

router = APIRouter(prefix="/chatbot", tags=["chatbot"])

@router.post("/query")
def mock_ai_chat_query(query: Dict[str, str], db: Session = Depends(get_db)):
    """
    Super simplified mock AI matcher.
    Real AI would embed the text, but we perform simple keyword mapping to database queries here.
    """
    q_lower = query.get('text', '').lower()
    
    if "past" in q_lower or "400kv" in q_lower or "historic" in q_lower:
        # User is asking about historical delays.
        history = db.query(HistoricalData).limit(5).all()
        avg_delay = sum(h.delay_days for h in history) / (len(history) or 1)
        
        reasons = set()
        for h in history:
            if h.hindrance_tags:
                reasons.update([t.strip() for t in h.hindrance_tags.split(",")])
                
        reason_str = ", ".join(list(reasons)[:3])
        
        return {
            "reply": f"Historically, based on past 400kV projects, average delays are around {avg_delay:.0f} days. The top recurrent factors are usually: {reason_str}."
        }
        
    elif "hilly" in q_lower or "terrain" in q_lower:
        hilly_projs = db.query(HistoricalData).filter(HistoricalData.terrain_type == 'Hilly').all()
        avg = sum(h.delay_days for h in hilly_projs) / (len(hilly_projs) or 1)
        return {
            "reply": f"Hilly terrain historically adds roughly {avg:.0f} extra delay days to the excavation and foundation phases due to heavy machinery transit difficulties."
        }
    
    else:
        return {
            "reply": "I am the mocked AI assistant. Try asking me about 'past 400kV projects' or 'hilly terrain delays'."
        }
