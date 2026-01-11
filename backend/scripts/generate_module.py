"""
Module boilerplate generator for LMS backend.

This script creates a complete module structure following the project's patterns:
- schema.py (Pydantic schemas)
- serializer.py (Marshmallow serializers)
- view.py (FastAPI routes)
- models/model.py (SQLAlchemy models)
- models/method.py (CRUD base methods)
- models/methods/ (Individual async database methods)
- services/ (Business logic services)
"""

import os
import sys
from pathlib import Path
from typing import Optional


def get_project_root() -> Path:
    """Get the project root directory."""
    current_file = Path(__file__).resolve()
    return current_file.parent.parent


def to_snake_case(name: str) -> str:
    """Convert string to snake_case."""
    return name.lower().replace("-", "_").replace(" ", "_")


def to_pascal_case(name: str) -> str:
    """Convert string to PascalCase."""
    return "".join(word.capitalize() for word in to_snake_case(name).split("_"))


def to_camel_case(name: str) -> str:
    """Convert string to camelCase."""
    words = to_snake_case(name).split("_")
    return words[0] + "".join(word.capitalize() for word in words[1:])


def create_directory(path: Path) -> None:
    """Create directory if it doesn't exist."""
    path.mkdir(parents=True, exist_ok=True)
    print(f"✓ Created directory: {path}")


def write_file(file_path: Path, content: str) -> None:
    """Write content to file."""
    file_path.write_text(content, encoding="utf-8")
    print(f"✓ Created file: {file_path}")


def generate_init_file(module_path: Path) -> None:
    """Generate __init__.py file."""
    content = ""
    write_file(module_path / "__init__.py", content)


def generate_schema_file(module_path: Path, module_name: str, pascal_name: str) -> None:
    """Generate schema.py file with Pydantic schemas."""
    content = f'''"""
Pydantic schemas for {module_name} module.
"""

from typing import Optional
from pydantic import BaseModel, Field


class {pascal_name}CreateSchema(BaseModel):
    """Schema for creating {module_name}."""

    name: str = Field(..., description="{pascal_name} name")
    # Add more fields as needed


class {pascal_name}UpdateSchema(BaseModel):
    """Schema for updating {module_name}."""

    name: Optional[str] = Field(None, description="{pascal_name} name")
    # Add more fields as needed


class {pascal_name}ResponseSchema(BaseModel):
    """Schema for {module_name} response."""

    id: int = Field(..., description="{pascal_name} ID")
    name: str = Field(..., description="{pascal_name} name")
    created_at: str = Field(..., description="Creation timestamp")
    updated_at: str = Field(..., description="Update timestamp")

    class Config:
        """Pydantic config."""

        from_attributes = True
'''
    write_file(module_path / "schema.py", content)


def generate_serializer_file(module_path: Path, module_name: str, pascal_name: str) -> None:
    """Generate serializer.py file with Marshmallow serializers."""
    content = f'''"""
Marshmallow serializer for {module_name} module.
"""

from apps.v1.api.{module_name}.models.model import {pascal_name}
from marshmallow import Schema, fields


class {pascal_name}Serializer(Schema):
    """Serializer for {pascal_name} model."""

    id = fields.Int(required=True)
    name = fields.Str(required=True)
    created_at = fields.DateTime(required=True)
    updated_at = fields.DateTime(required=True)
'''
    write_file(module_path / "serializer.py", content)


def generate_model_file(module_path: Path, module_name: str, pascal_name: str) -> None:
    """Generate model.py file with SQLAlchemy model."""
    content = f'''"""
SQLAlchemy model for {module_name} module.
"""

from config.db_config import Base
from core.db.mixins.timestamp_mixin import TimestampMixin
from sqlalchemy import Column, Integer, String


class {pascal_name}(Base, TimestampMixin):
    """
    {pascal_name} model.

    Represents a {module_name} entity in the database.
    """

    __tablename__ = "{module_name}"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False, index=True)
    # Add more columns as needed
'''
    write_file(module_path / "models" / "model.py", content)


