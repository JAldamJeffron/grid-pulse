from pydantic import BaseModel
from typing import List, Optional

class LayerBase(BaseModel):
    name: str
    sequence: int
    planned_duration_days: int
    actual_duration_days: Optional[int] = None
    planned_monthly_workload: float
    completed_workload: float

class Layer(LayerBase):
    id: int
    project_id: int
    class Config:
        from_attributes = True

class ProjectBase(BaseModel):
    name: str
    terrain_type: str
    initial_budget: float

class Project(ProjectBase):
    id: int
    revised_cost: Optional[float] = None
    layers: List[Layer] = []
    class Config:
        from_attributes = True

class WhatIfPredictionInput(BaseModel):
    project_id: int
    weather_adds_days: int = 0
    cost_increase_percent: float = 0.0
    terrain_multiplier: float = 1.0
    vendor_supply_reduction_percent: float = 0.0
