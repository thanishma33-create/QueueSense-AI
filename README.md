# 🏥 QueueSense AI — Intelligent Hospital Waiting-Time & Patient Flow System

> **Hackathon Theme:** Tech for a Better Tomorrow  
> **Target Environment:** Government Outpatient Department (OPD) Hub  
> **Key Innovations:** Accessible Bilingual (English & Malayalam) Voice Guidance, Explainable AI Wait-Time Estimation, Clinical Priority Governance, and Public TV Display.

---

## 🌟 Executive Summary

**QueueSense AI** is a production-grade, accessible outpatient queue management and patient flow platform designed for public healthcare facilities. It addresses OPD hallway congestion, long patient wait-times, and digital literacy barriers (particularly for senior citizens) through transparent AI wait-time estimation, multilingual voice synthesis, high-contrast displays, and strict clinical priority governance.

---

## 🚀 Key Features

### 1. 📢 Multilingual Voice & High-Contrast TV Display (`/display`)
- Extra-large typography for waiting halls.
- **Bilingual English & Malayalam announcements** using procedural Web Audio chimes and Web Speech API.
- Fullscreen mode for hospital monitor deployment.
- Public display privacy: No sensitive medical data or personal phone numbers are ever exposed on public screens.

### 2. 🧠 Explainable Wait-Time Estimation AI (`/predictions`)
- Transparent mathematical formulation calculating OPD wait times based on:
  - Queue depth ($Q_{\text{waiting}}$)
  - Active consultation counters ($C_{\text{active}}$)
  - Average consult duration ($T_{\text{service}}$)
  - Peak-hour surge coefficient ($\alpha_{\text{surge}}$)
  - Clinical specialty complexity factor ($k_{\text{specialty}}$)
- Confidence interval indicator with estimated uncertainty range ($t \pm \sigma$).
- **Interactive "What-If" Capacity Sandbox** for department heads and administrators to model the impact of staffing adjustments.

### 3. 🛡️ Clinical Priority Governance & Audit Ledger (`/priority-review`)
- **Safety Guardrail:** AI does *not* diagnose patients or autonomously assign emergency triage.
- Priority cases require authorized healthcare personnel verification (e.g. frail senior citizens, post-chemo follow-ups, pediatric fevers).
- Complete immutable audit trail logging verifier, timestamp, rationale, and action history.

### 4. 📊 OPD Congestion & Flow Analytics (`/analytics`)
- Daily and weekly waiting time trends using Recharts.
- Hourly patient inflow vs. consultations completed.
- Department load comparison without punitive ranking of clinical staff.
- Sanitized CSV report generation and download.

### 5. ⚡ Plug-and-Play API Service Layer (`src/services/api.js`)
- Standardized service layer ready for seamless FastAPI backend integration.
- Configurable via `VITE_API_BASE_URL`.
- Reactive `localStorage` fallback with realistic network latency simulation for standalone offline demos.

---

## 🛠️ Tech Stack

- **Framework:** React 18
- **Build Tool:** Vite 6
- **Styling:** Tailwind CSS (Navy & Medical Teal Palette)
- **Routing:** React Router v6
- **Icons:** Lucide React
- **Data Visualization:** Recharts
- **Audio & Speech:** Web Audio API (procedural chime) & Web Speech API (English & Malayalam speech synthesis)

---

## 💻 Installation & Local Development

### Prerequisites
- Node.js (v18 or higher recommended)
- npm (v9 or higher)

### 1. Clone & Install Dependencies
```bash
# Navigate to the workspace directory
cd queueresq

# Install project dependencies
npm install
```

### 2. Start the Development Server
```bash
npm run dev
```
Open your browser and visit: `http://localhost:3000`

### 3. Build for Production
```bash
npm run build
npm run preview
```

---

## 🔌 Connecting to a FastAPI Backend

The frontend contains a centralized API client in [`src/services/api.js`](file:///c:/Users/DELL/Desktop/queueresq/src/services/api.js).

To connect to a live FastAPI server:
1. Create a `.env` file in the project root:
   ```env
   VITE_API_BASE_URL=http://localhost:8000/api
   ```
2. Your FastAPI backend should implement endpoints matching:
   - `GET /departments`
   - `GET /queue?department_id={id}`
   - `POST /patients/register`
   - `POST /queue/call-next`
   - `PATCH /queue/tokens/{id}/status`
   - `GET /predictions/waiting-time?department_id={id}`
   - `GET /analytics?range={today|week|month}`
   - `GET /priority/flags`
   - `PATCH /priority/flags/{id}`

---

## 🔒 Safety, Ethics & Privacy Compliance

- **No Diagnostic Claim:** QueueSense AI estimates operational queue metrics only.
- **Privacy by Design:** Anonymized references (`REF-8238`) and initials are used throughout public interfaces.
- **Clinical Primacy:** Authorized medical officers maintain full override authority over queue priority.
