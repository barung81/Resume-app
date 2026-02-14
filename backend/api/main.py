from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from api.routes import resume, history
import os

app = FastAPI(
    title="Resume ATS Optimizer API",
    description="API for analyzing resumes against job descriptions using ATS scoring",
    version="1.0.0",
)

# CORS configuration
origins = [
    "http://localhost:5173",
    "http://localhost:3000",
    "https://resume-ats-pro.netlify.app",  # Your Netlify URL
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

@app.middleware("http")
async def log_requests(request, call_next):
    print(f"Incoming request: {request.method} {request.url}")
    if request.method == "POST":
        content_type = request.headers.get("content-type", "")
        print(f"Content-Type: {content_type}")
    
    response = await call_next(request)
    print(f"Response status: {response.status_code}")
    return response

# Include routes
app.include_router(resume.router)
app.include_router(history.router)


@app.get("/")
async def root():
    return {"status": "ok", "message": "Resume ATS Optimizer API"}


@app.get("/api/health")
async def health():
    return {"status": "healthy"}


@app.get("/api/models")
async def list_models():
    """List available Gemini models for debugging."""
    try:
        import google.generativeai as genai
        api_key = os.getenv("GEMINI_API_KEY")
        if not api_key:
            return {"error": "GEMINI_API_KEY not set"}
        
        genai.configure(api_key=api_key)
        models = []
        for m in genai.list_models():
            models.append({
                "name": m.name,
                "display_name": m.display_name,
                "supported_methods": m.supported_generation_methods
            })
        return {"models": models}
    except Exception as e:
        return {"error": str(e)}
