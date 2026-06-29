import { supabase } from '../supabaseClient';

// =========================================================
// جلب بيانات الطالب الكاملة (الاشتراك + الوصول)
// =========================================================

export const getStudentProfile = async (userId) => {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();

  if (error) throw error;
  return data;
};

// =========================================================
// جلب كل الوحدات مع تحديد المتاح والمقفول
// =========================================================

export const getUnitsWithAccess = async (profile) => {
  // جلب كل الوحدات حسب صف الطالب
  const { data: units, error } = await supabase
    .from('units')
    .select(`
      *,
      lessons ( id, title, video_url, lesson_pdf_url, exam_pdf_url, description )
    `)
    .eq('grade_level', profile.grade_level)
    .order('term', { ascending: true })
    .order('created_at', { ascending: true });

  if (error) throw error;
  if (!units) return [];

  // تحديد ما هو متاح بناءً على نوع الاشتراك
  const accessMode = profile.access_mode || 'full_grade';
  const subscriptionType = profile.subscription_type;
  const subscriptionStatus = profile.subscription_status;

  // لو الاشتراك مش active → كل حاجة مقفولة
  const isSubscriptionActive = subscriptionStatus === 'active';

  // جلب الوحدات المخصصة للطالب لو access_mode = custom_units
  let customUnitIds = [];
  if (accessMode === 'custom_units' && isSubscriptionActive) {
    const { data: accessData } = await supabase
      .from('student_unit_access')
      .select('unit_id')
      .eq('student_id', profile.id);
    customUnitIds = (accessData || []).map((a) => a.unit_id);
  }

  // جلب الباقة المرتبطة بالطالب (للشهري خاصة)
  let planUnitIds = [];
  if (subscriptionType === 'monthly' && isSubscriptionActive) {
    const { data: planData } = await supabase
      .from('subscription_plans')
      .select(`
        plan_units ( unit_id )
      `)
      .eq('grade_level', profile.grade_level)
      .eq('plan_type', 'monthly')
      .eq('is_active', true)
      .limit(1)
      .maybeSingle();

    if (planData?.plan_units) {
      planUnitIds = planData.plan_units.map((pu) => pu.unit_id);
    }
  }

  // تحديد هل الوحدة متاحة للطالب
  const isUnitAccessible = (unit) => {
    if (!isSubscriptionActive) return false;

    switch (accessMode) {
      case 'full_grade':
        // الترم/السنوي: كل الوحدات العادية
        if (subscriptionType === 'yearly') return !unit.is_final_review;
        if (subscriptionType === 'term') {
          return !unit.is_final_review && String(unit.term) === String(profile.subscription_term);
        }
        return false;

      case 'final_review_only':
        return unit.is_final_review === true;

      case 'custom_units':
        return customUnitIds.includes(unit.id);

      default:
        if (subscriptionType === 'monthly') return planUnitIds.includes(unit.id);
        return false;
    }
  };

  // تجميع الوحدات مع حالة الوصول
  return units.map((unit) => ({
    ...unit,
    isAccessible: isUnitAccessible(unit),
    lessonsCount: unit.lessons?.length || 0,
  }));
};

// =========================================================
// جلب دروس وحدة معينة مع تحديد المتاح
// =========================================================

export const getLessonsWithAccess = async (unitId, profile) => {
  const { data: lessons, error } = await supabase
    .from('lessons')
    .select('*')
    .eq('unit_id', unitId)
    .order('created_at', { ascending: true });

  if (error) throw error;
  if (!lessons) return [];

  // تحقق من access_mode
  const isCustomLessons = profile.access_mode === 'custom_lessons';
  const isSubscriptionActive = profile.subscription_status === 'active';

  let accessibleLessonIds = [];
  if (isCustomLessons && isSubscriptionActive) {
    const { data: accessData } = await supabase
      .from('student_lesson_access')
      .select('lesson_id')
      .eq('student_id', profile.id);
    accessibleLessonIds = (accessData || []).map((a) => a.lesson_id);
  }

  return lessons.map((lesson) => ({
    ...lesson,
    isAccessible: isCustomLessons
      ? accessibleLessonIds.includes(lesson.id)
      : true, // لو الوحدة متاحة أصلاً → كل دروسها متاحة
  }));
};

// =========================================================
// جلب امتحانات متاحة للطالب
// =========================================================

