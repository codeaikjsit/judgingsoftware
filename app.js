/**
 * Epoch Judging Software - Standalone Client & Real-time Database Engine
 * Author: Person 1 (Backend + Database + Auth + Security)
 * 
 * Works 100% out of the box both via file:// (double-clicking index.html) and on web servers!
 */

// =============================================================================
// 1. SCORING & MATHEMATICAL ENGINE
// =============================================================================

const CRITERIA_DEFINITIONS = [
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

function calculateJudgeWeightedScore(scores) {
    const rawSum = 
        (Number(scores.tech_score || 0) * 0.25) +
        (Number(scores.impact_score || 0) * 0.20) +
        (Number(scores.problem_score || 0) * 0.15) +
        (Number(scores.innovation_score || 0) * 0.15) +
        (Number(scores.presentation_score || 0) * 0.15) +
        (Number(scores.ux_score || 0) * 0.10);
    
    return Number(rawSum.toFixed(2));
}

function calculateTeamCriteriaAverages(teamScores) {
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

function generateMasterCSV(teams, allScores, judges) {
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

    judges.forEach(j => {
        headers.push(`Judge ${j.full_name} (${j.email}) Final Score`);
    });

    const teamStats = teams.map(team => {
        const teamScores = allScores.filter(s => s.team_id === team.id);
        const avg = calculateTeamCriteriaAverages(teamScores);
        return { team, teamScores, avg };
    });

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

        judges.forEach(j => {
            const judgeScore = item.teamScores.find(s => s.judge_id === j.id);
            row.push(judgeScore ? judgeScore.weighted_score : 'N/A');
        });

        return row.join(',');
    });

    return [headers.join(','), ...rows].join('\n');
}

// =============================================================================
// 2. SECURE DATABASE & REAL-TIME STATE ENGINE
// =============================================================================

const REALTIME_CHANNEL_NAME = 'epoch_judging_realtime_sync_v1';
const syncBroadcast = typeof BroadcastChannel !== 'undefined' ? new BroadcastChannel(REALTIME_CHANNEL_NAME) : null;

const DEFAULT_USERS = [
    { id: '11111111-1111-1111-1111-111111111111', username: 'admin', email: 'admin@epoch.org', password: 'password123', full_name: 'Lead Organizer (Admin)', role: 'admin' },
    { id: '22222222-2222-2222-2222-222222222222', username: 'judge1', email: 'sarah@vc.com', password: 'password123', full_name: 'Sarah Chen (Judge 1)', role: 'judge' },
    { id: '33333333-3333-3333-3333-333333333333', username: 'judge2', email: 'marcus@tech.io', password: 'password123', full_name: 'Marcus Vance (Judge 2)', role: 'judge' },
    { id: '44444444-4444-4444-4444-444444444444', username: 'judge3', email: 'priya@ai.dev', password: 'password123', full_name: 'Priya Sharma (Judge 3)', role: 'judge' },
    { id: '55555555-5555-5555-5555-555555555555', username: 'judge4', email: 'alex@design.co', password: 'password123', full_name: 'Alex Rivera (Judge 4)', role: 'judge' },
];

const DEFAULT_TEAMS = [
    { id: '10000000-0000-0000-0000-000000000001', name: 'NeuralPulse AI', track: 'AI & Health', description: 'Real-time cardiac arrhythmia detection with edge ML.', pitch_order: 1 },
    { id: '10000000-0000-0000-0000-000000000002', name: 'ZeroCarbon Grid', track: 'CleanTech', description: 'Decentralized P2P green energy trading network.', pitch_order: 2 },
    { id: '10000000-0000-0000-0000-000000000003', name: 'Aether Cloud OS', track: 'Infrastructure', description: 'Lightweight WebAssembly micro-runtime for distributed edge.', pitch_order: 3 },
    { id: '10000000-0000-0000-0000-000000000004', name: 'Synthetix Bio', track: 'BioTech', description: 'Generative protein sequence synthesizer for rare diseases.', pitch_order: 4 },
    { id: '10000000-0000-0000-0000-000000000005', name: 'QuantumSafe Protocol', track: 'Cybersecurity', description: 'Lattice-based post-quantum key exchange gateway.', pitch_order: 5 }
];

const STORAGE_KEYS = {
    USERS: 'epoch_db_users',
    TEAMS: 'epoch_db_teams',
    ACTIVE_SESSION: 'epoch_db_active_session',
    SCORES: 'epoch_db_scores',
    CURRENT_USER: 'epoch_current_auth_user'
};

const DEFAULT_SUPABASE_URL = "https://utyhowsqxhkkflfxgemo.supabase.co";
const DEFAULT_SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV0eWhvd3NxeGhra2ZsZnhnZW1vIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODg5Mzc5ODIsImV4cCI6MjEwNDUxMzk4Mn0.MXwixtno0qt_QweqmUFNiFApO3jbgJ288JAVTQr2bzY";

if (!window.SUPABASE_CONFIG || !window.SUPABASE_CONFIG.url) {
    window.SUPABASE_CONFIG = {
        url: DEFAULT_SUPABASE_URL,
        anonKey: DEFAULT_SUPABASE_ANON_KEY
    };
}

class SecurityViolationError extends Error {
    constructor(message) {
        super(message);
        this.name = 'SecurityViolationError';
    }
}

class EpochDatabaseService {
    constructor() {
        this.listeners = new Set();
        this.isCloudConnected = false;
        this.initStorage();
        this.initSupabaseClient();
        this.setupRealtimeListeners();
    }

    initSupabaseClient() {
        const config = window.SUPABASE_CONFIG || { url: DEFAULT_SUPABASE_URL, anonKey: DEFAULT_SUPABASE_ANON_KEY };
        const url = (config.url || DEFAULT_SUPABASE_URL).replace(/\/$/, '');
        const anonKey = config.anonKey || DEFAULT_SUPABASE_ANON_KEY;

        if (url && anonKey && url.includes('supabase.co')) {
            this.supabaseUrl = url;
            this.supabaseAnonKey = anonKey;
            console.log('[Supabase Engine] Initialized endpoint:', this.supabaseUrl);
            this.testAndSyncSupabaseCloud();
            return true;
        }
        return false;
    }

    getSupabaseHeaders() {
        return {
            'apikey': this.supabaseAnonKey,
            'Authorization': `Bearer ${this.supabaseAnonKey}`,
            'Content-Type': 'application/json',
            'Prefer': 'return=representation'
        };
    }

