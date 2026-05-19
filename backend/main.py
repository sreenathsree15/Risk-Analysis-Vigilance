from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import json

app = FastAPI(title="Vigilance Monitoring API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

def load_data():
    with open("db.json", "r") as f:
        data = json.load(f)
    return data["cases"]

@app.get("/api/cases")
def get_cases():
    cases = load_data()
    return {"cases": cases}

@app.get("/api/stats")
def get_stats():
    cases = load_data()
    
    total = len(cases)
    pending = sum(1 for c in cases if c["status"] == "Pending")
    resolved = sum(1 for c in cases if c["status"] == "Resolved")
    in_progress = sum(1 for c in cases if c["status"] == "In Progress")
    
    high_severity = sum(1 for c in cases if c["severity"] == "High")
    
    return {
        "total": total,
        "pending": pending,
        "resolved": resolved,
        "in_progress": in_progress,
        "high_severity": high_severity
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
