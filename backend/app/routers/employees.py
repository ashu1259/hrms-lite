from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List

from app.database import get_db
from app import models, schemas

router = APIRouter()


@router.post(
    "/",
    response_model=schemas.EmployeeResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Add a new employee",
)
def create_employee(payload: schemas.EmployeeCreate, db: Session = Depends(get_db)):
    """
    Create a new employee record.
    - Rejects duplicate employee_id
    - Rejects duplicate email
    - Email format validated by Pydantic (EmailStr)
    """
    # Check for duplicate employee_id
    if db.query(models.Employee).filter(
        models.Employee.employee_id == payload.employee_id
    ).first():
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"Employee with ID '{payload.employee_id}' already exists.",
        )

    # Check for duplicate email
    if db.query(models.Employee).filter(
        models.Employee.email == payload.email
    ).first():
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"Employee with email '{payload.email}' already exists.",
        )

    employee = models.Employee(**payload.model_dump())
    db.add(employee)
    db.commit()
    db.refresh(employee)
    return employee


@router.get(
    "/",
    response_model=List[schemas.EmployeeWithAttendance],
    summary="List all employees",
)
def list_employees(db: Session = Depends(get_db)):
    """Return all employees with their attendance summary (present/absent counts)."""
    employees = db.query(models.Employee).order_by(models.Employee.created_at.desc()).all()

    result = []
    for emp in employees:
        total_present = sum(
            1 for r in emp.attendance_records if r.status == models.AttendanceStatus.present
        )
        total_absent = sum(
            1 for r in emp.attendance_records if r.status == models.AttendanceStatus.absent
        )
        emp_dict = schemas.EmployeeWithAttendance(
            **schemas.EmployeeResponse.model_validate(emp).model_dump(),
            total_present=total_present,
            total_absent=total_absent,
        )
        result.append(emp_dict)

    return result


@router.get(
    "/{employee_id}",
    response_model=schemas.EmployeeWithAttendance,
    summary="Get a single employee",
)
def get_employee(employee_id: str, db: Session = Depends(get_db)):
    employee = db.query(models.Employee).filter(
        models.Employee.employee_id == employee_id
    ).first()

    if not employee:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Employee '{employee_id}' not found.",
        )

    total_present = sum(
        1 for r in employee.attendance_records if r.status == models.AttendanceStatus.present
    )
    total_absent = sum(
        1 for r in employee.attendance_records if r.status == models.AttendanceStatus.absent
    )

    return schemas.EmployeeWithAttendance(
        **schemas.EmployeeResponse.model_validate(employee).model_dump(),
        total_present=total_present,
        total_absent=total_absent,
    )


@router.delete(
    "/{employee_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Delete an employee",
)
def delete_employee(employee_id: str, db: Session = Depends(get_db)):
    """
    Delete an employee and all their attendance records (cascade).
    Returns 204 No Content on success.
    """
    employee = db.query(models.Employee).filter(
        models.Employee.employee_id == employee_id
    ).first()

    if not employee:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Employee '{employee_id}' not found.",
        )

    db.delete(employee)
    db.commit()
