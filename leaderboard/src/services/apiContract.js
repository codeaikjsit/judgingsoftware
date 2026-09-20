/**
 * ============================================================================
 * EPOCH 1.0 // EVALUATION DATA CONTRACTS & CRITERIA SPECIFICATION
 * Aligned with Person 1 (Backend), Person 2 (Admin), Person 3 (Judge)
 * ============================================================================
 */

export const CRITERIA_DEFINITIONS = [
  {
    id: 'c1',
    key: 'innovation',
    name: 'Innovation & Originality',
    shortName: 'Innovation',
    weight: 0.20,
    description: 'Novelty of idea, creative problem solving, and uniqueness of approach.'
  },
  {
    id: 'c2',
    key: 'technical',
    name: 'Technical Execution',
    shortName: 'Tech Exec',
    weight: 0.25,
    description: 'Architectural complexity, stack proficiency, robustness, and performance.'
  },
  {
    id: 'c3',
    key: 'design',
    name: 'UI/UX & Polish',
    shortName: 'UI / UX',
    weight: 0.15,
    description: 'Aesthetic appeal, intuitive interaction, responsiveness, and cyber theme execution.'
  },
  {
    id: 'c4',
    key: 'feasibility',
    name: 'Feasibility & Impact',
    shortName: 'Impact',
    weight: 0.15,
    description: 'Practical deployment viability, real-world utility, and market/social value.'
  },
  {
    id: 'c5',
    key: 'presentation',
    name: 'Presentation & Pitch',
    shortName: 'Pitch',
    weight: 0.15,
    description: 'Clarity of problem formulation, live demo fluency, and Q&A defense.'
  },
  {
    id: 'c6',
    key: 'codeQuality',
    name: 'Code Quality',
    shortName: 'Code Quality',
    weight: 0.10,
    description: 'Repository structure, clean code practices, documentation, and test coverage.'
  }
];

export const TRACKS = [
  'AI / ML',
  'WEB3 & FINTECH',
  'HEALTHCARE & SOCIAL',
  'OPEN INNOVATION'
];

/**
 * Validates a judge score payload
 * @param {Object} scorePayload 
 * @returns {boolean}
 */
export function isValidScorePayload(scorePayload) {
  if (!scorePayload || !scorePayload.teamId || !scorePayload.judgeId) return false;
  if (!scorePayload.criteriaScores || typeof scorePayload.criteriaScores !== 'object') return false;
  
  for (const c of CRITERIA_DEFINITIONS) {
    const val = scorePayload.criteriaScores[c.id];
    if (typeof val !== 'number' || val < 1 || val > 10) {
      return false;
    }
  }
  return true;
}