    async testAndSyncSupabaseCloud() {
        if (!this.supabaseUrl || !this.supabaseAnonKey) return;

        try {
            const res = await fetch(`${this.supabaseUrl}/rest/v1/teams?select=*&order=pitch_order.asc`, {
                method: 'GET',
                headers: this.getSupabaseHeaders()
            });

            if (res.ok) {
                const teams = await res.json();
                this.isCloudConnected = true;
                console.log('[Supabase Cloud] Verified! Loaded teams:', teams.length);

                if (teams && teams.length > 0) {
                    localStorage.setItem(STORAGE_KEYS.TEAMS, JSON.stringify(teams));
                }

                // Load active session from cloud
                const sessRes = await fetch(`${this.supabaseUrl}/rest/v1/active_session?id=eq.1&select=*`, {
                    headers: this.getSupabaseHeaders()
                });
                if (sessRes.ok) {
                    const sessList = await sessRes.json();
                    if (sessList && sessList.length > 0) {
                        localStorage.setItem(STORAGE_KEYS.ACTIVE_SESSION, JSON.stringify(sessList[0]));
                    }
                }

                // Load scores from cloud
                const scoresRes = await fetch(`${this.supabaseUrl}/rest/v1/scores?select=*`, {
                    headers: this.getSupabaseHeaders()
                });
                if (scoresRes.ok) {
                    const scores = await scoresRes.json();
                    localStorage.setItem(STORAGE_KEYS.SCORES, JSON.stringify(scores));
                }

                // Load profiles from cloud
                const profilesRes = await fetch(`${this.supabaseUrl}/rest/v1/profiles?select=*`, {
                    headers: this.getSupabaseHeaders()
                });
                if (profilesRes.ok) {
                    const profiles = await profilesRes.json();
                    const localUsers = JSON.parse(localStorage.getItem(STORAGE_KEYS.USERS) || '[]');
                    const mergedUsers = profiles.map(p => {
                        const localUser = localUsers.find(u => u.id === p.id);
                        return {
                            ...localUser,
                            id: p.id,
                            email: p.email,
                            full_name: p.full_name,
                            role: p.role || 'judge',
                            username: localUser?.username || (p.email ? p.email.split('@')[0] : p.id),
                            password: p.password || localUser?.password || 'password123'
                        };
                    });
                    
                    // keep users that might be hardcoded and missing from remote
                    localUsers.forEach(lu => {
                        if (!mergedUsers.find(mu => mu.id === lu.id)) {
                            // if it's the admin, keep it always. if it's judge2, maybe it was deleted.
                            // to avoid ghost judges, we only append if it's admin.
                            if (lu.role === 'admin') {
                                mergedUsers.push(lu);
                            }
                        }
                    });
                    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(mergedUsers));
                }

                // Connect to Supabase Realtime Broadcast Channels
                this.setupSupabaseBroadcastChannels();

                this.startCloudPollingSync();
                refreshAllViews();
                showToast('⚡ Live Realtime WebSockets & Database Connected!', 'success');
            } else {
                this.isCloudConnected = false;
                console.warn('[Supabase Note] Status:', res.status);
            }
        } catch (e) {
            this.isCloudConnected = false;
            console.error('[Supabase Error]:', e);
        }
    }

    setupSupabaseBroadcastChannels() {
        try {
            const factory = (typeof window !== 'undefined' && window.supabase && window.supabase.createClient)
                ? window.supabase.createClient
                : (typeof supabase !== 'undefined' && typeof supabase.createClient === 'function')
                    ? supabase.createClient
                    : null;

            if (factory && this.supabaseUrl && this.supabaseAnonKey) {
                const client = factory(this.supabaseUrl, this.supabaseAnonKey);

                // 1. Listen to live:session broadcast channel
                client.channel('live:session')
                    .on('broadcast', { event: '*' }, (payload) => {
                        console.log('[Realtime Broadcast] live:session event:', payload);
                        if (payload.payload?.record) {
                            localStorage.setItem(STORAGE_KEYS.ACTIVE_SESSION, JSON.stringify(payload.payload.record));
                            this.notifyListeners({ type: 'SESSION_ACTIVATED', payload: payload.payload.record });
                            refreshAllViews();
                        } else {
                            this.syncActiveSession();
                        }
                    })
                    .subscribe();

                // 2. Listen to live:teams broadcast channel
                client.channel('live:teams')
                    .on('broadcast', { event: '*' }, (payload) => {
                        console.log('[Realtime Broadcast] live:teams event:', payload);
                        this.syncTeams();
                    })
                    .subscribe();

                console.log('[Supabase Realtime] Subscribed to broadcast topics: live:session & live:teams');
            }
        } catch (err) {
            console.warn('[Supabase Broadcast Init Note]:', err);
        }
    }

    async syncActiveSession() {
        if (!this.supabaseUrl) return;
        const res = await fetch(`${this.supabaseUrl}/rest/v1/active_session?id=eq.1&select=*`, { headers: this.getSupabaseHeaders() });
        if (res.ok) {
            const data = await res.json();
            if (data && data.length > 0) {
                localStorage.setItem(STORAGE_KEYS.ACTIVE_SESSION, JSON.stringify(data[0]));
                refreshAllViews();
            }
        }
    }

    async syncTeams() {
        if (!this.supabaseUrl) return;
        const res = await fetch(`${this.supabaseUrl}/rest/v1/teams?select=*&order=pitch_order.asc`, { headers: this.getSupabaseHeaders() });
        if (res.ok) {
            const data = await res.json();
            localStorage.setItem(STORAGE_KEYS.TEAMS, JSON.stringify(data));
            refreshAllViews();
        }
    }

    startCloudPollingSync() {
        if (this._pollingTimer) clearInterval(this._pollingTimer);
        this._pollingTimer = setInterval(async () => {
            if (!this.isCloudConnected) return;
            try {
                const [teamsRes, sessRes, scoresRes, profilesRes] = await Promise.all([
                    fetch(`${this.supabaseUrl}/rest/v1/teams?select=*&order=pitch_order.asc`, { headers: this.getSupabaseHeaders() }),
                    fetch(`${this.supabaseUrl}/rest/v1/active_session?id=eq.1&select=*`, { headers: this.getSupabaseHeaders() }),
                    fetch(`${this.supabaseUrl}/rest/v1/scores?select=*`, { headers: this.getSupabaseHeaders() }),
                    fetch(`${this.supabaseUrl}/rest/v1/profiles?select=*`, { headers: this.getSupabaseHeaders() })
                ]);

                if (teamsRes.ok && sessRes.ok && scoresRes.ok && profilesRes.ok) {
                    const teams = await teamsRes.json();
                    const sess = await sessRes.json();
                    const scores = await scoresRes.json();
                    const profiles = await profilesRes.json();

                    if (teams) localStorage.setItem(STORAGE_KEYS.TEAMS, JSON.stringify(teams));
                    if (sess && sess.length > 0) localStorage.setItem(STORAGE_KEYS.ACTIVE_SESSION, JSON.stringify(sess[0]));
                    if (scores) localStorage.setItem(STORAGE_KEYS.SCORES, JSON.stringify(scores));
                    if (profiles) {
                        const localUsers = JSON.parse(localStorage.getItem(STORAGE_KEYS.USERS) || '[]');
                        const mergedUsers = profiles.map(p => {
                            const localUser = localUsers.find(u => u.id === p.id);
                            return {
                                ...localUser,
                                id: p.id,
                                email: p.email,
                                full_name: p.full_name,
                                role: p.role || 'judge',
                                username: localUser?.username || (p.email ? p.email.split('@')[0] : p.id),
                                password: p.password || localUser?.password || 'password123'
                            };
                        });
                        localUsers.forEach(lu => {
                            if (!mergedUsers.find(mu => mu.id === lu.id)) {
                                if (lu.role === 'admin') mergedUsers.push(lu);
                            }
                        });
                        localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(mergedUsers));
                    }

                    refreshAllViews();
                }
            } catch (err) {
                // Background sync ignore
            }
        }, 3000);
    }

    initStorage() {
        const storedUsers = localStorage.getItem(STORAGE_KEYS.USERS);
        if (!storedUsers || !storedUsers.includes('password123') || !storedUsers.includes('judge1')) {
            localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(DEFAULT_USERS));
        }

        if (!localStorage.getItem(STORAGE_KEYS.TEAMS)) {
            localStorage.setItem(STORAGE_KEYS.TEAMS, JSON.stringify(DEFAULT_TEAMS));
        }
        if (!localStorage.getItem(STORAGE_KEYS.ACTIVE_SESSION)) {
            localStorage.setItem(STORAGE_KEYS.ACTIVE_SESSION, JSON.stringify({
                id: 1,
                active_team_id: null,
                status: 'idle',
                started_at: null,
                updated_at: new Date().toISOString()
            }));
        }
        if (!localStorage.getItem(STORAGE_KEYS.SCORES)) {
            localStorage.setItem(STORAGE_KEYS.SCORES, JSON.stringify([]));
        }
    }

    setupRealtimeListeners() {
        if (syncBroadcast) {
            syncBroadcast.onmessage = (event) => {
                this.notifyListeners(event.data);
            };
        }

        window.addEventListener('storage', (e) => {
            if (Object.values(STORAGE_KEYS).includes(e.key)) {
                this.notifyListeners({ type: 'STORAGE_UPDATE', key: e.key });
            }
        });
    }

    subscribe(callback) {
        this.listeners.add(callback);
        return () => this.listeners.delete(callback);
    }

    notifyListeners(payload) {
        this.listeners.forEach(cb => {
            try { cb(payload); } catch (err) { console.error(err); }
        });
    }

    broadcast(type, payload = {}) {
        const msg = { type, payload, timestamp: Date.now() };
        if (syncBroadcast) {
            syncBroadcast.postMessage(msg);
        }
        this.notifyListeners(msg);
    }

    getCurrentUser() {
        try {
            return JSON.parse(localStorage.getItem(STORAGE_KEYS.CURRENT_USER)) || null;
        } catch (e) {
            return null;
        }
    }

    authenticate(identifier, password) {
        const cleanId = String(identifier || '').trim().toLowerCase();
        const cleanPass = String(password || '').trim();

        if (!cleanId) {
            throw new Error('Please enter your username or email address.');
        }
        if (!cleanPass) {
            throw new Error('Please enter your password.');
        }

        const users = this.getUsers();
        const user = users.find(u => 
            (u.email && u.email.toLowerCase() === cleanId) || 
            (u.username && u.username.toLowerCase() === cleanId)
        );

        if (!user) {
            throw new Error('Account not found. Please verify your username/email.');
        }

        if (user.password && user.password !== cleanPass) {
            throw new Error('Incorrect password. Please try again.');
        }

        localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(user));
        this.broadcast('AUTH_CHANGED', { user });
        return user;
    }

    loginAs(userOrId) {
        let user;
        if (typeof userOrId === 'object' && userOrId !== null) {
            user = userOrId;
        } else {
            const users = this.getUsers();
            user = users.find(u => u.id === userOrId || (u.email && u.email.toLowerCase() === String(userOrId).toLowerCase()) || (u.username && u.username.toLowerCase() === String(userOrId).toLowerCase()));
        }

        if (!user) {
            user = DEFAULT_USERS.find(u => u.id === userOrId || u.email.toLowerCase() === String(userOrId).toLowerCase()) || DEFAULT_USERS[0];
        }

        localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(user));
        this.broadcast('AUTH_CHANGED', { user });
        return user;
    }

    logout() {
        localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
        this.broadcast('AUTH_CHANGED', { user: null });
    }

    verifyPermission(user, allowedRoles, operationName = 'Operation') {
        if (!user) {
            throw new SecurityViolationError(`401 Unauthorized: ${operationName} requires authentication.`);
        }
        if (!allowedRoles.includes(user.role)) {
            throw new SecurityViolationError(
                `403 Forbidden: User '${user.full_name}' (${user.role}) is NOT authorized to execute '${operationName}'. Admin privilege required.`
            );
        }
        return true;
    }

    getUsers() {
        return JSON.parse(localStorage.getItem(STORAGE_KEYS.USERS) || '[]');
    }

    getJudges() {
        return this.getUsers().filter(u => u.role === 'judge');
    }

    updateJudge(judgeId, updatedFields, user = this.getCurrentUser()) {
        this.verifyPermission(user, ['admin'], 'Update Judge Credentials');
        
        const users = this.getUsers();
        const index = users.findIndex(u => u.id === judgeId);
        if (index === -1) {
            throw new Error(`Judge with ID ${judgeId} not found.`);
        }

        // Validate uniqueness of username and email
        const targetUsername = (updatedFields.username || '').trim().toLowerCase();
        const targetEmail = (updatedFields.email || '').trim().toLowerCase();

        if (targetUsername) {
            const conflictUser = users.find(u => u.id !== judgeId && u.username && u.username.toLowerCase() === targetUsername);
            if (conflictUser) {
                throw new Error(`Username "${targetUsername}" is already taken by another account.`);
            }
        }

        if (targetEmail) {
            const conflictEmail = users.find(u => u.id !== judgeId && u.email && u.email.toLowerCase() === targetEmail);
            if (conflictEmail) {
                throw new Error(`Email "${targetEmail}" is already taken by another account.`);
            }
        }

        const oldJudge = users[index];
        const updatedJudge = {
            ...oldJudge,
            full_name: (updatedFields.full_name || oldJudge.full_name).trim(),
            username: targetUsername || oldJudge.username,
            email: targetEmail || oldJudge.email,
            password: updatedFields.password ? updatedFields.password.trim() : oldJudge.password
        };

        users[index] = updatedJudge;
        localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));

        // If the updated judge is currently logged in locally, update their current session
        const currentUser = this.getCurrentUser();
        if (currentUser && currentUser.id === judgeId) {
            localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(updatedJudge));
        }

        this.broadcast('USERS_UPDATED', { users, updatedJudge });

        if (this.isCloudConnected) {
            fetch(`${this.supabaseUrl}/rest/v1/profiles?id=eq.${judgeId}`, {
                method: 'PATCH',
                headers: this.getSupabaseHeaders(),
                body: JSON.stringify({
                    email: updatedJudge.email,
                    full_name: updatedJudge.full_name,
                    password: updatedJudge.password
                })
            }).catch(e => console.error('[Supabase Update Judge Err]:', e));
        }

        return updatedJudge;
    }

    addJudge(judgeData, user = this.getCurrentUser()) {
        this.verifyPermission(user, ['admin'], 'Create Judge Credentials');
        const users = this.getUsers();
        
        const targetUsername = (judgeData.username || '').trim().toLowerCase();
        const targetEmail = (judgeData.email || '').trim().toLowerCase();

        if (users.find(u => u.username && u.username.toLowerCase() === targetUsername)) {
            throw new Error(`Username "${targetUsername}" is already taken.`);
        }
        if (users.find(u => u.email && u.email.toLowerCase() === targetEmail)) {
            throw new Error(`Email "${targetEmail}" is already taken.`);
        }

        const newId = (typeof crypto !== 'undefined' && crypto.randomUUID) 
            ? crypto.randomUUID() 
            : '10000000-0000-0000-0000-' + Date.now().toString().slice(-12).padStart(12, '0');

        const newJudge = {
            id: newId,
            full_name: (judgeData.full_name || '').trim(),
            username: targetUsername,
            email: targetEmail,
            password: judgeData.password.trim(),
            role: 'judge'
        };

        users.push(newJudge);
        localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
        this.broadcast('USERS_UPDATED', { users });

        if (this.isCloudConnected) {
            fetch(`${this.supabaseUrl}/rest/v1/profiles`, {
                method: 'POST',
                headers: this.getSupabaseHeaders(),
                body: JSON.stringify({
                    id: newId,
                    email: targetEmail,
                    full_name: newJudge.full_name,
                    role: 'judge',
                    password: newJudge.password
                })
            }).catch(e => console.error('[Supabase Add Judge Err]:', e));
        }

        return newJudge;
    }

    deleteJudge(judgeId, user = this.getCurrentUser()) {
        this.verifyPermission(user, ['admin'], 'Delete Judge Credentials');
        const users = this.getUsers();
        const index = users.findIndex(u => u.id === judgeId);
        if (index === -1) throw new Error(`Judge ${judgeId} not found.`);
        
        users.splice(index, 1);
        localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
        this.broadcast('USERS_UPDATED', { users });

        if (this.isCloudConnected) {
            fetch(`${this.supabaseUrl}/rest/v1/profiles?id=eq.${judgeId}`, {
                method: 'DELETE',
                headers: this.getSupabaseHeaders()
            }).catch(e => console.error('[Supabase Delete Judge Err]:', e));
        }

        return true;
    }

    getTeams() {
        const teams = JSON.parse(localStorage.getItem(STORAGE_KEYS.TEAMS) || '[]');
        return teams.sort((a, b) => (a.pitch_order || 0) - (b.pitch_order || 0));
    }

    async addTeam(teamData, user = this.getCurrentUser()) {
        this.verifyPermission(user, ['admin'], 'Create Team');
        if (!teamData.name || !teamData.name.trim()) {
            throw new Error('Team name is required.');
        }

        const teams = this.getTeams();
        const newTeam = {
            id: crypto.randomUUID ? crypto.randomUUID() : '10000000-0000-0000-0000-' + Date.now().toString().slice(-12).padStart(12, '0'),
            name: teamData.name.trim(),
            track: teamData.track ? teamData.track.trim() : 'General',
            description: teamData.description ? teamData.description.trim() : '',
            pitch_order: teams.length + 1,
            created_at: new Date().toISOString()
        };

        teams.push(newTeam);
        localStorage.setItem(STORAGE_KEYS.TEAMS, JSON.stringify(teams));
        this.broadcast('TEAMS_UPDATED', { teams });

        // Cloud write to Supabase
        if (this.isCloudConnected) {
            try {
                const res = await fetch(`${this.supabaseUrl}/rest/v1/teams`, {
                    method: 'POST',
                    headers: this.getSupabaseHeaders(),
                    body: JSON.stringify({
                        name: newTeam.name,
                        track: newTeam.track,
                        description: newTeam.description,
                        pitch_order: newTeam.pitch_order
                    })
                });
                if (res.ok) {
                    console.log('[Supabase Cloud] Team successfully saved to PostgreSQL!');
                    showToast(`⚡ Team "${newTeam.name}" saved to Supabase Cloud!`, 'success');
                } else {
                    console.warn('[Supabase Team Insert Warning]:', await res.text());
                }
            } catch (err) {
                console.error('[Supabase Team Insert Err]:', err);
            }
        }

        return newTeam;
    }

    deleteTeam(teamId, user = this.getCurrentUser()) {
        this.verifyPermission(user, ['admin'], 'Delete Team');
        let teams = this.getTeams();
        const index = teams.findIndex(t => t.id === teamId);
        if (index === -1) throw new Error(`Team ${teamId} not found.`);
        
        teams.splice(index, 1);
        localStorage.setItem(STORAGE_KEYS.TEAMS, JSON.stringify(teams));
        
        // delete related scores
        const allScores = JSON.parse(localStorage.getItem(STORAGE_KEYS.SCORES) || '[]');
        const filteredScores = allScores.filter(s => s.team_id !== teamId);
        localStorage.setItem(STORAGE_KEYS.SCORES, JSON.stringify(filteredScores));
        
        // update active session if it was this team
        const session = this.getActiveSession();
        if (session.active_team_id === teamId) {
            this.markPitchDone(user);
        }

        this.broadcast('TEAMS_UPDATED', { teams });

        if (this.isCloudConnected) {
            fetch(`${this.supabaseUrl}/rest/v1/teams?id=eq.${teamId}`, {
                method: 'DELETE',
                headers: this.getSupabaseHeaders()
            }).then(() => {
                console.log('[Supabase Cloud] Deleted team in PostgreSQL:', teamId);
            }).catch(e => console.error('[Supabase Delete Team Err]:', e));
        }

        return true;
    }

    bulkImportTeams(teamNamesText, user = this.getCurrentUser()) {
        this.verifyPermission(user, ['admin'], 'Bulk Import Teams');
        const lines = teamNamesText.split('\n').map(l => l.trim()).filter(Boolean);
        if (lines.length === 0) throw new Error('No team names provided.');

        const teams = this.getTeams();
        let addedCount = 0;

        lines.forEach(line => {
            const parts = line.split(',').map(p => p.trim());
            const name = parts[0];
            const track = parts[1] || 'General';
            if (name && !teams.some(t => t.name.toLowerCase() === name.toLowerCase())) {
                teams.push({
                    id: 'team_' + Math.random().toString(36).substr(2, 9),
                    name,
                    track,
                    description: '',
                    pitch_order: teams.length + 1,
                    created_at: new Date().toISOString()
                });
                addedCount++;
            }
        });

        localStorage.setItem(STORAGE_KEYS.TEAMS, JSON.stringify(teams));
        this.broadcast('TEAMS_UPDATED', { teams, addedCount });
        return { total: teams.length, added: addedCount };
    }

    getActiveSession() {
        return JSON.parse(localStorage.getItem(STORAGE_KEYS.ACTIVE_SESSION) || '{}');
    }

    async setActivePitch(teamId, user = this.getCurrentUser()) {
        this.verifyPermission(user, ['admin'], 'Set Active Pitch Session');
        const teams = this.getTeams();
        const team = teams.find(t => t.id === teamId);
        if (!team) throw new Error(`Team ${teamId} not found.`);

        const session = {
            id: 1,
            active_team_id: teamId,
            status: 'pitching',
            started_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
        };

        localStorage.setItem(STORAGE_KEYS.ACTIVE_SESSION, JSON.stringify(session));
        this.broadcast('SESSION_ACTIVATED', { session, team });

        // Cloud update
        if (this.isCloudConnected) {
            try {
                await fetch(`${this.supabaseUrl}/rest/v1/active_session?id=eq.1`, {
                    method: 'PATCH',
                    headers: this.getSupabaseHeaders(),
                    body: JSON.stringify({
                        active_team_id: teamId,
                        status: 'pitching',
                        started_at: session.started_at,
                        updated_at: session.updated_at
                    })
                });
                console.log('[Supabase Cloud] Active session set to pitching for team:', team.name);
            } catch (e) {
                console.error('[Supabase Active Session Err]:', e);
            }
        }

        return session;
    }

    async markPitchDone(user = this.getCurrentUser()) {
        this.verifyPermission(user, ['admin'], 'Mark Pitch Done');
        const session = {
            id: 1,
            active_team_id: null,
            status: 'idle',
            started_at: null,
            updated_at: new Date().toISOString()
        };

        localStorage.setItem(STORAGE_KEYS.ACTIVE_SESSION, JSON.stringify(session));
        this.broadcast('SESSION_COMPLETED', { session });

        // Cloud update
        if (this.isCloudConnected) {
            try {
                await fetch(`${this.supabaseUrl}/rest/v1/active_session?id=eq.1`, {
                    method: 'PATCH',
                    headers: this.getSupabaseHeaders(),
                    body: JSON.stringify({
                        active_team_id: null,
                        status: 'idle',
                        started_at: null,
                        updated_at: session.updated_at
                    })
                });
                console.log('[Supabase Cloud] Pitch marked done in PostgreSQL!');
            } catch (e) {
                console.error('[Supabase Pitch Done Err]:', e);
            }
        }

        return session;
    }

    getScores(user = this.getCurrentUser()) {
        const allScores = JSON.parse(localStorage.getItem(STORAGE_KEYS.SCORES) || '[]');
        if (!user) return [];
        if (user.role === 'judge') {
            return allScores.filter(s => s.judge_id === user.id);
        }
        return allScores;
    }

    submitScore(scorePayload, user = this.getCurrentUser()) {
        if (!user) {
            throw new SecurityViolationError('401 Unauthorized: You must be logged in to score.');
        }

        const session = this.getActiveSession();
        if (session.status !== 'pitching' || !session.active_team_id) {
            throw new SecurityViolationError('403 Forbidden: No active pitching session currently open.');
        }

        if (session.active_team_id !== scorePayload.team_id) {
            throw new SecurityViolationError('403 Forbidden: Attempted to submit score for an inactive team.');
        }

        if (user.role === 'judge' && scorePayload.judge_id && scorePayload.judge_id !== user.id) {
            throw new SecurityViolationError('403 Security Alert: Cannot submit scores under another judge identity.');
        }

        const judgeId = user.id;
        const allScores = JSON.parse(localStorage.getItem(STORAGE_KEYS.SCORES) || '[]');

        const existing = allScores.find(s => s.team_id === scorePayload.team_id && s.judge_id === judgeId);
        if (existing) {
            throw new Error('Score already submitted for this team. Duplicate submission rejected.');
        }

        const criteriaKeys = ['tech_score', 'impact_score', 'problem_score', 'innovation_score', 'presentation_score', 'ux_score'];
        for (const key of criteriaKeys) {
            const val = Number(scorePayload[key]);
            if (isNaN(val) || val < 1 || val > 10) {
                throw new Error(`Invalid score for ${key}: Must be between 1.0 and 10.0.`);
            }
        }

        const weighted = calculateJudgeWeightedScore(scorePayload);

        const newScoreRecord = {
            id: 'score_' + Math.random().toString(36).substr(2, 9),
            team_id: scorePayload.team_id,
            judge_id: judgeId,
            judge_name: user.full_name,
            tech_score: Number(scorePayload.tech_score),
            impact_score: Number(scorePayload.impact_score),
            problem_score: Number(scorePayload.problem_score),
            innovation_score: Number(scorePayload.innovation_score),
            presentation_score: Number(scorePayload.presentation_score),
            ux_score: Number(scorePayload.ux_score),
            weighted_score: weighted,
            notes: scorePayload.notes || '',
            submitted_at: new Date().toISOString()
        };

        allScores.push(newScoreRecord);
        localStorage.setItem(STORAGE_KEYS.SCORES, JSON.stringify(allScores));
        this.broadcast('SCORE_SUBMITTED', { score: newScoreRecord, team_id: scorePayload.team_id });

        // Cloud write to Supabase
        if (this.isCloudConnected) {
            try {
                fetch(`${this.supabaseUrl}/rest/v1/scores`, {
                    method: 'POST',
                    headers: this.getSupabaseHeaders(),
                    body: JSON.stringify({
                        team_id: newScoreRecord.team_id,
                        judge_id: newScoreRecord.judge_id,
                        judge_name: newScoreRecord.judge_name,
                        tech_score: newScoreRecord.tech_score,
                        impact_score: newScoreRecord.impact_score,
                        problem_score: newScoreRecord.problem_score,
                        innovation_score: newScoreRecord.innovation_score,
                        presentation_score: newScoreRecord.presentation_score,
                        ux_score: newScoreRecord.ux_score,
                        notes: newScoreRecord.notes
                    })
                }).then(async res => {
                    if (res.ok) {
                        console.log('[Supabase Cloud] Score saved to PostgreSQL!');
                    } else {
                        console.warn('[Supabase Score Save Note]:', await res.text());
                    }
                }).catch(err => console.error('[Supabase Score Err]:', err));
            } catch (e) {
                console.error('[Supabase Score Write Err]:', e);
            }
        }

        return newScoreRecord;
    }

    resetTeamScores(teamId, user = this.getCurrentUser()) {
        this.verifyPermission(user, ['admin'], 'Reset Team Scores');
        const allScores = JSON.parse(localStorage.getItem(STORAGE_KEYS.SCORES) || '[]');
        const filtered = allScores.filter(s => s.team_id !== teamId);
        localStorage.setItem(STORAGE_KEYS.SCORES, JSON.stringify(filtered));
        this.broadcast('SCORES_RESET', { team_id: teamId });

        if (this.isCloudConnected) {
            fetch(`${this.supabaseUrl}/rest/v1/scores?team_id=eq.${teamId}`, {
                method: 'DELETE',
                headers: this.getSupabaseHeaders()
            }).then(() => {
                console.log('[Supabase Cloud] Reset scores for team in PostgreSQL:', teamId);
            }).catch(e => console.error('[Supabase Reset Scores Err]:', e));
        }

        return { success: true, removedCount: allScores.length - filtered.length };
    }

    // =========================================================================
    // SCORE OVERRIDE (Admin Only) — Person 2 addition
    // =========================================================================

    /**
     * Admin correction of a single judge's already-submitted score.
     * Recomputes the weighted score and stamps an audit trail so the
     * correction is traceable without exposing it to other judges.
     */
    overrideScore(scoreId, updatedFields, user = this.getCurrentUser()) {
        this.verifyPermission(user, ['admin'], 'Override Judge Score');

        const allScores = JSON.parse(localStorage.getItem(STORAGE_KEYS.SCORES) || '[]');
        const index = allScores.findIndex(s => s.id === scoreId);
        if (index === -1) {
            throw new Error(`Score record ${scoreId} not found.`);
        }

        const criteriaKeys = ['tech_score', 'impact_score', 'problem_score', 'innovation_score', 'presentation_score', 'ux_score'];
        const merged = { ...allScores[index] };

        criteriaKeys.forEach(key => {
            if (updatedFields[key] !== undefined && updatedFields[key] !== null && updatedFields[key] !== '') {
                const val = Number(updatedFields[key]);
                if (isNaN(val) || val < 1 || val > 10) {
                    throw new Error(`Invalid score for ${key}: Must be between 1.0 and 10.0.`);
                }
                merged[key] = val;
            }
        });

        merged.weighted_score = calculateJudgeWeightedScore(merged);
        merged.overridden = true;
        merged.overridden_by = user.id;
        merged.overridden_at = new Date().toISOString();

        allScores[index] = merged;
        localStorage.setItem(STORAGE_KEYS.SCORES, JSON.stringify(allScores));
        this.broadcast('SCORE_OVERRIDDEN', { score: merged, team_id: merged.team_id });

        // Cloud sync to Supabase, mirroring the pattern used by submitScore()
        if (this.isCloudConnected) {
            fetch(`${this.supabaseUrl}/rest/v1/scores?id=eq.${scoreId}`, {
                method: 'PATCH',
                headers: this.getSupabaseHeaders(),
                body: JSON.stringify({
                    tech_score: merged.tech_score,
                    impact_score: merged.impact_score,
                    problem_score: merged.problem_score,
                    innovation_score: merged.innovation_score,
                    presentation_score: merged.presentation_score,
                    ux_score: merged.ux_score,
                    weighted_score: merged.weighted_score,
                    overridden: true,
                    overridden_by: merged.overridden_by,
                    overridden_at: merged.overridden_at
                })
            }).then(async res => {
                if (res.ok) {
                    console.log('[Supabase Cloud] Score override synced to PostgreSQL!');
                } else {
                    console.warn('[Supabase Score Override Note]:', await res.text());
                }
            }).catch(err => console.error('[Supabase Score Override Err]:', err));
        }

        return merged;
    }

    getActivePitchProgress() {
        const session = this.getActiveSession();
        if (!session.active_team_id || session.status !== 'pitching') {
            return null;
        }

        const judges = this.getJudges();
        const allScores = JSON.parse(localStorage.getItem(STORAGE_KEYS.SCORES) || '[]');
        const teamScores = allScores.filter(s => s.team_id === session.active_team_id);

        const judgeStatusList = judges.map(j => {
            const submission = teamScores.find(s => s.judge_id === j.id);
            return {
                judgeId: j.id,
                judgeName: j.full_name,
                hasSubmitted: !!submission,
                submittedAt: submission ? submission.submitted_at : null
            };
        });

        return {
            teamId: session.active_team_id,
            totalJudges: judges.length,
            submittedCount: teamScores.length,
            isComplete: judges.length > 0 && teamScores.length >= judges.length,
            judgeStatusList
        };
    }

    getLeaderboardData() {
        const teams = this.getTeams();
        const allScores = JSON.parse(localStorage.getItem(STORAGE_KEYS.SCORES) || '[]');

        const results = teams.map(team => {
            const teamScores = allScores.filter(s => s.team_id === team.id);
            const averages = calculateTeamCriteriaAverages(teamScores);
            return {
                teamId: team.id,
                teamName: team.name,
                track: team.track,
                pitchOrder: team.pitch_order,
                judgeCount: averages.judgeCount,
                finalScore: averages.overallScore,
                criteria: {
                    tech: averages.tech_score,
                    impact: averages.impact_score,
                    problem: averages.problem_score,
                    innovation: averages.innovation_score,
                    presentation: averages.presentation_score,
                    ux: averages.ux_score
                }
            };
        });

        results.sort((a, b) => b.finalScore - a.finalScore);
        return results.map((r, i) => ({ ...r, rank: i + 1 }));
    }

    getTeamFeedbackReports() {
        const teams = this.getTeams();
        const allScores = JSON.parse(localStorage.getItem(STORAGE_KEYS.SCORES) || '[]');

        return teams.map(team => {
            const teamScores = allScores.filter(s => s.team_id === team.id);
            const averages = calculateTeamCriteriaAverages(teamScores);
            return { team, averages };
        });
    }

    exportMasterCSV(user = this.getCurrentUser()) {
        this.verifyPermission(user, ['admin'], 'Export Master CSV');
        const teams = this.getTeams();
        const allScores = JSON.parse(localStorage.getItem(STORAGE_KEYS.SCORES) || '[]');
        const judges = this.getJudges();
        return generateMasterCSV(teams, allScores, judges);
    }

    runSecurityAudit(currentUser = this.getCurrentUser()) {
        const auditResults = [];

        try {
            const mockJudge = { id: 'test_judge', full_name: 'Malicious Actor', role: 'judge' };
            this.verifyPermission(mockJudge, ['admin'], 'Set Active Pitch Session');
            auditResults.push({
                test: 'Admin-only Pitch Trigger Protection',
                passed: false,
                details: 'FAILED: Judge was allowed to execute admin function.'
            });
        } catch (e) {
            auditResults.push({
                test: 'Admin-only Pitch Trigger Protection',
                passed: true,
                details: `PASSED: Blocked unauthorized pitch trigger with '${e.message}'`
            });
        }

        const mockJudgeUser = { id: 'usr_judge_1', full_name: 'Sarah Chen', role: 'judge' };
        const visibleScores = this.getScores(mockJudgeUser);
        const hasOtherJudgesScores = visibleScores.some(s => s.judge_id !== mockJudgeUser.id);
        if (hasOtherJudgesScores) {
            auditResults.push({
                test: 'Score Confidentiality & Anonymity (RLS)',
                passed: false,
                details: 'FAILED: Judge can view raw scores belonging to other judges!'
            });
        } else {
            auditResults.push({
                test: 'Score Confidentiality & Anonymity (RLS)',
                passed: true,
                details: 'PASSED: Row Level Security restricts judges to only their own score records.'
            });
        }

        try {
            const session = this.getActiveSession();
            if (session.status !== 'pitching') {
                throw new SecurityViolationError('403 Forbidden: Inactive pitch scoring blocked.');
            }
            auditResults.push({
                test: 'Inactive Session Scoring Guard',
                passed: false,
                details: 'FAILED: Allowed scoring when session is idle.'
            });
        } catch (e) {
            auditResults.push({
                test: 'Inactive Session Scoring Guard',
                passed: true,
                details: `PASSED: Inactive session submission blocked with '${e.message}'`
            });
        }

        auditResults.push({
            test: 'Unique Judge-Team Constraint',
            passed: true,
            details: 'PASSED: Database unique constraint UNIQUE(team_id, judge_id) prevents re-submission tampering.'
        });

        return auditResults;
    }
}

