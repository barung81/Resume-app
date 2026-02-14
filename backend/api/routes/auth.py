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
    supabase_anon_key = os.getenv("SUPABASE_ANON_KEY")

    # STRATEGY: Prioritize Supabase API verification (/auth/v1/user)
    # This is much more robust as it handles both HS256 and RS256 automatically.
    if supabase_url and supabase_anon_key:
        print("DEBUG AUTH: Attempting API-based token verification...")
        try:
            async with httpx.AsyncClient() as client:
                response = await client.get(
                    f"{supabase_url}/auth/v1/user",
                    headers={
                        "Authorization": f"Bearer {token}",
                        "apikey": supabase_anon_key,
                    },
                )
                if response.status_code == 200:
                    userData = response.json()
                    # Standardization: Ensure we always return an 'id' and 'email'
                    return {
                        "id": userData.get("id") or userData.get("sub"),
                        "email": userData.get("email")
                    }
                else:
                    print(f"DEBUG AUTH: API verification rejected with status {response.status_code}")
                    # If API fails and we have a secret, we can try local decoding as a last resort
                    if not supabase_jwt_secret:
                        raise HTTPException(status_code=401, detail=f"Invalid token (API error {response.status_code})")
        except Exception as e:
            if isinstance(e, HTTPException): raise e
            print(f"DEBUG AUTH: API verification exception: {str(e)}")
            if not supabase_jwt_secret:
                raise HTTPException(status_code=401, detail=f"Token verification failed: {str(e)}")

    # FALLBACK: Local JWT decoding (only if API failed or wasn't tried, and secret exists)
    if supabase_jwt_secret and "your_" not in supabase_jwt_secret:
        print("DEBUG AUTH: Falling back to local JWT decoding...")
        try:
            payload = jwt.decode(
                token,
                supabase_jwt_secret,
                algorithms=["HS256"],
                audience="authenticated",
            )
            return {"id": payload.get("sub"), "email": payload.get("email")}
        except JWTError as e:
            print(f"DEBUG AUTH: Local JWT decoding failed: {str(e)}")
            raise HTTPException(status_code=401, detail=f"Invalid token: {str(e)}")

    raise HTTPException(status_code=401, detail="Token verification failed (no valid method found)")
