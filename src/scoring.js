/**
 * Epoch 1.0 Judging Software - Scoring & Mathematical Engine
 * Author: Person 1 (Backend + Database + Auth)
 */

export const CRITERIA_DEFINITIONS = [
    {
        id: 'tech_score',
        name: 'Technical Implementation',
        weight: 0.25,
        weightPercent: '25%',
        description: 'Does the prototype work, and does its architecture support the stated goal?'
    },
    {
        id: 'impact_score',
        name: 'Impact & Practicality',
        weight: 0.20,
        weightPercent: '20%',
        description: 'Does this solve a real problem effectively and viably?'
    },
    {
        id: 'problem_score',
        name: 'Problem Understanding & Relevance',
        weight: 0.15,
        weightPercent: '15%',
        description: 'How well did the team understand and address the core prompt?'
    },
    {
        id: 'innovation_score',
        name: 'Innovation & Creativity',
        weight: 0.15,
        weightPercent: '15%',
        description: 'Is the approach novel, fresh, or unique?'
    },
    {
        id: 'presentation_score',
        name: 'Presentation & Demo',
        weight: 0.15,
        weightPercent: '15%',
        description: 'Was the pitch clear, engaging, and well-structured?'
    },
    {
        id: 'ux_score',
        name: 'UX / Product Quality',
        weight: 0.10,
        weightPercent: '10%',
        description: 'Is the solution intuitive, well-designed, and polished?'
    }
];

/**
 * Calculates a single judge's final weighted score (out of 10.00).
 * Formula: Sum(Criteria_i * Weight_i)
 */
export function calculateJudgeWeightedScore(scores) {
    const rawSum = 
        (Number(scores.tech_score || 0) * 0.25) +
        (Number(scores.impact_score || 0) * 0.20) +
        (Number(scores.problem_score || 0) * 0.15) +
        (Number(scores.innovation_score || 0) * 0.15) +
        (Number(scores.presentation_score || 0) * 0.15) +
        (Number(scores.ux_score || 0) * 0.10);
    
    return Number(rawSum.toFixed(2));
}

/**
 * Calculates overall team score by averaging all submitted judge weighted scores.
 */
export function calculateTeamOverallScore(submittedScores) {
    if (!submittedScores || submittedScores.length === 0) return 0;
    const sum = submittedScores.reduce((acc, s) => acc + Number(s.weighted_score || calculateJudgeWeightedScore(s)), 0);
    return Number((sum / submittedScores.length).toFixed(2));
}

/**
 * Computes anonymized criteria breakdown averages for feedback reports.
 */
export function calculateTeamCriteriaAverages(teamScores) {
    if (!teamScores || teamScores.length === 0) {
        return {
            judgeCount: 0,
            overallScore: 0,
            tech_score: 0,
            impact_score: 0,
            problem_score: 0,
            innovation_score: 0,
            presentation_score: 0,
            ux_score: 0
        };
    }

    const count = teamScores.length;
    const totals = teamScores.reduce((acc, s) => {
        acc.tech += Number(s.tech_score || 0);
        acc.impact += Number(s.impact_score || 0);
        acc.problem += Number(s.problem_score || 0);
        acc.innovation += Number(s.innovation_score || 0);
        acc.presentation += Number(s.presentation_score || 0);
        acc.ux += Number(s.ux_score || 0);
        acc.weighted += Number(s.weighted_score || calculateJudgeWeightedScore(s));
        return acc;
    }, { tech: 0, impact: 0, problem: 0, innovation: 0, presentation: 0, ux: 0, weighted: 0 });

    return {
        judgeCount: count,
        overallScore: Number((totals.weighted / count).toFixed(2)),
        tech_score: Number((totals.tech / count).toFixed(2)),
        impact_score: Number((totals.impact / count).toFixed(2)),
        problem_score: Number((totals.problem / count).toFixed(2)),
        innovation_score: Number((totals.innovation / count).toFixed(2)),
        presentation_score: Number((totals.presentation / count).toFixed(2)),
        ux_score: Number((totals.ux / count).toFixed(2))
    };
}

/**
 * Generates Master CSV Content according to PRD section 3.7.
 */
export function generateMasterCSV(teams, allScores, judges) {
    const headers = [
        "Rank",
        "Team ID",
        "Team Name",
        "Track",
        "Judges Count",
        "Final Weighted Score (Avg)",
        "Avg Tech (25%)",
        "Avg Impact (20%)",
        "Avg Problem (15%)",
        "Avg Innovation (15%)",
        "Avg Presentation (15%)",
        "Avg UX (10%)"
    ];

    // Add individual judge audit columns
    judges.forEach(j => {
        headers.push(`Judge ${j.full_name} (${j.email}) Final Score`);
    });

    // Calculate aggregated team data
    const teamStats = teams.map(team => {
        const teamScores = allScores.filter(s => s.team_id === team.id);
        const avg = calculateTeamCriteriaAverages(teamScores);
        return {
            team,
            teamScores,
            avg
        };
    });

    // Sort by overall score descending
    teamStats.sort((a, b) => b.avg.overallScore - a.avg.overallScore);

    const rows = teamStats.map((item, index) => {
        const row = [
            index + 1,
            `"${item.team.id}"`,
            `"${item.team.name.replace(/"/g, '""')}"`,
            `"${item.team.track || 'General'}"`,
            item.avg.judgeCount,
            item.avg.overallScore,
            item.avg.tech_score,
            item.avg.impact_score,
            item.avg.problem_score,
            item.avg.innovation_score,
            item.avg.presentation_score,
            item.avg.ux_score
        ];

        // Append individual judge scores
        judges.forEach(j => {
            const judgeScore = item.teamScores.find(s => s.judge_id === j.id);
            row.push(judgeScore ? judgeScore.weighted_score : 'N/A');
        });

        return row.join(',');
    });

    return [headers.join(','), ...rows].join('\n');
}