def generate_method_file(module_path: Path, module_name: str, pascal_name: str) -> None:
    """Generate method.py file with CRUD base methods."""
    content = f'''"""
CRUD methods for {module_name} module.
"""

from apps.v1.api.{module_name}.models.model import {pascal_name}
from core.utils.db_method import CRUDBase


class {pascal_name}Method(CRUDBase[{pascal_name}]):
    """Methods for {module_name} module."""

    def get_{module_name}_by_name(self, db, name: str) -> {pascal_name}:
        """Get {module_name} by name."""
        return db.query({pascal_name}).filter({pascal_name}.name == name).first()
'''
    write_file(module_path / "models" / "method.py", content)


def generate_async_method_file(module_path: Path, module_name: str, pascal_name: str) -> None:
    """Generate async database method file."""
    content = f'''"""
Database methods for {module_name} operations.
"""

from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import Optional

from apps.v1.api.{module_name}.models.model import {pascal_name}


async def get_{module_name}_by_id(
    db: AsyncSession,
    {module_name}_id: int,
) -> Optional[{pascal_name}]:
    """
    Get {module_name} by ID.

    Args:
        db: Async database session
        {module_name}_id: {pascal_name} ID

    Returns:
        {pascal_name} object if found, None otherwise
    """
    stmt = select({pascal_name}).where({pascal_name}.id == {module_name}_id).limit(1)
    result = await db.execute(stmt)
    return result.scalar_one_or_none()


async def get_{module_name}_by_name(
    db: AsyncSession,
    name: str,
) -> Optional[{pascal_name}]:
    """
    Get {module_name} by name.

    Args:
        db: Async database session
        name: {pascal_name} name

    Returns:
        {pascal_name} object if found, None otherwise
    """
    stmt = select({pascal_name}).where({pascal_name}.name == name).limit(1)
    result = await db.execute(stmt)
    return result.scalar_one_or_none()


async def create_{module_name}(
    db: AsyncSession,
    {module_name}_data: dict,
) -> {pascal_name}:
    """
    Create a new {module_name} in the database.

    Args:
        db: Async database session
        {module_name}_data: Dictionary containing {module_name} data

    Returns:
        Created {pascal_name} object
    """
    new_{module_name} = {pascal_name}(**{module_name}_data)
    db.add(new_{module_name})
    await db.commit()
    await db.refresh(new_{module_name})
    return new_{module_name}


async def update_{module_name}(
    db: AsyncSession,
    {module_name}_id: int,
    {module_name}_data: dict,
) -> Optional[{pascal_name}]:
    """
    Update {module_name} in the database.

    Args:
        db: Async database session
        {module_name}_id: {pascal_name} ID
        {module_name}_data: Dictionary containing updated {module_name} data

    Returns:
        Updated {pascal_name} object if found, None otherwise
    """
    {module_name} = await get_{module_name}_by_id(db=db, {module_name}_id={module_name}_id)
    if not {module_name}:
        return None

    for key, value in {module_name}_data.items():
        setattr({module_name}, key, value)

    await db.commit()
    await db.refresh({module_name})
    return {module_name}


async def delete_{module_name}(
    db: AsyncSession,
    {module_name}_id: int,
) -> bool:
    """
    Delete {module_name} from the database.

    Args:
        db: Async database session
        {module_name}_id: {pascal_name} ID

    Returns:
        True if deleted, False otherwise
    """
    {module_name} = await get_{module_name}_by_id(db=db, {module_name}_id={module_name}_id)
    if not {module_name}:
        return False

    await db.delete({module_name})
    await db.commit()
    return True
'''
    write_file(module_path / "models" / "methods" / f"get_{module_name}_method.py", content)


