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

    if not supabase_jwt_secret:
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
                    raise HTTPException(status_code=401, detail="Invalid token")
                return response.json()
        except Exception:
            raise HTTPException(status_code=401, detail="Token verification failed")

    try:
        payload = jwt.decode(
            token,
            supabase_jwt_secret,
            algorithms=["HS256"],
            audience="authenticated",
        )
        return {"id": payload.get("sub"), "email": payload.get("email")}
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid token")
