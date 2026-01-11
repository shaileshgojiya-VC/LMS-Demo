## Status

from enum import Enum

class CourseStatus(Enum):
    """Status of the course."""

    ACTIVE = "active"
    INACTIVE = "inactive"
    COMPLETED = "completed"
    UPCOMING = "upcoming"
    ONGOING = "ongoing"
    CANCELLED = "cancelled"