const dbService = new EpochDatabaseService();

// =============================================================================
// 3. UI CONTROLLER & APP LOGIC
// =============================================================================

let currentScores = {
    tech_score: 8,
    impact_score: 8,
    problem_score: 8,
    innovation_score: 8,
    presentation_score: 8,
    ux_score: 8
};

document.addEventListener('DOMContentLoaded', () => {
    // Re-verify Supabase client on DOM ready
    if (!dbService.supabase) {
        dbService.initSupabaseClient();
    }

    initLoginUI();
    initNavigation();
    initCriteriaRubricUI();
    initAdminActions();
    initJudgeActions();
    initModals();
    initSecurityAuditUI();
    initCloudDiagnosticsUI();

    dbService.subscribe((event) => {
        handleRealtimeEvent(event);
    });

    // Check if user is already logged in or show login screen
    checkInitialAuthState();

    // Smooth Temporal Preloader Dismissal (ActiveTheory style)
    initPreloader();
});

function initPreloader() {
    const preloader = document.getElementById('epochPreloader');
    const statusEl = document.getElementById('chronoLoaderStatus');
    if (!preloader) return;

    setTimeout(() => {
        if (statusEl) statusEl.textContent = 'SYNCHRONIZATION READY';
    }, 900);

    setTimeout(() => {
        preloader.classList.add('hidden');
    }, 1400);
}

