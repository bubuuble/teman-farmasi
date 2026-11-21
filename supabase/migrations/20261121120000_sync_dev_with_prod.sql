-- Sync DEV (ukzzntovivwpebpyuyqy) schema with PROD (qcqcpbaqfecdpjczmukk).
-- Source of truth: prod, inspected read-only on 2026-11-21.
-- Target: DEV ONLY. Do NOT run against prod.
-- Safe against current dev data: orders & class_resources are empty, no
-- duplicates / NULLs / invalid enum values that would violate the new constraints.

-- ============================================================
-- 1. Functions
-- ============================================================
CREATE OR REPLACE FUNCTION public.is_admin()
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
BEGIN
  RETURN EXISTS (
    SELECT 1
    FROM public.profiles
    WHERE id = auth.uid()
    AND role IN ('admin', 'superadmin')
  );
END;
$function$;

CREATE OR REPLACE FUNCTION public.is_admin_or_mentor()
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  RETURN EXISTS (
    SELECT 1
    FROM public.profiles
    WHERE id = auth.uid()
    AND role IN ('admin', 'superadmin', 'mentor')
  );
END;
$function$;

CREATE OR REPLACE FUNCTION public.get_email_by_username(username_input text)
 RETURNS text
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
BEGIN
  RETURN (SELECT email FROM profiles WHERE username = username_input LIMIT 1);
END;
$function$;

CREATE OR REPLACE FUNCTION public.handle_new_user()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
begin
  insert into public.profiles (id, email, full_name, role)
  values (
    new.id,
    new.email,
    new.raw_user_meta_data->>'full_name',
    COALESCE(new.raw_user_meta_data->>'role', 'student') -- Default student jika tidak ada role
  );
  return new;
end;
$function$;

-- ============================================================
-- 2. Missing table: batches
-- ============================================================
CREATE TABLE IF NOT EXISTS public.batches (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  class_id    uuid NOT NULL REFERENCES public.classes(id) ON DELETE CASCADE,
  mentor_id   uuid NOT NULL REFERENCES public.profiles(id) ON DELETE SET NULL,
  name        text NOT NULL,
  start_date  date,
  end_date    date,
  created_at  timestamptz NOT NULL DEFAULT timezone('utc'::text, now())
);
ALTER TABLE public.batches ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- 3. orders: user_id/snap_token -> student_id/notes (table is empty in dev)
-- ============================================================
ALTER TABLE public.orders DROP CONSTRAINT IF EXISTS orders_user_id_fkey;
ALTER TABLE public.orders RENAME COLUMN user_id TO student_id;
ALTER TABLE public.orders DROP COLUMN IF EXISTS snap_token;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS notes text;
ALTER TABLE public.orders
  ALTER COLUMN student_id SET NOT NULL,
  ALTER COLUMN class_id   SET NOT NULL,
  ALTER COLUMN amount     SET NOT NULL,
  ALTER COLUMN amount     SET DEFAULT 0,
  ALTER COLUMN status     SET NOT NULL,
  ALTER COLUMN status     SET DEFAULT 'pending';
ALTER TABLE public.orders
  ADD CONSTRAINT orders_student_id_fkey
  FOREIGN KEY (student_id) REFERENCES public.profiles(id) ON DELETE CASCADE;
ALTER TABLE public.orders
  ADD CONSTRAINT orders_status_check
  CHECK (status = ANY (ARRAY['pending'::text, 'paid'::text, 'cancelled'::text]));

-- ============================================================
-- 4. class_resources (table is empty in dev)
-- ============================================================
ALTER TABLE public.class_resources DROP COLUMN IF EXISTS file_type;
ALTER TABLE public.class_resources
  ALTER COLUMN file_url  SET NOT NULL,
  ALTER COLUMN file_path SET NOT NULL;

-- ============================================================
-- 5. Column nullability / defaults aligned to prod
-- ============================================================
ALTER TABLE public.attendance_sessions
  ALTER COLUMN class_id      SET NOT NULL,
  ALTER COLUMN date_time     SET NOT NULL,
  ALTER COLUMN mentor_status SET DEFAULT 'scheduled';

ALTER TABLE public.attendance_records
  ALTER COLUMN status DROP DEFAULT,
  ALTER COLUMN status SET NOT NULL;

ALTER TABLE public.mentor_student_assignments
  ALTER COLUMN class_id     SET NOT NULL,
  ALTER COLUMN sub_class_id SET NOT NULL;

