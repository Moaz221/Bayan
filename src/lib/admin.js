import { supabase } from '../supabaseClient';

export const getAdminStats = async () => {
  const [profilesRes, unitsRes, lessonsRes] = await Promise.all([
    supabase.from('profiles').select('*', { count: 'exact', head: true }),
    supabase.from('units').select('*', { count: 'exact', head: true }),
    supabase.from('lessons').select('*', { count: 'exact', head: true }),
  ]);

  if (profilesRes.error) throw profilesRes.error;
  if (unitsRes.error) throw unitsRes.error;
  if (lessonsRes.error) throw lessonsRes.error;

  const totalStudentsRes = await supabase
    .from('profiles')
    .select('*', { count: 'exact', head: true })
    .eq('role', 'student');

  const activeStudentsRes = await supabase
    .from('profiles')
    .select('*', { count: 'exact', head: true })
    .eq('role', 'student')
    .eq('is_active', true);

  if (totalStudentsRes.error) throw totalStudentsRes.error;
  if (activeStudentsRes.error) throw activeStudentsRes.error;

  return {
    totalStudents: totalStudentsRes.count || 0,
    activeStudents: activeStudentsRes.count || 0,
    totalUnits: unitsRes.count || 0,
    totalLessons: lessonsRes.count || 0,
  };
};

export const getAllStudents = async () => {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data || [];
};

