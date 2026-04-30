/*
  # Add webhook logs table for ClickUp integration

  1. New Tables
    - `webhook_logs`
      - `id` (uuid, primary key)
      - `event_type` (text) - type of webhook event
      - `task_id` (text) - ClickUp task ID
      - `task_name` (text) - task name from ClickUp
      - `session_id` (uuid, foreign key) - linked session
      - `status` (text) - task status from ClickUp
      - `payload` (jsonb) - full webhook payload
      - `created_at` (timestamp)

  2. Security
    - Enable RLS
    - Allow service role to insert/read
*/

CREATE TABLE IF NOT EXISTS webhook_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type text DEFAULT '',
  task_id text DEFAULT '',
  task_name text DEFAULT '',
  session_id uuid REFERENCES sessions(id) ON DELETE SET NULL,
  status text DEFAULT '',
  payload jsonb,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE webhook_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role can manage webhook logs"
  ON webhook_logs FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);
