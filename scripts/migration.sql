-- Migration script to be run in Supabase SQL Editor

-- 1. Add session_time to attendance_sessions table
ALTER TABLE attendance_sessions ADD COLUMN IF NOT EXISTS session_time TIME;

-- 2. Create session_students table for private sessions (many-to-many relationship)
CREATE TABLE IF NOT EXISTS session_students (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id uuid NOT NULL REFERENCES attendance_sessions(id) ON DELETE CASCADE,
  student_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  UNIQUE(session_id, student_id)
);

-- 3. Create indexes for optimization
CREATE INDEX IF NOT EXISTS idx_session_students_session_id ON session_students(session_id);
CREATE INDEX IF NOT EXISTS idx_session_students_student_id ON session_students(student_id);

-- 4. Enable Row Level Security (RLS)
ALTER TABLE session_students ENABLE ROW LEVEL SECURITY;

-- 5. Create RLS Policies
-- Allow students to view their own session assignments
CREATE POLICY "Students can view their own assignments" ON session_students
  FOR SELECT USING (student_id = auth.uid());

-- Allow authenticated users (mentors, admins) to manage assignments
CREATE POLICY "Authenticated users can manage session assignments" ON session_students
  FOR ALL USING (auth.role() = 'authenticated');
