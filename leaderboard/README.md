# EPOCH 1.0 // Real-time Leaderboard, Reports & Export System
### **Person 4 Deliverable Specification**
**Host Club:** CodeAI &bull; K. J. Somaiya Institute of Technology  
**Design Theme:** Cyber-Terminal Dark Aesthetic (Epoch 1.0 & CodeAI)

---

## 🌟 Person 4 Deliverables Implemented

1. **Real-time Dynamic Leaderboard & Standings**
   - Live ranked teams table with animated rank badges and rank shift delta indicators (`▲`, `▼`, `—`).
   - 3D-styled **Top 3 Podium Showcase** with cyber glow badges for 1st (Gold 👑), 2nd (Silver 🥈), and 3rd (Bronze 🥉).
   - Track pills and instant search filtering (Search across team name, project title, and tech stack).
   - Sorting by overall weighted score or any of the individual 6 judging criteria.

2. **Multi-Judge Score Aggregator Engine**
   - Automatically computes criteria-level averages across multiple judges evaluating each team.
   - Calculates overall composite score scaled out of 100 based on the 6 weighted criteria:
     - **C1: Innovation & Originality** (20%)
     - **C2: Technical Execution** (25%)
     - **C3: UI/UX & Design Polish** (15%)
     - **C4: Feasibility & Real-world Impact** (15%)
     - **C5: Presentation & Pitch Delivery** (15%)
     - **C6: Code Quality & Architecture** (10%)
   - Statistical variance and consensus tracking (`HIGH`, `MEDIUM`, `LOW`) to flag outlier judge scores.

3. **Team Feedback Reports & Drilldown Dossier**
   - Interactive Modal Drilldown for each team.
   - **Interactive SVG Radar / Spider Chart** comparing the team's criteria scores against the competition benchmark.
   - Progress bar breakdowns for each criterion.
   - Judge-by-judge qualitative remarks and feedback log.
   - One-click **"Print Card"** for individual team scorecards.

4. **PDF / Report Generation & Admin CSV Export**
   - **Print Dossier Button**: Generates a clean, comprehensive Hackathon Evaluation Dossier formatted with custom `@media print` styles for PDF saving.
   - **Export CSV Button**: Exports a RFC-4180 compliant CSV containing Team ID, Name, Project, Track, Judge Count, Criteria 1-6 Averages, Weighted Total, Consensus, and Consolidated Remarks.

5. **Pluggable Integration Nexus (Person 1 & Person 3 Ready)**
   - **Built-in Standalone Live Simulation**: Ticker streams incoming judge scores so the UI can be showcased and verified independently.
   - **Backend API Adapter**: Input Person 1's server endpoint (`http://localhost:5000/api`) and connect live when ready.

---

## 🚀 How to Run Locally

```bash
# 1. Navigate to the project directory
cd C:\Users\Jayesh\.gemini\antigravity-ide\scratch\epoch-leaderboard-system

# 2. Install dependencies (Vite)
npm install

# 3. Start development server
npm run dev
```
The app will launch at `http://localhost:5173`.

---

## 🔌 API Contract for Person 1 (Backend + Database + Auth)

Person 1 can expose the following standard REST endpoints to hook directly into this frontend:

### 1. `GET /api/teams`
Returns list of teams:
```json
[
  {
    "id": "team-01",
    "name": "NeuralPulse",
    "title": "Autonomous EEG Seizure Forecasting via Edge Transformers",
    "track": "AI / ML",
    "members": ["Aarav Patel", "Sneha Iyer", "Kabir Sen"],
    "targetJudges": 3
  }
]
```

### 2. `GET /api/scores`
Returns all submitted scores from judges:
```json
[
  {
    "id": "score-101",
    "teamId": "team-01",
    "judgeId": "j-01",
    "judgeName": "Dr. Anita Roy",
    "judgeRole": "Chief AI Architect",
    "criteriaScores": {
      "c1": 9.5,
      "c2": 9.8,
      "c3": 9.2,
      "c4": 9.0,
      "c5": 9.4,
      "c6": 9.6
    },
    "feedback": "Brilliant technical execution and well-architected edge deployment.",
    "submittedAt": "2026-09-14T12:00:00Z"
  }
]
```

### 3. Real-time Events (WebSocket or Server-Sent Events - SSE)
Stream new judge score events:
```json
{
  "event": "SCORE_SUBMITTED",
  "data": { ...scorePayload }
}
```
