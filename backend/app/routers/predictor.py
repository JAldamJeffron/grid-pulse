from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.models.database import get_db
from app.models.database_models import Project
from app.schemas import WhatIfPredictionInput
from app.services.delay_engine import calculate_delay_propagation

router = APIRouter(prefix="/predictor", tags=["predictor"])

@router.post("/simulate")
def simulate_what_if_scenario(data: WhatIfPredictionInput, db: Session = Depends(get_db)):
    project = db.query(Project).filter(Project.id == data.project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    layer_dicts = []
    for l in project.layers:
        ld = {
            "id": l.id,
            "name": l.name,
            "sequence": l.sequence,
            "planned_duration_days": l.planned_duration_days,
            "actual_duration_days": l.actual_duration_days or 0, # Assume 0 actual if not started for simulation basis
        }
        
        # Apply external factors dynamically before the cascading recursive engine runs
        
        # 1. Weather adds to Phase 6 (Foundation)
        if ld['sequence'] == 6 and data.weather_adds_days > 0:
            ld['actual_duration_days'] += data.weather_adds_days 
            
        # 2. Terrain changes add multiplier to Phase 5 (Excavation)
        if ld['sequence'] == 5 and data.terrain_multiplier > 1.0:
            added_exc = ld['planned_duration_days'] * (data.terrain_multiplier - 1.0)
            ld['actual_duration_days'] += added_exc
            
        # 3. Supply specific offset based on Vendor 
        if ld['sequence'] == 2 and data.vendor_supply_reduction_percent > 0:
            # Reverses some delays
            reduction = ld['planned_duration_days'] * (data.vendor_supply_reduction_percent / 100)
            ld['actual_duration_days'] = max(0, ld['actual_duration_days'] - reduction)
            
        layer_dicts.append(ld)
        
    simulated_layers = calculate_delay_propagation(layer_dicts)
    new_total_duration = sum(l.get('projected_duration_days', 0) for l in simulated_layers)
    
    # Calculate Revised Financial budget
    new_financial_cost = project.initial_budget * (1.0 + (data.cost_increase_percent / 100))

    return {
        "status": "success",
        "predicted_total_duration_days": new_total_duration,
        "predicted_revised_cost": new_financial_cost,
        "simulated_layer_breakdown": simulated_layers
    }