def generate_service_file(module_path: Path, module_name: str, pascal_name: str) -> None:
    """Generate service file with business logic."""
    content = f'''"""
Service for {module_name} operations.
"""

import logging
from sqlalchemy.ext.asyncio import AsyncSession

from apps.v1.api.{module_name}.models.methods.get_{module_name}_method import (
    create_{module_name},
    get_{module_name}_by_id,
    get_{module_name}_by_name,
    update_{module_name},
    delete_{module_name},
)
from apps.v1.api.{module_name}.schema import (
    {pascal_name}CreateSchema,
    {pascal_name}UpdateSchema,
)
from core.utils import constant_variable, message_variable
from core.utils.standard_response import StandardResponse

logger = logging.getLogger(__name__)


async def create_{module_name}_service(
    db: AsyncSession,
    {module_name}_data: {pascal_name}CreateSchema,
) -> StandardResponse:
    """
    Create a new {module_name}.

    Args:
        db: Async database session
        {module_name}_data: {pascal_name}CreateSchema containing {module_name} data

    Returns:
        StandardResponse with created {module_name} data or error message
    """
    logger.info(f"Creating {module_name}: {{str({module_name}_data)}}")

    try:
        # Check if {module_name} already exists
        existing_{module_name} = await get_{module_name}_by_name(
            db=db,
            name={module_name}_data.name,
        )

        if existing_{module_name}:
            logger.warning(f"{pascal_name} with name {{str({module_name}_data.name)}} already exists")
            return StandardResponse(
                status=constant_variable.STATUS_FAIL,
                status_code=constant_variable.HTTP_400_BAD_REQUEST,
                data=constant_variable.STATUS_NULL,
                message=f"{pascal_name} with this name already exists",
            )

        # Create {module_name}
        {module_name}_dict = {module_name}_data.model_dump()
        new_{module_name} = await create_{module_name}(
            db=db,
            {module_name}_data={module_name}_dict,
        )

        logger.info(f"{pascal_name} created successfully with ID: {{new_{module_name}.id}}")

        return StandardResponse(
            status=constant_variable.STATUS_SUCCESS,
            status_code=constant_variable.HTTP_201_CREATED,
            data={{"id": new_{module_name}.id, "name": new_{module_name}.name}},
            message=f"{pascal_name} created successfully",
        )

    except Exception as exc:
        logger.error(f"Error creating {module_name}: {{str(exc)}}", exc_info=True)
        return StandardResponse(
            status=constant_variable.STATUS_FAIL,
            status_code=constant_variable.HTTP_500_INTERNAL_SERVER_ERROR,
            data=constant_variable.STATUS_NULL,
            message=message_variable.SOMETHING_WENT_WRONG,
        )


async def get_{module_name}_service(
    db: AsyncSession,
    {module_name}_id: int,
) -> StandardResponse:
    """
    Get {module_name} by ID.

    Args:
        db: Async database session
        {module_name}_id: {pascal_name} ID

    Returns:
        StandardResponse with {module_name} data or error message
    """
    logger.info(f"Fetching {module_name} with ID: {{str({module_name}_id)}}")

    try:
        {module_name} = await get_{module_name}_by_id(db=db, {module_name}_id={module_name}_id)

        if not {module_name}:
            logger.warning(f"{pascal_name} with ID {{str({module_name}_id)}} not found")
            return StandardResponse(
                status=constant_variable.STATUS_FAIL,
                status_code=constant_variable.HTTP_404_NOT_FOUND,
                data=constant_variable.STATUS_NULL,
                message=f"{pascal_name} not found",
            )

        return StandardResponse(
            status=constant_variable.STATUS_SUCCESS,
            status_code=constant_variable.HTTP_200_OK,
            data={{"id": {module_name}.id, "name": {module_name}.name}},
            message=f"{pascal_name} retrieved successfully",
        )

    except Exception as exc:
        logger.error(f"Error fetching {module_name}: {{str(exc)}}", exc_info=True)
        return StandardResponse(
            status=constant_variable.STATUS_FAIL,
            status_code=constant_variable.HTTP_500_INTERNAL_SERVER_ERROR,
            data=constant_variable.STATUS_NULL,
            message=message_variable.SOMETHING_WENT_WRONG,
        )


async def update_{module_name}_service(
    db: AsyncSession,
    {module_name}_id: int,
    {module_name}_data: {pascal_name}UpdateSchema,
) -> StandardResponse:
    """
    Update {module_name}.

    Args:
        db: Async database session
        {module_name}_id: {pascal_name} ID
        {module_name}_data: {pascal_name}UpdateSchema containing updated {module_name} data

    Returns:
        StandardResponse with updated {module_name} data or error message
    """
    logger.info(f"Updating {module_name} with ID: {{str({module_name}_id)}}")

    try:
        {module_name} = await update_{module_name}(
            db=db,
            {module_name}_id={module_name}_id,
            {module_name}_data={module_name}_data.model_dump(exclude_unset=True),
        )

        if not {module_name}:
            logger.warning(f"{pascal_name} with ID {{str({module_name}_id)}} not found")
            return StandardResponse(
                status=constant_variable.STATUS_FAIL,
                status_code=constant_variable.HTTP_404_NOT_FOUND,
                data=constant_variable.STATUS_NULL,
                message=f"{pascal_name} not found",
            )

        logger.info(f"{pascal_name} updated successfully with ID: {{str({module_name}_id)}}")

        return StandardResponse(
            status=constant_variable.STATUS_SUCCESS,
            status_code=constant_variable.HTTP_200_OK,
            data={{"id": {module_name}.id, "name": {module_name}.name}},
            message=f"{pascal_name} updated successfully",
        )

    except Exception as exc:
        logger.error(f"Error updating {module_name}: {{str(exc)}}", exc_info=True)
        return StandardResponse(
            status=constant_variable.STATUS_FAIL,
            status_code=constant_variable.HTTP_500_INTERNAL_SERVER_ERROR,
            data=constant_variable.STATUS_NULL,
            message=message_variable.SOMETHING_WENT_WRONG,
        )


async def delete_{module_name}_service(
    db: AsyncSession,
    {module_name}_id: int,
) -> StandardResponse:
    """
    Delete {module_name}.

    Args:
        db: Async database session
        {module_name}_id: {pascal_name} ID

    Returns:
        StandardResponse with success or error message
    """
    logger.info(f"Deleting {module_name} with ID: {{str({module_name}_id)}}")

    try:
        deleted = await delete_{module_name}(db=db, {module_name}_id={module_name}_id)

        if not deleted:
            logger.warning(f"{pascal_name} with ID {{str({module_name}_id)}} not found")
            return StandardResponse(
                status=constant_variable.STATUS_FAIL,
                status_code=constant_variable.HTTP_404_NOT_FOUND,
                data=constant_variable.STATUS_NULL,
                message=f"{pascal_name} not found",
            )

        logger.info(f"{pascal_name} deleted successfully with ID: {{str({module_name}_id)}}")

        return StandardResponse(
            status=constant_variable.STATUS_SUCCESS,
            status_code=constant_variable.HTTP_200_OK,
            data=constant_variable.STATUS_NULL,
            message=f"{pascal_name} deleted successfully",
        )

    except Exception as exc:
        logger.error(f"Error deleting {module_name}: {{str(exc)}}", exc_info=True)
        return StandardResponse(
            status=constant_variable.STATUS_FAIL,
            status_code=constant_variable.HTTP_500_INTERNAL_SERVER_ERROR,
            data=constant_variable.STATUS_NULL,
            message=message_variable.SOMETHING_WENT_WRONG,
        )
'''
    write_file(module_path / "services" / f"create_{module_name}_service.py", content)


