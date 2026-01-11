## Status

from enum import Enum

class StudentStatus(Enum):
    """Status of the student."""

    ACTIVE = "active"
    INACTIVE = "inactive"
    COMPLETED = "completed"
    SUSPENDED = "suspended"

