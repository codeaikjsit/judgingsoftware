/**
 * ============================================================================
 * EPOCH 1.0 // LEADERBOARD TABLE COMPONENT
 * Scores formatted strictly out of 10.0
 * ============================================================================
 */

import { CRITERIA_DEFINITIONS } from '../services/apiContract.js';

export function renderLeaderboardTable(tbody, teams, onSelectTeam) {
  if (!tbody) return;

  if (!teams || teams.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="8">
          <div style="padding: 40px; text-align: center; color: var(--text-muted); font-size: 0.88rem;">
            No teams match the active search or track filter.
          </div>
        </td>
      </tr>
    `;
    return;
  }

  const rowsHtml = teams.map(team => {
    let rankPillClass = 'rank-regular-sm';
    if (team.rank === 1) rankPillClass = 'rank-gold-sm';
    else if (team.rank === 2) rankPillClass = 'rank-silver-sm';
    else if (team.rank === 3) rankPillClass = 'rank-bronze-sm';

    let deltaHtml = '<span class="delta-indicator delta-none">&mdash;</span>';
    if (team.rankDelta > 0) {
      deltaHtml = `<span class="delta-indicator delta-pos" title="Moved up ${team.rankDelta}">&utrif;+${team.rankDelta}</span>`;
    } else if (team.rankDelta < 0) {
      deltaHtml = `<span class="delta-indicator delta-neg" title="Moved down ${Math.abs(team.rankDelta)}">&dtrif;${team.rankDelta}</span>`;
    }

    let evalClass = 'eval-none';
    if (team.judgeCount >= team.targetJudges) evalClass = 'eval-complete';
    else if (team.judgeCount > 0) evalClass = 'eval-inflight';

    // Criteria mini bars (1 to 10 scale)
    const miniBarsHtml = CRITERIA_DEFINITIONS.map(c => {
      const val = team.criteriaAverages[c.id] || 0;
      const heightPercent = Math.min(100, Math.max(10, val * 10));
      return `
        <div class="criteria-bar-col" title="${c.shortName}: ${val.toFixed(1)} / 10">
          <div class="criteria-fill" style="height: ${heightPercent}%;"></div>
        </div>
      `;
    }).join('');

    const miniLabelsHtml = CRITERIA_DEFINITIONS.map(c => `<span>${c.shortName.slice(0, 3)}</span>`).join('');

    return `
      <tr class="table-row" data-team-id="${team.id}">
        <td class="col-rank">
          <div class="rank-badge-wrap">
            <span class="rank-pill-sm ${rankPillClass}">#${team.rank}</span>
            ${deltaHtml}
          </div>
        </td>

        <td>
          <div style="display:flex; flex-direction:column; gap:2px;">
            <span class="team-name-row">${escapeHtml(team.name)}</span>
            <span class="project-title-row" title="${escapeHtml(team.title)}">${escapeHtml(team.title)}</span>
            <span class="college-tag-row">${escapeHtml(team.college || 'KJSIT Mumbai')}</span>
          </div>
        </td>

        <td class="col-track">
          <span class="track-tag-pill">${escapeHtml(team.track)}</span>
        </td>

        <td>
          <span class="eval-status-pill ${evalClass}">
            <span>${team.judgeCount}/${team.targetJudges}</span>
            <span>Evaluations</span>
          </span>
        </td>

        <td class="col-criteria">
          <div class="criteria-cell-group">
            <div class="criteria-bars-row">${miniBarsHtml}</div>
            <div class="criteria-abbr-row">${miniLabelsHtml}</div>
          </div>
        </td>

        <td>
          <span class="consensus-tag" title="StdDev: ${team.scoreStdDev}">
            ${team.consensus}
          </span>
        </td>

        <td class="col-score">
          <div class="score-display-box">
            <span>${team.judgeCount > 0 ? team.weightedScore.toFixed(2) : '0.00'}</span>
            <span class="score-scale-note">/ 10</span>
          </div>
        </td>

        <td class="col-actions">
          <button class="btn-report-view" data-action="view-report" data-team-id="${team.id}">
            View Report
          </button>
        </td>
      </tr>
    `;
  }).join('');

  tbody.innerHTML = rowsHtml;

  tbody.querySelectorAll('[data-action="view-report"]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const teamId = btn.getAttribute('data-team-id');
      const team = teams.find(t => t.id === teamId);
      if (team && typeof onSelectTeam === 'function') {
        onSelectTeam(team);
      }
    });
  });

  tbody.querySelectorAll('.table-row').forEach(row => {
    row.addEventListener('click', () => {
      const teamId = row.getAttribute('data-team-id');
      const team = teams.find(t => t.id === teamId);
      if (team && typeof onSelectTeam === 'function') {
        onSelectTeam(team);
      }
    });
  });
}

function escapeHtml(text) {
  if (!text) return '';
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}
