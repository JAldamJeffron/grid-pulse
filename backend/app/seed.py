from app.models.database import get_db, init_db, SessionLocal
from app.models.database_models import HistoricalData, Project, Layer
import random

def seed_database():
    init_db()
    db = SessionLocal()
    
    # Check if already seeded
    if db.query(HistoricalData).first():
        print("Database already seeded")
        return

    print("Seeding database...")
    
    # 1. Seed Historical Data (for the AI Chatbot mock)
    terrains = ["Hilly", "Flat", "River Crossing"]
    tags_pool = ["Demand-Supply impact", "Labor shortage", "Contractor default", "Local resistance", "Forest permit delay"]
    
    for i in range(1, 41): # 40 historical projects
        t = random.choice(terrains)
        planned = random.randint(300, 800)
        delay = random.randint(30, 200)
        
        # Hilly terrain adds more delay naturally
        if t == "Hilly": delay += 50
            
        tags = ", ".join(random.sample(tags_pool, k=random.randint(1, 3)))
        
        hist = HistoricalData(
            project_name=f"Past Project {i}00kV",
            terrain_type=t,
            planned_days=planned,
            actual_days=planned + delay,
            delay_days=delay,
            hindrance_tags=tags
        )
        db.add(hist)
        
    # 2. Seed an initial active project
    active_project = Project(
        name="Transmission Line 765kV - Alpha",
        terrain_type="Flat",
        initial_budget=5000000.0,
        revised_cost=5000000.0,
    )
    db.add(active_project)
    db.commit() # commit to get ID
    
    # 3. Seed the 9 specific Layers for this active project
    layer_names = [
        "Engineering", "Supply", "Land Acquisition", "Leveling",
        "Excavation", "Concreting/Foundation", "Erection", 
        "Testing", "Commissioning"
    ]
    
    base_planned_days = [30, 60, 90, 45, 60, 90, 120, 30, 15]
    
    for i, name in enumerate(layer_names):
        layer = Layer(
            name=name,
            sequence=i + 1,
            planned_duration_days=base_planned_days[i],
            actual_duration_days=None,
            planned_monthly_workload=random.randint(500, 2000), # Mock quantitative target
            completed_workload=0.0,
            project_id=active_project.id
        )
        db.add(layer)
        
    db.commit()
    db.close()
    print("Database seeding complete!")
    
if __name__ == "__main__":
    seed_database()
