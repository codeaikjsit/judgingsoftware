/**
 * ============================================================================
 * EPOCH 1.0 // EXPORT DOSSIER COMPONENT
 * Full Hackathon Evaluation Dossier (Scores strictly out of 10.0)
 * ============================================================================
 */

import { CRITERIA_DEFINITIONS, TRACKS } from '../services/apiContract.js';

export function printFullDossier(state) {
  const container = document.getElementById('printDossierContainer');
  if (!container) return;

  const { teams, totalTeams, evaluatedCount, totalSubmissions, lastSyncTimestamp } = state;

  const trackWinners = TRACKS.map(track => {
    const trackTeams = teams.filter(t => t.track === track && t.judgeCount > 0);
    return {
      track,
      winner: trackTeams.length > 0 ? trackTeams[0] : null
    };
  });

  const formattedDate = new Date(lastSyncTimestamp).toLocaleString();

  container.innerHTML = `
    <div style="padding: 24px; font-family: 'IBM Plex Sans', sans-serif; color: #111;">
      <!-- Header -->
      <div style="border-bottom: 2px solid #000; padding-bottom: 12px; margin-bottom: 20px; display: flex; justify-content: space-between; align-items: flex-end;">
        <div>
          <h1 style="font-size: 24px; margin: 0; font-family: 'Space Grotesk', sans-serif;">EPOCH 1.0 &bull; OFFICIAL EVALUATION DOSSIER</h1>
          <p style="margin: 3px 0 0; color: #555; font-size: 13px;">CodeAI Club &bull; Department of Computer Engineering, KJSIT</p>
        </div>
        <div style="text-align: right; font-size: 12px; color: #666;">
          <div>Generated: ${formattedDate}</div>
          <div>Official Hackathon Results</div>
        </div>
      </div>

      <!-- Telemetry Summary Cards -->
      <div style="display: flex; gap: 16px; background: #f8f9fa; border: 1px solid #ddd; padding: 12px; margin-bottom: 20px; border-radius: 4px;">
        <div style="flex: 1;">
          <div style="font-size: 11px; color: #666; font-weight: bold;">TOTAL TEAMS</div>
          <div style="font-size: 18px; font-weight: bold;">${totalTeams}</div>
        </div>
        <div style="flex: 1;">
          <div style="font-size: 11px; color: #666; font-weight: bold;">EVALUATED</div>
          <div style="font-size: 18px; font-weight: bold;">${evaluatedCount} / ${totalTeams}</div>
        </div>
        <div style="flex: 1;">
          <div style="font-size: 11px; color: #666; font-weight: bold;">JUDGE SUBMISSIONS</div>
          <div style="font-size: 18px; font-weight: bold;">${totalSubmissions}</div>
        </div>
        <div style="flex: 1;">
          <div style="font-size: 11px; color: #666; font-weight: bold;">COMPETITION AVERAGE</div>
          <div style="font-size: 18px; font-weight: bold;">
            ${(teams.filter(t => t.judgeCount > 0).reduce((a, b) => a + b.weightedScore, 0) / (teams.filter(t => t.judgeCount > 0).length || 1)).toFixed(2)} / 10.0
          </div>
        </div>
      </div>

      <!-- Track Champions -->
      <h2 style="font-size: 16px; margin: 18px 0 8px; border-bottom: 1px solid #000; padding-bottom: 4px;">Track Champions</h2>
      <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px; margin-bottom: 20px;">
        ${trackWinners.map(tw => `
          <div style="border: 1px solid #ccc; padding: 8px 12px; border-radius: 4px; background: #fafafa;">
            <div style="font-size: 11px; font-weight: bold; color: #666;">${tw.track}</div>
            <div style="font-size: 15px; font-weight: bold; margin: 2px 0;">${tw.winner ? tw.winner.name : 'Pending Evaluation'}</div>
            <div style="font-size: 12px; color: #444;">${tw.winner ? tw.winner.title : ''}</div>
            <div style="font-size: 12px; font-weight: bold; margin-top: 3px;">
              ${tw.winner ? `Score: ${tw.winner.weightedScore.toFixed(2)} / 10.0 (Rank #${tw.winner.rank})` : ''}
            </div>
          </div>
        `).join('')}
      </div>

      <!-- Comprehensive Standings Table -->
      <h2 style="font-size: 16px; margin: 20px 0 8px; border-bottom: 1px solid #000; padding-bottom: 4px;">Complete Leaderboard & Standings</h2>
      <table style="width: 100%; border-collapse: collapse; font-size: 11.5px;">
        <thead>
          <tr style="background: #e9ecef; text-align: left;">
            <th style="padding: 5px 6px; border: 1px solid #bbb;">Rank</th>
            <th style="padding: 5px 6px; border: 1px solid #bbb;">Team &amp; College</th>
            <th style="padding: 5px 6px; border: 1px solid #bbb;">Track</th>
            <th style="padding: 5px 6px; border: 1px solid #bbb;">Judges</th>
            <th style="padding: 5px 6px; border: 1px solid #bbb;">C1 (20%)</th>
            <th style="padding: 5px 6px; border: 1px solid #bbb;">C2 (25%)</th>
            <th style="padding: 5px 6px; border: 1px solid #bbb;">C3 (15%)</th>
            <th style="padding: 5px 6px; border: 1px solid #bbb;">C4 (15%)</th>
            <th style="padding: 5px 6px; border: 1px solid #bbb;">C5 (15%)</th>
            <th style="padding: 5px 6px; border: 1px solid #bbb;">C6 (10%)</th>
            <th style="padding: 5px 6px; border: 1px solid #bbb; text-align: right;">Total / 10</th>
          </tr>
        </thead>
        <tbody>
          ${teams.map(t => `
            <tr>
              <td style="padding: 5px 6px; border: 1px solid #ddd; font-weight: bold;">#${t.rank}</td>
              <td style="padding: 5px 6px; border: 1px solid #ddd;">
                <strong>${escapeHtml(t.name)}</strong> <small style="color:#555">(${escapeHtml(t.college || 'KJSIT')})</small><br>
                <span style="color: #444;">${escapeHtml(t.title)}</span>
              </td>
              <td style="padding: 5px 6px; border: 1px solid #ddd;">${t.track}</td>
              <td style="padding: 5px 6px; border: 1px solid #ddd;">${t.judgeCount}/${t.targetJudges}</td>
              <td style="padding: 5px 6px; border: 1px solid #ddd;">${t.criteriaAverages.c1 || 0}</td>
              <td style="padding: 5px 6px; border: 1px solid #ddd;">${t.criteriaAverages.c2 || 0}</td>
              <td style="padding: 5px 6px; border: 1px solid #ddd;">${t.criteriaAverages.c3 || 0}</td>
              <td style="padding: 5px 6px; border: 1px solid #ddd;">${t.criteriaAverages.c4 || 0}</td>
              <td style="padding: 5px 6px; border: 1px solid #ddd;">${t.criteriaAverages.c5 || 0}</td>
              <td style="padding: 5px 6px; border: 1px solid #ddd;">${t.criteriaAverages.c6 || 0}</td>
              <td style="padding: 5px 6px; border: 1px solid #ddd; font-weight: bold; text-align: right;">
                ${t.judgeCount > 0 ? t.weightedScore.toFixed(2) : '0.00'}
              </td>
            </tr>
          `).join('')}
        </tbody>
      </table>

      <!-- Criteria Weights Legend -->
      <div style="margin-top: 18px; padding-top: 8px; border-top: 1px solid #ccc; font-size: 11px; color: #555;">
        ${CRITERIA_DEFINITIONS.map(c => `<strong>${c.shortName}:</strong> ${c.name} (${Math.round(c.weight * 100)}% wt)`).join(' &bull; ')}
      </div>
    </div>
  `;

  container.classList.add('active');
  window.print();
  container.classList.remove('active');
}

function escapeHtml(text) {
  if (!text) return '';
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}
