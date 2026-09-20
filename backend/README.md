# 🏥 QueueSense AI — FastAPI Backend System

> **Hackathon Theme:** Tech for a Better Tomorrow 📡  
> **Project:** Intelligent Hospital Waiting-Time & Patient Flow System (Outpatient Department Hub)  
> **API Documentation:** Interactive Swagger at `http://localhost:8000/docs`

---

## 🌟 Overview & Clinical Safety Governance

**QueueSense AI** is a production-style, accessible backend engineered for public healthcare outpatient departments (OPDs). It manages patient intake, sequential token generation, transaction-safe counter assignments, explainable wait-time calculations, real-time WebSocket notifications, and auditable clinical priority governance.

### 🛡️ Ethical & Clinical Guardrails
1. **No Diagnostic Claim:** The system does *not* diagnose illnesses or autonomously triage emergency patients.
2. **Clinical Human-in-the-Loop:** Clinical priority flags (e.g. frail senior citizens, pediatric high fever, oncology follow-ups) require authorized healthcare staff confirmation before altering queues.
3. **Patient Privacy by Design:** Public monitors and queue broadcasts use strictly anonymous references (`REF-8238` / `GM-042`) without exposing sensitive personal identifiers.

---

## 🛠️ Technology Stack

- **Framework:** Python 3.11+ / 3.14 + FastAPI
- **ORM & Database:** SQLAlchemy 2.0 with SQLite (`sqlite:///./queuesense.db`)
- **Data Validation:** Pydantic v2 & Pydantic-Settings
- **Security & Auth:** JWT (JSON Web Tokens) with bcrypt password hashing
- **Real-Time Live Updates:** WebSockets (`/ws/queue/{department_id}`)
- **Testing:** Pytest & HTTPX TestClient
- **Server:** Uvicorn ASGI

---

## 📁 Project Directory Structure

```
backend/
├── app/
│   ├── main.py                     # FastAPI app, CORS, lifespan handler, error handling
│   ├── config.py                   # Pydantic Settings configuration
│   ├── database.py                 # SQLAlchemy 2.0 engine, SessionLocal, Base model
│   ├── dependencies.py             # DB session & JWT RBAC dependencies
│   ├── models/
│   │   ├── __init__.py             # Export all SQLAlchemy models
│   │   ├── user.py                 # User model (reception, doctor, admin)
│   │   ├── department.py           # Department model (GM, PED, ORTHO, ENT)
│   │   ├── patient.py              # Patient model (Anonymous ref, accessibility)
│   │   ├── token.py                # QueueToken model (Status, timestamps, counter #)
│   │   ├── priority_flag.py        # PriorityFlag model (Audit history & review notes)
│   │   └── queue_event.py          # QueueEvent model (Audit trail logging)
│   ├── schemas/
│   │   ├── __init__.py             # Export all Pydantic schemas
│   │   ├── auth.py                 # Login, Token, User schemas
│   │   ├── department.py           # Department schemas & counter status
│   │   ├── patient.py              # Patient registration & response schemas
│   │   ├── token.py                # QueueToken schemas & status transitions
│   │   ├── priority.py             # Priority flag & audit log schemas
│   │   └── analytics.py            # Flow analytics & prediction response schemas
│   ├── routers/
│   │   ├── __init__.py             # Export all API routers
│   │   ├── auth.py                 # POST /api/auth/login, GET /api/auth/me
│   │   ├── departments.py          # GET /api/departments, GET/PATCH /api/departments/{id}
│   │   ├── patients.py             # POST /api/patients/register, GET /api/patients/{id}
│   │   ├── queue.py                # GET /api/queue, POST call-next, PATCH status
│   │   ├── waiting_time.py         # GET /api/waiting-time/{dept_id}, GET token wait
│   │   ├── priority.py             # GET /api/priority/flags, PATCH review flag
│   │   ├── analytics.py            # GET /api/analytics/overview, departments, congestion
│   │   └── websocket.py            # WS /ws/queue/{department_id} & ConnectionManager
│   ├── services/
│   │   ├── queue_service.py        # Token generation, atomic call-next, status engine
│   │   ├── waiting_time_service.py # Explainable transparent waiting time model
│   │   ├── priority_service.py     # Priority validation & audit log updates
│   │   └── analytics_service.py    # Hourly trends, rush hour & capacity calculations
│   └── utils/
│       ├── security.py             # bcrypt hashing, JWT create & decode
│       └── logging_config.py       # Standardized structured Python logging
├── tests/
│   ├── conftest.py                 # In-memory SQLite fixtures & auth headers
│   ├── test_auth.py                # Login, invalid credentials, token verification
│   ├── test_patients.py            # Patient registration, anonymous reference generation
│   ├── test_queue.py               # Call-next priority precedence, status lifecycle
│   ├── test_waiting_time.py        # Explainable heuristic factors & confidence bounds
│   └── test_priority.py            # Priority flag workflow & audit trail logging
├── .env.example
├── .env
├── requirements.txt
├── README.md
└── seed.py                         # Demo database population script
```

---

## 🚀 Quickstart & Setup Guide

### 1. Prerequisites
- Python 3.11 or higher installed on your system.

