from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from datetime import date

from app.database import get_db
from app import models, schemas

router = APIRouter()


@router.get(
    "/",
    response_model=schemas.DashboardSummary,
    summary="Get dashboard summary stats",
)
def get_dashboard(db: Session = Depends(get_db)):
    """
    Returns:
    - Total employee count
    - Today's present / absent counts
    - Employee count per department
    """
    today = date.today()

    total_employees = db.query(func.count(models.Employee.employee_id)).scalar()

    today_records = db.query(models.Attendance).filter(
        models.Attendance.date == today
    ).all()

    total_present_today = sum(
        1 for r in today_records if r.status == models.AttendanceStatus.present
    )
    total_absent_today = sum(
        1 for r in today_records if r.status == models.AttendanceStatus.absent
    )

    # Group employees by department
    dept_rows = (
        db.query(models.Employee.department, func.count(models.Employee.employee_id))
        .group_by(models.Employee.department)
        .all()
    )
    departments = [{"department": dept, "count": count} for dept, count in dept_rows]

    return schemas.DashboardSummary(
        total_employees=total_employees,
        total_present_today=total_present_today,
        total_absent_today=total_absent_today,
        departments=departments,
    )
