/*
  # Create Evaluation Tracking System

  1. New Tables
    - `trainers` - Store trainer information
    - `sessions` - Track each Saturday session with date and topic
    - `evaluations` - Store individual evaluation metrics (attendee ratings)
    - `organiser_checks` - Store organiser verification checks

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated access
    
  3. Scoring Structure
    - 7 metrics for attendee evaluation (1-5 scale)
    - 3 organiser checks (binary/boolean)
    - Overall score = (Avg Attendee Rating / 5 × 5) × 60% + (Organiser Checks Passed / 3 × 5) × 40%
*/

CREATE TABLE IF NOT EXISTS trainers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  trainer_id uuid NOT NULL REFERENCES trainers(id) ON DELETE CASCADE,
  date date NOT NULL,
  month date NOT NULL,
  topic text NOT NULL,
  created_at timestamptz DEFAULT now(),
  UNIQUE(trainer_id, date)
);

CREATE TABLE IF NOT EXISTS evaluations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id uuid NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
  content_quality integer NOT NULL CHECK (content_quality BETWEEN 1 AND 5),
  session_flow integer NOT NULL CHECK (session_flow BETWEEN 1 AND 5),
  presenter_clarity integer NOT NULL CHECK (presenter_clarity BETWEEN 1 AND 5),
  interactivity integer NOT NULL CHECK (interactivity BETWEEN 1 AND 5),
  hands_on_value integer NOT NULL CHECK (hands_on_value BETWEEN 1 AND 5),
  time_management integer NOT NULL CHECK (time_management BETWEEN 1 AND 5),
  relevance integer NOT NULL CHECK (relevance BETWEEN 1 AND 5),
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS organiser_checks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id uuid NOT NULL UNIQUE REFERENCES sessions(id) ON DELETE CASCADE,
  check_1 boolean NOT NULL DEFAULT false,
  check_2 boolean NOT NULL DEFAULT false,
  check_3 boolean NOT NULL DEFAULT false,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE trainers ENABLE ROW LEVEL SECURITY;
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE evaluations ENABLE ROW LEVEL SECURITY;
ALTER TABLE organiser_checks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Trainers are viewable by everyone" ON trainers FOR SELECT USING (true);
CREATE POLICY "Trainers can be created by authenticated users" ON trainers FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Sessions are viewable by everyone" ON sessions FOR SELECT USING (true);
CREATE POLICY "Sessions can be managed by authenticated users" ON sessions FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Sessions can be updated by authenticated users" ON sessions FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Evaluations are viewable by everyone" ON evaluations FOR SELECT USING (true);
CREATE POLICY "Evaluations can be created by authenticated users" ON evaluations FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Organiser checks are viewable by everyone" ON organiser_checks FOR SELECT USING (true);
CREATE POLICY "Organiser checks can be managed by authenticated users" ON organiser_checks FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Organiser checks can be updated by authenticated users" ON organiser_checks FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
