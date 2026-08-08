-- Phase 67: Notification Triggers (Student & Admin Events)

-- 1. Helper columns on profiles for Level Up & Leaderboard notifications state
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS last_notified_level_id uuid;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS last_notified_leaderboard_rank integer;

-- 2. Shared helper to notify all admins
CREATE OR REPLACE FUNCTION public.notify_all_admins(
  p_type                text,
  p_title               text,
  p_body                text,
  p_template_data       jsonb DEFAULT '{}'::jsonb,
  p_action_url          text  DEFAULT NULL,
  p_related_entity_type text  DEFAULT NULL,
  p_related_entity_id   uuid  DEFAULT NULL
)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_admin_id uuid;
  v_count integer := 0;
BEGIN
  FOR v_admin_id IN
    SELECT id FROM public.profiles WHERE role = 'admin'::public.app_role
  LOOP
    PERFORM public.create_notification(
      v_admin_id, p_type, p_title, p_body, p_template_data, p_action_url, p_related_entity_type, p_related_entity_id
    );
    v_count := v_count + 1;
  END LOOP;
  RETURN v_count;
END;
$$;

GRANT EXECUTE ON FUNCTION public.notify_all_admins TO authenticated;

-- 3. Trigger: Notify students when a new course matching their stage is published
CREATE OR REPLACE FUNCTION public.trg_notify_on_course_published()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_student_id uuid;
BEGIN
  IF (OLD.status IS NULL OR OLD.status <> 'published') AND NEW.status = 'published' AND NEW.stage_id IS NOT NULL THEN
    FOR v_student_id IN
      SELECT id FROM public.profiles
      WHERE role = 'student'::public.app_role AND stage_id = NEW.stage_id AND is_banned IS NOT TRUE
    LOOP
      PERFORM public.create_notification(
        v_student_id,
        'course_published',
        'دورة جديدة متاحة لمرحلتك الدراسية',
        'تم نشر دورة جديدة: ' || NEW.title || '. اضغط للانتقال والتسجيل.',
        jsonb_build_object('course_id', NEW.id, 'course_title', NEW.title),
        '/courses/' || NEW.id,
        'course',
        NEW.id
      );
    END LOOP;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_course_published_notifications ON public.courses;
CREATE TRIGGER trg_course_published_notifications
  AFTER UPDATE ON public.courses
  FOR EACH ROW EXECUTE FUNCTION public.trg_notify_on_course_published();

-- 4. Triggers: Notify enrolled students when new content (lesson, quiz, assignment) is added
CREATE OR REPLACE FUNCTION public.trg_notify_enrolled_new_lesson()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_course_id uuid;
  v_course_title text;
  v_student_id uuid;
BEGIN
  SELECT u.course_id, c.title INTO v_course_id, v_course_title
  FROM public.units u
  JOIN public.courses c ON c.id = u.course_id
  WHERE u.id = NEW.unit_id;

  IF v_course_id IS NOT NULL THEN
    FOR v_student_id IN
      SELECT user_id FROM public.enrollments WHERE course_id = v_course_id
    LOOP
      PERFORM public.create_notification(
        v_student_id,
        'lesson_added',
        'درس جديد في دورة ' || COALESCE(v_course_title, ''),
        'تم إضافة درس جديد: ' || NEW.title || '.',
        jsonb_build_object('course_id', v_course_id, 'lesson_id', NEW.id),
        '/courses/' || v_course_id,
        'lesson',
        NEW.id
      );
    END LOOP;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_lesson_added_notifications ON public.lessons;
CREATE TRIGGER trg_lesson_added_notifications
  AFTER INSERT ON public.lessons
  FOR EACH ROW EXECUTE FUNCTION public.trg_notify_enrolled_new_lesson();

CREATE OR REPLACE FUNCTION public.trg_notify_enrolled_new_quiz()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_course_title text;
  v_student_id uuid;
