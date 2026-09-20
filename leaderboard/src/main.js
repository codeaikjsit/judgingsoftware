/**
 * ============================================================================
 * EPOCH 1.0 // PERSON 4: LEADERBOARD, REPORTS & EXPORT CONTROLLER
 * CodeAI Club &bull; Department of Computer Engineering, KJSIT
 * ============================================================================
 */

import { leaderboardService } from './services/leaderboardService.js';
import { renderPodium } from './components/Podium.js';
import { renderLeaderboardTable } from './components/LeaderboardTable.js';
import { TeamReportModal } from './components/TeamReportModal.js';
import { printFullDossier } from './components/ExportDossier.js';

// Application State
let currentLeaderboardState = null;
let activeTrackFilter = 'ALL';
let currentSearchQuery = '';
let activeSortKey = 'weightedScore';

// DOM Elements
const podiumContainer = document.getElementById('podiumContainer');
const tableBody = document.getElementById('leaderboardTableBody');
const tableCounter = document.getElementById('tableFilteredCount');
const statEvaluated = document.getElementById('statEvaluated');
const statSubmissions = document.getElementById('statSubmissions');
const statSyncTime = document.getElementById('statSyncTime');

const searchInput = document.getElementById('teamSearchInput');
const btnClearSearch = document.getElementById('btnClearSearch');
const trackPills = document.querySelectorAll('#trackFilters .tag-btn');
const sortBySelect = document.getElementById('sortBySelect');
const btnExportCsv = document.getElementById('btnExportCsv');
const btnPrintDossier = document.getElementById('btnPrintDossier');

// Initialize Modal
const teamReportModal = new TeamReportModal(document.getElementById('teamReportModal'));

/**
 * Toast Utility
 */
export function showToast(message, type = 'info', duration = 3500) {
  const container = document.getElementById('toastContainer');
  if (!container) return;

  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;

  const icon = type === 'success' ? '✓' : (type === 'warning' ? '⚠️' : 'ℹ️');
  toast.innerHTML = `<span>${icon}</span><span>${message}</span>`;

  container.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(8px)';
    toast.style.transition = 'all 0.25s ease';
    setTimeout(() => toast.remove(), 250);
  }, duration);
}

function getFilteredAndSortedTeams(teams) {
  if (!teams) return [];

  let result = [...teams];

  // Search Filter
  if (currentSearchQuery.trim()) {
    const q = currentSearchQuery.toLowerCase().trim();
    result = result.filter(team => {
      const matchName = (team.name || '').toLowerCase().includes(q);
      const matchTitle = (team.title || '').toLowerCase().includes(q);
      const matchTrack = (team.track || '').toLowerCase().includes(q);
      const matchCollege = (team.college || '').toLowerCase().includes(q);
      const matchMembers = (team.members || []).some(m => m.toLowerCase().includes(q));
      return matchName || matchTitle || matchTrack || matchCollege || matchMembers;
    });
  }

  // Track Filter
  if (activeTrackFilter !== 'ALL') {
    result = result.filter(team => team.track.toUpperCase() === activeTrackFilter.toUpperCase());
  }

  // Sorting
  result.sort((a, b) => {
    if (activeSortKey === 'weightedScore') {
      return b.weightedScore - a.weightedScore;
    }
    if (activeSortKey === 'judgeCount') {
      return b.judgeCount - a.judgeCount;
    }
    if (a.criteriaAverages && b.criteriaAverages && a.criteriaAverages[activeSortKey] !== undefined) {
      return (b.criteriaAverages[activeSortKey] || 0) - (a.criteriaAverages[activeSortKey] || 0);
    }
    return 0;
  });

  return result;
}

function renderApp() {
  if (!currentLeaderboardState) return;

  const { teams, totalTeams, evaluatedCount, totalSubmissions, lastSyncTimestamp, benchmarkCriteria } = currentLeaderboardState;

  // Header Telemetry Stats
  if (statEvaluated) statEvaluated.textContent = `${evaluatedCount} / ${totalTeams}`;
  if (statSubmissions) statSubmissions.textContent = totalSubmissions;
  if (statSyncTime) {
    const date = new Date(lastSyncTimestamp);
    statSyncTime.textContent = date.toTimeString().split(' ')[0];
  }

  // Top 3 Podium Cards
  const top3 = teams.slice(0, 3);
  renderPodium(podiumContainer, top3, (team) => {
    teamReportModal.open(team, benchmarkCriteria);
  });

  // Table
  const filteredTeams = getFilteredAndSortedTeams(teams);
  if (tableCounter) {
    tableCounter.textContent = `Showing ${filteredTeams.length} of ${totalTeams} teams`;
  }

  renderLeaderboardTable(tableBody, filteredTeams, (team) => {
    teamReportModal.open(team, benchmarkCriteria);
  });
}

function initializeEventListeners() {
  // Search
  searchInput?.addEventListener('input', (e) => {
    currentSearchQuery = e.target.value;
    btnClearSearch?.classList.toggle('visible', currentSearchQuery.length > 0);
    renderApp();
  });

  btnClearSearch?.addEventListener('click', () => {
    if (searchInput) searchInput.value = '';
    currentSearchQuery = '';
    btnClearSearch.classList.remove('visible');
    renderApp();
  });

  // Track filter tags
  trackPills.forEach(pill => {
    pill.addEventListener('click', () => {
      trackPills.forEach(p => p.classList.remove('active'));
      pill.classList.add('active');
      activeTrackFilter = pill.getAttribute('data-track');
      renderApp();
    });
  });

  // Sorting
  sortBySelect?.addEventListener('change', (e) => {
    activeSortKey = e.target.value;
    renderApp();
  });

  // Export CSV for Admin
  btnExportCsv?.addEventListener('click', () => {
    leaderboardService.downloadCsv();
    showToast('Official evaluation CSV downloaded for Admin review.', 'success');
  });

  // Print Dossier / Report Generation
  btnPrintDossier?.addEventListener('click', () => {
    if (currentLeaderboardState) {
      showToast('Opening print preview for Hackathon Evaluation Dossier...', 'info');
      printFullDossier(currentLeaderboardState);
    }
  });
}

function init() {
  initializeEventListeners();

  // Subscribe to Leaderboard State
  leaderboardService.subscribe((state) => {
    currentLeaderboardState = state;
    renderApp();
  });
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