def generate_view_file(module_path: Path, module_name: str, pascal_name: str) -> None:
    """Generate view.py file with FastAPI routes."""
    content = f'''"""
View for {module_name} operations.
"""

import logging

from fastapi import APIRouter, Depends, Path
from sqlalchemy.ext.asyncio import AsyncSession

from apps.v1.api.{module_name}.schema import (
    {pascal_name}CreateSchema,
    {pascal_name}UpdateSchema,
)
from apps.v1.api.{module_name}.services.create_{module_name}_service import (
    create_{module_name}_service,
    get_{module_name}_service,
    update_{module_name}_service,
    delete_{module_name}_service,
)
from config.db_config import get_async_db

logger = logging.getLogger(__name__)

router = APIRouter()


@router.post("/")
async def create_{module_name}(
    {module_name}_data: {pascal_name}CreateSchema,
    db: AsyncSession = Depends(get_async_db),
):
    """
    Create a new {module_name}.

    Args:
        {module_name}_data: {pascal_name}CreateSchema containing {module_name} data
        db: Async database session

    Returns:
        StandardResponse with created {module_name} data or error message
    """
    logger.info(f"Creating {module_name}: {{str({module_name}_data)}}")
    response = await create_{module_name}_service(db=db, {module_name}_data={module_name}_data)
    return response.make


@router.get("/{{module_id}}")
async def get_{module_name}(
    module_id: int = Path(..., description="{pascal_name} ID"),
    db: AsyncSession = Depends(get_async_db),
):
    """
    Get {module_name} by ID.

    Args:
        module_id: {pascal_name} ID
        db: Async database session

    Returns:
        StandardResponse with {module_name} data or error message
    """
    logger.info(f"Fetching {module_name} with ID: {{str(module_id)}}")
    response = await get_{module_name}_service(db=db, {module_name}_id=module_id)
    return response.make


@router.put("/{{module_id}}")
async def update_{module_name}(
    {module_name}_data: {pascal_name}UpdateSchema,
    module_id: int = Path(..., description="{pascal_name} ID"),
    db: AsyncSession = Depends(get_async_db),
):
    """
    Update {module_name}.

    Args:
        module_id: {pascal_name} ID
        {module_name}_data: {pascal_name}UpdateSchema containing updated {module_name} data
        db: Async database session

    Returns:
        StandardResponse with updated {module_name} data or error message
    """
    logger.info(f"Updating {module_name} with ID: {{str(module_id)}}")
    response = await update_{module_name}_service(
        db=db,
        {module_name}_id=module_id,
        {module_name}_data={module_name}_data,
    )
    return response.make


@router.delete("/{{module_id}}")
async def delete_{module_name}(
    module_id: int = Path(..., description="{pascal_name} ID"),
    db: AsyncSession = Depends(get_async_db),
):
    """
    Delete {module_name}.

    Args:
        module_id: {pascal_name} ID
        db: Async database session

    Returns:
        StandardResponse with success or error message
    """
    logger.info(f"Deleting {module_name} with ID: {{str(module_id)}}")
    response = await delete_{module_name}_service(db=db, {module_name}_id=module_id)
    return response.make
'''
    write_file(module_path / "view.py", content)


