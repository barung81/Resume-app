import os
from supabase import create_client, Client


def get_supabase_client() -> Client:
    """Create and return a Supabase client."""
    url = os.getenv("SUPABASE_URL")
    key = os.getenv("SUPABASE_SERVICE_ROLE_KEY")

    if not url or not key:
        raise ValueError(
            "SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY environment variables must be set"
        )

    return create_client(url, key)


def get_supabase_anon_client() -> Client:
    """Create a Supabase client with anon key (for auth verification)."""
    url = os.getenv("SUPABASE_URL")
    key = os.getenv("SUPABASE_ANON_KEY")

    if not url or not key:
        raise ValueError(
            "SUPABASE_URL and SUPABASE_ANON_KEY environment variables must be set"
        )

    return create_client(url, key)
