"""
Pydantic schemas for student module.
"""

from typing import Optional
from pydantic import BaseModel, Field, EmailStr
from apps.v1.api.student.models.attribute import StudentStatus


class StudentCreateSchema(BaseModel):
    """Schema for creating student."""

    name: str = Field(..., description="Student name", min_length=2, max_length=255)
    email: EmailStr = Field(..., description="Student email address")
    program: Optional[str] = Field(None, description="Student program", max_length=255)
    status: Optional[StudentStatus] = Field(None, description="Student status")
    course_id: Optional[int] = Field(None, description="Course ID", gt=0)
    enrollment_date: Optional[str] = Field(None, description="Enrollment date")
    completion_date: Optional[str] = Field(None, description="Completion date")


class StudentUpdateSchema(BaseModel):
    """Schema for updating student."""

    name: Optional[str] = Field(None, description="Student name", min_length=2, max_length=255)
    email: Optional[EmailStr] = Field(None, description="Student email address")
    program: Optional[str] = Field(None, description="Student program", max_length=255)
    status: Optional[StudentStatus] = Field(None, description="Student status")
    course_id: Optional[int] = Field(None, description="Course ID", gt=0)
    enrollment_date: Optional[str] = Field(None, description="Enrollment date")
    completion_date: Optional[str] = Field(None, description="Completion date")


class StudentResponseSchema(BaseModel):
    """Schema for student response."""

    id: int = Field(..., description="Student ID")
    name: str = Field(..., description="Student name")
    email: str = Field(..., description="Student email address")
    program: Optional[str] = Field(None, description="Student program")
    status: Optional[StudentStatus] = Field(None, description="Student status")
    course_id: Optional[int] = Field(None, description="Course ID")
    enrollment_date: Optional[str] = Field(None, description="Enrollment date")
    completion_date: Optional[str] = Field(None, description="Completion date")
    created_at: str = Field(..., description="Creation timestamp")
    updated_at: str = Field(..., description="Update timestamp")

    class Config:
        """Pydantic config."""

        from_attributes = True

