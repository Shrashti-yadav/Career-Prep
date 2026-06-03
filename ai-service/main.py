import uvicorn
from app.server import create_app
from app.config import settings

# ✅ App must be created at module level
app = create_app()


if __name__ == "__main__":
    uvicorn.run(
        "main:app",   # important: must match this file name
        host="0.0.0.0",
        port=int(getattr(settings, "PORT", 8000)),
        reload=True,
    )