BEGIN
  IF NEW.course_id IS NOT NULL THEN
    SELECT title INTO v_course_title FROM public.courses WHERE id = NEW.course_id;

    FOR v_student_id IN
      SELECT user_id FROM public.enrollments WHERE course_id = NEW.course_id
    LOOP
      PERFORM public.create_notification(
        v_student_id,
        'quiz_added',
        'اختبار جديد في دورة ' || COALESCE(v_course_title, ''),
        'تم إضافة اختبار جديد: ' || NEW.title || '.',
        jsonb_build_object('course_id', NEW.course_id, 'quiz_id', NEW.id),
        '/courses/' || NEW.course_id,
        'quiz',
        NEW.id
      );
    END LOOP;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_quiz_added_notifications ON public.quizzes;
CREATE TRIGGER trg_quiz_added_notifications
  AFTER INSERT ON public.quizzes
  FOR EACH ROW EXECUTE FUNCTION public.trg_notify_enrolled_new_quiz();

CREATE OR REPLACE FUNCTION public.trg_notify_enrolled_new_assignment()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_course_title text;
  v_student_id uuid;
BEGIN
  IF NEW.course_id IS NOT NULL THEN
    SELECT title INTO v_course_title FROM public.courses WHERE id = NEW.course_id;

    FOR v_student_id IN
      SELECT user_id FROM public.enrollments WHERE course_id = NEW.course_id
    LOOP
      PERFORM public.create_notification(
        v_student_id,
        'assignment_added',
        'واجب جديد في دورة ' || COALESCE(v_course_title, ''),
        'تم إضافة واجب جديد: ' || NEW.name || '.',
        jsonb_build_object('course_id', NEW.course_id, 'assignment_id', NEW.id),
        '/courses/' || NEW.course_id,
        'assignment',
        NEW.id
      );
    END LOOP;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_assignment_added_notifications ON public.assignments;
CREATE TRIGGER trg_assignment_added_notifications
  AFTER INSERT ON public.assignments
  FOR EACH ROW EXECUTE FUNCTION public.trg_notify_enrolled_new_assignment();

-- 5. Trigger: Quiz attempt officially graded
CREATE OR REPLACE FUNCTION public.trg_notify_quiz_attempt_graded()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_quiz_title text;
  v_outcome text;
BEGIN
  IF (OLD.status IS NULL OR OLD.status <> 'graded') AND NEW.status = 'graded' THEN
    SELECT title INTO v_quiz_title FROM public.quizzes WHERE id = NEW.quiz_id;

    IF NEW.passed IS TRUE THEN
      v_outcome := 'اجتياز بنجاح';
    ELSE
      v_outcome := 'لم يتم الاجتياز';
    END IF;

    PERFORM public.create_notification(
      NEW.user_id,
      'quiz_graded',
      'تم تصحيح اختبارك: ' || COALESCE(v_quiz_title, 'الاختبار'),
      'حصلت على نتيجة ' || COALESCE(NEW.percentage::text, '0') || '% (' || v_outcome || '). اضغط لمراجعة تقرير الاختبار.',
      jsonb_build_object('attempt_id', NEW.id, 'score', NEW.percentage, 'passed', NEW.passed),
      '/dashboard/quiz-attempts',
      'quiz_attempt',
      NEW.id
    );
  END IF;

  -- Admin Notification when quiz needs review
  IF (OLD.status IS NULL OR OLD.status <> 'needs_review') AND NEW.status = 'needs_review' THEN
    SELECT title INTO v_quiz_title FROM public.quizzes WHERE id = NEW.quiz_id;
    PERFORM public.notify_all_admins(
      'quiz_needs_review',
      'محاولة اختبار تتطلب مراجعة أسئلة مقالية',
      'توجد محاولة جديدة بحاجة لمراجعة تصحيح الأسئلة المقالية في اختبار: ' || COALESCE(v_quiz_title, ''),
      jsonb_build_object('attempt_id', NEW.id, 'user_id', NEW.user_id),
      '/admin/quiz-attempts',
      'quiz_attempt',
      NEW.id
    );
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_quiz_graded_notifications ON public.quiz_attempts;
CREATE TRIGGER trg_quiz_graded_notifications
  AFTER UPDATE ON public.quiz_attempts
  FOR EACH ROW EXECUTE FUNCTION public.trg_notify_quiz_attempt_graded();

