from fastapi import APIRouter, Depends, HTTPException
from api.routes.auth import get_current_user
from api.services.supabase import get_supabase_client
from api.models.schemas import HistoryCreate, HistoryItem
from typing import List

router = APIRouter(prefix="/api/history", tags=["history"])


@router.get("", response_model=List[HistoryItem])
async def list_history(user: dict = Depends(get_current_user)):
    """List all history entries for the current user."""
    try:
        supabase = get_supabase_client()
        response = (
            supabase.table("history")
            .select("*")
            .eq("user_id", user["id"])
            .order("created_at", desc=True)
            .execute()
        )
        return response.data
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch history: {str(e)}")


@router.post("")
async def create_history(entry: HistoryCreate, user: dict = Depends(get_current_user)):
    """Save a new history entry."""
    try:
        supabase = get_supabase_client()
        data = entry.model_dump()
        data["user_id"] = user["id"]

        response = supabase.table("history").insert(data).execute()
        return response.data[0] if response.data else {"status": "created"}
    except Exception as e:
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
