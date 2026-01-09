"""
Database methods for password reset operations.
"""

from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, update
from typing import Optional

from apps.v1.api.auth.models.model import Users


async def get_user_by_email_for_password_reset(db: AsyncSession, email: str) -> Optional[Users]:
    """
    Get user by email address for password reset.

    Args:
        db: Async database session
        email: User email address

    Returns:
        Users object if found, None otherwise
    """
    stmt = select(Users).where(Users.email == email).limit(1)
    result = await db.execute(stmt)
    return result.scalar_one_or_none()


async def update_user_password(db: AsyncSession, user_id: int, hashed_password: str) -> Users:
    """
    Update user password in the database.

    Args:
        db: Async database session
        user_id: User ID
        hashed_password: Hashed password string

    Returns:
        Updated Users object
    """
    stmt = (
        update(Users)
        .where(Users.id == user_id)
        .values(password=hashed_password)
        .execution_options(synchronize_session="fetch")
    )
    await db.execute(stmt)
    await db.commit()

    # Fetch updated user
    fetch_stmt = select(Users).where(Users.id == user_id).limit(1)
    result = await db.execute(fetch_stmt)
    return result.scalar_one()