-- 6. Trigger: Assignment submission graded / submitted / feedback
CREATE OR REPLACE FUNCTION public.trg_notify_assignment_submission_events()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_asg_title text;
  v_outcome text;
  v_student_name text;
BEGIN
  SELECT name INTO v_asg_title FROM public.assignments WHERE id = NEW.assignment_id;

  -- Event A: Graded (outcome set to passed/failed)
  IF (OLD.outcome IS NULL OR OLD.outcome <> NEW.outcome) AND NEW.outcome IN ('passed', 'failed') THEN
    IF NEW.outcome = 'passed' THEN v_outcome := 'اجتياز بنجاح'; ELSE v_outcome := 'غير مجتاز'; END IF;

    PERFORM public.create_notification(
      NEW.user_id,
      'assignment_graded',
      'تم تصحيح واجبك: ' || COALESCE(v_asg_title, 'الواجب'),
      'النتيجة: ' || v_outcome || ' - الدرجة: ' || COALESCE(NEW.grade::text, '0') || '. اضغط لمراجعة التفاصيل.',
      jsonb_build_object('submission_id', NEW.id, 'outcome', NEW.outcome, 'grade', NEW.grade),
      '/dashboard/assignment-submissions',
      'assignment_submission',
      NEW.id
    );
  END IF;

  -- Event B: Feedback given
  IF (OLD.feedback_given_at IS NULL AND NEW.feedback_given_at IS NOT NULL) OR
     (OLD.feedback IS DISTINCT FROM NEW.feedback AND NEW.feedback IS NOT NULL AND NEW.feedback <> '') THEN
    PERFORM public.create_notification(
      NEW.user_id,
      'assignment_feedback',
      'تحديث ملاحظات المعلم على الواجب',
      'قام المعلم بتقديم ملاحظات تقييمية على واجب: ' || COALESCE(v_asg_title, '') || '.',
      jsonb_build_object('submission_id', NEW.id),
      '/dashboard/assignment-submissions',
      'assignment_submission',
      NEW.id
    );
  END IF;

  -- Event C: Admin Notification when student submits assignment
  IF (OLD.status IS NULL OR OLD.status = 'draft') AND NEW.status = 'submitted' THEN
    SELECT full_name INTO v_student_name FROM public.profiles WHERE id = NEW.user_id;

    PERFORM public.notify_all_admins(
      'assignment_submitted',
      'تسليم واجب جديد يتطلب التقييم',
      'قام الطالب (' || COALESCE(v_student_name, 'طالب') || ') بتسليم واجب: ' || COALESCE(v_asg_title, '') || '.',
      jsonb_build_object('submission_id', NEW.id, 'user_id', NEW.user_id),
      '/admin/assignment-submissions',
      'assignment_submission',
      NEW.id
    );
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_assignment_submission_notifications ON public.assignment_submissions;
CREATE TRIGGER trg_assignment_submission_notifications
  AFTER UPDATE ON public.assignment_submissions
  FOR EACH ROW EXECUTE FUNCTION public.trg_notify_assignment_submission_events();

-- 7. Trigger: Badge earned (student_badges table)
CREATE OR REPLACE FUNCTION public.trg_notify_badge_earned()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_badge_name text;
BEGIN
  SELECT title INTO v_badge_name FROM public.badges WHERE id = NEW.badge_id;

  PERFORM public.create_notification(
    NEW.student_id,
    'badge_earned',
    'وسام جديد! حصلت على وسام ' || COALESCE(v_badge_name, 'إنجاز'),
    'تهانينا! لقد حصلت على وسام جديد تقديرًا لتفوقك وإنجازاتك في المنصة.',
    jsonb_build_object('badge_id', NEW.badge_id, 'badge_name', v_badge_name),
    '/dashboard/badges',
    'badge',
    NEW.badge_id
  );

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_badge_earned_notifications ON public.student_badges;
CREATE TRIGGER trg_badge_earned_notifications
  AFTER INSERT ON public.student_badges
  FOR EACH ROW EXECUTE FUNCTION public.trg_notify_badge_earned();

