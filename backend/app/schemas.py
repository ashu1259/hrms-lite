from pydantic import BaseModel, EmailStr, field_validator
from datetime import date, datetime
from typing import Optional, List
from app.models import AttendanceStatus


# ─── Employee Schemas ────────────────────────────────────────────────────────

class EmployeeCreate(BaseModel):
    """Schema for creating a new employee — all fields required."""
    employee_id: str
    full_name: str
    email: EmailStr          # Pydantic validates email format automatically
    department: str

    @field_validator("employee_id", "full_name", "department")
    @classmethod
    def not_blank(cls, v: str) -> str:
        if not v or not v.strip():
            raise ValueError("Field cannot be blank")
        return v.strip()


class EmployeeResponse(BaseModel):
    """Schema returned to the client for an employee record."""
    employee_id: str
    full_name: str
    email: str
    department: str
    created_at: datetime

    model_config = {"from_attributes": True}   # Allows ORM → Pydantic conversion


class EmployeeWithAttendance(EmployeeResponse):
    """Employee response that also includes their attendance summary."""
    total_present: int = 0
    total_absent: int = 0


# ─── Attendance Schemas ──────────────────────────────────────────────────────

class AttendanceCreate(BaseModel):
    """Schema for marking attendance."""
    employee_id: str
    date: date
    status: AttendanceStatus


class AttendanceResponse(BaseModel):
    """Schema returned to the client for an attendance record."""
    id: str
    employee_id: str
    date: date
    status: AttendanceStatus
    created_at: datetime
    employee_name: Optional[str] = None   # Populated from join

    model_config = {"from_attributes": True}


# ─── Dashboard Schema ────────────────────────────────────────────────────────

class DashboardSummary(BaseModel):
    total_employees: int
    total_present_today: int
    total_absent_today: int
    departments: List[dict]   # [{department, count}]
