import { supabase } from '../supabaseClient';

// =========================================================
// جلب بيانات الطالب
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
// ✅ الجديد: جلب الوحدات بناءً على student_unit_access مباشرة
// =========================================================
export const getUnitsWithAccess = async (profile) => {
  if (!profile?.grade_level) return [];

  // 1. جيب كل وحدات الصف
  const { data: units, error } = await supabase
    .from('units')
    .select(`
      *,
      lessons ( id, title, video_url, lesson_pdf_url, exam_pdf_url, homework_pdf_url, description )
    `)
    .eq('grade_level', profile.grade_level)
    .order('term', { ascending: true })
    .order('created_at', { ascending: true });

  if (error) throw error;
  if (!units) return [];

  const isSubscriptionActive = 
    profile.is_active && profile.subscription_status === 'active';

  // 2. لو الاشتراك مش active → كل حاجة مقفولة
  if (!isSubscriptionActive) {
    return units.map((unit) => ({
      ...unit,
      isAccessible: false,
      lessonsCount: unit.lessons?.length || 0,
    }));
  }

  // 3. ✅ جيب الوحدات المتاحة من student_unit_access مباشرة
  const { data: accessData, error: accessError } = await supabase
    .from('student_unit_access')
    .select('unit_id')
    .eq('student_id', profile.id);

  if (accessError) throw accessError;

  const accessibleUnitIds = new Set((accessData || []).map((a) => a.unit_id));

  // 4. ✅ في حالة custom_lessons، الوحدة تكون متاحة لو فيها أي درس متاح
  let accessibleLessonsByUnit = new Map();
  if (profile.access_mode === 'custom_lessons') {
    const { data: lessonAccess } = await supabase
      .from('student_lesson_access')
      .select('lesson_id, lessons(unit_id)')
      .eq('student_id', profile.id);

    (lessonAccess || []).forEach((row) => {
      const unitId = row.lessons?.unit_id;
      if (unitId) {
        if (!accessibleLessonsByUnit.has(unitId)) {
          accessibleLessonsByUnit.set(unitId, new Set());
        }
        accessibleLessonsByUnit.get(unitId).add(row.lesson_id);
      }
    });
  }

  // 5. حدد الـ accessibility
  return units.map((unit) => {
    let isAccessible = false;

    if (profile.access_mode === 'custom_lessons') {
      // متاحة لو فيها درس واحد على الأقل متاح
      isAccessible = accessibleLessonsByUnit.has(unit.id);
    } else {
      isAccessible = accessibleUnitIds.has(unit.id);
    }

    return {
      ...unit,
      isAccessible,
      lessonsCount: unit.lessons?.length || 0,
    };
  });
};

// =========================================================
// ✅ جلب دروس الوحدة (محدّث)
// =========================================================
export const getLessonsWithAccess = async (unitId, profile) => {
  const { data: lessons, error } = await supabase
    .from('lessons')
    .select('*')
    .eq('unit_id', unitId)
    .order('created_at', { ascending: true });

  if (error) throw error;
  if (!lessons) return [];

  const isSubscriptionActive =
    profile.is_active && profile.subscription_status === 'active';

  if (!isSubscriptionActive) {
    return lessons.map((lesson) => ({ ...lesson, isAccessible: false }));
  }

  // لو الـ mode = custom_lessons → اقرأ من student_lesson_access
  if (profile.access_mode === 'custom_lessons') {
    const { data: accessData } = await supabase
      .from('student_lesson_access')
      .select('lesson_id')
      .eq('student_id', profile.id);

    const accessibleIds = new Set((accessData || []).map((a) => a.lesson_id));

    return lessons.map((lesson) => ({
      ...lesson,
      isAccessible: accessibleIds.has(lesson.id),
    }));
  }

  // باقي الأنواع: تحقق إن الوحدة نفسها متاحة في student_unit_access
  const { data: unitAccess } = await supabase
    .from('student_unit_access')
    .select('unit_id')
    .eq('student_id', profile.id)
    .eq('unit_id', Number(unitId))
    .maybeSingle();

  const unitIsAccessible = !!unitAccess;

  return lessons.map((lesson) => ({
    ...lesson,
    isAccessible: unitIsAccessible,
  }));
};

