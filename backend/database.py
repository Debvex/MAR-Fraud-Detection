import os
from fastapi import APIRouter
from dotenv import load_dotenv
from supabase import Client, create_client


load_dotenv()


def get_supabase_client() -> Client:
    """Create a Supabase client from environment configuration."""
    supabase_url = os.getenv("SUPABASE_URL")
    supabase_key = os.getenv("SUPABASE_KEY")

    if not supabase_url or not supabase_key:
        raise ValueError("SUPABASE_URL and SUPABASE_KEY must be set.")

    return create_client(supabase_url, supabase_key)


supabase: Client = get_supabase_client()
