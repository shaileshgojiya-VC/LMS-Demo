"""
SQLAlchemy model for student module.
"""

from config.db_config import Base
from core.db.mixins.timestamp_mixin import TimestampMixin
from sqlalchemy import Column, Integer, String, Enum as SQLEnum, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from apps.v1.api.student.models.attribute import StudentStatus


class Student(Base, TimestampMixin):
    """
    Student model.

    Represents a student entity in the database.
    """

    __tablename__ = "students"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False, index=True)
    email = Column(String(255), unique=True, nullable=False, index=True)
    program = Column(String(255), nullable=True)
    status = Column(SQLEnum(StudentStatus), nullable=True, default=StudentStatus.ACTIVE)
    course_id = Column(Integer, ForeignKey("courses.id"), nullable=True, index=True)
    enrollment_date = Column(DateTime, nullable=True)
    completion_date = Column(DateTime, nullable=True)

    # Relationship - using string reference to avoid circular import
    # Note: backref name is "enrolled_students" to avoid conflict with Course.students column
    course = relationship("Course", backref="enrolled_students", lazy="select")

