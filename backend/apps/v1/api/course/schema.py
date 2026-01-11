"""
Pydantic schemas for course module.
"""

from typing import Optional
from pydantic import BaseModel, Field
from apps.v1.api.course.models.attribute import CourseStatus


class CourseCreateSchema(BaseModel):
    """Schema for creating course."""

    name: str = Field(..., description="Course name")
    description: Optional[str] = Field(None, description="Course description")
    instructor: Optional[str] = Field(None, description="Course instructor")
    students: Optional[int] = Field(None, description="Course students")
    duration: Optional[int] = Field(None, description="Course duration")
    modules: Optional[int] = Field(None, description="Course modules")
    status: Optional[CourseStatus] = Field(None, description="Course status")
    # Add more fields as needed


class CourseUpdateSchema(BaseModel):
    """Schema for updating course."""

    name: Optional[str] = Field(None, description="Course name")
    description: Optional[str] = Field(None, description="Course description")
    instructor: Optional[str] = Field(None, description="Course instructor")
    students: Optional[int] = Field(None, description="Course students")
    duration: Optional[int] = Field(None, description="Course duration")
    modules: Optional[int] = Field(None, description="Course modules")
    status: Optional[CourseStatus] = Field(None, description="Course status")


class CourseResponseSchema(BaseModel):
    """Schema for course response."""

    id: int = Field(..., description="Course ID")
    name: str = Field(..., description="Course name")
    description: Optional[str] = Field(None, description="Course description")
    instructor: Optional[str] = Field(None, description="Course instructor")
    students: Optional[int] = Field(None, description="Course students")
    duration: Optional[int] = Field(None, description="Course duration")
    modules: Optional[int] = Field(None, description="Course modules")
    status: Optional[CourseStatus] = Field(None, description="Course status")
    created_at: str = Field(..., description="Creation timestamp")
    updated_at: str = Field(..., description="Update timestamp")

    class Config:
        """Pydantic config."""

        from_attributes = True

