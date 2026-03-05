from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import os

from app.routers import projects, predictor, chatbot, simulator

app = FastAPI(title="GridPulse API")

# Setup CORS
allowed_origins = os.getenv("CORS_ORIGINS", "*").split(",")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "https://gridpulse-webapp.netlify.app" 
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include Routers
app.include_router(projects.router)
app.include_router(predictor.router)
app.include_router(chatbot.router)
app.include_router(simulator.router)

@app.get("/")
def read_root():
    return {"message": "Welcome to GridPulse API"}

@app.get("/health")
def health_check():
    return {"status": "healthy"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="127.0.0.1", port=8000, reload=True)