-- 8. Trigger: Account banned
CREATE OR REPLACE FUNCTION public.trg_notify_account_banned()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF (OLD.is_banned IS NOT TRUE) AND NEW.is_banned IS TRUE THEN
    PERFORM public.create_notification(
      NEW.id,
      'account_banned',
      'تنبيه بشأن حسابك',
      'تم تعليق حسابك مؤقتًا. يرجى التواصل مع إدارة المنصة أو الدعم الفني لمزيد من التفاصيل.',
      jsonb_build_object('user_id', NEW.id),
      '/contact',
      'profile',
      NEW.id
    );
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_account_banned_notifications ON public.profiles;
CREATE TRIGGER trg_account_banned_notifications
  AFTER UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.trg_notify_account_banned();

-- 9. Check Level Up & Leaderboard Top 10 notification helper
CREATE OR REPLACE FUNCTION public.check_student_level_and_rank_notifications(_user_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_prof RECORD;
  v_points integer := 0;
  v_current_lvl RECORD;
  v_rank integer := 0;
BEGIN
  SELECT * INTO v_prof FROM public.profiles WHERE id = _user_id;
  IF v_prof IS NULL THEN RETURN; END IF;

  -- 1. Check Level Up
  SELECT SUM(points_delta) INTO v_points FROM public.points_ledger WHERE student_id = _user_id;
  v_points := COALESCE(v_points, 0);

  SELECT * INTO v_current_lvl
  FROM public.levels
  WHERE min_points <= v_points
  ORDER BY min_points DESC
  LIMIT 1;

  IF v_current_lvl IS NOT NULL AND (v_prof.last_notified_level_id IS NULL OR v_prof.last_notified_level_id <> v_current_lvl.id) THEN
    -- Update last notified level
    UPDATE public.profiles SET last_notified_level_id = v_current_lvl.id WHERE id = _user_id;

    -- Send Level Up Notification
    PERFORM public.create_notification(
      _user_id,
      'level_up',
      'مبروك! ارتقيت إلى مستوى جديد',
      'لقد وصلت إلى المستوى (' || COALESCE(v_current_lvl.name, '') || ') بنجاح. واصل التقدم والتفوق!',
      jsonb_build_object('level_id', v_current_lvl.id, 'level_title', v_current_lvl.name, 'points', v_points),
      '/dashboard/levels',
      'level',
      v_current_lvl.id
    );
  END IF;

  -- 2. Check Leaderboard Top 10 / #1
  WITH ranked AS (
    SELECT
      student_id,
      SUM(points_delta) AS total_pts,
      RANK() OVER (ORDER BY SUM(points_delta) DESC) AS rank_pos
    FROM public.points_ledger
    GROUP BY student_id
  )
  SELECT rank_pos INTO v_rank FROM ranked WHERE student_id = _user_id;

  IF v_rank > 0 THEN
    -- Check genuine crossing into Top 10 (was > 10 or NULL, now <= 10)
    IF v_rank <= 10 AND (v_prof.last_notified_leaderboard_rank IS NULL OR v_prof.last_notified_leaderboard_rank > 10) THEN
      PERFORM public.create_notification(
        _user_id,
        'leaderboard_top10',
        'إنجاز رائع! دخلت قائمة الأوائل',
        'تهانينا! لقد وصلت إلى المرتبة #' || v_rank || ' في قائمة المتصدرين على مستوى المنصة.',
        jsonb_build_object('rank', v_rank, 'points', v_points),
        '/leaderboard',
        'leaderboard',
        _user_id
      );
    END IF;

    -- Update last known rank
    UPDATE public.profiles SET last_notified_leaderboard_rank = v_rank WHERE id = _user_id;
  END IF;
END;
$$;

GRANT EXECUTE ON FUNCTION public.check_student_level_and_rank_notifications(uuid) TO authenticated;
