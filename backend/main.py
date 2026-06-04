from fastapi import FastAPI, Header, HTTPException, status, Depends
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import json
from auth import create_jwt, decode_jwt
from smtp_client import send_reset_email

app = FastAPI(title="Vigilance Monitoring API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# In-memory user database
USERS_DB = {
    "admin@vigilance.gov.in": {
        "password": "admin123",
        "name": "Admin Officer",
        "role": "Administrator"
    }
}

class LoginRequest(BaseModel):
    username: str
    password: str

class ForgotPasswordRequest(BaseModel):
    email: str

class ResetPasswordRequest(BaseModel):
    token: str
    new_password: str

def load_data():
    with open("db.json", "r") as f:
        data = json.load(f)
    return data["cases"]

# Dependency to secure routes with JWT
def get_current_user(authorization: str = Header(None)):
    if not authorization:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Missing Authorization Header"
        )
    try:
        parts = authorization.split(" ")
        if len(parts) != 2 or parts[0].lower() != "bearer":
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid authorization format. Use 'Bearer <token>'"
            )
        token = parts[1]
        payload = decode_jwt(token)
        if not payload:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid or expired authentication token"
            )
        return payload
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Error decoding authentication token"
        )

@app.post("/api/auth/login")
def login(req: LoginRequest):
    user = USERS_DB.get(req.username)
    if not user or user["password"] != req.password:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid username or password"
        )
    # Generate token (expires in 24 hours)
    token = create_jwt({"sub": req.username, "name": user["name"], "role": user["role"]}, expires_in=86400)
    return {
        "access_token": token,
        "token_type": "bearer",
        "user": {
            "username": req.username,
            "name": user["name"],
            "role": user["role"]
        }
    }

@app.post("/api/auth/forgot-password")
def forgot_password(req: ForgotPasswordRequest):
    user = USERS_DB.get(req.email)
    if not user:
        # Avoid user enumeration attacks, but for debugging we can return 200 regardless
        return {"message": "If the email is registered, a password reset link has been sent."}
    
    # Generate a temporary reset token (expires in 1 hour / 3600 seconds)
    reset_token = create_jwt({"sub": req.email, "type": "reset"}, expires_in=3600)
    
    # Reset link pointing to frontend Vite client page
    reset_link = f"http://localhost:5173/reset-password?token={reset_token}"
    
    # Send email
    success = send_reset_email(req.email, reset_link)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to send password reset email"
        )
    return {"message": "If the email is registered, a password reset link has been sent."}

@app.post("/api/auth/reset-password")
def reset_password(req: ResetPasswordRequest):
    payload = decode_jwt(req.token)
    if not payload or payload.get("type") != "reset":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid or expired reset token"
        )
    
    email = payload.get("sub")
    if email not in USERS_DB:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
        
    USERS_DB[email]["password"] = req.new_password
    return {"message": "Password has been successfully reset."}

class UpdateProfileRequest(BaseModel):
    name: str
    username: str
    new_password: str | None = None

@app.post("/api/auth/update-profile")
def update_profile(req: UpdateProfileRequest, current_user: dict = Depends(get_current_user)):
    old_username = current_user.get("sub")
    if old_username not in USERS_DB:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    if req.username != old_username and req.username in USERS_DB:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Username already in use"
        )
        
    user_data = USERS_DB.pop(old_username)
    user_data["name"] = req.name
    if req.new_password:
        user_data["password"] = req.new_password
        
    USERS_DB[req.username] = user_data
    
    # Create a fresh token
    token = create_jwt({"sub": req.username, "name": req.name, "role": user_data["role"]}, expires_in=86400)
    
    return {
        "access_token": token,
        "token_type": "bearer",
        "user": {
            "username": req.username,
            "name": req.name,
            "role": user_data["role"]
        }
    }

@app.get("/api/cases")
def get_cases(current_user: dict = Depends(get_current_user)):
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
