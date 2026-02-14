from fastapi import APIRouter, Depends, HTTPException, Header
from api.routes.auth import get_current_user
from api.services.supabase import get_supabase_client
from api.models.schemas import HistoryItem, HistoryCreate
from typing import List
import os

router = APIRouter(prefix="/api/history", tags=["history"])


@router.get("/debug/check-connection")
async def debug_check_connection():
    """Diagnostic endpoint to check Supabase connection."""
    url = os.getenv("SUPABASE_URL", "not set")
    try:
        supabase = get_supabase_client()
        response = supabase.table("history").select("count", count="exact").limit(1).execute()
        return {
            "status": "connected",
            "table_exists": True,
            "total_records": response.count,
            "supabase_url": f"{url[:15]}..." if url else "not set"
        }
    except Exception as e:
        return {
            "status": "error",
            "message": str(e),
            "env_check": {
                "url": bool(os.getenv("SUPABASE_URL")),
                "key": bool(os.getenv("SUPABASE_SERVICE_ROLE_KEY")),
                "anon": bool(os.getenv("SUPABASE_ANON_KEY")),
                "jwt": bool(os.getenv("SUPABASE_JWT_SECRET"))
            }
        }

@router.get("", response_model=List[HistoryItem])
async def list_history(user: dict = Depends(get_current_user)):
    """List all history entries for the current user."""
    try:
        print(f"DEBUG: Fetching history for user {user['id']}")
        supabase = get_supabase_client()
        response = (
            supabase.table("history")
            .select("*")
            .eq("user_id", user["id"])
            .order("created_at", desc=True)
            .execute()
        )
        print(f"DEBUG: Found {len(response.data)} records")
        return response.data
    except Exception as e:
        print(f"DEBUG: History fetch FAILED: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to fetch history: {str(e)}")


@router.post("")
async def create_history(entry: HistoryCreate, user: dict = Depends(get_current_user)):
    """Save a new history entry."""
    try:
        supabase = get_supabase_client()
        data = entry.model_dump()
        data["user_id"] = user["id"]

        print(f"DEBUG: Saving history entry for user {user['id']}")
        print(f"DEBUG: Data keys: {list(data.keys())}")

        response = supabase.table("history").insert(data).execute()
        
        if not response.data:
            print("DEBUG: History insert returned no data")
            
        return response.data[0] if response.data else {"status": "created"}
    except Exception as e:
        print(f"DEBUG: History save FAILED: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to save history: {str(e)}")


@router.get("/{history_id}")
async def get_history(history_id: str, user: dict = Depends(get_current_user)):
    """Get a specific history entry."""
    try:
        supabase = get_supabase_client()
        response = (
            supabase.table("history")
            .select("*")
            .eq("id", history_id)
            .eq("user_id", user["id"])
            .single()
            .execute()
        )
        return response.data
    except Exception as e:
        raise HTTPException(
            status_code=404, detail=f"History entry not found: {str(e)}"
        )


@router.delete("/{history_id}")
async def delete_history(history_id: str, user: dict = Depends(get_current_user)):
    """Delete a history entry."""
    try:
        supabase = get_supabase_client()
        supabase.table("history").delete().eq("id", history_id).eq(
            "user_id", user["id"]
        ).execute()
        return {"status": "deleted"}
    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Failed to delete history: {str(e)}"
        )
