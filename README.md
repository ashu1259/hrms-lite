# HRMS Lite

A lightweight Human Resource Management System built with **FastAPI** (Python) + **React** (Vite).

## Features

- ✅ Add, view, and delete employees
- ✅ Mark daily attendance (Present / Absent)
- ✅ Filter attendance by employee or date
- ✅ Dashboard with live stats and department breakdown
- ✅ Present/Absent day counts per employee
- ✅ Full Docker support (local + production)

## Tech Stack

| Layer      | Technology                          |
|------------|-------------------------------------|
| Frontend   | React 18, Vite, React Router, Axios |
| Backend    | Python 3.12, FastAPI, SQLAlchemy    |
| Database   | SQLite (file-based, zero setup)     |
| Deployment | Docker + Docker Compose             |

---

## Run Locally with Docker (Recommended)

**Prerequisites:** Docker + Docker Compose installed.

```bash
git clone https://github.com/YOUR_USERNAME/hrms-lite.git
cd hrms-lite
docker-compose up --build
```

| Service      | URL                          |
|--------------|------------------------------|
| Frontend     | http://localhost:3000        |
| Backend API  | http://localhost:8000        |
| Swagger Docs | http://localhost:8000/docs   |

To stop:
```bash
docker-compose down
```

To wipe data too:
```bash
docker-compose down -v
```

---

## Run Locally Without Docker

### Backend

```bash
cd backend
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

### Frontend

```bash
cd frontend
npm install
npm run dev
# Opens at http://localhost:3000
```

> The frontend Vite config proxies `/api` → `http://localhost:8000` automatically in dev mode.

---

## API Endpoints

| Method | Endpoint                    | Description                          |
|--------|-----------------------------|--------------------------------------|
| GET    | /api/employees/             | List all employees with stats        |
| POST   | /api/employees/             | Add a new employee                   |
| GET    | /api/employees/{id}         | Get a single employee                |
| DELETE | /api/employees/{id}         | Delete employee (cascades attendance)|
| GET    | /api/attendance/            | List attendance (filterable)         |
| POST   | /api/attendance/            | Mark attendance for an employee      |
| DELETE | /api/attendance/{id}        | Delete an attendance record          |
| GET    | /api/dashboard/             | Dashboard summary stats              |

Interactive API docs available at **http://localhost:8000/docs** (Swagger UI).

---

## Deploy to Production

### Backend → Render

1. Push project to GitHub
2. Create a **New Web Service** on [Render](https://render.com)
3. Set **Root Directory** to `backend`
4. Build command: `pip install -r requirements.txt`
5. Start command: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
6. Note your deployed URL: `https://your-app.onrender.com`

### Frontend → Vercel

1. Import repository on [Vercel](https://vercel.com)
2. Set **Root Directory** to `frontend`
3. Add Environment Variable: `VITE_API_URL=https://your-app.onrender.com`
4. Deploy — Vercel auto-detects Vite

---

## Project Structure

```
hrms-lite/
├── backend/
│   ├── app/
│   │   ├── main.py          # FastAPI app, CORS, router registration
│   │   ├── database.py      # SQLAlchemy engine + session dependency
│   │   ├── models.py        # ORM models (Employee, Attendance)
│   │   ├── schemas.py       # Pydantic request/response schemas
│   │   └── routers/
│   │       ├── employees.py # CRUD endpoints for employees
│   │       ├── attendance.py# Attendance endpoints
│   │       └── dashboard.py # Summary stats endpoint
│   ├── requirements.txt
│   └── Dockerfile
├── frontend/
│   ├── src/
│   │   ├── api/index.js     # Axios API client
│   │   ├── pages/           # Dashboard, Employees, Attendance
│   │   ├── App.jsx          # Routing + Sidebar layout
│   │   ├── main.jsx         # React entry point
│   │   └── index.css        # Global styles + design system
│   ├── index.html
│   ├── package.json
│   ├── vite.config.js
│   └── Dockerfile
└── docker-compose.yml
```

---

## Assumptions & Limitations

- Single admin user — no authentication or login required
- SQLite used for simplicity; swap `DATABASE_URL` to a PostgreSQL connection string for production scale
- One attendance record per employee per calendar date (enforced server-side)
- Leave management, payroll, and multi-user roles are out of scope