ALTER TABLE public.profiles
  ALTER COLUMN email SET NOT NULL,
  ALTER COLUMN role  DROP DEFAULT,
  ALTER COLUMN role  SET NOT NULL;

ALTER TABLE public.classes
  ALTER COLUMN level SET DEFAULT 'Beginner';

ALTER TABLE public.sub_classes
  ALTER COLUMN session_offset SET NOT NULL;

ALTER TABLE public.tryouts
  ALTER COLUMN duration_minutes DROP DEFAULT,
  ALTER COLUMN is_active        SET DEFAULT true,
  ALTER COLUMN total_questions  SET NOT NULL;

ALTER TABLE public.tryout_questions ALTER COLUMN question_order SET DEFAULT 0;
ALTER TABLE public.tryout_attempts  ALTER COLUMN score DROP DEFAULT;
ALTER TABLE public.tryout_answers   ALTER COLUMN is_correct DROP DEFAULT;

-- created_at: NOT NULL + utc default on the tables where prod has it
DO $$
DECLARE t text;
BEGIN
  FOREACH t IN ARRAY ARRAY[
    'attendance_records','attendance_sessions','class_mentors','class_resources',
    'classes','enrollments','orders','profiles'
  ] LOOP
    EXECUTE format('UPDATE public.%I SET created_at = now() WHERE created_at IS NULL', t);
    EXECUTE format('ALTER TABLE public.%I ALTER COLUMN created_at SET DEFAULT timezone(''utc''::text, now())', t);
    EXECUTE format('ALTER TABLE public.%I ALTER COLUMN created_at SET NOT NULL', t);
  END LOOP;
END $$;

-- ============================================================
-- 6. Constraints
-- ============================================================
ALTER TABLE public.attendance_records
  ADD CONSTRAINT attendance_records_session_id_student_id_key UNIQUE (session_id, student_id),
  ADD CONSTRAINT attendance_records_status_check
    CHECK (status = ANY (ARRAY['present'::text, 'late'::text, 'absent'::text, 'permission'::text]));

ALTER TABLE public.attendance_sessions
  ADD CONSTRAINT attendance_sessions_mentor_status_check
    CHECK (mentor_status = ANY (ARRAY['scheduled'::text, 'present'::text, 'cancelled'::text]));

ALTER TABLE public.enrollments
  ADD CONSTRAINT enrollments_class_id_student_id_key UNIQUE (class_id, student_id);

ALTER TABLE public.mentor_student_assignments
  ADD CONSTRAINT mentor_student_assignments_mentor_id_student_id_sub_class_i_key
    UNIQUE (mentor_id, student_id, sub_class_id);

ALTER TABLE public.profiles
  ADD CONSTRAINT profiles_username_key UNIQUE (username);

-- ============================================================
-- 7. Indexes
-- ============================================================
CREATE UNIQUE INDEX IF NOT EXISTS class_mentors_unique_idx
  ON public.class_mentors USING btree (class_id, mentor_id, sub_class_id) NULLS NOT DISTINCT;
CREATE INDEX IF NOT EXISTS idx_question_options_question_id ON public.question_options (question_id);
CREATE INDEX IF NOT EXISTS idx_questions_category_id        ON public.questions (category_id);
CREATE INDEX IF NOT EXISTS idx_session_students_student_id  ON public.session_students (student_id);
CREATE INDEX IF NOT EXISTS idx_session_students_session_id  ON public.session_students (session_id);
CREATE INDEX IF NOT EXISTS idx_tryout_answers_attempt_id    ON public.tryout_answers (attempt_id);
CREATE INDEX IF NOT EXISTS idx_tryout_attempts_student_id   ON public.tryout_attempts (student_id);
CREATE INDEX IF NOT EXISTS idx_tryout_attempts_tryout_id    ON public.tryout_attempts (tryout_id);
CREATE INDEX IF NOT EXISTS idx_tryout_questions_tryout_id   ON public.tryout_questions (tryout_id);
CREATE INDEX IF NOT EXISTS idx_tryout_questions_question_id ON public.tryout_questions (question_id);
CREATE INDEX IF NOT EXISTS idx_tryouts_class_id             ON public.tryouts (class_id);