export const toggleStudentActivation = async (userId, currentValue) => {
  const { data, error } = await supabase
    .from('profiles')
    .update({ is_active: !currentValue })
    .eq('id', userId)
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const makeUserAdmin = async (userId) => {
  const { data, error } = await supabase
    .from('profiles')
    .update({ role: 'admin' })
    .eq('id', userId)
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const getAllUnits = async () => {
  const { data, error } = await supabase
    .from('units')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data || [];
};

export const createUnit = async (payload) => {
  const { data, error } = await supabase
    .from('units')
    .insert([payload])
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const updateUnit = async (unitId, payload) => {
  const { data, error } = await supabase
    .from('units')
    .update(payload)
    .eq('id', unitId)
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const deleteUnit = async (unitId) => {
  const { error } = await supabase
    .from('units')
    .delete()
    .eq('id', unitId);

  if (error) throw error;
};

export const getAllLessons = async () => {
  const { data, error } = await supabase
    .from('lessons')
    .select(`
      *,
      units (
        id,
        title,
        grade_level
      )
    `)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data || [];
};

export const createLesson = async (payload) => {
  const { data, error } = await supabase
    .from('lessons')
    .insert([payload])
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const updateLesson = async (lessonId, payload) => {
  const { data, error } = await supabase
    .from('lessons')
    .update(payload)
    .eq('id', lessonId)
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const deleteLesson = async (lessonId) => {
  const { error } = await supabase
    .from('lessons')
    .delete()
    .eq('id', lessonId);

  if (error) throw error;
};

export const updateStudentSubscription = async (userId, payload) => {
  const { data, error } = await supabase
    .from('profiles')
    .update({
      is_active: payload.is_active,
      subscription_type: payload.subscription_type || null,
      subscription_status: payload.subscription_status || 'pending',
      subscription_start: payload.subscription_start || null,
      subscription_end: payload.subscription_end || null,
      access_mode: payload.access_mode || 'full_grade',
      notes: payload.notes || null,
    })
    .eq('id', userId)
    .select()
    .single();

  if (error) throw error;
  return data;
};

// =========================================================
// SUBSCRIPTION PLANS
// =========================================================

export const getAllPlans = async () => {
  const [plansRes, planUnitsRes, unitsRes] = await Promise.all([
    supabase
      .from('subscription_plans')
      .select('*')
      .order('grade_level', { ascending: true })
      .order('created_at', { ascending: false }),
    supabase
      .from('plan_units')
      .select('id, plan_id, unit_id'),
    supabase
      .from('units')
      .select('id, title, term, is_final_review')
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

export const createPlan = async (payload) => {
  const { data, error } = await supabase
    .from('subscription_plans')
    .insert([{
      name: payload.name,
      grade_level: Number(payload.grade_level),
      plan_type: payload.plan_type,
      term: payload.term ? Number(payload.term) : null,
      price: Number(payload.price) || 0,
      is_active: payload.is_active ?? true,
    }])
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const updatePlan = async (planId, payload) => {
  const { data, error } = await supabase
    .from('subscription_plans')
    .update({
      name: payload.name,
      grade_level: Number(payload.grade_level),
      plan_type: payload.plan_type,
      term: payload.term ? Number(payload.term) : null,
      price: Number(payload.price) || 0,
      is_active: payload.is_active ?? true,
    })
    .eq('id', planId)
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const deletePlan = async (planId) => {
  const { error } = await supabase
    .from('subscription_plans')
    .delete()
    .eq('id', planId);
  if (error) throw error;
};

export const setPlanUnits = async (planId, unitIds) => {
  const { error: delError } = await supabase
    .from('plan_units')
    .delete()
    .eq('plan_id', planId);
  if (delError) throw delError;

  if (!unitIds || unitIds.length === 0) return;

  const rows = unitIds.map((unitId) => ({
    plan_id: planId,
    unit_id: Number(unitId),
  }));

  const { error: insError } = await supabase
    .from('plan_units')
    .insert(rows);
  if (insError) throw insError;
};

// =========================================================
// EXAMS MANAGEMENT
// =========================================================

export const getAllExams = async () => {
  const { data, error } = await supabase
    .from('exams')
    .select(`
      *,
      units ( id, title, grade_level, term, is_final_review ),
      lessons ( id, title ),
      exam_questions (
        id, question_text, sort_order,
        exam_question_options ( id, option_text, is_correct, sort_order )
      )
    `)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data || [];
};

export const getAllExamResults = async () => {
  const { data, error } = await supabase
    .from('student_exam_attempts')
    .select(`
      *,
      exams ( id, title, scope_type, grade_level, term, lesson_id, unit_id ),
      profiles:student_id ( id, full_name, phone, grade_level, subscription_status, is_active )
    `)
    .order('submitted_at', { ascending: false });

  if (error) throw error;
  return (data || []).map((attempt) => ({
    ...attempt,
    student: attempt.profiles || null,
    exam: attempt.exams || null,
  }));
};

export const createExam = async (payload) => {
  const { data, error } = await supabase
    .from('exams')
    .insert([{
      title: payload.title,
      description: payload.description || null,
      scope_type: payload.scope_type,
      lesson_id: payload.lesson_id || null,
      unit_id: payload.unit_id || null,
      term: payload.term || null,
      grade_level: payload.grade_level || null,
      duration_minutes: payload.duration_minutes || null,
      is_final_review: payload.is_final_review || false,
      is_published: payload.is_published ?? false,
    }])
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const updateExam = async (examId, payload) => {
  const { data, error } = await supabase
    .from('exams')
    .update({
      title: payload.title,
      description: payload.description || null,
      scope_type: payload.scope_type,
      lesson_id: payload.lesson_id || null,
      unit_id: payload.unit_id || null,
      term: payload.term || null,
      grade_level: payload.grade_level || null,
      duration_minutes: payload.duration_minutes || null,
      is_final_review: payload.is_final_review || false,
      is_published: payload.is_published ?? false,
    })
    .eq('id', examId)
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const deleteExam = async (examId) => {
  const { error } = await supabase.rpc('admin_delete_exam', {
    p_exam_id: Number(examId),
  });
  if (error) throw error;
};

export const createQuestion = async (examId, questionText, sortOrder) => {
  const { data, error } = await supabase
    .from('exam_questions')
    .insert([{
      exam_id: examId,
      question_text: questionText,
      sort_order: sortOrder || 0,
    }])
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const updateQuestion = async (questionId, questionText) => {
  const { data, error } = await supabase
    .from('exam_questions')
    .update({ question_text: questionText })
    .eq('id', questionId)
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const deleteQuestion = async (questionId) => {
  const { error } = await supabase
    .from('exam_questions')
    .delete()
    .eq('id', questionId);
  if (error) throw error;
};

export const saveQuestionOptions = async (questionId, options) => {
  await supabase
    .from('exam_question_options')
    .delete()
    .eq('question_id', questionId);

  const rows = options.map((opt, idx) => ({
    question_id: questionId,
    option_text: opt.option_text,
    is_correct: opt.is_correct,
    sort_order: idx,
  }));

  const { data, error } = await supabase
    .from('exam_question_options')
    .insert(rows)
    .select();

  if (error) throw error;
  return data;
};

// =========================================================
// STUDENT ACCESS MANAGEMENT
// =========================================================

export const getUnitsByGrade = async (gradeLevel) => {
  const { data, error } = await supabase
    .from('units')
    .select('*')
    .eq('grade_level', Number(gradeLevel))
    .order('term', { ascending: true })
    .order('created_at', { ascending: true });

  if (error) throw error;
  return data || [];
};

export const getLessonsByUnits = async (unitIds) => {
  if (!unitIds || unitIds.length === 0) return [];

  const { data, error } = await supabase
    .from('lessons')
    .select('*, units(id, title, grade_level, term)')
    .in('unit_id', unitIds)
    .order('created_at', { ascending: true });

  if (error) throw error;
  return data || [];
};

export const getStudentUnitAccess = async (studentId) => {
  const { data, error } = await supabase
    .from('student_unit_access')
    .select('unit_id')
    .eq('student_id', studentId);

  if (error) throw error;
  return (data || []).map(r => r.unit_id);
};

export const getStudentLessonAccess = async (studentId) => {
  const { data, error } = await supabase
    .from('student_lesson_access')
    .select('lesson_id')
    .eq('student_id', studentId);

  if (error) throw error;
  return (data || []).map(r => r.lesson_id);
};

export const setStudentUnitAccess = async (studentId, unitIds) => {
  const { error: delError } = await supabase
    .from('student_unit_access')
    .delete()
    .eq('student_id', studentId);
  if (delError) throw delError;

  if (!unitIds || unitIds.length === 0) return;

  const rows = unitIds.map(unitId => ({
    student_id: studentId,
    unit_id: Number(unitId),
  }));

  const { error: insError } = await supabase
    .from('student_unit_access')
    .insert(rows);
  if (insError) throw insError;
};

export const setStudentLessonAccess = async (studentId, lessonIds) => {
  const { error: delError } = await supabase
    .from('student_lesson_access')
    .delete()
    .eq('student_id', studentId);
  if (delError) throw delError;

  if (!lessonIds || lessonIds.length === 0) return;

  const rows = lessonIds.map(lessonId => ({
    student_id: studentId,
    lesson_id: Number(lessonId),
  }));

  const { error: insError } = await supabase
    .from('student_lesson_access')
    .insert(rows);
  if (insError) throw insError;
};

// =========================================================
// updateStudentSubscriptionFull — النسخة المصلحة
// =========================================================

export const updateStudentSubscriptionFull = async (userId, payload) => {

  // ══ STEP 1: الـ grade_level بييجي من الـ payload مباشرة ══
  // لأن الـ SubscriptionModal دلوقتي بيبعته دايماً في الـ form
  const gradeLevel = payload.grade_level;

  if (!gradeLevel) {
    throw new Error('الطالب ليس لديه صف دراسي محدد!');
  }

  // ══ STEP 2: تحديث الـ profile شامل الـ grade_level ══
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .update({
      grade_level:           Number(gradeLevel),
      is_active:             payload.is_active,
      subscription_type:     payload.subscription_type     || null,
      subscription_status:   payload.subscription_status   || 'pending',
      subscription_start:    payload.subscription_start    || null,
      subscription_end:      payload.subscription_end      || null,
      access_mode:           payload.access_mode           || 'full_grade',
      notes:                 payload.notes                 || null,
    })
    .eq('id', userId)
    .select()
    .single();

  if (profileError) throw profileError;

  // ══ STEP 3: لو الحساب مش مفعّل → امسح الـ access ══
  if (!payload.is_active) {
    await setStudentUnitAccess(userId, []);
    await setStudentLessonAccess(userId, []);
    return profile;
  }

  // ══ STEP 4: لو الاشتراك مش active → امسح الـ access ══
  if (payload.subscription_status !== 'active') {
    await setStudentUnitAccess(userId, []);
    await setStudentLessonAccess(userId, []);
    return profile;
  }

  // ══ STEP 5: تحديد الوحدات بناءً على access_mode ══
  let unitIdsToGrant   = [];
  let lessonIdsToGrant = [];

  if (payload.access_mode === 'full_grade') {
    if (payload.subscription_type === 'term' && payload.term) {
      const { data: termUnits, error } = await supabase
        .from('units')
        .select('id')
        .eq('grade_level', Number(gradeLevel))
        .eq('term', Number(payload.term))
        .eq('is_final_review', false);

      if (error) throw error;
      unitIdsToGrant = (termUnits || []).map(u => u.id);
    } else {
      const { data: allUnits, error } = await supabase
        .from('units')
        .select('id')
        .eq('grade_level', Number(gradeLevel))
        .eq('is_final_review', false);

      if (error) throw error;
      unitIdsToGrant = (allUnits || []).map(u => u.id);
    }
  }
  else if (payload.access_mode === 'final_review_only') {
    const { data: reviewUnits, error } = await supabase
      .from('units')
      .select('id')
      .eq('grade_level', Number(gradeLevel))
      .eq('is_final_review', true);

    if (error) throw error;
    unitIdsToGrant = (reviewUnits || []).map(u => u.id);
  }
  else if (payload.access_mode === 'custom_units') {
    unitIdsToGrant = payload.selected_unit_ids || [];
  }
  else if (payload.access_mode === 'custom_lessons') {
    lessonIdsToGrant = payload.selected_lesson_ids || [];

    // افتح الوحدات المرتبطة بالدروس دي تلقائياً
    if (lessonIdsToGrant.length > 0) {
      const { data: lessonsData, error } = await supabase
        .from('lessons')
        .select('unit_id')
        .in('id', lessonIdsToGrant);

      if (error) throw error;
      unitIdsToGrant = [...new Set((lessonsData || []).map(l => l.unit_id))];
    }
  }

  // ══ STEP 6: احفظ الـ access ══
  await setStudentUnitAccess(userId, unitIdsToGrant);
  await setStudentLessonAccess(userId, lessonIdsToGrant);

  return profile;
};
// =========================================================
// 📊 ADVANCED ANALYTICS
// =========================================================

export const getAdvancedAnalytics = async () => {
  const [profilesRes, unitsRes, lessonsRes, examsRes, plansRes, attemptsRes] = await Promise.all([
    supabase.from('profiles').select('*').eq('role', 'student'),
    supabase.from('units').select('*'),
    supabase.from('lessons').select('*'),
    supabase.from('exams').select('*'),
    supabase.from('subscription_plans').select('*'),
    supabase.from('student_exam_attempts').select('*'),
  ]);

  if (profilesRes.error) throw profilesRes.error;

  const students = profilesRes.data || [];
  const units = unitsRes.data || [];
  const lessons = lessonsRes.data || [];
  const exams = examsRes.data || [];
  const plans = plansRes.data || [];
  const attempts = attemptsRes.data || [];

  const totalStudents = students.length;
  const activeStudents = students.filter(s => s.is_active).length;
  const pendingStudents = students.filter(s => !s.is_active).length;
  const activeSubscriptions = students.filter(s => s.subscription_status === 'active').length;
  const expiredSubscriptions = students.filter(s => s.subscription_status === 'expired').length;

  const byGrade = [1, 2, 3].map(grade => ({
    grade,
    label: ['أولى ثانوي', 'ثانية ثانوي', 'ثالثة ثانوي'][grade - 1],
    total: students.filter(s => s.grade_level === grade).length,
    active: students.filter(s => s.grade_level === grade && s.is_active).length,
    subscribed: students.filter(s => s.grade_level === grade && s.subscription_status === 'active').length,
  }));

  const bySubscriptionType = ['monthly', 'term', 'yearly', 'final_review'].map(type => ({
    type,
    count: students.filter(s => s.subscription_type === type && s.subscription_status === 'active').length,
  }));

  let totalRevenue = 0;
  let monthlyRevenue = 0;
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();

  students.forEach(student => {
    if (student.subscription_status !== 'active' || !student.subscription_type) return;
    
    const matchingPlan = plans.find(
      p => p.plan_type === student.subscription_type 
        && p.grade_level === student.grade_level
        && p.is_active
    );

    if (matchingPlan) {
      totalRevenue += Number(matchingPlan.price) || 0;

      if (student.subscription_start) {
        const startDate = new Date(student.subscription_start);
        if (startDate.getMonth() === currentMonth && startDate.getFullYear() === currentYear) {
          monthlyRevenue += Number(matchingPlan.price) || 0;
        }
      }
    }
  });

  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (6 - i));
    return date.toISOString().split('T')[0];
  });

  const newSubsLast7Days = last7Days.map(day => ({
    day,
    label: new Date(day).toLocaleDateString('ar-EG', { weekday: 'short' }),
    count: students.filter(s => s.created_at?.split('T')[0] === day).length,
  }));

  const expiringSoon = students.filter(s => {
    if (!s.subscription_end || s.subscription_status !== 'active') return false;
    const daysLeft = Math.ceil((new Date(s.subscription_end) - new Date()) / (1000 * 60 * 60 * 24));
    return daysLeft > 0 && daysLeft <= 7;
  }).map(s => ({
    ...s,
    daysLeft: Math.ceil((new Date(s.subscription_end) - new Date()) / (1000 * 60 * 60 * 24)),
  }));

  const recentStudents = [...students]
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
    .slice(0, 5);

  const contentStats = {
    totalUnits: units.length,
    totalLessons: lessons.length,
    totalExams: exams.length,
    publishedExams: exams.filter(e => e.is_published).length,
    finalReviewUnits: units.filter(u => u.is_final_review).length,
    totalPlans: plans.length,
    activePlans: plans.filter(p => p.is_active).length,
  };

  const totalAttempts = attempts.length;
  const avgScore = attempts.length > 0
    ? Math.round((attempts.reduce((sum, a) => sum + (a.score / Math.max(a.total_questions, 1)), 0) / attempts.length) * 100)
    : 0;

  const conversionRate = totalStudents > 0
    ? Math.round((activeSubscriptions / totalStudents) * 100)
    : 0;

  return {
    overview: {
      totalStudents, activeStudents, pendingStudents,
      activeSubscriptions, expiredSubscriptions,
      totalRevenue, monthlyRevenue, conversionRate,
      totalAttempts, avgScore,
    },
    byGrade, bySubscriptionType, newSubsLast7Days,
    expiringSoon, recentStudents, contentStats,
  };
};