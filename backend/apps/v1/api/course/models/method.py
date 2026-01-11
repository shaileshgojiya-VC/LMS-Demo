"""
CRUD methods for course module.
"""

from apps.v1.api.course.models.model import Course
from core.utils.db_method import CRUDBase


class CourseMethod(CRUDBase[Course]):
    """Methods for course module."""

    def get_course_by_name(self, db, name: str) -> Course:
        """Get course by name."""
        return db.query(Course).filter(Course.name == name).first()

