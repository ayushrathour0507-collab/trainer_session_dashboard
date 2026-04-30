/*
  # Update evaluations table for feedback-based scoring

  1. Changes
    - Add `overall_feedback` (text) - main qualitative feedback from evaluator
    - Add `attendee_count` (integer) - number of attendees present
    - Add `started_on_time` (boolean) - did session start on time
    - Add `finished_on_time` (boolean) - did session finish on time
    - Add `had_demos` (boolean) - were there live demos/hands-on
    - Add `had_qa` (boolean) - was there Q&A
    - Add `was_engaging` (boolean) - was the session engaging
    - Add `was_relevant` (boolean) - was topic relevant to team
    - Add `was_clear` (boolean) - was presenter clear and confident
    - Add `content_depth` (integer 1-5) - depth of content
    - Add `presenter_knowledge` (integer 1-5) - presenter's knowledge level
    - Add `practical_value` (integer 1-5) - practical/takeaway value
    - Make original 7 metric columns nullable (they'll be auto-calculated)
    - Add `calculated_score` (numeric) - auto-calculated overall score

  2. Security
    - RLS already allows public CRUD from previous migration
*/

-- Add new columns to evaluations
ALTER TABLE evaluations ADD COLUMN IF NOT EXISTS overall_feedback text DEFAULT '';
ALTER TABLE evaluations ADD COLUMN IF NOT EXISTS attendee_count integer DEFAULT 0;
ALTER TABLE evaluations ADD COLUMN IF NOT EXISTS started_on_time boolean DEFAULT false;
ALTER TABLE evaluations ADD COLUMN IF NOT EXISTS finished_on_time boolean DEFAULT false;
ALTER TABLE evaluations ADD COLUMN IF NOT EXISTS had_demos boolean DEFAULT false;
ALTER TABLE evaluations ADD COLUMN IF NOT EXISTS had_qa boolean DEFAULT false;
ALTER TABLE evaluations ADD COLUMN IF NOT EXISTS was_engaging boolean DEFAULT false;
ALTER TABLE evaluations ADD COLUMN IF NOT EXISTS was_relevant boolean DEFAULT false;
ALTER TABLE evaluations ADD COLUMN IF NOT EXISTS was_clear boolean DEFAULT false;
ALTER TABLE evaluations ADD COLUMN IF NOT EXISTS content_depth integer DEFAULT 3;
ALTER TABLE evaluations ADD COLUMN IF NOT EXISTS presenter_knowledge integer DEFAULT 3;
ALTER TABLE evaluations ADD COLUMN IF NOT EXISTS practical_value integer DEFAULT 3;
ALTER TABLE evaluations ADD COLUMN IF NOT EXISTS calculated_score numeric(5,2) DEFAULT 0;

-- Make original metric columns nullable so they can be auto-calculated
ALTER TABLE evaluations ALTER COLUMN content_quality DROP NOT NULL;
ALTER TABLE evaluations ALTER COLUMN session_flow DROP NOT NULL;
ALTER TABLE evaluations ALTER COLUMN presenter_clarity DROP NOT NULL;
ALTER TABLE evaluations ALTER COLUMN interactivity DROP NOT NULL;
ALTER TABLE evaluations ALTER COLUMN hands_on_value DROP NOT NULL;
ALTER TABLE evaluations ALTER COLUMN time_management DROP NOT NULL;
ALTER TABLE evaluations ALTER COLUMN relevance DROP NOT NULL;

-- Update organiser_checks with descriptive labels
ALTER TABLE organiser_checks ADD COLUMN IF NOT EXISTS organiser_feedback text DEFAULT '';