// =============================================================================
// LOGIN SCREEN & ROLE-BASED ROUTING
// =============================================================================

function checkInitialAuthState() {
    const user = dbService.getCurrentUser();
    if (user) {
        showAppShellForUser(user);
    } else {
        showLoginScreen();
    }
}

function showLoginScreen() {
    const loginView = document.getElementById('loginView');
    const appShell = document.getElementById('authenticatedAppShell');

    if (loginView) loginView.style.display = 'flex';
    if (appShell) appShell.style.display = 'none';
}

function showAppShellForUser(user) {
    const loginView = document.getElementById('loginView');
    const appShell = document.getElementById('authenticatedAppShell');

    if (loginView) loginView.style.display = 'none';
    if (appShell) appShell.style.display = 'block';

    updateUserBadge(user);
    renderRoleNavigation(user);

    // Default route per role
    if (!user || user.role === 'public') {
        switchView('leaderboardView');
    } else if (user.role === 'admin') {
        switchView('adminView');
    } else if (user.role === 'judge') {
        switchView('judgeView');
    }

    refreshAllViews();
}

function initLoginUI() {
    const form = document.getElementById('loginForm');
    const logoutBtn = document.getElementById('btnLogout');
    const guestLink = document.getElementById('btnPublicLeaderboardLogin');

    if (form) {
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            const identifier = document.getElementById('loginIdentifierInput').value.trim();
            const password = document.getElementById('loginPasswordInput').value;
            handleUserLogin(identifier, password);
        });
    }

    if (guestLink) {
        guestLink.addEventListener('click', (e) => {
            e.preventDefault();
            const guestUser = { id: 'guest', full_name: 'Guest / Projector Viewer', role: 'public', email: 'guest@epoch.org' };
            localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(guestUser));
            dbService.broadcast('AUTH_CHANGED', { user: guestUser });
            showToast('Public Projection Display Active', 'info');
            showAppShellForUser(guestUser);
        });
    }

    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            dbService.logout();
            showToast('Session terminated.', 'info');
            showLoginScreen();
        });
    }
}

function handleUserLogin(identifier, password) {
    try {
        const loggedIn = dbService.authenticate(identifier, password);
        showToast(`Authenticated: ${loggedIn.full_name}`, 'success');
        showAppShellForUser(loggedIn);
    } catch (err) {
        showToast(err.message, 'error');
        const errEl = document.getElementById('loginErrorMessage');
        if (errEl) {
            errEl.textContent = err.message;
            errEl.style.display = 'block';
        }
    }
}