def generate_module_boilerplate(module_name: str) -> None:
    """
    Generate complete module boilerplate.

    Args:
        module_name: Name of the module to create (e.g., 'student', 'course', 'teacher')
    """
    project_root = get_project_root()
    api_path = project_root / "apps" / "v1" / "api"

    # Normalize module name
    module_name = to_snake_case(module_name)
    pascal_name = to_pascal_case(module_name)

    # Check if module already exists
    module_path = api_path / module_name
    if module_path.exists():
        print(f"❌ Error: Module '{module_name}' already exists at {module_path}")
        sys.exit(1)

    print(f"\n🚀 Generating boilerplate for module: {module_name}")
    print(f"   PascalCase name: {pascal_name}")
    print(f"   Location: {module_path}\n")

    # Create directory structure
    create_directory(module_path)
    create_directory(module_path / "models")
    create_directory(module_path / "models" / "methods")
    create_directory(module_path / "services")

    # Generate files
    generate_init_file(module_path)
    generate_init_file(module_path / "models")
    generate_init_file(module_path / "models" / "methods")
    generate_init_file(module_path / "services")

    generate_schema_file(module_path, module_name, pascal_name)
    generate_serializer_file(module_path, module_name, pascal_name)
    generate_model_file(module_path, module_name, pascal_name)
    generate_method_file(module_path, module_name, pascal_name)
    generate_async_method_file(module_path, module_name, pascal_name)
    generate_service_file(module_path, module_name, pascal_name)
    generate_view_file(module_path, module_name, pascal_name)

    print(f"\n✅ Module '{module_name}' boilerplate generated successfully!")
    print(f"\n📝 Next steps:")
    print(f"   1. Review and customize the generated files")
    print(f"   2. Update the model in models/model.py with your specific fields")
    print(f"   3. Update schemas in schema.py with your specific fields")
    print(f"   4. Register the router in apps/server.py:")
    print(f"      from apps.v1.api.{module_name}.view import router as {module_name}_router")
    print(f"      app.include_router(")
    print(f"          {module_name}_router,")
    print(f"          prefix=f\"/api{{constant_variable.API_V1_PREFIX}}/{module_name}\",")
    print(f"          tags=[\"{module_name}\"],")
    print(f"      )")
    print(f"   5. Create and run database migration for the new model")


def main() -> None:
    """Main entry point for the script."""
    if len(sys.argv) < 2:
        print("Usage: python generate_module.py <module_name>")
        print("Example: python generate_module.py student")
        print("Example: python generate_module.py course-management")
        sys.exit(1)

    module_name = sys.argv[1]
    generate_module_boilerplate(module_name)


if __name__ == "__main__":
    main()

