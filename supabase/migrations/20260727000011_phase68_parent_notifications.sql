-- Phase 68: Parent Notification Triggers & Shared Helper

-- 1. Shared helper to notify all approved parents of a student
CREATE OR REPLACE FUNCTION public.notify_parents_of_student(
  p_student_id          uuid,
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
  v_link RECORD;
  v_count integer := 0;
  v_student_name text;
  v_body_with_name text;
BEGIN
  -- Fetch student full name
  SELECT full_name INTO v_student_name FROM public.profiles WHERE id = p_student_id;
  v_student_name := COALESCE(v_student_name, 'الطالب');

  -- Prepend student name to notification body
  v_body_with_name := 'الطالب (' || v_student_name || '): ' || p_body;

  FOR v_link IN
    SELECT parent_user_id
    FROM public.parent_student_links
    WHERE student_user_id = p_student_id AND status = 'approved'
  LOOP
    PERFORM public.create_notification(
      v_link.parent_user_id,
      p_type,
      p_title,
      v_body_with_name,
      p_template_data || jsonb_build_object('student_id', p_student_id, 'student_name', v_student_name),
      COALESCE(p_action_url, '/parent?studentId=' || p_student_id),
      p_related_entity_type,
      p_related_entity_id
    );
    v_count := v_count + 1;
  END LOOP;

  RETURN v_count;
END;
$$;

GRANT EXECUTE ON FUNCTION public.notify_parents_of_student TO authenticated;

-- 2. Trigger: Notify parents when student completes a lesson
CREATE OR REPLACE FUNCTION public.trg_notify_parents_lesson_completed()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_lesson_title text;
  v_course_title text;
BEGIN
  SELECT title INTO v_lesson_title FROM public.lessons WHERE id = NEW.lesson_id;
  SELECT title INTO v_course_title FROM public.courses WHERE id = NEW.course_id;

  PERFORM public.notify_parents_of_student(
    NEW.user_id,
    'parent_lesson_completed',
    'إنجاز جديد في الدراسة',
    'أكمل درس (' || COALESCE(v_lesson_title, '') || ') في كورس (' || COALESCE(v_course_title, '') || ').',
    jsonb_build_object('lesson_id', NEW.lesson_id, 'course_id', NEW.course_id),
    '/parent?studentId=' || NEW.user_id,
    'lesson',
    NEW.lesson_id
  );

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_parent_lesson_completed_notifications ON public.lesson_progress;
CREATE TRIGGER trg_parent_lesson_completed_notifications
  AFTER INSERT ON public.lesson_progress
  FOR EACH ROW EXECUTE FUNCTION public.trg_notify_parents_lesson_completed();

-- 3. Extend Quiz Attempt Graded trigger to notify parents as well
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

    -- Student Notification
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

    -- Parent Notification
    PERFORM public.notify_parents_of_student(
      NEW.user_id,
      'parent_quiz_graded',
      'نتيجة اختبار جديد',
      'حصل على نتيجة ' || COALESCE(NEW.percentage::text, '0') || '% (' || v_outcome || ') في اختبار (' || COALESCE(v_quiz_title, '') || ').',
      jsonb_build_object('attempt_id', NEW.id, 'score', NEW.percentage, 'passed', NEW.passed),
      '/parent?studentId=' || NEW.user_id,
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

-- 4. Extend Assignment Submission Events trigger to notify parents as well
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

    -- Student Notification
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

    -- Parent Notification
    PERFORM public.notify_parents_of_student(
      NEW.user_id,
      'parent_assignment_graded',
      'نتيجة تقييم واجب',
      'حصل على نتيجة (' || v_outcome || ') بدرجة ' || COALESCE(NEW.grade::text, '0') || ' في واجب (' || COALESCE(v_asg_title, '') || ').',
      jsonb_build_object('submission_id', NEW.id, 'outcome', NEW.outcome, 'grade', NEW.grade),
      '/parent?studentId=' || NEW.user_id,
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

-- 5. Extend Badge Earned trigger to notify parents as well
CREATE OR REPLACE FUNCTION public.trg_notify_badge_earned()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_badge_name text;
BEGIN
  SELECT name INTO v_badge_name FROM public.badges WHERE id = NEW.badge_id;

  -- Student Notification
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

  -- Parent Notification
  PERFORM public.notify_parents_of_student(
    NEW.student_id,
    'parent_badge_earned',
    'وسام جديد للطالب',
    'حصل على وسام جديد (' || COALESCE(v_badge_name, 'إنجاز') || ') تقديرًا لتفوقه وإنجازاته.',
    jsonb_build_object('badge_id', NEW.badge_id, 'badge_name', v_badge_name),
    '/parent?studentId=' || NEW.student_id,
    'badge',
    NEW.badge_id
  );

  RETURN NEW;
END;
$$;

-- 6. Extend Level Up & Leaderboard Top 10 helper to notify parents on Top 10 / #1 crossing
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
    UPDATE public.profiles SET last_notified_level_id = v_current_lvl.id WHERE id = _user_id;

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
    IF v_rank <= 10 AND (v_prof.last_notified_leaderboard_rank IS NULL OR v_prof.last_notified_leaderboard_rank > 10) THEN
      -- Student Notification
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

      -- Parent Notification
      PERFORM public.notify_parents_of_student(
        _user_id,
        'parent_leaderboard_top10',
        'تفوق واستحقاق في قائمة الأوائل',
        'وصل إلى المرتبة #' || v_rank || ' في قائمة المتصدرين على مستوى المنصة!',
        jsonb_build_object('rank', v_rank, 'points', v_points),
        '/parent?studentId=' || _user_id,
        'leaderboard',
        _user_id
      );
    END IF;

    UPDATE public.profiles SET last_notified_leaderboard_rank = v_rank WHERE id = _user_id;
  END IF;
END;
$$;

-- 7. Extend Enrollment Created trigger to notify parents on course purchase
CREATE OR REPLACE FUNCTION public.trg_notify_on_enrollment_created()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_title text;
BEGIN
  SELECT title INTO v_title FROM public.courses WHERE id = NEW.course_id;

  -- Student Notification
  PERFORM public.create_notification(
    NEW.user_id,
    'course_purchased',
    'تم تفعيل اشتراكك في الكورس بنجاح',
    'مبروك! تم تسجيلك في كورس: ' || COALESCE(v_title, '') || '. يمكنك البدء بالدراسة فوراً.',
    jsonb_build_object('course_id', NEW.course_id, 'course_title', v_title),
    '/courses/' || NEW.course_id,
    'course',
    NEW.course_id
  );

  -- Parent Notification
  PERFORM public.notify_parents_of_student(
    NEW.user_id,
    'parent_course_purchased',
    'اشتراك جديد في كورس',
    'تم تفعيل اشتراك جديد في كورس (' || COALESCE(v_title, '') || ').',
    jsonb_build_object('course_id', NEW.course_id, 'course_title', v_title),
    '/parent?studentId=' || NEW.user_id,
    'course',
    NEW.course_id
  );

  RETURN NEW;
END;
$$;

-- 8. Extend Bundle Purchased trigger to notify parents on bundle purchase
CREATE OR REPLACE FUNCTION public.trg_notify_on_bundle_purchased()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_title text;
BEGIN
  SELECT title INTO v_title FROM public.bundles WHERE id = NEW.bundle_id;

  -- Student Notification
  PERFORM public.create_notification(
    NEW.user_id,
    'bundle_purchased',
    'تم تفعيل اشتراكك في الباقة بنجاح',
    'مبروك! تم تفعيل اشتراكك في باقة: ' || COALESCE(v_title, '') || '. تم تفعيل كل الكورسات المندرجة تحت الباقة.',
    jsonb_build_object('bundle_id', NEW.bundle_id, 'bundle_title', v_title),
    '/dashboard',
    'bundle',
    NEW.bundle_id
  );

  -- Parent Notification
  PERFORM public.notify_parents_of_student(
    NEW.user_id,
    'parent_bundle_purchased',
    'اشتراك جديد في باقة تعليمية',
    'تم تفعيل اشتراك جديد في باقة (' || COALESCE(v_title, '') || ').',
    jsonb_build_object('bundle_id', NEW.bundle_id, 'bundle_title', v_title),
    '/parent?studentId=' || NEW.user_id,
    'bundle',
    NEW.bundle_id
  );

  RETURN NEW;
END;
$$;

-- 9. Extend Wallet Transaction trigger to notify parents on wallet top-up / adjustments
CREATE OR REPLACE FUNCTION public.trg_notify_on_wallet_transaction()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Student Notification
  IF NEW.transaction_type IN ('credit', 'debit', 'admin_adjustment', 'topup_card', 'refund') THEN
    PERFORM public.create_notification(
      NEW.user_id,
      'wallet_transaction',
      'تحديث في رصيد محفظتك',
      'تم إجراء معاملة على محفظتك بقيمة ' || (NEW.amount_piastres/100)::text || ' ج.م.',
      jsonb_build_object('transaction_id', NEW.id, 'amount', NEW.amount_piastres, 'type', NEW.transaction_type),
      '/dashboard/wallet',
      'wallet_transaction',
      NEW.id
    );
  END IF;

  -- Parent Notification on Credit / Top-Up / Admin Adjustment
  IF NEW.transaction_type IN ('credit', 'admin_adjustment', 'topup_card') THEN
    PERFORM public.notify_parents_of_student(
      NEW.user_id,
      'parent_wallet_topup',
      'شحن رصيد المحفظة',
      'تم شحن رصيد محفظة الطالب بمقدار ' || (NEW.amount_piastres/100)::text || ' ج.م.',
      jsonb_build_object('transaction_id', NEW.id, 'amount', NEW.amount_piastres),
      '/parent?studentId=' || NEW.user_id,
      'wallet_transaction',
      NEW.id
    );
  END IF;

  RETURN NEW;
END;
$$;
