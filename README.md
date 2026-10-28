# 🏥 QueueSense AI

### Intelligent Hospital Waiting-Time & Patient Flow Management System

[![Python](https://img.shields.io/badge/Python-3.11+-blue?logo=python)](https://www.python.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-Backend-009688?logo=fastapi)](https://fastapi.tiangolo.com/)
[![React](https://img.shields.io/badge/React-18-61DAFB?logo=react)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-Build%20Tool-646CFF?logo=vite)](https://vitejs.dev/)
[![SQLite](https://img.shields.io/badge/Database-SQLite-003B57?logo=sqlite)](https://www.sqlite.org/)
[![SQLAlchemy](https://img.shields.io/badge/ORM-SQLAlchemy-D71F00)](https://www.sqlalchemy.org/)
[![JWT](https://img.shields.io/badge/Auth-JWT-black)](https://jwt.io/)
[![WebSockets](https://img.shields.io/badge/Real--Time-WebSockets-blue)](https://developer.mozilla.org/en-US/docs/Web/API/WebSockets_API)
[![Tailwind CSS](https://img.shields.io/badge/Styling-Tailwind%20CSS-06B6D4?logo=tailwindcss)](https://tailwindcss.com/)

> **QueueSense AI** is an intelligent hospital outpatient department (OPD) queue management and patient flow platform designed to reduce uncertainty in waiting times, improve staff coordination, and support more efficient healthcare service delivery.

---

## 🌐 Live Deployment & Demo

| Service | Live URL | Status | Description |
|---|---|---|---|
| 🚀 **Frontend Web Application** | [queuesense-ai-1.onrender.com](https://queuesense-ai-1.onrender.com) | ![Live](https://img.shields.io/badge/status-active-success) | OPD Queue Management, Patient Display & Staff Dashboard |
| 🔗 **Backend REST API & Swagger** | [queuesense-ai-rx39.onrender.com/docs](https://queuesense-ai-rx39.onrender.com/docs) | ![Live](https://img.shields.io/badge/status-active-success) | Interactive FastAPI OpenAPI Swagger UI |
| 💓 **Backend Health Check** | [queuesense-ai-rx39.onrender.com/health](https://queuesense-ai-rx39.onrender.com/health) | ![Live](https://img.shields.io/badge/health-ok-success) | Service Status & Database Connection Verification |
| 📡 **Real-Time WebSocket Feed** | `wss://queuesense-ai-rx39.onrender.com/ws/queue/{department_id}` | ![Active](https://img.shields.io/badge/websocket-active-blue) | Live Queue Event Streaming |

> The live deployment runs 24/7 on Render. If waking from cold start, the backend may take up to 45 seconds to spin up.

---

## 🎥 Live Demo Video

📽️ **Project Demonstration Video:**  
[Add your demo video link here]

Example:

```text
https://drive.google.com/your-demo-video-link
```

The demonstration video can showcase:

- Staff login
- Department selection
- Patient registration
- Queue management
- Token calling
- Waiting-time estimation
- Priority review
- Analytics dashboard

---

## 📸 Application Screenshots

### 🖥️ Screenshot 1 — Staff Dashboard

<!-- Replace the path with your actual screenshot -->
![QueueSense AI Dashboard](screenshots/dashboard.png)

> Staff dashboard showing queue information, patient flow, waiting-time insights, and operational statistics.

### 🏥 Screenshot 2 — Queue Management

<!-- Replace the path with your actual screenshot -->
![Queue Management](screenshots/queue-management.png)

> Queue management interface for monitoring tokens, calling patients, and updating queue status.

---

## 📌 Table of Contents

- [Problem Statement](#-problem-statement)
- [Solution](#-solution)
- [Objectives](#-objectives)
- [Key Features](#-key-features)
- [User Roles](#-user-roles)
- [System Architecture](#-system-architecture)
- [Application Workflow](#-application-workflow)
- [Technology Stack](#️-technology-stack)
- [Project Structure](#-project-structure)
- [Installation and Setup](#-installation-and-setup)
- [Environment Variables](#-environment-variables)
- [API Documentation](#-api-documentation)
- [Deployment](#-deployment)
- [Safety and Responsible Design](#-safety-and-responsible-design)
- [Future Enhancements](#-future-enhancements)
- [Contributor](#-contributor)

---

## ❗ Problem Statement

Government hospitals and busy outpatient departments often face challenges such as:

- Long and unpredictable patient waiting times.
- Manual queue and token management.
- Limited visibility into patient flow.
- Difficulty coordinating departments and service counters.
- Challenges supporting elderly patients and people with limited digital literacy.
- Limited operational insights for identifying congestion and improving resource allocation.

These challenges can increase staff workload and create a less predictable experience for patients.

---

## 💡 Solution

QueueSense AI provides a centralized digital platform for hospital OPD queue management and patient flow coordination.

The system connects hospital staff, patient registration, department queues, waiting-time insights, and operational analytics through a unified interface.

It supports staff decision-making by presenting queue information and reviewable priority indicators, while keeping clinical decisions under authorized healthcare personnel.

---

## 🎯 Objectives

- Improve hospital OPD queue visibility.
- Reduce uncertainty around patient waiting times.
- Digitize patient registration and token management.
- Support real-time queue updates.
- Provide department-level monitoring and analytics.
- Assist staff in reviewing potential priority cases.
- Design an accessible system for diverse patient groups.
- Improve coordination between reception and clinical service counters.

---

## 🚀 Key Features

### 1. 🔐 Role-Based Authentication

- JWT-based authentication.
- Staff login and session management.
- Role-oriented access to application features.
- Support for different operational responsibilities.

### 2. 🏥 Department Management

The system supports hospital departments such as:

- General Medicine
- Pediatrics
- Orthopedics
- ENT

Departments can be used to organize patient queues and monitor waiting times.

### 3. 🧑‍⚕️ Patient Registration

- Register patients through the staff interface.
- Capture required registration information.
- Assign patients to the appropriate department.
- Generate queue tokens.
- Reduce dependency on manual queue records.

### 4. 🎫 Digital Queue Management

- View department-specific queues.
- Display current and waiting tokens.
- Call the next patient.
- Update token status.
- Support queue monitoring through a centralized dashboard.

### 5. ⏱️ Waiting-Time Insights

- Display estimated waiting-time information.
- Provide department-level waiting-time insights.
- Help staff communicate queue expectations.
- Support operational planning using available queue information.

> Waiting-time estimates are informational and may vary depending on actual patient flow, service duration, and queue changes.

### 6. ⚠️ Priority Review Support

- Identify cases that may require staff review.
- Provide reviewable priority indicators.
- Keep priority decisions under authorized staff supervision.
- Avoid allowing patients to independently assign themselves clinical priority.

### 7. 📊 Analytics Dashboard

- Queue-related statistics.
- Department-level operational insights.
- Waiting-time monitoring.
- Patient flow analysis.
- Data visualization for staff and administrators.

### 8. 🔄 Real-Time Updates

- WebSocket-based queue communication.
- Live queue updates between connected clients.
- Reduced need for repeated manual refreshes.
- Improved visibility of queue changes.

### 9. 👥 Accessibility-Oriented Design

- Staff-assisted registration.
- Clear interface design.
- Support for elderly patients and users with limited digital literacy.
- Reduced dependence on personal smartphones for accessing queue services.

### 10. ⚙️ Administrative Configuration

- Application settings.
- Backend configuration through environment variables.
- Structured API integration.
- Role-based operational workflows.

---

## 👤 User Roles

| User Role | Responsibilities |
|---|---|
| Reception Staff | Patient registration, department selection, token generation, queue assistance |
| Doctor / Counter Staff | View queues, call patients, update token status, review priority indicators |
| Administrator | Monitor operations, access analytics, manage system-level configuration |

> Actual permissions depend on the implementation of the deployed application.

---

## 🏗️ System Architecture

QueueSense AI follows a client-server architecture.

```text
                    ┌─────────────────────────┐
                    │       Frontend          │
                    │    React + Vite         │
                    │    Tailwind CSS         │
                    └────────────┬────────────┘
                                 │
                         HTTP / REST API
                                 │
                         WebSocket Updates
                                 │
                    ┌────────────▼────────────┐
                    │        Backend          │
                    │        FastAPI          │
                    │ Authentication + APIs   │
                    │ Queue Management        │
                    │ Waiting-Time Services   │
                    └────────────┬────────────┘
                                 │
                         SQLAlchemy ORM
                                 │
                    ┌────────────▼────────────┐
                    │        Database         │
                    │    SQLite / SQL DB      │
                    └─────────────────────────┘
```

### Architecture Components

- **Frontend:** Provides the user interface and staff workflows.
- **Backend:** Handles API requests, authentication, queue operations, and business logic.
- **Database:** Stores application records through SQLAlchemy.
- **WebSockets:** Support real-time queue updates.
- **JWT:** Supports authenticated access to protected resources.

---

## 🔁 Application Workflow

```text
Staff Login
     │
     ▼
Select Department
     │
     ▼
Register Patient
     │
     ▼
Generate Queue Token
     │
     ▼
Patient Added to Department Queue
     │
     ▼
Waiting-Time Information Updated
     │
     ▼
Staff Monitors Queue
     │
     ▼
Call Next Patient
     │
     ▼
Update Token Status
     │
     ▼
Analytics and Operational Monitoring
```

---

## 🛠️ Technology Stack

### Frontend

| Technology | Purpose |
|---|---|
| React 18 | User interface development |
| Vite | Frontend build tool |
| React Router | Application navigation |
| Tailwind CSS | Responsive styling |
| Lucide React | Interface icons |
| Recharts | Data visualization |
| Axios / Fetch | API communication |
| WebSocket Client | Real-time queue updates |

### Backend

| Technology | Purpose |
|---|---|
| Python 3.11+ | Backend programming |
| FastAPI | REST API framework |
| SQLAlchemy | Database ORM |
| SQLite | Development database |
| Pydantic | Data validation |
| Pydantic Settings | Configuration management |
| JWT | Authentication |
| Uvicorn | ASGI server |
| WebSockets | Real-time communication |
| Pytest | Backend testing |

---

## 📁 Project Structure

```text
QueueSense-AI/
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── services/
│   │   │   └── api.js
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── public/
│   ├── package.json
│   └── vite.config.js
│
├── backend/
│   ├── app/
│   │   ├── main.py
│   │   ├── config.py
│   │   ├── database.py
│   │   ├── models/
│   │   ├── schemas/
│   │   ├── routers/
│   │   └── services/
│   ├── requirements.txt
│   └── ...
│
└── README.md
```

> The structure above represents the intended organization. Update individual folders if your repository contains additional files or different names.

---

## 💻 Installation and Setup

### Prerequisites

Install the following:

- Python 3.11 or later
- Node.js and npm
- Git
- A code editor such as VS Code or Antigravity IDE

### 1. Clone the Repository

```bash
git clone https://github.com/thanishma33-create/QueueSense-AI.git
cd QueueSense-AI
```

### 2. Backend Setup

Open a terminal:

```bash
cd backend
```

Create a virtual environment:

#### Windows

```bash
python -m venv .venv
.venv\Scripts\activate
```

#### macOS / Linux

```bash
python3 -m venv .venv
source .venv/bin/activate
```

Install dependencies:

```bash
pip install -r requirements.txt
```

Start the backend:

```bash
uvicorn app.main:app --reload
```

Backend API documentation:

```text
http://127.0.0.1:8000/docs
```

### 3. Frontend Setup

Open another terminal:

```bash
cd frontend
npm install
npm run dev
```

Open the local URL shown in the terminal.

---

## 🔑 Environment Variables

### Frontend

Create a frontend environment file according to your project configuration.

Example:

```env
VITE_API_BASE_URL=https://queuesense-ai-rx39.onrender.com
VITE_DEMO_MODE=false
```

> Use your actual deployed backend URL. Do not commit private credentials or secret keys to GitHub.

### Backend

Configure backend environment variables according to your settings file.

Example:

```env
DATABASE_URL=sqlite:///./queuesense.db
SECRET_KEY=your-secure-secret-key
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=120
FRONTEND_URL=http://localhost:5173
LOG_LEVEL=INFO
```

For production, use a strong secret key and an appropriate persistent database configuration.

---

## 📡 API Documentation

The backend provides automatically generated FastAPI documentation.

### Live API Documentation

[Open QueueSense AI API Docs](https://queuesense-ai-rx39.onrender.com/docs)

### Example API Groups

| Method | Endpoint | Purpose |
|---|---|---|
| POST | `/api/auth/login` | Authenticate a user |
| GET | `/api/auth/me` | Get authenticated user information |
| GET | `/api/departments` | Retrieve departments |
| POST | `/api/patients/register` | Register a patient |
| GET | `/api/queue/{department_id}` | Retrieve department queue |
| GET | `/api/queue/{department_id}/current` | Get current queue information |
| POST | `/api/queue/{department_id}/call-next` | Call the next patient |
| PATCH | `/api/queue/tokens/{token_id}/status` | Update token status |
| GET | `/api/waiting-time/{department_id}` | Get waiting-time information |

> Confirm exact route parameters and additional endpoints through the live Swagger documentation.

---

## ☁️ Deployment

QueueSense AI is fully deployed to production using a cloud-native architecture on Render with seamless CI/CD from GitHub.

### 🚀 Production Deployment URLs

- **Frontend Client Application:** [https://queuesense-ai-1.onrender.com](https://queuesense-ai-1.onrender.com)
- **Backend API & Swagger UI:** [https://queuesense-ai-rx39.onrender.com/docs](https://queuesense-ai-rx39.onrender.com/docs)
- **Backend Health Check:** [https://queuesense-ai-rx39.onrender.com/health](https://queuesense-ai-rx39.onrender.com/health)
- **WebSocket Gateway:** `wss://queuesense-ai-rx39.onrender.com/ws/queue/{department_id}`

### 🏗️ Production Architecture

```
[ Patient Displays / Kiosks / Staff Consoles ]
                        │
                        │ HTTPS / WSS
                        ▼
   ┌─────────────────────────────────────────┐
   │         Render Static Site              │
   │         (Vite + React 18 SPA)           │
   │    https://queuesense-ai-1.onrender.com │
   └────────────────────┬────────────────────┘
                        │
                        │ REST JSON API & WebSockets
                        ▼
   ┌─────────────────────────────────────────┐
   │         Render Web Service              │
   │         (FastAPI + Uvicorn ASGI)        │
   │   https://queuesense-ai-rx39.onrender.com │
   └────────────────────┬────────────────────┘
                        │
                        │ SQLAlchemy 2.0 ORM
                        ▼
   ┌─────────────────────────────────────────┐
   │         SQLite Relational Store         │
   │       (Auto-seeded demo records)        │
   └─────────────────────────────────────────┘
```

### ⚙️ Production Configuration Settings

| Setting | Backend Web Service | Frontend Static Site |
|---|---|---|
| **Platform** | Render (Web Service) | Render (Static Site) / Vercel / Netlify |
| **Root Directory** | `backend` | Root `./` |
| **Build Command** | `pip install -r requirements.txt` | `npm install && npm run build` |
| **Start Command** | `uvicorn app.main:app --host 0.0.0.0 --port $PORT` | N/A (Static Files) |
| **Publish Directory** | N/A | `dist` |
| **Health Check Path** | `/health` | `/` |
| **SPA Routing Rule** | N/A | `/*` ➔ `/index.html` (200 rewrite) |

### 🔐 Production Environment Variables

#### Backend Web Service
```env
PROJECT_NAME="QueueSense AI - OPD Queue & Patient Flow System"
API_V1_STR="/api"
DATABASE_URL="sqlite:///./queuesense.db"
SECRET_KEY="your-secure-production-secret-key"
ALGORITHM="HS256"
ACCESS_TOKEN_EXPIRE_MINUTES=120
FRONTEND_URL="https://queuesense-ai-1.onrender.com"
LOG_LEVEL="INFO"
```

#### Frontend Static Site
```env
VITE_API_BASE_URL=https://queuesense-ai-rx39.onrender.com
VITE_WS_BASE_URL=wss://queuesense-ai-rx39.onrender.com/ws
VITE_DEMO_MODE=false
```

### 🔁 Automated CI/CD Deployment Flow
1. **GitHub Push:** Every commit pushed to the `main` branch of [`thanishma33-create/QueueSense-AI`](https://github.com/thanishma33-create/QueueSense-AI) triggers automatic webhooks on Render.
2. **Backend Automated Build:** Render pulls latest Python code, installs dependencies, verifies database tables, and executes the automatic demo database seed during lifespan startup.
3. **Frontend Automated Build:** Render executes Vite production compilation (`npm run build`), bundles assets, applies SPA routing rewrite rules via [`public/_redirects`](public/_redirects), and publishes the `dist` directory.
4. **Live Verification:** Both frontend and backend verify connection with CORS origin matching and live health checks.

---

## 🛡️ Safety and Responsible Design

QueueSense AI is designed as a healthcare operations and queue-management platform.

- The system is not intended to diagnose medical conditions.
- Waiting-time estimates should not be treated as guaranteed times.
- Priority indicators should be reviewed by authorized hospital staff.
- The system should not replace professional clinical judgment.
- Public queue displays should avoid exposing sensitive patient information.
- Production deployments should use secure authentication, appropriate data protection, and suitable database infrastructure.

---

## 🔮 Future Enhancements

Potential future improvements include:

- Multilingual interface support, including regional languages.
- SMS and voice-based queue notifications.
- Accessibility features for elderly and visually impaired users.
- Improved waiting-time prediction using validated hospital data.
- Integration with hospital information systems.
- Persistent production-grade database deployment.
- Advanced operational analytics.
- Better offline and low-connectivity support.
- Queue monitoring across multiple hospital branches.

---

## 👨‍💻 Contributor

### Thanishma Shanoje

**Role:** Full-Stack Innovator|AI& Health Care technology enthusiast
Passionate about transforming innovative ideas into reality,user-focused digital solutions.

**Responsibilities:**

- Frontend UI/UX design and implementation.
- React and Vite application development.
- Responsive interface development.
- Backend API integration.
- Queue management workflow implementation.
- Deployment and frontend-backend connectivity.
- System testing and project documentation.

| Contact | Details |
|---|---|
| Name | Thanishma Shanoje |
| Role | Frontend and Backend Developer |
| Email | thanishma33@gmail.com |
| GitHub | [thanishma33-create](https://github.com/thanishma33-create) |

---

## 📄 License

This project was developed for educational and hackathon purposes.

Add an appropriate open-source license if you decide to publish the project under specific licensing terms.

---

## ⭐ Acknowledgement

QueueSense AI aims to demonstrate how digital queue management, real-time communication, and data-driven operational insights can support more organized and accessible hospital outpatient services.

**Built with ❤️ for a better healthcare experience.**
