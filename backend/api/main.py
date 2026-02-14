from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from api.routes import resume, history
import os

app = FastAPI(
    title="Resume ATS Optimizer API",
    description="Backend API for Resume ATS Optimizer",
    version="1.0.0",
)

# CORS configuration
origins = [
    "http://localhost:5173",
    "http://localhost:3000",
    "https://resume-ats-pro.netlify.app",
    os.getenv("FRONTEND_URL", ""),
]
# Filter out empty strings
origins = [o for o in origins if o]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routes
app.include_router(resume.router)
app.include_router(history.router)

@app.get("/")
async def root():
    return {"status": "ok", "message": "Resume ATS Optimizer API"}

@app.get("/api/health")
async def health():
    return {"status": "healthy"}