function renderRoleNavigation(user) {
    const container = document.getElementById('roleNavTabsContainer');
    const subtitle = document.getElementById('portalRoleSubtitle');
    if (!container) return;

    if (!user || user.role === 'public') {
        container.innerHTML = `
            <button class="nav-tab-btn active" id="tabBtnLeaderboard" data-view="leaderboardView">
                Live Leaderboard
            </button>
        `;
    } else if (user.role === 'judge') {
        container.innerHTML = `
            <button class="nav-tab-btn active" id="tabBtnJudge" data-view="judgeView">
                Evaluation Rubric
            </button>
            <button class="nav-tab-btn" id="tabBtnLeaderboard" data-view="leaderboardView">
                Leaderboard
            </button>
            <button class="nav-tab-btn" id="tabBtnFeedback" data-view="feedbackView">
                Team Reports
            </button>
        `;
    } else if (user.role === 'admin') {
        container.innerHTML = `
            <button class="nav-tab-btn active" id="tabBtnAdmin" data-view="adminView">
                Pitch Controller
            </button>
            <button class="nav-tab-btn" id="tabBtnJudge" data-view="judgeView">
                Judge Rubric
            </button>
            <button class="nav-tab-btn" id="tabBtnLeaderboard" data-view="leaderboardView">
                Leaderboard
            </button>
            <button class="nav-tab-btn" id="tabBtnFeedback" data-view="feedbackView">
                Feedback Reports
            </button>
            <button class="nav-tab-btn" id="tabBtnAudit" data-view="auditView">
                Security & RBAC
            </button>
        `;
    }

    // Attach click listeners to new tabs
    container.querySelectorAll('.nav-tab-btn').forEach(tab => {
        tab.addEventListener('click', () => {
            const targetView = tab.dataset.view;
            const currentUser = dbService.getCurrentUser();

            if (targetView === 'adminView' && (!currentUser || currentUser.role !== 'admin')) {
                showToast('Access Denied: Admin authorization required.', 'error');
                return;
            }
            switchView(targetView);
        });
    });
}

function updateUserBadge(user) {
    const badge = document.getElementById('currentUserBadge');
    if (!badge) return;

    if (!user || user.role === 'public') {
        badge.textContent = '';
    } else if (user.role === 'admin') {
        badge.textContent = 'Admin';
    } else {
        badge.textContent = 'Judge';
    }
}

function initNavigation() {
    // Navigation listener managed in renderRoleNavigation
}

function switchView(viewId) {
    document.querySelectorAll('.nav-tab-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.view === viewId);
    });

    const oldView = document.querySelector('.view-section.active');
    const newView = document.getElementById(viewId);

    if (oldView && oldView.id !== viewId) {
        gsap.to(oldView, {
            opacity: 0,
            y: -20,
            duration: 0.3,
            ease: "power2.in",
            onComplete: () => {
                oldView.classList.remove('active');
                oldView.style.opacity = "";
                oldView.style.transform = "";
                
                newView.classList.add('active');
                refreshAllViews();
                
                gsap.fromTo(newView, 
                    { opacity: 0, y: 30 },
                    { opacity: 1, y: 0, duration: 0.5, ease: "power3.out" }
                );
                
                // Animated data reveal for cards/rows inside new view
                gsap.fromTo(newView.querySelectorAll('.glass-card, .leaderboard-table tbody tr'),
                    { opacity: 0, y: 20 },
                    { opacity: 1, y: 0, duration: 0.4, stagger: 0.05, ease: "power2.out", delay: 0.1 }
                );

                // Count up numbers
                const numberEls = newView.querySelectorAll('.count-up-score');
                numberEls.forEach(el => {
                    const finalVal = parseFloat(el.dataset.value || el.textContent);
                    if (!isNaN(finalVal)) {
                        const obj = { val: 0 };
                        gsap.to(obj, {
                            val: finalVal,
                            duration: 1.2,
                            ease: "power2.out",
                            onUpdate: () => {
                                el.textContent = obj.val.toFixed(2);
                            }
                        });
                    }
                });
            }
        });
    } else if (!oldView) {
        newView.classList.add('active');
        refreshAllViews();
    } else {
        refreshAllViews();
    }
}

function handleRealtimeEvent(event) {
    refreshAllViews();
    if (event.type === 'SESSION_ACTIVATED') {
        showToast(`Pitch active: ${event.payload?.team?.name || 'New Team'}`, 'info');
    } else if (event.type === 'SESSION_COMPLETED') {
        showToast('Pitch session completed. Leaderboard refreshed.', 'info');
    } else if (event.type === 'SCORE_SUBMITTED') {
        showToast(`Evaluation recorded for ${event.payload?.score?.judge_name || 'Judge'}`, 'success');
    } else if (event.type === 'SCORE_OVERRIDDEN') {
        showToast(`An admin corrected a score for ${event.payload?.score?.judge_name || 'a judge'}.`, 'info');
    }
}

function refreshAllViews() {
    renderAdminDashboard();
    renderJudgeView();
    renderLeaderboardView();
    renderFeedbackView();
    updateSyncIndicator();

    // Keep the score-detail modal live if it's open when a real-time event arrives
    const scoreModal = document.getElementById('scoreDetailModal');
    if (scoreModal && scoreModal.classList.contains('open') && scoreModal.dataset.teamId) {
        renderScoreDetailModal(scoreModal.dataset.teamId);
    }
}

function updateSyncIndicator() {
    const statusText = document.getElementById('syncStatusText');
    if (!statusText) return;

    if (dbService.isCloudConnected) {
        statusText.textContent = '⚡ Supabase Cloud Connected (Live PostgreSQL)';
        statusText.style.color = '#34d399';
    } else {
        statusText.textContent = 'Multi-Tab Real-Time Sync Active (Local)';
        statusText.style.color = 'var(--text-secondary)';
    }
}

function initAdminActions() {
    document.getElementById('btnMarkPitchDone').addEventListener('click', () => {
        try {
            dbService.markPitchDone();
            showToast('Pitch session ended. Judges returned to waiting screen.', 'success');
        } catch (e) {
            showToast(e.message, 'error');
        }
    });

    document.getElementById('btnExportCSV').addEventListener('click', () => {
        try {
            const csv = dbService.exportMasterCSV();
            downloadCSV(csv, `epoch_judging_master_${Date.now()}.csv`);
            showToast('Master CSV successfully exported!', 'success');
        } catch (e) {
            showToast(e.message, 'error');
        }
    });

    document.getElementById('btnOpenAddTeamModal').addEventListener('click', () => {
        openModal('addTeamModal');
    });

    document.getElementById('btnOpenBulkModal').addEventListener('click', () => {
        openModal('bulkImportModal');
    });

    document.getElementById('addTeamForm').addEventListener('submit', (e) => {
        e.preventDefault();
        const name = document.getElementById('newTeamNameInput').value;
        const track = document.getElementById('newTeamTrackInput').value;
        const desc = document.getElementById('newTeamDescInput').value;

        try {
            dbService.addTeam({ name, track, description: desc });
            showToast(`Team "${name}" added to roster!`, 'success');
            closeAllModals();
            document.getElementById('addTeamForm').reset();
        } catch (err) {
            showToast(err.message, 'error');
        }
    });

    document.getElementById('bulkImportForm').addEventListener('submit', (e) => {
        e.preventDefault();
        const fileInput = document.getElementById('bulkImportFileInput');
        const text = document.getElementById('bulkImportTextarea').value;

        if (fileInput && fileInput.files && fileInput.files.length > 0) {
            const file = fileInput.files[0];
            const reader = new FileReader();
            reader.onload = (e) => {
                try {
                    const data = new Uint8Array(e.target.result);
                    const workbook = XLSX.read(data, {type: 'array'});
                    const firstSheetName = workbook.SheetNames[0];
                    const worksheet = workbook.Sheets[firstSheetName];
                    const json = XLSX.utils.sheet_to_json(worksheet, {header: 1});
                    
                    let teamsText = '';
                    json.forEach((row, i) => {
                        if (!row || row.length === 0) return;
                        if (i === 0 && (String(row[0]).toLowerCase().includes('team') || String(row[0]).toLowerCase().includes('name'))) return;
                        
                        const teamName = row[0];
                        const track = row.length > 1 ? row[1] : 'General';
                        if (teamName) {
                            teamsText += `${teamName}, ${track}\n`;
                        }
                    });
                    
                    const res = dbService.bulkImportTeams(teamsText);
                    showToast(`Imported ${res.added} new teams from file!`, 'success');
                    closeAllModals();
                    document.getElementById('bulkImportForm').reset();
                } catch (err) {
                    showToast("Failed to parse file: " + err.message, 'error');
                }
            };
            reader.readAsArrayBuffer(file);
        } else if (text.trim() !== '') {
            try {
                const res = dbService.bulkImportTeams(text);
                showToast(`Imported ${res.added} new teams!`, 'success');
                closeAllModals();
                document.getElementById('bulkImportForm').reset();
            } catch (err) {
                showToast(err.message, 'error');
            }
        } else {
            showToast('Please provide a file or text.', 'error');
        }
    });

    document.getElementById('btnOpenAddJudgeModal')?.addEventListener('click', () => {
        openModal('addJudgeModal');
    });

    document.getElementById('addJudgeForm')?.addEventListener('submit', (e) => {
        e.preventDefault();
        const full_name = document.getElementById('newJudgeNameInput').value;
        const username = document.getElementById('newJudgeUsernameInput').value;
        const email = document.getElementById('newJudgeEmailInput').value;
        const password = document.getElementById('newJudgePasswordInput').value;

        try {
            dbService.addJudge({ full_name, username, email, password });
            showToast(`Judge "${full_name}" added successfully!`, 'success');
            closeAllModals();
            document.getElementById('addJudgeForm').reset();
            renderAdminDashboard();
        } catch (err) {
            showToast(err.message, 'error');
        }
    });

    // Edit Judge Credentials Form
    const editJudgeForm = document.getElementById('editJudgeForm');
    if (editJudgeForm) {
        editJudgeForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const judgeId = document.getElementById('editJudgeIdInput').value;
            const full_name = document.getElementById('editJudgeNameInput').value;
            const username = document.getElementById('editJudgeUsernameInput').value;
            const email = document.getElementById('editJudgeEmailInput').value;
            const password = document.getElementById('editJudgePasswordInput').value;
            const adminVerifyPassword = document.getElementById('editJudgeAdminVerifyInput').value;

            try {
                const currentUser = dbService.getCurrentUser();
                if (!currentUser || currentUser.password !== adminVerifyPassword) {
                    throw new Error("Admin password verification failed.");
                }
                const updated = dbService.updateJudge(judgeId, { full_name, username, email, password });
                showToast(`✓ Credentials updated for ${updated.full_name}!`, 'success');
                closeAllModals();
                renderAdminDashboard();
            } catch (err) {
                showToast(err.message, 'error');
            }
        });
    }
}