### 2. Environment Setup & Dependency Installation

#### Windows (PowerShell):
```powershell
cd backend
python -m venv venv
.\venv\Scripts\Activate.ps1
python -m pip install -r requirements.txt
```

#### Linux / macOS:
```bash
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

### 3. Environment Configuration
Create or verify your `.env` file in the `backend/` root directory:
```env
PROJECT_NAME="QueueSense AI - OPD Queue & Patient Flow System"
API_V1_STR="/api"
DATABASE_URL="sqlite:///./queuesense.db"
SECRET_KEY="queuesense-super-secret-development-key-change-in-production"
ALGORITHM="HS256"
ACCESS_TOKEN_EXPIRE_MINUTES=120
FRONTEND_URL="http://localhost:3000"
CORS_ORIGINS=["http://localhost:3000","http://localhost:5173","http://127.0.0.1:3000","http://127.0.0.1:5173"]
LOG_LEVEL="INFO"
```

### 4. Database Seeding
Populate initial OPD departments, demo users, realistic patient queues, priority cases, and audit logs:
```bash
python seed.py
```

### 5. Running the Backend Server
Start the development server with hot-reloading:
```bash
python -m uvicorn app.main:app --port 8000 --reload
```

- **API Base:** `http://localhost:8000`
- **Interactive Swagger Docs:** `http://localhost:8000/docs`
- **ReDoc:** `http://localhost:8000/redoc`

---

## 👥 Demo Credentials

| Role | Email | Password | Permissions & Purpose |
|---|---|---|---|
| **Reception & Triage** | `reception@queuesense.demo` | `Reception@123` | Patient intake, token issuance, recording initial priority requests. |
| **Doctor / Counter Staff** | `doctor@queuesense.demo` | `Doctor@123` | Calling next patient, managing consult status, clinical priority validation. |
| **Hospital Admin / RMO** | `admin@queuesense.demo` | `Admin@123` | Capacity planning, counter management, system-wide analytics, data export. |

---

## 🧪 Running Automated Tests

Run the full Pytest suite with verbose test reporting:
```bash
python -m pytest tests/ -v
```

Tests cover:
- ✅ JWT Authentication & Password verification
- ✅ Patient intake & sequential department token generation
- ✅ Priority queue precedence on `POST /api/queue/{dept_id}/call-next`
- ✅ Status transitions (`WAITING` $\rightarrow$ `CALLED` $\rightarrow$ `IN_SERVICE` $\rightarrow$ `COMPLETED`)
- ✅ Explainable wait-time calculations with factor breakdown
- ✅ Priority flag review & permanent audit log updates

---

## 📡 Key REST & WebSocket API Endpoints

### Authentication
- `POST /api/auth/login` — Authenticate and receive JWT token
- `GET /api/auth/me` — Retrieve current authenticated user profile

### Departments
- `GET /api/departments` — List active departments with current queue load & counter statuses
- `GET /api/departments/{id}` — Retrieve department details
- `PATCH /api/departments/{id}` — Configure active counters and service duration

### Patient Registration & Intake
- `POST /api/patients/register` — Register patient, issue sequential token (`GM-104`), return estimated wait
- `GET /api/patients/{id}` — Retrieve sanitized patient registration record

### Queue Management
- `GET /api/queue` — Retrieve all queue tokens (filterable by `department_id` and `status`)
- `GET /api/queue/{dept_id}/current` — Get currently called / in-service token
- `POST /api/queue/{dept_id}/call-next` — Atomically call next token (prioritizes priority tokens)
- `PATCH /api/queue/tokens/{token_id}/status` — Update lifecycle status (`IN_SERVICE`, `COMPLETED`, `SKIPPED`, `NO_SHOW`)
- `GET /api/queue/tokens/{token_id}` — Get single token profile

### Explainable Waiting-Time Estimation
- `GET /api/waiting-time/{dept_id}` — Calculate explainable waiting duration, confidence interval, and 5-factor breakdown
- `GET /api/waiting-time/token/{token_id}` — Calculate customized wait time for an individual token

### Clinical Priority Review & Governance
- `GET /api/priority/flags` — List priority cases with audit trails (filterable by `PENDING`, `ACCEPTED`, `REJECTED`)
- `PATCH /api/priority/flags/{flag_id}` — Medical officer review, status update, and append audit note

### Hospital Analytics
- `GET /api/analytics/overview` — Aggregated summary, hourly rush trends, and department benchmarks
- `GET /api/analytics/congestion` — Hospital-wide congestion index and operational staffing advice

### Live WebSockets
- `WS /ws/queue/{department_id}` — Real-time event broadcasts (`PATIENT_REGISTERED`, `TOKEN_CALLED`, `TOKEN_STATUS_UPDATED`, `CONGESTION_ALERT`)

---

## 🌐 Frontend Integration

The React + Vite frontend communicates with this backend seamlessly:
1. In your frontend directory (`queueresq/`), configure `.env`:
   ```env
   VITE_API_BASE_URL=http://localhost:8000/api
   ```
2. Start the FastAPI backend on port 8000:
   ```bash
   python -m uvicorn app.main:app --port 8000
   ```
3. Start the Vite frontend:
   ```bash
   npm run dev
   ```
