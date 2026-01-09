"""
Database methods for user login operations.
"""

from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import Optional

from apps.v1.api.auth.models.model import Users


async def get_user_by_email_for_login(db: AsyncSession, email: str) -> Optional[Users]:
    """
    Get user by email address for login verification.

    Args:
        db: Async database session
        email: User email address

    Returns:
        Users object if found, None otherwise
    """
    stmt = select(Users).where(Users.email == email).limit(1)
    result = await db.execute(stmt)
    return result.scalar_one_or_none()

