/**
 * ============================================================================
 * EPOCH 1.0 // LEADERBOARD & EVALUATION SERVICE (PERSON 4)
 * Authentic College Hackathon Teams, Mentors, and Score Aggregation (Out of 10)
 * ============================================================================
 */

import { CRITERIA_DEFINITIONS, TRACKS } from './apiContract.js';

// Realistic student hackathon teams from KJSIT / CodeAI Epoch 1.0
const BASELINE_TEAMS = [
  {
    id: 'team-01',
    name: 'ByteCrafters',
    title: 'SmartCampus: RFID & Computer Vision Lab Resource Booking',
    track: 'AI / ML',
    members: ['Jayesh Rane', 'Sneha Iyer', 'Kabir Sen', 'Aarav Patel'],
    college: 'K. J. Somaiya Institute of Technology',
    repoUrl: 'https://github.com/codeai-kjsit/smart-campus',
    targetJudges: 3
  },
  {
    id: 'team-02',
    name: 'BlockHeads',
    title: 'CredChain: Tamper-proof College Degree & Credential Verification',
    track: 'WEB3 & FINTECH',
    members: ['Devika Sharma', 'Rohan Mehta', 'Aditya Nair'],
    college: 'KJSIT Mumbai',
    repoUrl: 'https://github.com/codeai-kjsit/cred-chain',
    targetJudges: 3
  },
  {
    id: 'team-03',
    name: 'PulseGuard',
    title: 'VitalAlert: Continuous ICU Telemetry & Predictive Sepsis Alarm',
    track: 'HEALTHCARE & SOCIAL',
    members: ['Arjun Nair', 'Pooja Verma', 'Meera Joshi'],
    college: 'K. J. Somaiya Institute of Technology',
    repoUrl: 'https://github.com/codeai-kjsit/vital-alert',
    targetJudges: 3
  },
  {
    id: 'team-04',
    name: 'EcoTransit',
    title: 'GreenTransit: EV Fleet Schedule & Battery Swap Optimization for BEST Buses',
    track: 'OPEN INNOVATION',
    members: ['Siddharth K.', 'Vikram Rathore', 'Ananya Gupta'],
    college: 'DJ Sanghvi College of Engineering',
    repoUrl: 'https://github.com/codeai-kjsit/eco-transit',
    targetJudges: 3
  },
  {
    id: 'team-05',
    name: 'DevAccessibility',
    title: 'VoiceFlow: Hands-free Voice & Eye-tracking Code Navigator',
    track: 'OPEN INNOVATION',
    members: ['Ishita Shah', 'Harsh Trivedi', 'Rhea Kapoor'],
    college: 'K. J. Somaiya Institute of Technology',
    repoUrl: 'https://github.com/codeai-kjsit/voice-flow',
    targetJudges: 3
  },
  {
    id: 'team-06',
    name: 'AgriSense Mumbai',
    title: 'CropShield: Edge AI Blight Detection & Weather Advisory for Farmers',
    track: 'AI / ML',
    members: ['Kunal Bakshi', 'Neha Pillai', 'Aditya Rao'],
    college: 'SPIT Mumbai',
    repoUrl: 'https://github.com/codeai-kjsit/agri-sense',
    targetJudges: 3
  },
  {
    id: 'team-07',
    name: 'SplitChain',
    title: 'ZeroSplit: Instant Group Expense Settlements via UPI 2.0 & Web3 Pay',
    track: 'WEB3 & FINTECH',
    members: ['Manish Pandey', 'Farhan Ali', 'Deepak Chopra'],
    college: 'K. J. Somaiya Institute of Technology',
    repoUrl: 'https://github.com/codeai-kjsit/split-chain',
    targetJudges: 3
  },
  {
    id: 'team-08',
    name: 'MentalHeal AR',
    title: 'CalmSpace: Biofeedback Guided VR Meditation for Exam Stress',
    track: 'HEALTHCARE & SOCIAL',
    members: ['Kavita Sundaram', 'Yash Gaikwad'],
    college: 'VESIT Chembur',
    repoUrl: 'https://github.com/codeai-kjsit/calm-space',
    targetJudges: 3
  },
  {
    id: 'team-09',
    name: 'LocalVoice',
    title: 'BhashaBridge: Low-latency Hindi & Marathi Speech Translation for Public Helplines',
    track: 'AI / ML',
    members: ['Tanvi Sawant', 'Gaurav Kulkarni'],
    college: 'K. J. Somaiya Institute of Technology',
    repoUrl: 'https://github.com/codeai-kjsit/bhasha-bridge',
    targetJudges: 3
  },
  {
    id: 'team-10',
    name: 'UrbanClean',
    title: 'BinVision: Municipal Solid Waste Fill-level Forecasting & Smart Routing',
    track: 'OPEN INNOVATION',
    members: ['Nikhil Shinde', 'Pranali More'],
    college: 'VJTI Mumbai',
    repoUrl: 'https://github.com/codeai-kjsit/bin-vision',
    targetJudges: 3
  }
];

