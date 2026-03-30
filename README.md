# GridPulse ⚡

> **A dynamic project-simulation and predictive web application for POWERGRID infrastructure projects.**
[![Live Website](https://img.shields.io/badge/Live_Demo-GridPulse-emerald?style=for-the-badge&logo=netlify)](https://gridpulse-webapp.netlify.app)

GridPulse serves as a "Digital Twin" for infrastructure projects. It is a full-stack platform designed to simulate, estimate, and analyze project delays and cost overruns by applying recursive delay logic and autonomous macro-factors (such as weather, financial markets, and global events).

## 🌍 Live Link
**[Experience GridPulse Here!](https://gridpulse-webapp.netlify.app)**

---

## 🚀 Key Features

### 1. The "Predict" Page (Zero-Day Estimator)
A planning sandbox that predicts cost and time overruns before a project even starts.
* Takes inputs like Project Category, Scale, Base Budget, Terrain Profile, and Forest Cover.
* Outputs Glassmorphism Cards showing Estimated Cost, Predicted Overruns, Estimated Timeline, and Predicted Delays.

### 2. Project Pulse (Live Simulator / Digital Twin)
An active dashboard featuring a strict separation between **Manual Internal Progress** and **Autonomous External Triggers**.
* **Auto-Baseline Generator:** Calculates initial project timelines and budgets upon initialization.
* **Conditional Setup:** Tailor the simulator for Transmission Lines or Substations, defining capacity and location.
* **Manual Workload Tracker:** Tracks execution across 9 critical project layers.
* **Time Engine (Lock & Play):** Time-travel forward to simulate execution progress.

### 3. Autonomous Event Engine (Backend Driven)
Silent background engine that watches external macro-factors to automatically inject realistic delays and overruns:
* **Environmental/Weather:** Heavy monsoons or floods automatically halt excavation.
* **Live Market Fluctuator:** Dynamic adjustments of project costs based on simulated commodity prices (e.g., steel/copper spikes).
* **Worldly Affairs / Force Majeure:** Global supply chain issues securely lock materials and apply financial overruns.

---

## 🛠 Tech Stack

**Frontend Framework & UI:**
* React.js (Vite)
* Tailwind CSS v4 (Premium Glassmorphism Aesthetic)
* Recharts (For Dynamic Gantt Charts & Data Visualizations)

**Backend & Data:**
* FastAPI (Python) - Fast, asynchronous Delay Engine
* SQLite - Lightweight and responsive persistent storage (`gridpulse.db`)

**Infrastructure & Deployment:**
* Docker & Docker Compose (Full-stack containerization)
* Netlify (Frontend Deployment)

---

## 🏗 The 9 Interdependent Micro-Layers
Our simulation strictly models the real-world sequence of POWERGRID project execution:
1. Survey & Route Alignment
2. Engineering & Design
3. Regulatory Permissions
4. Land Acquisition / ROW
5. Supply of Material
6. Site Leveling & Excavation
7. Concreting & Foundation
8. Tower/Equipment Erection
9. Testing & Commissioning

---

## 💻 Local Setup & Installation

GridPulse is fully dockerized for an easy, seamless development experience.

### Prerequisites:
* [Docker](https://www.docker.com/) & [Docker Compose](https://docs.docker.com/compose/) installed on your machine.
* Alternatively, Node.js (`v18+`) and Python (`v3.10+`) for manual setup.

### Option 1: Run with Docker (Recommended)
1. **Clone the repository:**
   ```bash
   git clone https://github.com/yourusername/gridpulse.git
   cd gridpulse
   ```
2. **Build and start the application:**
   ```bash
   docker-compose up --build
   ```
3. **Access the application:**
   * Frontend: `http://localhost:5173`
   * Backend API / Swagger Docs: `http://localhost:8000/docs`

### Option 2: Run Manually (Without Docker)
**Backend:**
```bash
cd backend
python -m venv .venv
source .venv/bin/activate  # Or `.venv\Scripts\activate` on Windows
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

**Frontend:**
```bash
cd frontend
npm install
npm run dev
```

---

## 📜 License
Distributed under the MIT License. See `LICENSE` for more information.

---
*Built with ❤️ for Makethon 3.0*
