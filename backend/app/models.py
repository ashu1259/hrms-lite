from sqlalchemy import Column, String, Date, Enum, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import enum
from app.database import Base


class AttendanceStatus(str, enum.Enum):
    present = "Present"
    absent = "Absent"


class Employee(Base):
    """
    Represents an employee in the system.
    employee_id is the HR-assigned unique code (e.g. EMP001), not the DB PK.
    """
    __tablename__ = "employees"

    employee_id = Column(String, primary_key=True, index=True)
    full_name = Column(String, nullable=False)
    email = Column(String, unique=True, nullable=False, index=True)
    department = Column(String, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # One employee → many attendance records; deleting employee cascades
    attendance_records = relationship(
        "Attendance",
        back_populates="employee",
        cascade="all, delete-orphan",
    )


class Attendance(Base):
    """
    Daily attendance record for an employee.
    One record per (employee_id, date) pair — enforced at the API layer.
    """
    __tablename__ = "attendance"

    id = Column(String, primary_key=True, index=True)   # UUID set in router
    employee_id = Column(String, ForeignKey("employees.employee_id"), nullable=False)
    date = Column(Date, nullable=False)
    status = Column(Enum(AttendanceStatus), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    employee = relationship("Employee", back_populates="attendance_records")
