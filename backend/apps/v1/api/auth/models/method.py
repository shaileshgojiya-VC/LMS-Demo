## methods for the auth module

from apps.v1.api.auth.models.model import Users
from core.utils.db_method import CRUDBase

class UserAuthMethod(CRUDBase[Users]):
    """Methods for the auth module"""

    def get_user_by_email(self, db: Session, email: str) -> Users:
        """Get user by email"""
        return db.query(Users).filter(Users.email == email).first()