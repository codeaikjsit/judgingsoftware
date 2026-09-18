/**
 * ============================================================================
 * EPOCH 1.0 // PODIUM COMPONENT (TOP 3)
 * Displays scores strictly out of 10.0 with collegiate context
 * ============================================================================
 */

export function renderPodium(container, topTeams, onSelectTeam) {
  if (!container) return;
  if (!topTeams || topTeams.length === 0) {
    container.innerHTML = '';
    return;
  }

  const first = topTeams[0];
  const second = topTeams[1];
  const third = topTeams[2];

  const createCardHtml = (team, rank, positionClass, pillClass, rankTitle) => {
    if (!team) return '';
    const hasScores = team.judgeCount > 0;
    const scoreDisplay = hasScores ? team.weightedScore.toFixed(2) : '0.00';

    return `
      <article class="podium-card ${positionClass}" data-team-id="${team.id}" tabindex="0" role="button" aria-label="View report for ${team.name}, Rank ${rank}">
        <div class="podium-top-row">
          <div class="podium-place-pill ${pillClass}">
            <span>${rankTitle}</span>
          </div>
          <span class="podium-track-tag">${escapeHtml(team.track)}</span>
        </div>

        <div class="podium-title-group">
          <h3 class="podium-team-title">${escapeHtml(team.name)}</h3>
          <p class="podium-project-desc" title="${escapeHtml(team.title)}">${escapeHtml(team.title)}</p>
          <span class="podium-college">${escapeHtml(team.college || 'KJSIT Mumbai')}</span>
        </div>

        <div class="podium-criteria-bars" title="Criteria Breakdown: C1-C6 (1-10)">
          <div class="podium-criteria-seg" style="width: ${(team.criteriaAverages.c1 || 5) * 10}%" title="Innovation: ${team.criteriaAverages.c1}"></div>
          <div class="podium-criteria-seg" style="width: ${(team.criteriaAverages.c2 || 5) * 10}%" title="Tech Exec: ${team.criteriaAverages.c2}"></div>
          <div class="podium-criteria-seg" style="width: ${(team.criteriaAverages.c3 || 5) * 10}%" title="UI/UX: ${team.criteriaAverages.c3}"></div>
          <div class="podium-criteria-seg" style="width: ${(team.criteriaAverages.c4 || 5) * 10}%" title="Impact: ${team.criteriaAverages.c4}"></div>
          <div class="podium-criteria-seg" style="width: ${(team.criteriaAverages.c5 || 5) * 10}%" title="Pitch: ${team.criteriaAverages.c5}"></div>
          <div class="podium-criteria-seg" style="width: ${(team.criteriaAverages.c6 || 5) * 10}%" title="Code: ${team.criteriaAverages.c6}"></div>
        </div>

        <div class="podium-score-row">
          <div>
            <span class="podium-score-num">${scoreDisplay}</span>
            <span class="podium-score-out-of">/ 10</span>
          </div>
          <div class="podium-eval-count">
            <span>${team.judgeCount}/${team.targetJudges} Judges Done</span>
          </div>
        </div>
      </article>
    `;
  };

  container.innerHTML = `
    ${createCardHtml(second, 2, 'podium-second', 'pill-silver', '🥈 2nd Place')}
    ${createCardHtml(first, 1, 'podium-first', 'pill-gold', '👑 1st Place')}
    ${createCardHtml(third, 3, 'podium-third', 'pill-bronze', '🥉 3rd Place')}
  `;

  container.querySelectorAll('.podium-card').forEach(card => {
    const teamId = card.getAttribute('data-team-id');
    const trigger = () => {
      const selected = topTeams.find(t => t.id === teamId);
      if (selected && typeof onSelectTeam === 'function') {
        onSelectTeam(selected);
      }
    };

    card.addEventListener('click', trigger);
    card.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        trigger();
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
