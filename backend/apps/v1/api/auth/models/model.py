from config.db_config import Base
from core.db.mixins.timestamp_mixin import TimestampMixin
from  sqlalchemy import Integer, String, Boolean, Column, DateTime




class Users(Base, TimestampMixin):

    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, index=True)
    password = Column(String(255))
    full_name = Column(String(255))
    refresh_token = Column(String(255))
    refresh_token_expires_at = Column(DateTime, nullable=True)
    is_active = Column(Boolean, default=True)
    is_verified = Column(Boolean, default=False)
    
    