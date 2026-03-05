from sqlalchemy import Column, Integer, String, Float, Boolean, ForeignKey, DateTime
from sqlalchemy.orm import declarative_base, relationship
from datetime import datetime

Base = declarative_base()

class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True)
    hashed_password = Column(String)
    role = Column(String, default="viewer") # Admin, PM, Vendor, Viewer

class Project(Base):
    __tablename__ = "projects"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    terrain_type = Column(String) # Hilly, Flat, River Crossing
    initial_budget = Column(Float)
    revised_cost = Column(Float, nullable=True)
    start_date = Column(DateTime, default=datetime.utcnow)
    layers = relationship("Layer", back_populates="project_owner")

class Layer(Base):
    __tablename__ = "layers"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String) # Engineering, Supply, Land Acquisition, etc.
    sequence = Column(Integer) # 1 through 9
    
    planned_duration_days = Column(Integer)
    actual_duration_days = Column(Integer, nullable=True)
    
    planned_monthly_workload = Column(Float)
    completed_workload = Column(Float, default=0.0)

    project_id = Column(Integer, ForeignKey("projects.id"))
    project_owner = relationship("Project", back_populates="layers")

class HistoricalData(Base):
    __tablename__ = "historical_data"
    id = Column(Integer, primary_key=True, index=True)
    project_name = Column(String)
    terrain_type = Column(String)
    planned_days = Column(Integer)
    actual_days = Column(Integer)
    delay_days = Column(Integer)
    hindrance_tags = Column(String) # Comma separated tags e.g "Demand-Supply impact, Labor shortage"
