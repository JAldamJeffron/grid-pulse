# GridPulse: Master Architecture & Technical Blueprint

## 1. System Overview (The "Digital Twin")
Build "GridPulse," a dynamic project-simulation and predictive web application for POWERGRID infrastructure projects. The platform consists of two main engines:
1. **The Predict Page (Zero-Day Estimator):** A planning sandbox that predicts cost and time overruns before a project starts.
2. **The Live Simulator (Digital Twin):** An active dashboard featuring a strict separation between **Manual Internal Progress** (user-entered workloads for 9 layers) and **Autonomous External Triggers** (backend-driven delays from weather, financial markets, and global worldly affairs).

## 2. Tech Stack Requirements (Full-Stack Dockerized)
* **Frontend:** React, Vite, and Tailwind CSS v4. Aesthetic: Premium Glassmorphism (translucent cards, soft shadows, blue/gray/emerald tones). Use `Recharts` for Gantt charts.
* **Backend:** FastAPI (Python) for recursive delay logic and the Autonomous Event Engine.
* **Database:** SQLite (local `gridpulse.db`) with tables for: Projects, 9-Phase Layers, Quantitative Targets, and Global Event Logs.
* **Deployment:** Docker & Docker Compose (`Dockerfile` required for full-stack spin-up).

## 3. The 9 Interdependent Micro-Layers (Manual Input)
The system tracks 9 strict sequential/parallel layers. The UI for these must be purely manual data entry.
1. **Survey & Route Alignment:** (Unit: km surveyed)
2. **Engineering & Design:** (Unit: Technical Diagrams)
3. **Regulatory Permissions:** (Unit: Permits Acquired)
4. **Land Acquisition / ROW:** (Unit: Hectares/Parcels)
5. **Supply of Material:** (Unit: Tons of Steel/Cables)
6. **Site Leveling & Excavation:** (Unit: Cubic Meters)
7. **Concreting & Foundation:** (Unit: Foundations Cast)
8. **Tower/Equipment Erection:** (Unit: Towers Erected)
9. **Testing & Commissioning:** (Unit: Sub-systems)

## 4. Feature Module 1: The "Predict" Page
A pre-project estimation sandbox. Do NOT ask the user for delay days; the AI calculates them.
* **Inputs:** Project Category (Transmission/Substation), Scale (km/kV), Base Budget (₹), Terrain Profile, Forest Cover, Vendor Tier.
* **Output:** 4 Glassmorphism Cards (Estimated Cost, Predicted Overrun in Red, Estimated Timeline, Predicted Delay in Red).

## 5. Feature Module 2: The "Live Simulator" Page

### A. Conditional Project Setup (Manual Inputs)
* **Project Category:** Dropdown (`Transmission Line` or `Substation`).
* **Condition 1 (If Transmission Line):** Show Line Type (`Overhead`/`Underground`) and Distance (`km`).
* **Condition 2 (If Substation):** Show Capacity (`kV`).
* **Universal Inputs:** Terrain Profile, Project Location (City), Official Start Date.
* **Action:** "Lock & Initialize Simulation" Button.

### B. The "Lock & Play" Time Engine
* **Logic:** Once initialized, the "Official Start Date" becomes Read-Only. Reveal a "Current Simulation Date" picker that defaults to the Start Date. The user manually changes this to "time-travel" forward.

### C. The Manual Workload Tracker (Internal Execution)
Display the 9 layers as expandable accordion panels. The user manually logs progress here:
* `Total Target Required`: Number Input.
* `Actual Completed`: Number Input.
* **Completion Checkmark:** If `Actual Completed` >= `Total Target Required`, instantly lock the inputs and display a green ✅ **"PHASE COMPLETED"**.
* **Delay Trigger:** If the `Current Simulation Date` passes a layer's deadline without the ✅ checkmark, flag it RED and trigger internal delay propagation.

## 6. Business Logic: Autonomous Macro-Factors (Backend)
The FastAPI backend must include an `Autonomous Event Engine`. Every time the user changes the `Current Simulation Date`, the backend silently checks for external macro-factors and automatically injects delays and cost overruns into the project, independent of the user's manual inputs.

Implement these 3 backend-driven autonomous triggers:
1. **Environmental / Weather:** Integrate OpenWeather API (or mock weather logic). If the `Current Simulation Date` coincides with heavy monsoons or floods in the `Project Location`, automatically halt Phase 6 (Excavation) and Phase 7 (Foundation). Add +days to the timeline.
2. **Financial / Commodity Markets:** Integrate a mock Commodity Index (or real API). If the backend detects a sudden +15% spike in Steel/Copper prices on the `Current Simulation Date`, automatically recalculate the Phase 5 (Supply) budget and add a financial overrun.
3. **Worldly Affairs / Force Majeure:** Create a randomized (or News API-driven) geopolitical risk trigger. If a "War / Embargo" or "Global Supply Chain Crisis" is detected, apply an instant 3.0x multiplier to the Supply and Erection phases, locking the materials.

## 7. The Live Scoreboard & Autonomous Event Log
* **Scoreboard:** A sticky UI reacting instantly to both the manual inputs AND the backend autonomous events.
  * Card 1: Original Deadline vs. Live Projected Deadline (+X Days Delay in Red).
  * Card 2: Approved Budget vs. Live Projected Cost (+₹ X Lakhs Overrun in Red).
* **Live Hindrance Log:** A vertical feed that prints Event Cards explaining *why* the backend changed the numbers. 
  * *Example:* "[Date] GLOBAL EVENT: Red Sea supply chain disrupted due to geopolitical conflict. Phase 5 (Supply) costs increased by ₹45 Lakhs. +30 Days Delay applied autonomously."
