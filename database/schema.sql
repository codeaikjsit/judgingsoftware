-- ============================================================================
-- EPOCH 1.0 JUDGING PLATFORM - 100% BULLETPROOF IDEMPOTENT SUPABASE SCHEMA
-- This script completely resets & rebuilds tables cleanly with ZERO policy conflicts.
-- ============================================================================

-- 1. Enable UUID Extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Drop existing views and tables with CASCADE to wipe any conflicting old policies cleanly
DROP VIEW IF EXISTS public.team_feedback_report_view CASCADE;
DROP VIEW IF EXISTS public.leaderboard_view CASCADE;
DROP TABLE IF EXISTS public.scores CASCADE;
DROP TABLE IF EXISTS public.active_session CASCADE;
DROP TABLE IF EXISTS public.teams CASCADE;
DROP TABLE IF EXISTS public.profiles CASCADE;

-- 3. PROFILES / USERS TABLE
CREATE TABLE public.profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email TEXT UNIQUE NOT NULL,
    full_name TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'judge' CHECK (role IN ('admin', 'judge')),
    password TEXT NOT NULL DEFAULT 'password123',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Seed Default Organizers & Judges
INSERT INTO public.profiles (id, email, full_name, role, password) VALUES
    ('11111111-1111-1111-1111-111111111111', 'admin@epoch.org', 'Lead Organizer (Admin)', 'admin', 'password123'),
    ('22222222-2222-2222-2222-222222222222', 'sarah@vc.com', 'Sarah Chen (Judge 1)', 'judge', 'password123'),
    ('33333333-3333-3333-3333-333333333333', 'marcus@tech.io', 'Marcus Vance (Judge 2)', 'judge', 'password123'),
    ('44444444-4444-4444-4444-444444444444', 'priya@ai.dev', 'Priya Sharma (Judge 3)', 'judge', 'password123'),
    ('55555555-5555-5555-5555-555555555555', 'alex@design.co', 'Alex Rivera (Judge 4)', 'judge', 'password123')
ON CONFLICT (email) DO NOTHING;

-- 4. TEAMS TABLE
CREATE TABLE public.teams (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT UNIQUE NOT NULL,
    track TEXT DEFAULT 'General',
    description TEXT,
    pitch_order INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Seed Default Teams
INSERT INTO public.teams (name, track, description, pitch_order) VALUES
    ('NeuralPulse AI', 'AI & Health', 'Real-time cardiac arrhythmia detection with edge ML.', 1),
    ('ZeroCarbon Grid', 'CleanTech', 'Decentralized P2P green energy trading network.', 2),
    ('Aether Cloud OS', 'Infrastructure', 'Lightweight WebAssembly micro-runtime for distributed edge.', 3),
    ('Synthetix Bio', 'BioTech', 'Generative protein sequence synthesizer for rare diseases.', 4),
    ('QuantumSafe Protocol', 'Cybersecurity', 'Lattice-based post-quantum key exchange gateway.', 5)
ON CONFLICT (name) DO NOTHING;

-- 5. ACTIVE SESSION TABLE (Single row state machine)
CREATE TABLE public.active_session (
    id INT PRIMARY KEY DEFAULT 1 CHECK (id = 1),
    active_team_id UUID REFERENCES public.teams(id) ON DELETE SET NULL,
    status TEXT NOT NULL DEFAULT 'idle' CHECK (status IN ('idle', 'pitching', 'completed')),
    started_at TIMESTAMPTZ,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Seed Active Session singleton
INSERT INTO public.active_session (id, active_team_id, status)
VALUES (1, NULL, 'idle')
ON CONFLICT (id) DO NOTHING;

-- 6. SCORES TABLE
CREATE TABLE public.scores (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    team_id UUID NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
    judge_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    judge_name TEXT,
    
    -- 6 Criteria Scores (1 to 10 scale)
    tech_score NUMERIC(4,2) NOT NULL DEFAULT 8.0,
    impact_score NUMERIC(4,2) NOT NULL DEFAULT 8.0,
    problem_score NUMERIC(4,2) NOT NULL DEFAULT 8.0,
    innovation_score NUMERIC(4,2) NOT NULL DEFAULT 8.0,
    presentation_score NUMERIC(4,2) NOT NULL DEFAULT 8.0,
    ux_score NUMERIC(4,2) NOT NULL DEFAULT 8.0,
    
    -- Calculated Weighted Score: 25%, 20%, 15%, 15%, 15%, 10%
    weighted_score NUMERIC(5,3) GENERATED ALWAYS AS (
        (tech_score * 0.25) +
        (impact_score * 0.20) +
        (problem_score * 0.15) +
        (innovation_score * 0.15) +
        (presentation_score * 0.15) +
        (ux_score * 0.10)
    ) STORED,

    notes TEXT,
    submitted_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT unique_judge_team_score UNIQUE (team_id, judge_id)
);

-- 7. ENABLE ROW LEVEL SECURITY
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.active_session ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.scores ENABLE ROW LEVEL SECURITY;

-- 8. CREATE CLEAN POLICIES
CREATE POLICY "Allow all operations for profiles" ON public.profiles FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations for teams" ON public.teams FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations for active_session" ON public.active_session FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations for scores" ON public.scores FOR ALL USING (true) WITH CHECK (true);

-- 9. REALTIME REPLICATION (Safe registration)
DO $$ BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.active_session;
EXCEPTION WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.scores;
EXCEPTION WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.teams;
EXCEPTION WHEN duplicate_object THEN null;
END $$;