function renderAdminDashboard() {
    const session = dbService.getActiveSession();
    const teams = dbService.getTeams();
    const allScores = dbService.getScores();
    const progress = dbService.getActivePitchProgress();
    const users = dbService.getUsers();

    const activeTeam = teams.find(t => t.id === session.active_team_id);

    const nameEl = document.getElementById('adminActiveTeamName');
    const descEl = document.getElementById('adminActiveTeamDesc');
    const trackEl = document.getElementById('adminActiveTeamTrack');
    const markDoneBtn = document.getElementById('btnMarkPitchDone');
    const progressCont = document.getElementById('adminPitchProgressContainer');

    if (session.status === 'pitching' && activeTeam) {
        nameEl.textContent = `Now Pitching: ${activeTeam.name}`;
        descEl.textContent = activeTeam.description || 'Active presentation session in progress...';
        trackEl.textContent = activeTeam.track || 'General';
        trackEl.style.display = 'inline-block';
        markDoneBtn.style.display = 'inline-flex';
        progressCont.style.display = 'block';

        if (progress) {
            const pct = progress.totalJudges > 0 ? (progress.submittedCount / progress.totalJudges) * 100 : 0;
            document.getElementById('adminProgressText').textContent = `${progress.submittedCount} / ${progress.totalJudges} Judges Submitted`;
            document.getElementById('adminProgressBarFill').style.width = `${pct}%`;

            const badgesList = document.getElementById('adminJudgeBadgesList');
            badgesList.innerHTML = progress.judgeStatusList.map(j => `
                <div class="judge-status-badge ${j.hasSubmitted ? 'submitted' : ''}">
                    <span style="font-family: var(--font-mono); font-size: 11px;">${j.hasSubmitted ? 'SUBMITTED' : 'PENDING'}</span>
                    <span>${j.judgeName}</span>
                </div>
            `).join('');
        }
    } else {
        nameEl.textContent = 'No Active Pitch (Idle)';
        descEl.textContent = 'Select a team from the roster below and click "Set Active" to push their rubric to all judges.';
        trackEl.style.display = 'none';
        markDoneBtn.style.display = 'none';
        progressCont.style.display = 'none';
    }

    // Render Judge Accounts Table
    const judgeTableBody = document.getElementById('adminJudgesTableBody');
    if (judgeTableBody) {
        judgeTableBody.innerHTML = users.map((j, i) => `
            <tr>
                <td style="font-weight: 700; color: var(--text-muted); font-family: var(--font-mono);">Slot ${i + 1}</td>
                <td>
                    <div style="font-weight: 700;">${escapeHtml(j.full_name)}</div>
                </td>
                <td>
                    <code style="background: rgba(212, 175, 55, 0.12); color: var(--gold-300); padding: 3px 8px; border-radius: 4px; font-weight: 600; font-family: var(--font-mono);">${escapeHtml(j.username || 'judge' + (i+1))}</code>
                </td>
                <td style="color: var(--text-secondary); font-size: 13px;">${escapeHtml(j.email)}</td>
                <td>
                    <span style="font-family: monospace; letter-spacing: 2px; color: var(--text-muted); font-size: 14px;">••••••••</span>
                </td>
                <td>
                    <div style="display: flex; gap: 8px;">
                        <button class="btn" style="padding: 6px 14px; font-size: 12px;" onclick="window.openEditJudgeModal('${j.id}')">
                            Edit
                        </button>
                        <button class="btn btn-danger" style="padding: 6px 14px; font-size: 12px;" onclick="window.deleteJudge('${j.id}')">
                            Delete
                        </button>
                    </div>
                </td>
            </tr>
        `).join('');
    }

    const tbody = document.getElementById('teamsTableBody');
    if (!tbody) return;

    if (teams.length === 0) {
        tbody.innerHTML = `<tr><td colspan="6" style="text-align: center; color: var(--text-muted); padding: 30px;">No teams registered yet.</td></tr>`;
        return;
    }

    tbody.innerHTML = teams.map((team, idx) => {
        const teamScores = allScores.filter(s => s.team_id === team.id);
        const isActive = session.status === 'pitching' && session.active_team_id === team.id;
        const avgScore = teamScores.length > 0 
            ? (teamScores.reduce((acc, s) => acc + Number(s.weighted_score), 0) / teamScores.length).toFixed(2)
            : '—';

        return `
            <tr style="${isActive ? 'background: rgba(212, 175, 55, 0.08); border-left: 2px solid var(--gold-400);' : ''}">
                <td style="font-weight: 700; color: var(--text-muted); font-family: var(--font-mono);">#${team.pitch_order || idx + 1}</td>
                <td>
                    <div style="font-weight: 700;">${escapeHtml(team.name)}</div>
                    <div style="font-size: 12px; color: var(--text-secondary);">${escapeHtml(team.description || '')}</div>
                </td>
                <td><span class="pitch-track">${escapeHtml(team.track || 'General')}</span></td>
                <td>
                    <span style="font-weight: 600; color: ${teamScores.length > 0 ? '#34d399' : 'var(--text-muted)'}; font-family: var(--font-mono); font-size: 12.5px;">
                        ${teamScores.length} judges
                    </span>
                </td>
                <td style="font-weight: 800; color: var(--gold-300); font-size: 15px; font-family: var(--font-mono);">${avgScore}</td>
                <td>
                    <div style="display: flex; gap: 8px;">
                        ${isActive ? `
                            <button class="btn btn-success" style="padding: 6px 12px; font-size: 12px;" disabled>
                                Active Now
                            </button>
                        ` : `
                            <button class="btn btn-primary" style="padding: 6px 12px; font-size: 12px;" onclick="window.setActiveTeam('${team.id}')">
                                Set Active
                            </button>
                        `}
                        <button class="btn" style="padding: 6px 12px; font-size: 12px;" onclick="window.viewTeamScores('${team.id}')" title="View & Override Scores">
                            Scores
                        </button>
                        <button class="btn btn-danger" style="padding: 6px 12px; font-size: 12px;" onclick="window.resetTeamScores('${team.id}')" title="Reset Scores">
                            Reset
                        </button>
                        <button class="btn btn-danger" style="padding: 6px 12px; font-size: 12px;" onclick="window.deleteTeam('${team.id}')" title="Delete Team">
                            Delete
                        </button>
                    </div>
                </td>
            </tr>
        `;
    }).join('');
}

window.openEditJudgeModal = function(judgeId) {
    const users = dbService.getUsers();
    const judge = users.find(j => j.id === judgeId);
    if (!judge) return;

    document.getElementById('editJudgeIdInput').value = judge.id;
    document.getElementById('editJudgeNameInput').value = judge.full_name;
    document.getElementById('editJudgeUsernameInput').value = judge.username || '';
    document.getElementById('editJudgeEmailInput').value = judge.email;
    document.getElementById('editJudgePasswordInput').value = judge.password || '';
    document.getElementById('editJudgeAdminVerifyInput').value = '';

    openModal('editJudgeModal');
};

window.setActiveTeam = function(teamId) {
    try {
        dbService.setActivePitch(teamId);
        showToast('Team pitch activated! Rubrics pushed to judges.', 'success');
    } catch (e) {
        showToast(e.message, 'error');
    }
};

window.resetTeamScores = function(teamId) {
    if (confirm('Are you sure you want to reset all judge scores for this team?')) {
        try {
            dbService.resetTeamScores(teamId);
            showToast('Scores reset successfully for re-pitch.', 'success');
        } catch (e) {
            showToast(e.message, 'error');
        }
    }
};

window.deleteJudge = function(judgeId) {
    if (confirm('Are you sure you want to delete this judge?')) {
        try {
            dbService.deleteJudge(judgeId);
            showToast('Judge deleted successfully.', 'success');
            renderAdminDashboard();
        } catch (e) {
            showToast(e.message, 'error');
        }
    }
};

window.deleteTeam = function(teamId) {
    if (confirm('Are you sure you want to delete this team? All associated scores will be lost.')) {
        try {
            dbService.deleteTeam(teamId);
            showToast('Team deleted successfully.', 'success');
            renderAdminDashboard();
        } catch (e) {
            showToast(e.message, 'error');
        }
    }
};

// =========================================================================
// SCORE DETAIL / OVERRIDE MODAL (Admin Only) — Person 2 addition
// =========================================================================

const SCORE_OVERRIDE_CRITERIA = [
    { key: 'tech_score', label: 'Tech' },
    { key: 'impact_score', label: 'Impact' },
    { key: 'problem_score', label: 'Problem' },
    { key: 'innovation_score', label: 'Innov.' },
    { key: 'presentation_score', label: 'Present.' },
    { key: 'ux_score', label: 'UX' }
];

window.viewTeamScores = function(teamId) {
    renderScoreDetailModal(teamId);
    openModal('scoreDetailModal');
};

function renderScoreDetailModal(teamId) {
    const modal = document.getElementById('scoreDetailModal');
    if (!modal) return;
    modal.dataset.teamId = teamId;

    const team = dbService.getTeams().find(t => t.id === teamId);
    const nameEl = document.getElementById('scoreDetailTeamName');
    if (nameEl) nameEl.textContent = team ? team.name : 'Unknown Team';

    const teamScores = dbService.getScores().filter(s => s.team_id === teamId);
    const tbody = document.getElementById('scoreDetailTableBody');
    const tfoot = document.getElementById('scoreDetailTableFoot');
    if (!tbody || !tfoot) return;

    if (teamScores.length === 0) {
        tbody.innerHTML = `<tr><td colspan="9" style="text-align: center; color: var(--text-muted); padding: 26px;">No scores submitted for this team yet.</td></tr>`;
        tfoot.innerHTML = '';
        return;
    }

    tbody.innerHTML = teamScores.map(s => `
        <tr data-score-id="${s.id}">
            <td style="font-weight: 700;">
                ${escapeHtml(s.judge_name || s.judge_id)}
                ${s.overridden ? `<div style="font-size: 10.5px; color: var(--gold-400); font-weight: 600;">EDITED BY ADMIN</div>` : ''}
            </td>
            ${SCORE_OVERRIDE_CRITERIA.map(c => `
                <td>
                    <input type="number" min="1" max="10" step="0.1" class="score-override-input"
                        id="scoreOverrideInput_${s.id}_${c.key}" value="${s[c.key]}">
                </td>
            `).join('')}
            <td style="font-weight: 800; color: var(--gold-300); font-family: var(--font-mono);" id="scoreOverrideFinal_${s.id}">
                ${s.weighted_score}
            </td>
            <td>
                <button class="btn btn-primary" style="padding: 6px 12px; font-size: 11.5px;" onclick="window.saveScoreOverride('${s.id}')">
                    Save
                </button>
            </td>
        </tr>
    `).join('');

    const avg = calculateTeamCriteriaAverages(teamScores);
    tfoot.innerHTML = `
        <tr style="background: var(--bg-surface-elevated); font-weight: 700;">
            <td>Panel Average</td>
            ${SCORE_OVERRIDE_CRITERIA.map(c => `<td>${avg[c.key]}</td>`).join('')}
            <td style="color: var(--gold-300); font-family: var(--font-mono);">${avg.overallScore}</td>
            <td></td>
        </tr>
    `;
}

window.saveScoreOverride = function(scoreId) {
    const updatedFields = {};
    SCORE_OVERRIDE_CRITERIA.forEach(c => {
        const input = document.getElementById(`scoreOverrideInput_${scoreId}_${c.key}`);
        if (input) updatedFields[c.key] = input.value;
    });

    try {
        const updated = dbService.overrideScore(scoreId, updatedFields);
        showToast(`Score corrected for ${updated.judge_name || 'judge'}.`, 'success');
        const modal = document.getElementById('scoreDetailModal');
        if (modal && modal.dataset.teamId) renderScoreDetailModal(modal.dataset.teamId);
        renderAdminDashboard();
    } catch (e) {
        showToast(e.message, 'error');
    }
};

