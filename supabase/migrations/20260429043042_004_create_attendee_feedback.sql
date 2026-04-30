/*
  # Create attendee_feedback table

  1. New Tables
    - `attendee_feedback`
      - `id` (uuid, primary key)
      - `session_id` (uuid, foreign key to sessions)
      - `attendee_name` (text) - name of the attendee giving feedback
      - `rating` (integer 1-5) - overall rating from attendee
      - `what_liked` (text) - what the attendee liked
      - `what_improve` (text) - what could be improved
      - `key_takeaway` (text) - key takeaway from the session
      - `would_recommend` (boolean) - would they recommend this session
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on `attendee_feedback` table
    - Allow public INSERT (attendees submit feedback without auth)
    - Allow public SELECT (transparency - everyone can see feedback counts)
*/

CREATE TABLE IF NOT EXISTS attendee_feedback (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id uuid NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
  attendee_name text DEFAULT '',
  rating integer NOT NULL DEFAULT 3 CHECK (rating >= 1 AND rating <= 5),
  what_liked text DEFAULT '',
  what_improve text DEFAULT '',
  key_takeaway text DEFAULT '',
  would_recommend boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE attendee_feedback ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can submit feedback"
  ON attendee_feedback FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Anyone can view feedback"
  ON attendee_feedback FOR SELECT
  TO anon, authenticated
  USING (true);

-- Add summarized_feedback column to sessions for Gemini output
ALTER TABLE sessions ADD COLUMN IF NOT EXISTS summarized_feedback text DEFAULT '';
ALTER TABLE sessions ADD COLUMN IF NOT EXISTS feedback_summary_updated_at timestamptz;