// Realistic human judging panel (Professors and Industry Mentors)
const JUDGES = [
  { id: 'j-01', name: 'Dr. Radhika Kulkarni', role: 'Professor & Head of Dept, KJSIT' },
  { id: 'j-02', name: 'Amitabh Joshi', role: 'Staff Engineer @ BrowserStack' },
  { id: 'j-03', name: 'Priya Chawla', role: 'Product Design Lead @ Zepto' },
  { id: 'j-04', name: 'Sanjay Deshpande', role: 'VP Engineering @ Polygon Labs' }
];

// Real, constructive feedback written by human judges
const HUMAN_FEEDBACK_BANK = [
  "Solid architecture and impressive live demo under pressure! The edge inference runs quickly, though you should benchmark memory usage on lower-end Android devices.",
  "Very thoughtful problem statement for Mumbai commuters. Clean frontend UI and great teamwork during Q&A defense.",
  "The smart contract verification logic is sound and gas consumption is well optimized. Consider adding a multisig recovery mechanism for edge cases.",
  "Great presentation skills and strong business justification. The pitch was crisp and addressed the faculty's questions directly.",
  "Extremely polished UI and intuitive user flows. Codebase on GitHub is well structured with clean commit hygiene and readable docs.",
  "Commendable social impact. The model needs a slightly larger dataset across varying lighting conditions before full production deployment, but the prototype is stellar."
];

class LeaderboardService {
  constructor() {
    this.teams = JSON.parse(JSON.stringify(BASELINE_TEAMS));
    this.judges = JSON.parse(JSON.stringify(JUDGES));
    this.scores = [];
    this.previousRanks = new Map();
    this.subscribers = new Set();
    this.tickerInterval = null;
    this.isTickerRunning = false;
    this.lastSyncTimestamp = new Date();
    this.backendApiUrl = null;
    this.isLiveBackend = false;

    this.seedInitialScores();
  }