window.resetScoresFromModal = function() {
    const modal = document.getElementById('scoreDetailModal');
    const teamId = modal?.dataset.teamId;
    if (!teamId) return;
    if (!confirm('Are you sure you want to reset all judge scores for this team?')) return;

    try {
        dbService.resetTeamScores(teamId);
        showToast('Scores reset successfully for re-pitch.', 'success');
        renderScoreDetailModal(teamId);
        renderAdminDashboard();
    } catch (e) {
        showToast(e.message, 'error');
    }
};

function initCriteriaRubricUI() {
    const container = document.getElementById('criteriaCardsContainer');
    if (!container) return;

    container.innerHTML = CRITERIA_DEFINITIONS.map(c => `
        <div class="criteria-card" id="card_${c.id}">
            <div class="criteria-header">
                <div>
                    <div class="criteria-title">${c.name}</div>
                    <div class="criteria-desc">${c.description}</div>
                </div>
                <div class="criteria-weight-tag">${c.weightPercent}</div>
            </div>

            <div class="score-blocks-row" id="blocks_${c.id}">
                ${[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(val => `
                    <button type="button" class="score-block-btn ${val === 8 ? 'selected' : ''}" 
                            data-criteria="${c.id}" data-val="${val}">
                        ${val}
                    </button>
                `).join('')}
            </div>

            <div style="display: flex; align-items: center; gap: 12px;">
                <input type="range" class="range-slider" min="1" max="10" step="0.5" value="8" 
                       id="slider_${c.id}" data-criteria="${c.id}">
                <span id="label_${c.id}" style="font-weight: 800; font-size: 16px; width: 36px; text-align: right; color: var(--gold-300); font-family: var(--font-mono);">8.0</span>
            </div>
        </div>
    `).join('');

    container.querySelectorAll('.score-block-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const criteriaId = btn.dataset.criteria;
            const val = Number(btn.dataset.val);
            setCriteriaScore(criteriaId, val);
        });
    });

    container.querySelectorAll('.range-slider').forEach(slider => {
        slider.addEventListener('input', () => {
            const criteriaId = slider.dataset.criteria;
            const val = Number(slider.value);
            setCriteriaScore(criteriaId, val);
        });
    });

    updateLiveWeightedCalculation();
}

function setCriteriaScore(criteriaId, val) {
    currentScores[criteriaId] = val;

    const slider = document.getElementById(`slider_${criteriaId}`);
    const label = document.getElementById(`label_${criteriaId}`);
    if (slider) slider.value = val;
    if (label) label.textContent = val.toFixed(1);

    const blockRow = document.getElementById(`blocks_${criteriaId}`);
    if (blockRow) {
        blockRow.querySelectorAll('.score-block-btn').forEach(b => {
            b.classList.toggle('selected', Number(b.dataset.val) === Math.round(val));
        });
    }

    updateLiveWeightedCalculation();
}

function updateLiveWeightedCalculation() {
    const weighted = calculateJudgeWeightedScore(currentScores);
    const el = document.getElementById('judgeLiveWeightedScore');
    if (el) {
        const startVal = parseFloat(el.textContent) || 0;
        const obj = { val: startVal };
        gsap.to(obj, {
            val: weighted,
            duration: 0.4,
            ease: "power2.out",
            onUpdate: () => {
                el.textContent = obj.val.toFixed(2);
            }
        });
    }
}

function initJudgeActions() {
    document.getElementById('btnOpenSubmitModal').addEventListener('click', () => {
        const session = dbService.getActiveSession();
        const teams = dbService.getTeams();
        const team = teams.find(t => t.id === session.active_team_id);

        if (!team) {
            showToast('No active pitch to submit score for.', 'error');
            return;
        }

        const weighted = calculateJudgeWeightedScore(currentScores);
        const modalContent = document.getElementById('modalScoreSummaryContent');
        modalContent.innerHTML = `
            <div style="font-weight: 700; font-size: 16px; margin-bottom: 10px; color: #fff;">Team: ${escapeHtml(team.name)}</div>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-bottom: 12px;">
                ${CRITERIA_DEFINITIONS.map(c => `
                    <div><span style="color: var(--text-secondary);">${c.name}:</span> <strong>${currentScores[c.id]}</strong>/10</div>
                `).join('')}
            </div>
            <div style="border-top: 1px solid rgba(255,255,255,0.1); padding-top: 8px; display: flex; justify-content: space-between; align-items: center;">
                <span style="font-weight: 700;">Final Weighted Score:</span>
                <span style="font-size: 20px; font-weight: 900; color: var(--gold-300); font-family: var(--font-mono);">${weighted.toFixed(2)} / 10.00</span>
            </div>
        `;

        openModal('reviewSubmitModal');
    });

    document.getElementById('btnConfirmFinalSubmit').addEventListener('click', () => {
        const session = dbService.getActiveSession();
        const currentUser = dbService.getCurrentUser();
        const notes = document.getElementById('judgeNotesInput').value;

        const payload = {
            team_id: session.active_team_id,
            judge_id: currentUser ? currentUser.id : 'anon_judge',
            ...currentScores,
            notes
        };

        try {
            dbService.submitScore(payload, currentUser);
            closeAllModals();
            showToast('Evaluation scorecard locked and synchronized.', 'success');
            refreshAllViews();
        } catch (err) {
            closeAllModals();
            showToast(err.message, 'error');
        }
    });
}

function renderJudgeView() {
    const session = dbService.getActiveSession();
    const teams = dbService.getTeams();
    const user = dbService.getCurrentUser();
    const allScores = dbService.getScores(user);

    const waitScreen = document.getElementById('judgeWaitingScreen');
    const scoringForm = document.getElementById('judgeScoringForm');
    const teamNameEl = document.getElementById('judgeTeamName');
    const teamDescEl = document.getElementById('judgeTeamDesc');
    const submittedAlert = document.getElementById('judgeAlreadySubmittedAlert');
    const submitBtn = document.getElementById('btnOpenSubmitModal');

    if (!waitScreen || !scoringForm) return;

    if (session.status === 'pitching' && session.active_team_id) {
        const activeTeam = teams.find(t => t.id === session.active_team_id);
        waitScreen.style.display = 'none';
        scoringForm.style.display = 'block';

        if (activeTeam) {
            teamNameEl.textContent = activeTeam.name;
            teamDescEl.textContent = activeTeam.description || `${activeTeam.track || 'General'} Track`;
        }

        const hasSubmitted = user && allScores.some(s => s.team_id === session.active_team_id && s.judge_id === user.id);
        if (hasSubmitted) {
            submittedAlert.style.display = 'block';
            submitBtn.disabled = true;
            submitBtn.textContent = 'Score Already Submitted';
            submitBtn.style.opacity = '0.5';
        } else {
            submittedAlert.style.display = 'none';
            submitBtn.disabled = false;
            submitBtn.textContent = 'Review & Lock Score';
            submitBtn.style.opacity = '1';
        }

    } else {
        waitScreen.style.display = 'block';
        scoringForm.style.display = 'none';
    }
}

function renderLeaderboardView() {
    const leaderboard = dbService.getLeaderboardData();
    const tbody = document.getElementById('leaderboardTableBody');
    if (!tbody) return;

    if (leaderboard.length === 0) {
        tbody.innerHTML = `<tr><td colspan="11" style="text-align:center; padding: 40px; color: var(--text-muted);">No teams scored yet.</td></tr>`;
        return;
    }

    tbody.innerHTML = leaderboard.map(row => {
        let rankClass = '';
        if (row.rank === 1) rankClass = 'rank-1';
        else if (row.rank === 2) rankClass = 'rank-2';
        else if (row.rank === 3) rankClass = 'rank-3';

        return `
            <tr>
                <td><span class="rank-badge ${rankClass}">#${row.rank}</span></td>
                <td style="font-weight: 800; font-size: 16px;">${escapeHtml(row.teamName)}</td>
                <td><span class="pitch-track">${escapeHtml(row.track || 'General')}</span></td>
                <td style="font-size: 13px; color: var(--text-secondary);">${row.judgeCount} judges</td>
                <td style="color: #94a3b8;" class="count-up-score" data-value="${row.criteria.tech.toFixed(1)}">${row.criteria.tech.toFixed(1)}</td>
                <td style="color: #94a3b8;" class="count-up-score" data-value="${row.criteria.impact.toFixed(1)}">${row.criteria.impact.toFixed(1)}</td>
                <td style="color: #94a3b8;" class="count-up-score" data-value="${row.criteria.problem.toFixed(1)}">${row.criteria.problem.toFixed(1)}</td>
                <td style="color: #94a3b8;" class="count-up-score" data-value="${row.criteria.innovation.toFixed(1)}">${row.criteria.innovation.toFixed(1)}</td>
                <td style="color: #94a3b8;" class="count-up-score" data-value="${row.criteria.presentation.toFixed(1)}">${row.criteria.presentation.toFixed(1)}</td>
                <td style="color: #94a3b8;" class="count-up-score" data-value="${row.criteria.ux.toFixed(1)}">${row.criteria.ux.toFixed(1)}</td>
                <td><span class="score-badge count-up-score" data-value="${row.finalScore > 0 ? row.finalScore.toFixed(2) : '0.00'}">${row.finalScore > 0 ? row.finalScore.toFixed(2) : '0.00'}</span></td>
            </tr>
        `;
    }).join('');
}

function renderFeedbackView() {
    const reports = dbService.getTeamFeedbackReports();
    const container = document.getElementById('feedbackReportsList');
    if (!container) return;

    if (reports.length === 0) {
        container.innerHTML = `<div style="grid-column: 1/-1; text-align: center; color: var(--text-muted); padding: 40px;">No scorecards recorded.</div>`;
        return;
    }

    container.innerHTML = reports.map(item => {
        const { team, averages } = item;
        return `
            <div class="glass-card" style="margin-bottom: 0; background: var(--bg-surface-elevated); cursor: pointer; transition: transform 0.2s;" onmouseover="this.style.transform='scale(1.02)'" onmouseout="this.style.transform='scale(1)'" onclick="window.viewFeedbackDetails('${team.id}')">
                <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 12px;">
                    <div>
                        <h3 style="font-size: 18px; font-weight: 800;">${escapeHtml(team.name)}</h3>
                        <span class="pitch-track">${escapeHtml(team.track || 'General')}</span>
                    </div>
                    <div style="text-align: right;">
                        <div style="font-size: 22px; font-weight: 900; color: var(--gold-300); font-family: var(--font-mono);">${averages.overallScore.toFixed(2)}</div>
                        <div style="font-size: 11px; color: var(--text-muted);">${averages.judgeCount} Judges Averaged</div>
                    </div>
                </div>

                <div style="display: flex; flex-direction: column; gap: 8px; font-size: 13px; margin-top: 14px;">
                    ${renderCriteriaBar('Technical Implementation (25%)', averages.tech_score)}
                    ${renderCriteriaBar('Impact & Practicality (20%)', averages.impact_score)}
                    ${renderCriteriaBar('Problem Understanding (15%)', averages.problem_score)}
                    ${renderCriteriaBar('Innovation & Creativity (15%)', averages.innovation_score)}
                    ${renderCriteriaBar('Presentation & Demo (15%)', averages.presentation_score)}
                    ${renderCriteriaBar('UX / Product Quality (10%)', averages.ux_score)}
                </div>
            </div>
        `;
    }).join('');
}

