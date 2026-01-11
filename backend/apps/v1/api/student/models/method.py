"""
CRUD methods for student module.
"""

from apps.v1.api.student.models.model import Student
from core.utils.db_method import CRUDBase


class StudentMethod(CRUDBase[Student]):
    """Methods for student module."""

    def get_student_by_email(self, db, email: str) -> Student:
        """Get student by email."""
        return db.query(Student).filter(Student.email == email).first()