  seedInitialScores() {
    this.scores = [];
    
    // Baseline evaluations (scores 1-10 per criteria)
    const seedMatrix = [
      { teamId: 'team-01', judges: ['j-01', 'j-02', 'j-03'], base: [9.4, 9.6, 9.2, 9.0, 9.5, 9.4] },
      { teamId: 'team-02', judges: ['j-02', 'j-03', 'j-04'], base: [9.1, 9.3, 9.4, 9.0, 9.1, 9.2] },
      { teamId: 'team-03', judges: ['j-01', 'j-03', 'j-04'], base: [8.9, 9.1, 8.8, 9.3, 9.0, 8.9] },
      { teamId: 'team-04', judges: ['j-01', 'j-02', 'j-04'], base: [8.8, 8.6, 8.9, 9.1, 8.7, 8.6] },
      { teamId: 'team-05', judges: ['j-02', 'j-03'], base: [8.6, 8.9, 8.3, 8.5, 8.6, 8.7] },
      { teamId: 'team-06', judges: ['j-01', 'j-04'], base: [8.4, 8.3, 8.6, 8.8, 8.3, 8.1] },
      { teamId: 'team-07', judges: ['j-02', 'j-03', 'j-04'], base: [8.3, 8.5, 8.6, 8.1, 8.5, 8.3] },
      { teamId: 'team-08', judges: ['j-01'], base: [8.1, 8.2, 8.0, 7.9, 8.3, 8.2] },
      { teamId: 'team-09', judges: ['j-03'], base: [7.8, 7.9, 8.1, 8.0, 7.9, 7.7] },
      { teamId: 'team-10', judges: [], base: [0, 0, 0, 0, 0, 0] }
    ];

    seedMatrix.forEach(entry => {
      entry.judges.forEach((jId, idx) => {
        const judge = this.judges.find(j => j.id === jId);
        const jitter = () => (Math.random() * 0.6 - 0.3);
        const criteriaScores = {
          c1: Math.min(10, Math.max(1, Math.round((entry.base[0] + jitter()) * 10) / 10)),
          c2: Math.min(10, Math.max(1, Math.round((entry.base[1] + jitter()) * 10) / 10)),
          c3: Math.min(10, Math.max(1, Math.round((entry.base[2] + jitter()) * 10) / 10)),
          c4: Math.min(10, Math.max(1, Math.round((entry.base[3] + jitter()) * 10) / 10)),
          c5: Math.min(10, Math.max(1, Math.round((entry.base[4] + jitter()) * 10) / 10)),
          c6: Math.min(10, Math.max(1, Math.round((entry.base[5] + jitter()) * 10) / 10)),
        };

        const feedbackIdx = Math.floor(idx + (entry.base[0] || 0)) % HUMAN_FEEDBACK_BANK.length;

        this.scores.push({
          id: `score-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
          teamId: entry.teamId,
          judgeId: jId,
          judgeName: judge ? judge.name : 'Faculty Evaluator',
          judgeRole: judge ? judge.role : 'Mentor',
          criteriaScores,
          feedback: HUMAN_FEEDBACK_BANK[feedbackIdx],
          submittedAt: new Date(Date.now() - (idx + 1) * 450000)
        });
      });
    });

    this.lastSyncTimestamp = new Date();
  }

  subscribe(callback) {
    this.subscribers.add(callback);
    callback(this.getAggregatedState());
    return () => this.subscribers.delete(callback);
  }

  notify() {
    this.lastSyncTimestamp = new Date();
    const state = this.getAggregatedState();
    this.subscribers.forEach(cb => {
      try {
        cb(state);
      } catch (err) {
        console.error('Error in subscriber callback:', err);
      }
    });
  }

  /**
   * Calculates multi-judge aggregated leaderboard
   * SCORE IS SCALED STRICTLY OUT OF 10.0 (weighted average of criteria 1-10)
   */
  getAggregatedState() {
    const totalSubmissions = this.scores.length;
    let fullyEvaluatedCount = 0;

    const teamRows = this.teams.map(team => {
      const teamScores = this.scores.filter(s => s.teamId === team.id);
      const judgeCount = teamScores.length;
      const targetJudges = team.targetJudges || 3;
      
      let status = 'PENDING';
      if (judgeCount >= targetJudges) {
        status = 'EVALUATED';
        fullyEvaluatedCount++;
      } else if (judgeCount > 0) {
        status = 'IN_PROGRESS';
      }

      // Calculate criteria averages (1-10 scale)
      const criteriaAverages = {};
      let weightedCompositeScore = 0; // Strictly out of 10.0

      if (judgeCount > 0) {
        CRITERIA_DEFINITIONS.forEach(crit => {
          const sum = teamScores.reduce((acc, s) => acc + (s.criteriaScores[crit.id] || 0), 0);
          const avg = sum / judgeCount;
          criteriaAverages[crit.id] = Math.round(avg * 10) / 10;
          // Weighted addition out of 10: (average * weight)
          weightedCompositeScore += avg * crit.weight;
        });
        // Rounded to 2 decimal places for precision on 10.0 scale
        weightedCompositeScore = Math.round(weightedCompositeScore * 100) / 100;
      } else {
        CRITERIA_DEFINITIONS.forEach(crit => {
          criteriaAverages[crit.id] = 0;
        });
        weightedCompositeScore = 0;
      }

      // Consensus Calculation across judges (variance on 10.0 scale)
      let consensus = 'HIGH';
      let scoreStdDev = 0;
      if (judgeCount > 1) {
        const judgeTotals = teamScores.map(s => {
          return CRITERIA_DEFINITIONS.reduce((acc, crit) => {
            return acc + (s.criteriaScores[crit.id] || 0) * crit.weight;
          }, 0);
        });
        const mean = judgeTotals.reduce((a, b) => a + b, 0) / judgeCount;
        const variance = judgeTotals.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / judgeCount;
        scoreStdDev = Math.sqrt(variance);

        if (scoreStdDev > 0.6) {
          consensus = 'MODERATE VARIANCE';
        } else if (scoreStdDev > 0.3) {
          consensus = 'NORMAL';
        } else {
          consensus = 'STRONG CONSENSUS';
        }
      } else if (judgeCount === 1) {
        consensus = 'PRELIMINARY (1 JUDGE)';
      } else {
        consensus = 'AWAITING SCORING';
      }

      return {
        ...team,
        judgeCount,
        targetJudges,
        status,
        criteriaAverages,
        weightedScore: weightedCompositeScore, // Out of 10.0 (e.g. 9.35)
        consensus,
        scoreStdDev: Math.round(scoreStdDev * 100) / 100,
        judgeScores: teamScores
      };
    });

    // Sort by weightedScore descending (tie breaker: C2 tech execution, then C1 innovation)
    teamRows.sort((a, b) => {
      if (b.weightedScore !== a.weightedScore) {
        return b.weightedScore - a.weightedScore;
      }
      if (b.criteriaAverages.c2 !== a.criteriaAverages.c2) {
        return b.criteriaAverages.c2 - a.criteriaAverages.c2;
      }
      return b.criteriaAverages.c1 - a.criteriaAverages.c1;
    });

    // Compute ranks and rank delta
    const rankedTeams = teamRows.map((team, index) => {
      const currentRank = index + 1;
      const prevRank = this.previousRanks.get(team.id) || currentRank;
      let delta = 0;
      if (prevRank > currentRank) {
        delta = prevRank - currentRank;
      } else if (prevRank < currentRank) {
        delta = prevRank - currentRank;
      }

      return {
        ...team,
        rank: currentRank,
        rankDelta: delta,
        prevRank
      };
    });

    rankedTeams.forEach(t => {
      this.previousRanks.set(t.id, t.rank);
    });

    // Overall Benchmark Averages across evaluated teams
    const evaluatedTeams = rankedTeams.filter(t => t.judgeCount > 0);
    const benchmarkCriteria = {};
    CRITERIA_DEFINITIONS.forEach(c => {
      if (evaluatedTeams.length > 0) {
        const sum = evaluatedTeams.reduce((acc, t) => acc + (t.criteriaAverages[c.id] || 0), 0);
        benchmarkCriteria[c.id] = Math.round((sum / evaluatedTeams.length) * 10) / 10;
      } else {
        benchmarkCriteria[c.id] = 8.0;
      }
    });

    return {
      teams: rankedTeams,
      totalTeams: this.teams.length,
      evaluatedCount: fullyEvaluatedCount,
      totalSubmissions,
      lastSyncTimestamp: this.lastSyncTimestamp,
      benchmarkCriteria,
      isTickerRunning: this.isTickerRunning,
      isLiveBackend: this.isLiveBackend
    };
  }

  /**
   * Submit an evaluation from a real judge on the UI
   */
  submitJudgeScore({ teamId, judgeId, judgeName, judgeRole, criteriaScores, feedback }) {
    if (!teamId || !judgeId) throw new Error('teamId and judgeId are required');

    const existingIdx = this.scores.findIndex(s => s.teamId === teamId && s.judgeId === judgeId);
    const scoreObj = {
      id: existingIdx >= 0 ? this.scores[existingIdx].id : `score-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      teamId,
      judgeId,
      judgeName: judgeName || 'Judge',
      judgeRole: judgeRole || 'Evaluator',
      criteriaScores: { ...criteriaScores },
      feedback: feedback ? feedback.trim() : 'Good presentation and functional prototype.',
      submittedAt: new Date()
    };

    if (existingIdx >= 0) {
      this.scores[existingIdx] = scoreObj;
    } else {
      this.scores.push(scoreObj);
    }

    this.notify();
    return scoreObj;
  }

  getJudgeScore(teamId, judgeId) {
    return this.scores.find(s => s.teamId === teamId && s.judgeId === judgeId) || null;
  }

  /**
   * Simulate realistic incoming score from a judge
   */
  simulateJudgeSubmission(targetTeamId = null) {
    const candidateTeams = this.teams.filter(t => {
      const existing = this.scores.filter(s => s.teamId === t.id);
      return existing.length < (t.targetJudges || 3);
    });

    const targetTeam = targetTeamId 
      ? this.teams.find(t => t.id === targetTeamId)
      : (candidateTeams.length > 0 ? candidateTeams[Math.floor(Math.random() * candidateTeams.length)] : this.teams[Math.floor(Math.random() * this.teams.length)]);

    if (!targetTeam) return null;

    const existingJudgeIds = new Set(this.scores.filter(s => s.teamId === targetTeam.id).map(s => s.judgeId));
    const availableJudges = this.judges.filter(j => !existingJudgeIds.has(j.id));
    const judge = availableJudges.length > 0 
      ? availableJudges[Math.floor(Math.random() * availableJudges.length)]
      : this.judges[Math.floor(Math.random() * this.judges.length)];

    const baseVal = 7.5 + Math.random() * 2.2; // 7.5 to 9.7
    const jitter = () => Math.round((Math.random() * 1.2 - 0.6) * 10) / 10;

    const newScore = {
      id: `score-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      teamId: targetTeam.id,
      judgeId: judge.id,
      judgeName: judge.name,
      judgeRole: judge.role,
      criteriaScores: {
        c1: Math.min(10, Math.max(1, Math.round((baseVal + jitter()) * 10) / 10)),
        c2: Math.min(10, Math.max(1, Math.round((baseVal + jitter()) * 10) / 10)),
        c3: Math.min(10, Math.max(1, Math.round((baseVal + jitter()) * 10) / 10)),
        c4: Math.min(10, Math.max(1, Math.round((baseVal + jitter()) * 10) / 10)),
        c5: Math.min(10, Math.max(1, Math.round((baseVal + jitter()) * 10) / 10)),
        c6: Math.min(10, Math.max(1, Math.round((baseVal + jitter()) * 10) / 10)),
      },
      feedback: HUMAN_FEEDBACK_BANK[Math.floor(Math.random() * HUMAN_FEEDBACK_BANK.length)],
      submittedAt: new Date()
    };

    this.scores.push(newScore);
    this.notify();

    const weightedScore = Object.entries(newScore.criteriaScores).reduce((acc, [k, v]) => {
      const crit = CRITERIA_DEFINITIONS.find(c => c.id === k);
      return acc + (v * (crit ? crit.weight : 0.15));
    }, 0);

    return {
      teamName: targetTeam.name,
      judgeName: judge.name,
      weightedScore: Math.round(weightedScore * 100) / 100
    };
  }

  startTicker(intervalMs = 8000) {
    if (this.tickerInterval) clearInterval(this.tickerInterval);
    this.isTickerRunning = true;
    this.tickerInterval = setInterval(() => {
      this.simulateJudgeSubmission();
    }, intervalMs);
    this.notify();
  }

  stopTicker() {
    if (this.tickerInterval) {
      clearInterval(this.tickerInterval);
      this.tickerInterval = null;
    }
    this.isTickerRunning = false;
    this.notify();
  }

  toggleTicker() {
    if (this.isTickerRunning) {
      this.stopTicker();
    } else {
      this.startTicker();
    }
    return this.isTickerRunning;
  }

  resetData() {
    this.stopTicker();
    this.teams = JSON.parse(JSON.stringify(BASELINE_TEAMS));
    this.previousRanks.clear();
    this.seedInitialScores();
    this.notify();
  }

  async connectBackend(apiUrl) {
    if (!apiUrl) throw new Error('API URL is required');
    this.backendApiUrl = apiUrl.replace(/\/$/, '');
    
    try {
      const res = await fetch(`${this.backendApiUrl}/teams`);
      if (!res.ok) throw new Error(`HTTP ${res.status}: ${res.statusText}`);
      const data = await res.json();
      
      if (Array.isArray(data)) {
        this.teams = data;
      }
      this.isLiveBackend = true;
      this.stopTicker();
      this.notify();
      return { success: true, message: `Connected to live backend at ${this.backendApiUrl}` };
    } catch (err) {
      console.warn('Backend API connection failed, staying on standalone simulation:', err);
      this.isLiveBackend = false;
      return { success: false, message: `Could not connect to ${apiUrl}: ${err.message}. Using standalone mode.` };
    }
  }

  /**
   * Export complete evaluation dataset as standard CSV (Scores out of 10.0)
   */
  generateCsvContent() {
    const state = this.getAggregatedState();
    
    const headers = [
      'Rank',
      'Team ID',
      'Team Name',
      'Project Title',
      'Institution',
      'Track',
      'Evaluation Status',
      'Judges Evaluated',
      'C1 - Innovation (20%) [Out of 10]',
      'C2 - Tech Execution (25%) [Out of 10]',
      'C3 - UI/UX Polish (15%) [Out of 10]',
      'C4 - Feasibility & Impact (15%) [Out of 10]',
      'C5 - Presentation & Pitch (15%) [Out of 10]',
      'C6 - Code Quality (10%) [Out of 10]',
      'Overall Weighted Score (Out of 10.0)',
      'Judge Consensus',
      'Score StdDev',
      'Judge Feedback Remarks'
    ];

    const escapeCsv = (str) => {
      if (str === null || str === undefined) return '""';
      const clean = String(str).replace(/"/g, '""');
      return `"${clean}"`;
    };

    const rows = state.teams.map(t => {
      const feedbackNotes = t.judgeScores.map(s => `[${s.judgeName}]: ${s.feedback}`).join(' | ');
      return [
        t.rank,
        escapeCsv(t.id),
        escapeCsv(t.name),
        escapeCsv(t.title),
        escapeCsv(t.college),
        escapeCsv(t.track),
        escapeCsv(t.status),
        `${t.judgeCount}/${t.targetJudges}`,
        t.criteriaAverages.c1,
        t.criteriaAverages.c2,
        t.criteriaAverages.c3,
        t.criteriaAverages.c4,
        t.criteriaAverages.c5,
        t.criteriaAverages.c6,
        t.weightedScore.toFixed(2),
        escapeCsv(t.consensus),
        t.scoreStdDev,
        escapeCsv(feedbackNotes)
      ].join(',');
    });

    return [headers.join(','), ...rows].join('\r\n');
  }

  downloadCsv(filename = `epoch_evaluation_results_${new Date().toISOString().slice(0,10)}.csv`) {
    const csvContent = this.generateCsvContent();
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }
}

export const leaderboardService = new LeaderboardService();
