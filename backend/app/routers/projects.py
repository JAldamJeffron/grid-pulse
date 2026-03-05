from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.models.database import get_db
from app.models.database_models import Project, Layer
from app.services.delay_engine import calculate_delay_propagation
from app.services.workload_accelerator import calculate_next_month_target

router = APIRouter(prefix="/projects", tags=["projects"])

@router.get("/")
def get_all_projects(db: Session = Depends(get_db)):
    return db.query(Project).all()

@router.get("/{project_id}/dashboard-data")
def get_project_dashboard(project_id: int, db: Session = Depends(get_db)):
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
        
    # Convert DB Models out to dicts for our Delay Engine
    layer_dicts = []
    for l in project.layers:
        layer_dicts.append({
            "id": l.id,
            "name": l.name,
            "sequence": l.sequence,
            "planned_duration_days": l.planned_duration_days,
            "actual_duration_days": l.actual_duration_days,
            "planned_monthly_workload": l.planned_monthly_workload,
            "completed_workload": l.completed_workload
        })
        
    filtered_and_calculated_layers = calculate_delay_propagation(layer_dicts)
    
    # Check total project delay to determine health indicator
    total_delay = sum(l.get('total_delay_impact', 0) for l in filtered_and_calculated_layers)
    health_status = 'Green'
    if total_delay > 90:
        health_status = 'Red'
    elif total_delay > 30:
        health_status = 'Yellow'
        
    # Calculate Workload acceleration next month target for the current active layer
    # Simplified: finding the first uncompleted layer to be the active one
    active_layer_next_target = None
    for l in filtered_and_calculated_layers:
        if l['actual_duration_days'] is None:
            active_layer_next_target = calculate_next_month_target(
                base_monthly_target=l['planned_monthly_workload'],
                previous_month_planned=l['planned_monthly_workload'], # Simplifying for prototype
                previous_month_actual=l['completed_workload']
            )
            break

    return {
        "project": {
            "id": project.id,
            "name": project.name,
            "terrain_type": project.terrain_type,
            "budget": project.initial_budget,
            "health_status": health_status,
            "total_delay_days": total_delay
        },
        "gantt_layers": filtered_and_calculated_layers,
        "next_workload_target_for_active_layer": active_layer_next_target
    }
