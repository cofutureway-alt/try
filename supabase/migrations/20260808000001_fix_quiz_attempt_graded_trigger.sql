-- Migration: Fix quiz attempt graded notification trigger
-- Resolves error: record "new" has no field "is_passed" by using "passed" and "percentage" columns from public.quiz_attempts

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
      'parent_quiz_graded',
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
