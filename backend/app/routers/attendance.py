from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import date
import uuid

from app.database import get_db
from app import models, schemas

router = APIRouter()


@router.post(
    "/",
    response_model=schemas.AttendanceResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Mark attendance for an employee",
)
def mark_attendance(payload: schemas.AttendanceCreate, db: Session = Depends(get_db)):
    """
    Mark attendance for an employee on a specific date.
    - Validates employee exists
    - Prevents duplicate attendance for the same (employee, date) pair
    """
    # Validate employee exists
    employee = db.query(models.Employee).filter(
        models.Employee.employee_id == payload.employee_id
    ).first()
    if not employee:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Employee '{payload.employee_id}' not found.",
        )

    # Prevent duplicate attendance record for same day
    existing = db.query(models.Attendance).filter(
        models.Attendance.employee_id == payload.employee_id,
        models.Attendance.date == payload.date,
    ).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"Attendance for '{payload.employee_id}' on {payload.date} already exists.",
        )

    record = models.Attendance(
        id=str(uuid.uuid4()),
        **payload.model_dump(),
    )
    db.add(record)
    db.commit()
    db.refresh(record)

    # Attach employee name for richer response
    response = schemas.AttendanceResponse.model_validate(record)
    response.employee_name = employee.full_name
    return response


@router.get(
    "/",
    response_model=List[schemas.AttendanceResponse],
    summary="Get attendance records",
)
def get_attendance(
    employee_id: Optional[str] = Query(None, description="Filter by employee ID"),
    date_filter: Optional[date] = Query(None, alias="date", description="Filter by date (YYYY-MM-DD)"),
    db: Session = Depends(get_db),
):
    """
    Retrieve attendance records.
    Optional filters:
    - employee_id: only records for that employee
    - date: only records for that date
    """
    query = db.query(models.Attendance)

    if employee_id:
        query = query.filter(models.Attendance.employee_id == employee_id)
    if date_filter:
        query = query.filter(models.Attendance.date == date_filter)

    records = query.order_by(models.Attendance.date.desc()).all()

    result = []
    for record in records:
        r = schemas.AttendanceResponse.model_validate(record)
        r.employee_name = record.employee.full_name if record.employee else None
        result.append(r)

    return result


@router.delete(
    "/{attendance_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Delete an attendance record",
)
def delete_attendance(attendance_id: str, db: Session = Depends(get_db)):
    record = db.query(models.Attendance).filter(
        models.Attendance.id == attendance_id
    ).first()
    if not record:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Attendance record not found.",
        )
    db.delete(record)
    db.commit()