// =========================================================
// ✅ جلب الامتحانات (محدّث)
// =========================================================
export const getStudentExams = async (profile) => {
  if (!profile?.grade_level) return [];

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

  const isSubscriptionActive =
    profile.is_active && profile.subscription_status === 'active';

  if (!isSubscriptionActive) {
    return data.map((exam) => ({
      ...exam,
      isAccessible: false,
      questionsCount: exam.exam_questions?.length || 0,
    }));
  }

  // جيب الوحدات والدروس المتاحة
  const [unitAccessRes, lessonAccessRes] = await Promise.all([
    supabase.from('student_unit_access').select('unit_id').eq('student_id', profile.id),
    supabase.from('student_lesson_access').select('lesson_id').eq('student_id', profile.id),
  ]);

  const accessibleUnitIds = new Set((unitAccessRes.data || []).map((a) => a.unit_id));
  const accessibleLessonIds = new Set((lessonAccessRes.data || []).map((a) => a.lesson_id));

  return data.map((exam) => {
    let accessible = false;

    // فلترة حسب الصف
    const matchesGrade = exam.grade_level === null || exam.grade_level === Number(profile.grade_level);
    if (!matchesGrade) {
      return {
        ...exam,
        isAccessible: false,
        questionsCount: exam.exam_questions?.length || 0,
      };
    }

    // امتحان درس → تحقق من الدرس
    if (exam.scope_type === 'lesson' && exam.lesson_id) {
      // متاح لو الدرس متاح أو الوحدة بتاعته متاحة
      accessible = accessibleLessonIds.has(exam.lesson_id) ||
        (exam.units?.id && accessibleUnitIds.has(exam.units.id));
    }
    // امتحان وحدة → تحقق من الوحدة
    else if (exam.scope_type === 'unit' && exam.unit_id) {
      accessible = accessibleUnitIds.has(exam.unit_id);
    }
    // امتحان ترم → تحقق إن الطالب عنده وحدة من الترم ده
    else if (exam.scope_type === 'term') {
      accessible = profile.access_mode === 'full_grade' && 
        (profile.subscription_type === 'yearly' || 
         (profile.subscription_type === 'term'));
    }
    // امتحان سنوي
    else if (exam.scope_type === 'yearly') {
      accessible = profile.subscription_type === 'yearly' && 
        profile.access_mode === 'full_grade';
    }

    return {
      ...exam,
      isAccessible: accessible,
      questionsCount: exam.exam_questions?.length || 0,
    };
  });
};

// =========================================================
// باقي الـ functions زي ما هي
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

  const sortedQuestions = (data.exam_questions || [])
    .sort((a, b) => a.sort_order - b.sort_order)
    .map((q) => ({
      ...q,
      exam_question_options: (q.exam_question_options || [])
        .sort((a, b) => a.sort_order - b.sort_order)
        .map(({ is_correct: _hidden, ...rest }) => rest),
    }));

  return { ...data, exam_questions: sortedQuestions };
};

export const checkExamAttempt = async (examId, studentId) => {
  const { data, error } = await supabase
    .from('student_exam_attempts')
    .select('id, score, submitted_at, total_questions')
    .eq('exam_id', examId)
    .eq('student_id', studentId)
    .maybeSingle();

  if (error) throw error;
  return data;
};

export const submitExamAttempt = async ({ examId, studentId, answers, totalQuestions }) => {
  const { data: options, error } = await supabase
    .from('exam_question_options')
    .select('id, question_id, is_correct')
    .in('question_id', answers.map((a) => a.question_id));

  if (error) throw error;

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

export const getActivePlans = async () => {
  const [plansRes, planUnitsRes, unitsRes] = await Promise.all([
    supabase
      .from('subscription_plans')
      .select('*')
      .eq('is_active', true)
      .order('grade_level', { ascending: true })
      .order('price', { ascending: true }),
    supabase
      .from('plan_units')
      .select('id, plan_id, unit_id'),
    supabase
      .from('units')
      .select('id, title')
  ]);

  if (plansRes.error) throw plansRes.error;
  if (planUnitsRes.error) throw planUnitsRes.error;
  if (unitsRes.error) throw unitsRes.error;

  const plans = plansRes.data || [];
  const units = unitsRes.data || [];
  const unitsById = new Map(units.map((unit) => [unit.id, unit]));

  const planUnitsByPlanId = new Map();
  for (const row of planUnitsRes.data || []) {
    if (!row?.plan_id) continue;
    const existing = planUnitsByPlanId.get(row.plan_id) || [];
    existing.push({
      id: row.id,
      plan_id: row.plan_id,
      unit_id: row.unit_id,
      units: unitsById.get(row.unit_id) || null,
    });
    planUnitsByPlanId.set(row.plan_id, existing);
  }

  return plans.map((plan) => ({
    ...plan,
    plan_units: planUnitsByPlanId.get(plan.id) || [],
  }));
};