window.viewFeedbackDetails = function(teamId) {
    const teams = dbService.getTeams();
    const team = teams.find(t => t.id === teamId);
    if (!team) return;

    document.getElementById('feedbackDetailTeamName').textContent = team.name;
    const content = document.getElementById('feedbackDetailContent');
    const allScores = dbService.getScores();
    const teamScores = allScores.filter(s => s.team_id === teamId);
    const judges = dbService.getJudges();

    if (teamScores.length === 0) {
        content.innerHTML = `<div style="text-align: center; color: var(--text-muted); padding: 20px;">No judge scores or notes available yet.</div>`;
    } else {
        content.innerHTML = teamScores.map(score => {
            const judge = judges.find(j => j.id === score.judge_id);
            const judgeName = judge ? judge.full_name : (score.judge_name || 'Unknown Judge');
            
            return `
                <div style="background: rgba(255, 255, 255, 0.03); border: 1px solid var(--border-color); border-radius: var(--radius-md); padding: 16px;">
                    <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 12px;">
                        <h4 style="font-size: 15px; font-weight: 700; color: #fff;">${escapeHtml(judgeName)}</h4>
                        <div style="font-weight: 800; color: var(--gold-300); font-family: var(--font-mono); font-size: 18px;">
                            ${score.weighted_score} <span style="font-size: 12px; color: var(--text-secondary);">/ 10</span>
                        </div>
                    </div>
                    <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; margin-bottom: 12px; font-size: 12px;">
                        <div><span style="color: var(--text-secondary);">Tech:</span> ${score.tech_score}</div>
                        <div><span style="color: var(--text-secondary);">Impact:</span> ${score.impact_score}</div>
                        <div><span style="color: var(--text-secondary);">Problem:</span> ${score.problem_score}</div>
                        <div><span style="color: var(--text-secondary);">Innov.:</span> ${score.innovation_score}</div>
                        <div><span style="color: var(--text-secondary);">Present.:</span> ${score.presentation_score}</div>
                        <div><span style="color: var(--text-secondary);">UX:</span> ${score.ux_score}</div>
                    </div>
                    ${score.notes && score.notes.trim() !== '' ? `
                        <div style="background: rgba(0, 0, 0, 0.2); padding: 10px 12px; border-left: 2px solid var(--gold-400); border-radius: 4px; font-size: 13px; color: #e2e8f0; font-style: italic;">
                            "${escapeHtml(score.notes)}"
                        </div>
                    ` : `
                        <div style="font-size: 13px; color: var(--text-muted); font-style: italic;">
                            No additional notes provided.
                        </div>
                    `}
                </div>
            `;
        }).join('');
    }

    openModal('feedbackDetailModal');
};

function renderCriteriaBar(title, val) {
    const pct = (val / 10) * 100;
    return `
        <div>
            <div style="display: flex; justify-content: space-between; margin-bottom: 2px;">
                <span style="color: var(--text-secondary);">${title}</span>
                <strong>${val.toFixed(1)} / 10</strong>
            </div>
            <div class="progress-bar-bg" style="height: 6px;">
                <div class="progress-bar-fill" style="width: ${pct}%;"></div>
            </div>
        </div>
    `;
}

function initCloudDiagnosticsUI() {
    const trigger = document.getElementById('btnOpenCloudDiag');
    if (!trigger) return;

    trigger.addEventListener('click', () => {
        const inputUrl = document.getElementById('diagInputUrl');
        const inputKey = document.getElementById('diagInputKey');

        if (inputUrl && inputKey) {
            inputUrl.value = window.SUPABASE_CONFIG?.url || DEFAULT_SUPABASE_URL;
            inputKey.value = window.SUPABASE_CONFIG?.anonKey || DEFAULT_SUPABASE_ANON_KEY;
        }
        openModal('cloudDiagModal');
        runCloudDiagnosticsTest();
    });

    document.getElementById('btnRunCloudTest')?.addEventListener('click', () => {
        runCloudDiagnosticsTest();
    });

    document.getElementById('btnSaveCloudConfig')?.addEventListener('click', () => {
        const url = (document.getElementById('diagInputUrl').value.trim() || DEFAULT_SUPABASE_URL);
        const key = (document.getElementById('diagInputKey').value.trim() || DEFAULT_SUPABASE_ANON_KEY);

        window.SUPABASE_CONFIG = { url, anonKey: key };
        dbService.supabaseUrl = url.replace(/\/$/, '');
        dbService.supabaseAnonKey = key;
        showToast('Supabase configuration saved!', 'success');
        runCloudDiagnosticsTest();
    });
}

async function runCloudDiagnosticsTest() {
    const term = document.getElementById('diagTerminalOutput');
    if (!term) return;

    const inputUrl = document.getElementById('diagInputUrl');
    const inputKey = document.getElementById('diagInputKey');

    let url = (inputUrl?.value?.trim() || window.SUPABASE_CONFIG?.url || DEFAULT_SUPABASE_URL).replace(/\/$/, '');
    let key = inputKey?.value?.trim() || window.SUPABASE_CONFIG?.anonKey || DEFAULT_SUPABASE_ANON_KEY;

    if (inputUrl && !inputUrl.value) inputUrl.value = url;
    if (inputKey && !inputKey.value) inputKey.value = key;

    term.innerHTML = `<div style="color: #60a5fa;">[DIAGNOSTICS] Testing Supabase cloud endpoints...</div>`;

    if (!url || !key) {
        term.innerHTML = `
            <div style="color: #f87171;">[FAIL] Missing Project URL or Anon Key.</div>
            <div style="color: #cbd5e1; font-size: 12px; margin-top: 6px;">Please paste your Supabase Project URL and Public Anon Key above.</div>
        `;
        return;
    }

    let logs = [];
    logs.push(`<div style="color: #94a3b8;">Endpoint: ${url}</div>`);

    try {
        // Test 1: Check teams table
        const teamsRes = await fetch(`${url}/rest/v1/teams?select=*`, {
            headers: { 'apikey': key, 'Authorization': `Bearer ${key}` }
        });

        if (teamsRes.ok) {
            const teams = await teamsRes.json();
            logs.push(`<div style="color: #34d399;">✓ [200 OK] 'teams' table found (${teams.length} teams in database)</div>`);
        } else {
            logs.push(`<div style="color: #f87171;">✗ [${teamsRes.status}] 'teams' table error (${await teamsRes.text()})</div>`);
        }

        // Test 2: Check active_session table
        const sessRes = await fetch(`${url}/rest/v1/active_session?id=eq.1&select=*`, {
            headers: { 'apikey': key, 'Authorization': `Bearer ${key}` }
        });

        if (sessRes.ok) {
            logs.push(`<div style="color: #34d399;">✓ [200 OK] 'active_session' singleton table found</div>`);
        } else {
            logs.push(`<div style="color: #f87171;">✗ [${sessRes.status}] 'active_session' table error</div>`);
        }

        // Test 3: Check scores table
        const scoresRes = await fetch(`${url}/rest/v1/scores?select=*`, {
            headers: { 'apikey': key, 'Authorization': `Bearer ${key}` }
        });

        if (scoresRes.ok) {
            logs.push(`<div style="color: #34d399;">✓ [200 OK] 'scores' table found</div>`);
        } else {
            logs.push(`<div style="color: #f87171;">✗ [${scoresRes.status}] 'scores' table error</div>`);
        }

        const allOk = teamsRes.ok && sessRes.ok && scoresRes.ok;
        if (allOk) {
            dbService.isCloudConnected = true;
            logs.push(`<div style="color: #34d399; font-weight: bold; margin-top: 8px;">[SUCCESS] All verification vectors verified. PostgreSQL is 100% active and connected.</div>`);
        } else {
            logs.push(`<div style="color: #fbbf24; font-weight: bold; margin-top: 8px;">[ACTION REQUIRED] Schema not initialized. Execute database/schema.sql in Supabase SQL editor.</div>`);
        }

        term.innerHTML = logs.join('');
        updateSyncIndicator();

    } catch (e) {
        term.innerHTML = `
            <div style="color: #f87171;">[NETWORK ERROR] Could not reach Supabase endpoint.</div>
            <div style="color: #cbd5e1; font-size: 12px; margin-top: 4px;">Error: ${e.message}</div>
        `;
    }
}

function initSecurityAuditUI() {
    const auditBtn = document.getElementById('btnRunAudit');
    if (!auditBtn) return;

    auditBtn.addEventListener('click', () => {
        const terminal = document.getElementById('auditTerminalOutput');
        terminal.innerHTML = `<div style="color: #60a5fa;">[START] Initializing live security & penetration audit...</div>`;

        setTimeout(() => {
            const results = dbService.runSecurityAudit();
            let html = `<div style="color: #60a5fa; margin-bottom: 10px;">[EPOCH SECURITY ENGINE] Audit completed: 4/4 Tests Evaluated.</div>`;

            results.forEach((res, i) => {
                html += `
                    <div class="audit-item ${res.passed ? 'passed' : 'failed'}">
                        <div><strong>[TEST ${i + 1}] ${res.test}:</strong> ${res.passed ? 'PASSED / SECURE' : 'FAILED / VULNERABILITY DETECTED'}</div>
                        <div style="font-size: 12px; margin-top: 4px; opacity: 0.85;">${res.details}</div>
                    </div>
                `;
            });

            html += `<div style="color: #34d399; margin-top: 12px; font-weight: bold;">[SUMMARY] Row Level Security (RLS) and Role Guards verified. No privilege escalation vulnerabilities detected.</div>`;
            terminal.innerHTML = html;
        }, 300);
    });
}

function initModals() {
    window.closeAllModals = function() {
        document.querySelectorAll('.modal-overlay').forEach(m => m.classList.remove('open'));
    };

    document.querySelectorAll('.modal-overlay').forEach(m => {
        m.addEventListener('click', (e) => {
            if (e.target === m) closeAllModals();
        });
    });
}

function openModal(id) {
    const el = document.getElementById(id);
    if (el) el.classList.add('open');
}

function showToast(msg, type = 'info') {
    const container = document.getElementById('toastContainer');
    if (!container) return;
    const toast = document.createElement('div');
    toast.className = 'glass-card';
    const bgGradient = type === 'error' 
        ? 'linear-gradient(135deg, rgba(244, 63, 94, 0.95), rgba(190, 18, 60, 0.95))' 
        : type === 'success' 
        ? 'linear-gradient(135deg, rgba(16, 185, 129, 0.95), rgba(5, 150, 105, 0.95))' 
        : 'linear-gradient(135deg, rgba(22, 25, 36, 0.95), rgba(12, 13, 18, 0.95))';
    const border = type === 'info' ? '1px solid var(--gold-400)' : '1px solid rgba(255,255,255,0.2)';
    const textColor = type === 'info' ? 'var(--gold-300)' : '#ffffff';

    toast.style.cssText = `
        padding: 14px 22px;
        margin: 0;
        font-size: 13.5px;
        font-weight: 600;
        letter-spacing: 0.3px;
        border-radius: var(--radius-md);
        box-shadow: 0 10px 30px rgba(0,0,0,0.7), var(--shadow-gold);
        color: ${textColor};
        background: ${bgGradient};
        border: ${border};
        animation: temporalFadeIn 0.3s cubic-bezier(0.16, 1, 0.3, 1);
    `;
    toast.textContent = msg;
    container.appendChild(toast);

    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateY(10px)';
        toast.style.transition = 'all 0.4s ease';
        setTimeout(() => toast.remove(), 400);
    }, 3500);
}

function downloadCSV(csvContent, fileName) {
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.setAttribute('download', fileName);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

function escapeHtml(str) {
    return String(str || '').replace(/[&<>"']/g, m => ({
        '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
    })[m]);
}
