/*
  # Update RLS policies for admin access

  1. Changes
    - Replace authenticated-only INSERT/UPDATE policies with public access
    - Allow public to insert trainers, sessions, evaluations, and organiser checks
    - Allow public to update sessions and organiser checks
    - Allow public to delete sessions, evaluations, and organiser checks
    - Keep SELECT policies as public (already set)

  2. Security
    - All tables now allow full CRUD for public access (admin mode)
*/

-- Drop old restrictive policies
DROP POLICY IF EXISTS "Trainers can be created by authenticated users" ON trainers;
DROP POLICY IF EXISTS "Sessions can be managed by authenticated users" ON sessions;
DROP POLICY IF EXISTS "Sessions can be updated by authenticated users" ON sessions;
DROP POLICY IF EXISTS "Evaluations can be created by authenticated users" ON evaluations;
DROP POLICY IF EXISTS "Organiser checks can be managed by authenticated users" ON organiser_checks;
DROP POLICY IF EXISTS "Organiser checks can be updated by authenticated users" ON organiser_checks;

-- Trainers: full CRUD
CREATE POLICY "Anyone can insert trainers" ON trainers FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update trainers" ON trainers FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "Anyone can delete trainers" ON trainers FOR DELETE USING (true);

-- Sessions: full CRUD
CREATE POLICY "Anyone can insert sessions" ON sessions FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update sessions" ON sessions FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "Anyone can delete sessions" ON sessions FOR DELETE USING (true);

-- Evaluations: full CRUD
CREATE POLICY "Anyone can insert evaluations" ON evaluations FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update evaluations" ON evaluations FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "Anyone can delete evaluations" ON evaluations FOR DELETE USING (true);

-- Organiser checks: full CRUD
CREATE POLICY "Anyone can insert organiser checks" ON organiser_checks FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update organiser checks" ON organiser_checks FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "Anyone can delete organiser checks" ON organiser_checks FOR DELETE USING (true);
