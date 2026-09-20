/**
 * ============================================================================
 * EPOCH 1.0 // TEAM FEEDBACK REPORT & RADAR DRILLDOWN MODAL
 * Scores strictly out of 10.0
 * ============================================================================
 */

import { CRITERIA_DEFINITIONS } from '../services/apiContract.js';

export class TeamReportModal {
  constructor(modalElement) {
    this.modal = modalElement;
    this.modalTrackBadge = modalElement.querySelector('#modalTrackBadge');
    this.modalTeamName = modalElement.querySelector('#modalTeamName');
    this.modalProjectTitle = modalElement.querySelector('#modalProjectTitle');
    this.modalContent = modalElement.querySelector('#modalReportContent');
    this.closeBtn = modalElement.querySelector('#btnCloseModal');
    this.printBtn = modalElement.querySelector('#btnModalPrint');
    
    this.currentTeam = null;

    this.bindEvents();
  }

  bindEvents() {
    this.closeBtn?.addEventListener('click', () => this.close());
    
    this.modal?.addEventListener('click', (e) => {
      if (e.target === this.modal) this.close();
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.modal.classList.contains('open')) {
        this.close();
      }
    });

    this.printBtn?.addEventListener('click', () => {
      if (this.currentTeam) {
        this.printTeamReport(this.currentTeam);
      }
    });
  }

  open(team, benchmarkCriteria = {}) {
    if (!team) return;
    this.currentTeam = team;

    if (this.modalTrackBadge) this.modalTrackBadge.textContent = `${team.track} &bull; ${team.college || 'KJSIT'}`;
    if (this.modalTeamName) this.modalTeamName.textContent = team.name;
    if (this.modalProjectTitle) this.modalProjectTitle.textContent = team.title;

    const radarSvgHtml = this.generateRadarSvg(team.criteriaAverages, benchmarkCriteria);

    const criteriaBarsHtml = CRITERIA_DEFINITIONS.map(c => {
      const teamVal = team.criteriaAverages[c.id] || 0;
      const benchmarkVal = benchmarkCriteria[c.id] || 7.8;
      const percent = (teamVal / 10) * 100;
      const isAboveAvg = teamVal >= benchmarkVal;

      return `
        <div class="criteria-detail-row">
          <div class="criteria-detail-labels">
            <span class="criteria-title">${c.name} <small style="color:var(--text-sub)">(${Math.round(c.weight*100)}% wt)</small></span>
            <div>
              <span class="criteria-score-val">${teamVal.toFixed(1)} / 10</span>
              <small style="margin-left: 8px; font-family:var(--font-mono); color:${isAboveAvg ? 'var(--emerald)' : 'var(--amber)'}">
                ${isAboveAvg ? '▲ +' : '▼ '}${(teamVal - benchmarkVal).toFixed(1)} vs avg
              </small>
            </div>
          </div>
          <div class="criteria-progress-bar">
            <div class="criteria-progress-fill" style="width: ${percent}%;"></div>
          </div>
        </div>
      `;
    }).join('');

    let judgeFeedbackHtml = '';
    if (team.judgeScores && team.judgeScores.length > 0) {
      judgeFeedbackHtml = team.judgeScores.map(score => {
        const total = CRITERIA_DEFINITIONS.reduce((acc, c) => acc + (score.criteriaScores[c.id] || 0) * c.weight, 0);
        return `
          <div class="mentor-feedback-card">
            <div class="mentor-card-top">
              <span>👤 ${escapeHtml(score.judgeName)} <small style="color:var(--text-sub); font-weight:normal">(${escapeHtml(score.judgeRole)})</small></span>
              <span class="mentor-score-tag">Awarded: <strong>${total.toFixed(2)} / 10</strong></span>
            </div>
            <p class="mentor-text">&ldquo;${escapeHtml(score.feedback)}&rdquo;</p>
          </div>
        `;
      }).join('');
    } else {
      judgeFeedbackHtml = `<p style="color:var(--text-sub); font-style:italic; font-size:0.84rem;">No evaluations submitted yet. Waiting for assigned faculty/mentor judges.</p>`;
    }

    const membersHtml = (team.members || []).map(m => `<span class="track-tag-pill">${escapeHtml(m)}</span>`).join(' ');

    this.modalContent.innerHTML = `
      <!-- Stat Highlights Grid -->
      <div class="stat-box-grid">
        <div class="stat-item-box">
          <span class="stat-box-lbl">FINAL RANK</span>
          <span class="stat-box-num" style="color:var(--emerald)">#${team.rank}</span>
        </div>
        <div class="stat-item-box">
          <span class="stat-box-lbl">WEIGHTED SCORE</span>
          <span class="stat-box-num">${team.weightedScore.toFixed(2)} <small style="font-size:0.75rem; color:var(--text-sub)">/ 10</small></span>
        </div>
        <div class="stat-item-box">
          <span class="stat-box-lbl">EVALUATOR CONSENSUS</span>
          <span class="stat-box-num" style="font-size:0.95rem; color:var(--cyan); line-height:1.4">${team.consensus}</span>
        </div>
        <div class="stat-item-box">
          <span class="stat-box-lbl">EVALUATIONS COMPLETED</span>
          <span class="stat-box-num">${team.judgeCount} / ${team.targetJudges}</span>
        </div>
      </div>

      <!-- Radar and Criteria Split -->
      <div class="radar-split-grid">
        <div class="radar-panel">
          <div class="panel-header-title">
            <span>CRITERIA RADAR VS COMPETITION BENCHMARK</span>
          </div>
          <div class="radar-svg-center">
            ${radarSvgHtml}
          </div>
          <div style="display:flex; justify-content:center; gap:16px; font-family:var(--font-mono); font-size:0.68rem; color:var(--text-muted)">
            <span style="display:flex; align-items:center; gap:5px;">
              <span style="width:8px; height:8px; background:var(--emerald); border-radius:2px;"></span> Team Score (1-10)
            </span>
            <span style="display:flex; align-items:center; gap:5px;">
              <span style="width:8px; height:8px; background:rgba(255,255,255,0.25); border-radius:2px;"></span> Hackathon Benchmark
            </span>
          </div>
        </div>

        <div class="criteria-panel">
          <div class="panel-header-title">
            <span>RUBRIC BREAKDOWN (1–10 SCALE)</span>
          </div>
          <div style="display:flex; flex-direction:column; gap:10px;">
            ${criteriaBarsHtml}
          </div>
        </div>
      </div>

      <!-- Team Members -->
      <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:10px; padding:10px 14px; background:var(--bg-subtle); border:1px solid var(--border-muted); border-radius:var(--r-sm);">
        <div>
          <span style="font-family:var(--font-mono); font-size:0.7rem; color:var(--text-sub); margin-right:8px;">TEAM MEMBERS:</span>
          ${membersHtml}
        </div>
        ${team.repoUrl ? `<a href="${team.repoUrl}" target="_blank" rel="noopener" style="font-family:var(--font-mono); font-size:0.72rem; color:var(--cyan); text-decoration:none;">GitHub Repository &rarr;</a>` : ''}
      </div>

      <!-- Judge Feedback Section -->
      <div style="display:flex; flex-direction:column; gap:10px;">
        <div class="panel-header-title">
          <span>FACULTY &amp; MENTOR EVALUATION REMARKS</span>
        </div>
        <div style="display:flex; flex-direction:column; gap:8px;">
          ${judgeFeedbackHtml}
        </div>
      </div>
    `;

    this.modal.classList.add('open');
    this.modal.setAttribute('aria-hidden', 'false');
  }

  close() {
    this.modal.classList.remove('open');
    this.modal.setAttribute('aria-hidden', 'true');
    this.currentTeam = null;
  }

  generateRadarSvg(teamCriteria = {}, benchmarkCriteria = {}) {
    const size = 250;
    const center = size / 2;
    const radius = 88;
    const count = CRITERIA_DEFINITIONS.length;

    const getCoords = (index, value, maxVal = 10) => {
      const angle = (Math.PI * 2 / count) * index - Math.PI / 2;
      const r = (value / maxVal) * radius;
      return {
        x: center + r * Math.cos(angle),
        y: center + r * Math.sin(angle)
      };
    };

    const rings = [0.25, 0.5, 0.75, 1.0].map(ratio => {
      const points = [];
      for (let i = 0; i < count; i++) {
        const { x, y } = getCoords(i, 10 * ratio, 10);
        points.push(`${x},${y}`);
      }
      return `<polygon points="${points.join(' ')}" fill="none" stroke="rgba(0, 255, 157, ${ratio === 1.0 ? 0.3 : 0.1})" stroke-width="1" />`;
    }).join('');

    let axesHtml = '';
    for (let i = 0; i < count; i++) {
      const outer = getCoords(i, 10, 10);
      const labelCoords = getCoords(i, 12.2, 10);
      const crit = CRITERIA_DEFINITIONS[i];
      axesHtml += `
        <line x1="${center}" y1="${center}" x2="${outer.x}" y2="${outer.y}" stroke="rgba(255, 255, 255, 0.12)" stroke-width="1" />
        <text x="${labelCoords.x}" y="${labelCoords.y + 4}" fill="#8d9f94" font-size="9" font-family="'JetBrains Mono', monospace" text-anchor="middle">
          ${crit.shortName}
        </text>
      `;
    }

    const benchmarkPoints = CRITERIA_DEFINITIONS.map((c, i) => {
      const val = benchmarkCriteria[c.id] || 7.8;
      const { x, y } = getCoords(i, val, 10);
      return `${x},${y}`;
    }).join(' ');

    const teamPoints = CRITERIA_DEFINITIONS.map((c, i) => {
      const val = teamCriteria[c.id] || 1;
      const { x, y } = getCoords(i, val, 10);
      return `${x},${y}`;
    }).join(' ');

    const dotsHtml = CRITERIA_DEFINITIONS.map((c, i) => {
      const val = teamCriteria[c.id] || 1;
      const { x, y } = getCoords(i, val, 10);
      return `<circle cx="${x}" cy="${y}" r="3" fill="#00ff9d" />`;
    }).join('');

    return `
      <svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
        ${rings}
        ${axesHtml}
        <polygon points="${benchmarkPoints}" fill="rgba(255, 255, 255, 0.05)" stroke="rgba(255, 255, 255, 0.35)" stroke-width="1.5" stroke-dasharray="3,3" />
        <polygon points="${teamPoints}" fill="rgba(0, 255, 157, 0.2)" stroke="#00ff9d" stroke-width="2" />
        ${dotsHtml}
      </svg>
    `;
  }

  printTeamReport(team) {
    const printContainer = document.getElementById('printDossierContainer');
    if (!printContainer) return;

    printContainer.innerHTML = `
      <div style="padding: 24px; font-family: 'IBM Plex Sans', sans-serif; color: #111;">
        <div style="border-bottom: 2px solid #000; padding-bottom: 10px; margin-bottom: 18px;">
          <h1 style="font-size: 22px; margin: 0;">EPOCH 1.0 &bull; TEAM EVALUATION SCORECARD</h1>
          <p style="margin: 4px 0 0; color: #555; font-size: 13px;">CodeAI Club &bull; Department of Computer Engineering, KJSIT</p>
        </div>

        <div style="display: flex; justify-content: space-between; margin-bottom: 20px;">
          <div>
            <h2 style="font-size: 20px; margin: 0;">${escapeHtml(team.name)}</h2>
            <p style="font-size: 14px; color: #333; margin: 4px 0;">${escapeHtml(team.title)}</p>
            <p style="font-size: 13px; color: #666; margin: 2px 0;">Track: <strong>${team.track}</strong> | College: ${team.college || 'KJSIT'}</p>
            <p style="font-size: 12px; color: #666; margin: 2px 0;">Team Members: ${(team.members || []).join(', ')}</p>
          </div>
          <div style="text-align: right;">
            <div style="font-size: 26px; font-weight: bold;">RANK #${team.rank}</div>
            <div style="font-size: 18px; font-weight: bold; margin-top: 4px;">Score: ${team.weightedScore.toFixed(2)} / 10.0</div>
            <div style="font-size: 12px; color: #555;">${team.judgeCount} Judges Completed</div>
          </div>
        </div>

        <h3 style="font-size: 15px; border-bottom: 1px solid #ccc; padding-bottom: 4px; margin-top: 20px;">Criteria Scores (1–10 Scale)</h3>
        <table style="width: 100%; border-collapse: collapse; margin-top: 8px; font-size: 13px;">
          <thead>
            <tr style="background: #f4f4f4; text-align: left;">
              <th style="padding: 6px 8px; border: 1px solid #ddd;">Evaluation Criterion</th>
              <th style="padding: 6px 8px; border: 1px solid #ddd;">Rubric Weight</th>
              <th style="padding: 6px 8px; border: 1px solid #ddd;">Average Score (1–10)</th>
              <th style="padding: 6px 8px; border: 1px solid #ddd;">Weighted Contribution</th>
            </tr>
          </thead>
          <tbody>
            ${CRITERIA_DEFINITIONS.map(c => {
              const avg = team.criteriaAverages[c.id] || 0;
              const contrib = (avg * c.weight).toFixed(2);
              return `
                <tr>
                  <td style="padding: 6px 8px; border: 1px solid #ddd;">${c.name}</td>
                  <td style="padding: 6px 8px; border: 1px solid #ddd;">${Math.round(c.weight * 100)}%</td>
                  <td style="padding: 6px 8px; border: 1px solid #ddd;"><strong>${avg.toFixed(1)}</strong> / 10</td>
                  <td style="padding: 6px 8px; border: 1px solid #ddd;">${contrib} / ${(c.weight * 10).toFixed(1)}</td>
                </tr>
              `;
            }).join('')}
          </tbody>
        </table>

        <h3 style="font-size: 15px; border-bottom: 1px solid #ccc; padding-bottom: 4px; margin-top: 22px;">Judge &amp; Mentor Remarks</h3>
        <div style="margin-top: 8px;">
          ${(team.judgeScores || []).map(s => `
            <div style="margin-bottom: 10px; padding: 8px 12px; border-left: 3px solid #000; background: #fafafa;">
              <div style="font-size: 12px; font-weight: bold;">${escapeHtml(s.judgeName)} (${escapeHtml(s.judgeRole)})</div>
              <div style="font-size: 13px; font-style: italic; margin-top: 3px;">"${escapeHtml(s.feedback)}"</div>
            </div>
          `).join('')}
        </div>
      </div>
    `;

    printContainer.classList.add('active');
    window.print();
    printContainer.classList.remove('active');
  }
}

function escapeHtml(text) {
  if (!text) return '';
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}