-- ============================================================
-- 8. RLS policies: drop every dev policy in public, recreate prod's
-- ============================================================
DO $$
DECLARE r record;
BEGIN
  FOR r IN SELECT schemaname, tablename, policyname FROM pg_policies WHERE schemaname = 'public' LOOP
    EXECUTE format('DROP POLICY %I ON %I.%I', r.policyname, r.schemaname, r.tablename);
  END LOOP;
END $$;

-- attendance_records
CREATE POLICY "Admins view all records" ON public.attendance_records FOR SELECT USING (is_admin());
CREATE POLICY "Public view records" ON public.attendance_records FOR SELECT USING (true);
CREATE POLICY "Students can mark attendance" ON public.attendance_records FOR INSERT WITH CHECK (auth.uid() = student_id);

-- attendance_sessions
CREATE POLICY "Admins view all sessions" ON public.attendance_sessions FOR SELECT USING (is_admin());
CREATE POLICY "Mentors manage sessions" ON public.attendance_sessions FOR ALL
  USING ((EXISTS (SELECT 1 FROM class_mentors WHERE class_mentors.class_id = attendance_sessions.class_id AND class_mentors.mentor_id = auth.uid())) OR is_admin())
  WITH CHECK ((EXISTS (SELECT 1 FROM class_mentors WHERE class_mentors.class_id = attendance_sessions.class_id AND class_mentors.mentor_id = auth.uid())) OR is_admin());
CREATE POLICY "Public view sessions" ON public.attendance_sessions FOR SELECT USING (true);

-- batches
CREATE POLICY "Admins view all batches" ON public.batches FOR SELECT USING (is_admin());
CREATE POLICY "Mentors access batches by assignment" ON public.batches FOR ALL
  USING (EXISTS (SELECT 1 FROM class_mentors cm WHERE cm.class_id = batches.class_id AND cm.mentor_id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM class_mentors cm WHERE cm.class_id = batches.class_id AND cm.mentor_id = auth.uid()));
CREATE POLICY "Mentors can manage batches in their assigned classes" ON public.batches FOR ALL
  USING (EXISTS (SELECT 1 FROM class_mentors cm WHERE cm.class_id = batches.class_id AND cm.mentor_id = auth.uid()));
CREATE POLICY "Mentors can view batches in their assigned classes" ON public.batches FOR SELECT
  USING (EXISTS (SELECT 1 FROM class_mentors cm WHERE cm.class_id = batches.class_id AND cm.mentor_id = auth.uid()));
CREATE POLICY "Public view batches" ON public.batches FOR SELECT USING (true);

-- class_mentors
CREATE POLICY "Admins can manage class_mentors" ON public.class_mentors FOR ALL USING (is_admin());
CREATE POLICY "Mentors can view own assignments" ON public.class_mentors FOR SELECT USING (auth.uid() = mentor_id);
CREATE POLICY "Public view class mentors" ON public.class_mentors FOR SELECT USING (true);

-- class_resources
CREATE POLICY "Admins can manage resources" ON public.class_resources FOR ALL USING (is_admin());
CREATE POLICY "Everyone can view resources" ON public.class_resources FOR SELECT USING (true);

-- classes
CREATE POLICY "Admins can delete classes" ON public.classes FOR DELETE USING (is_admin());
CREATE POLICY "Admins can insert classes" ON public.classes FOR INSERT WITH CHECK (is_admin());
CREATE POLICY "Admins can update classes" ON public.classes FOR UPDATE USING (is_admin());
CREATE POLICY "Everyone can view classes" ON public.classes FOR SELECT USING (true);

-- enrollments
CREATE POLICY "Admins can manage enrollments" ON public.enrollments FOR ALL USING (is_admin());
CREATE POLICY "Mentors can view enrollments" ON public.enrollments FOR SELECT
  USING (EXISTS (SELECT 1 FROM class_mentors cm WHERE cm.class_id = enrollments.class_id AND cm.mentor_id = auth.uid()));
CREATE POLICY "Students can view own enrollments" ON public.enrollments FOR SELECT USING (auth.uid() = student_id);

-- mentor_student_assignments
CREATE POLICY "Admin full access mentor_student_assignments" ON public.mentor_student_assignments FOR ALL
  USING (is_admin()) WITH CHECK (is_admin());
CREATE POLICY "Mentor can view their own student assignments" ON public.mentor_student_assignments FOR SELECT USING (mentor_id = auth.uid());
CREATE POLICY "Student can view their own mentor assignments" ON public.mentor_student_assignments FOR SELECT USING (student_id = auth.uid());

