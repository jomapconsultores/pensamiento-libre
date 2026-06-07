from functools import lru_cache

from supabase import Client, create_client

import config


@lru_cache(maxsize=1)
def get_client(*, service_role: bool = False) -> Client:
    """Return a cached Supabase client.

    service_role=True uses the secret key (bypasses RLS) — only for trusted,
    server-side operations. Default uses the publishable key.
    """
    if not config.SUPABASE_URL:
        raise RuntimeError("SUPABASE_URL is not set in .env")

    key = config.SUPABASE_SECRET_KEY if service_role else config.SUPABASE_PUBLISHABLE_KEY
    if not key:
        which = "SUPABASE_SECRET_KEY" if service_role else "SUPABASE_PUBLISHABLE_KEY"
        raise RuntimeError(f"{which} is not set in .env")

    return create_client(config.SUPABASE_URL, key)
