from fastapi import Depends, HTTPException, Header
from jose import jwt, JWTError
import os
import httpx


async def get_current_user(authorization: str = Header(None)) -> dict:
    """Verify Supabase JWT token and return user info."""
    if not authorization:
        raise HTTPException(status_code=401, detail="Authorization header missing")

    # Extract token from "Bearer <token>"
    parts = authorization.split(" ")
    if len(parts) != 2 or parts[0].lower() != "bearer":
        raise HTTPException(status_code=401, detail="Invalid authorization format")

    token = parts[1]
    supabase_url = os.getenv("SUPABASE_URL")
    supabase_jwt_secret = os.getenv("SUPABASE_JWT_SECRET")

    # Safety check for placeholder
    if supabase_jwt_secret and "your_" in supabase_jwt_secret:
        print("DEBUG AUTH: SUPABASE_JWT_SECRET is still the placeholder value!")
        supabase_jwt_secret = None

    if not supabase_jwt_secret:
        print("DEBUG AUTH: No JWT secret found. Falling back to Supabase API verification...")
        # Fallback: verify via Supabase API
        try:
            async with httpx.AsyncClient() as client:
                response = await client.get(
                    f"{supabase_url}/auth/v1/user",
                    headers={
                        "Authorization": f"Bearer {token}",
                        "apikey": os.getenv("SUPABASE_ANON_KEY", ""),
                    },
                )
                if response.status_code != 200:
                    print(f"DEBUG AUTH: Supabase API rejected token. Status: {response.status_code}, Body: {response.text}")
                    raise HTTPException(status_code=401, detail=f"Invalid token (API status {response.status_code})")
                return response.json()
        except Exception as e:
            if isinstance(e, HTTPException): raise e
            print(f"DEBUG AUTH: API verification failed: {str(e)}")
            raise HTTPException(status_code=401, detail=f"Token verification failed: {str(e)}")

    try:
        print("DEBUG AUTH: Verifying token locally with JWT secret...")
        payload = jwt.decode(
            token,
            supabase_jwt_secret,
            algorithms=["HS256"],
            audience="authenticated",
        )
        return {"id": payload.get("sub"), "email": payload.get("email")}
    except JWTError as e:
        print(f"DEBUG AUTH: JWT decoding failed: {str(e)}")
        raise HTTPException(status_code=401, detail=f"Invalid token: {str(e)}")
