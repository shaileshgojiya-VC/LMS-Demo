"""
SQLAlchemy model for course module.
"""

from config.db_config import Base
from core.db.mixins.timestamp_mixin import TimestampMixin
from sqlalchemy import Column, Integer, String, Text, Enum as SQLEnum
from apps.v1.api.course.models.attribute import CourseStatus


class Course(Base, TimestampMixin):
    """
    Course model.

    Represents a course entity in the database.
    """

    __tablename__ = "courses"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False, index=True)
    description = Column(Text, nullable=True)
    instructor = Column(String(255), nullable=True)
    students = Column(Integer, nullable=True)
    duration = Column(Integer, nullable=True)
    modules = Column(Integer, nullable=True)
    status = Column(SQLEnum(CourseStatus), nullable=True)