export const getStudentExams = async (profile) => {
  const { data, error } = await supabase
    .from('exams')
    .select(`
      *,
      units ( id, title, term ),
      lessons ( id, title ),
      exam_questions ( id )
    `)
    .eq('is_published', true)
    .order('created_at', { ascending: false });

  if (error) throw error;
  if (!data) return [];

  const isSubscriptionActive = profile.subscription_status === 'active';
  const subscriptionType = profile.subscription_type;
  const accessMode = profile.access_mode;

  return data.map((exam) => {
    let accessible = false;

    if (!isSubscriptionActive) {
      accessible = false;
    } else if (accessMode === 'final_review_only') {
      accessible = exam.is_final_review === true;
    } else if (subscriptionType === 'yearly') {
      accessible = !exam.is_final_review &&
        (exam.grade_level === null || exam.grade_level === profile.grade_level);
    } else if (subscriptionType === 'term') {
      accessible =
        !exam.is_final_review &&
        (exam.grade_level === null || exam.grade_level === profile.grade_level);
    } else if (subscriptionType === 'monthly') {
      accessible = exam.scope_type === 'lesson' || exam.scope_type === 'unit';
    } else {
      accessible = false;
    }

    return {
      ...exam,
      isAccessible: accessible,
      questionsCount: exam.exam_questions?.length || 0,
    };
  });
};

// =========================================================
// جلب امتحان كامل مع الأسئلة والاختيارات للطالب
// =========================================================

export const getExamForStudent = async (examId) => {
  const { data, error } = await supabase
    .from('exams')
    .select(`
      *,
      exam_questions (
        id, question_text, sort_order,
        exam_question_options ( id, option_text, sort_order )
      )
    `)
    .eq('id', examId)
    .eq('is_published', true)
    .single();

  if (error) throw error;

  // ترتيب الأسئلة والاختيارات (بدون كشف الإجابة الصحيحة!)
  const sortedQuestions = (data.exam_questions || [])
    .sort((a, b) => a.sort_order - b.sort_order)
    .map((q) => ({
      ...q,
      exam_question_options: (q.exam_question_options || [])
        .sort((a, b) => a.sort_order - b.sort_order)
        .map(({ is_correct: _hidden, ...rest }) => rest), // إخفاء الإجابة الصحيحة!
    }));

  return { ...data, exam_questions: sortedQuestions };
};

// =========================================================
// حفظ نتيجة الامتحان (مرة واحدة فقط)
// =========================================================

export const checkExamAttempt = async (examId, studentId) => {
  const { data, error } = await supabase
    .from('student_exam_attempts')
    .select('id, score, submitted_at, total_questions')
    .eq('exam_id', examId)
    .eq('student_id', studentId)
    .maybeSingle();

  if (error) throw error;
  return data; // null = لم يؤدِ بعد
};

export const submitExamAttempt = async ({ examId, studentId, answers, totalQuestions }) => {
  // جلب الإجابات الصحيحة من قاعدة البيانات
  const { data: options, error } = await supabase
    .from('exam_question_options')
    .select('id, question_id, is_correct')
    .in(
      'question_id',
      answers.map((a) => a.question_id)
    );

  if (error) throw error;

  // حساب الدرجة
  let score = 0;
  const detailedAnswers = answers.map((answer) => {
    const correct = options.find(
      (o) => o.question_id === answer.question_id && o.is_correct === true
    );
    const isCorrect = correct?.id === answer.selected_option_id;
    if (isCorrect) score++;
    return {
      ...answer,
      correct_option_id: correct?.id || null,
      is_correct: isCorrect,
    };
  });

  // حفظ المحاولة
  const { data: attempt, error: attemptError } = await supabase
    .from('student_exam_attempts')
    .insert([{
      exam_id: examId,
      student_id: studentId,
      score,
      total_questions: totalQuestions,
      submitted_at: new Date().toISOString(),
      status: 'submitted',
    }])
    .select()
    .single();

  if (attemptError) throw attemptError;

  // حفظ التفاصيل
  if (detailedAnswers.length > 0) {
    await supabase.from('student_exam_answers').insert(
      detailedAnswers.map((a) => ({
        attempt_id: attempt.id,
        question_id: a.question_id,
        selected_option_id: a.selected_option_id,
        correct_option_id: a.correct_option_id,
        is_correct: a.is_correct,
      }))
    );
  }

  return { attempt, score, total: totalQuestions, detailedAnswers };
};

// =========================================================
// جلب الباقات المتاحة (للـ Pricing Page)
// =========================================================

export const getActivePlans = async () => {
  const { data, error } = await supabase
    .from('subscription_plans')
    .select(`
      *,
      plan_units (
        units ( id, title )
      )
    `)
    .eq('is_active', true)
    .order('grade_level', { ascending: true })
    .order('price', { ascending: true });

  if (error) throw error;
  return data || [];
};