-- orders
CREATE POLICY "Admins can manage orders" ON public.orders FOR ALL USING (is_admin());
CREATE POLICY "Students can view own orders" ON public.orders FOR SELECT USING (auth.uid() = student_id);

-- profiles
CREATE POLICY "Admins can view all profiles" ON public.profiles FOR SELECT USING (is_admin());
CREATE POLICY "Mentors can view student profiles" ON public.profiles FOR SELECT
  USING (EXISTS (SELECT 1 FROM enrollments e JOIN class_mentors cm ON e.class_id = cm.class_id WHERE e.student_id = profiles.id AND cm.mentor_id = auth.uid()));
CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);

-- question bank
CREATE POLICY "Allow admin and mentor manage categories" ON public.question_categories FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = ANY (ARRAY['admin'::text, 'mentor'::text])));
CREATE POLICY "Allow authenticated read categories" ON public.question_categories FOR SELECT TO authenticated USING (true);

CREATE POLICY "Allow admin and mentor manage question options" ON public.question_options FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = ANY (ARRAY['admin'::text, 'mentor'::text])));
CREATE POLICY "Allow authenticated read question options" ON public.question_options FOR SELECT TO authenticated USING (true);

CREATE POLICY "Allow admin and mentor manage questions" ON public.questions FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = ANY (ARRAY['admin'::text, 'mentor'::text])));
CREATE POLICY "Allow authenticated read questions" ON public.questions FOR SELECT TO authenticated USING (true);

-- session_students
CREATE POLICY "Authenticated users can manage session assignments" ON public.session_students FOR ALL USING (auth.role() = 'authenticated'::text);
CREATE POLICY "Students can view their own assignments" ON public.session_students FOR SELECT USING (student_id = auth.uid());

-- sub_classes
CREATE POLICY "Admins can manage sub_classes" ON public.sub_classes FOR ALL TO authenticated USING (is_admin()) WITH CHECK (is_admin());
CREATE POLICY "Everyone can view sub_classes" ON public.sub_classes FOR SELECT USING (true);

-- tryouts & CBT
CREATE POLICY "Students can view and manage their own answers" ON public.tryout_answers FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM tryout_attempts WHERE tryout_attempts.id = tryout_answers.attempt_id AND (tryout_attempts.student_id = auth.uid() OR EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = ANY (ARRAY['admin'::text, 'mentor'::text])))));

CREATE POLICY "Students can view and manage their own attempts" ON public.tryout_attempts FOR ALL TO authenticated
  USING (student_id = auth.uid() OR EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = ANY (ARRAY['admin'::text, 'mentor'::text])));

CREATE POLICY "Allow admin and mentor manage tryout questions" ON public.tryout_questions FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = ANY (ARRAY['admin'::text, 'mentor'::text])));
CREATE POLICY "Allow authenticated read tryout questions" ON public.tryout_questions FOR SELECT TO authenticated USING (true);

CREATE POLICY "Allow admin and mentor manage tryouts" ON public.tryouts FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = ANY (ARRAY['admin'::text, 'mentor'::text])));
CREATE POLICY "Allow authenticated read tryouts" ON public.tryouts FOR SELECT TO authenticated
  USING (
    (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = ANY (ARRAY['admin'::text, 'mentor'::text])))
    OR (is_active = true AND (class_id IS NULL OR EXISTS (
          SELECT 1 FROM enrollments
          WHERE enrollments.class_id = tryouts.class_id
            AND enrollments.student_id = auth.uid()
            AND enrollments.status = 'active'::text)))
  );

-- ============================================================
-- 9. Storage: ebooks bucket + policies
-- ============================================================
INSERT INTO storage.buckets (id, name, public)
VALUES ('ebooks', 'ebooks', true)
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "Admin Storage Access" ON storage.objects;
DROP POLICY IF EXISTS "Public Read Access" ON storage.objects;

CREATE POLICY "Admin Storage Access" ON storage.objects FOR ALL
  USING (bucket_id = 'ebooks'::text AND (SELECT is_admin()))
  WITH CHECK (bucket_id = 'ebooks'::text AND (SELECT is_admin()));
CREATE POLICY "Public Read Access" ON storage.objects FOR SELECT
  USING (bucket_id = 'ebooks'::text);
