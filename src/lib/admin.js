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
  const { data, error } = await supabase
    .from('subscription_plans')
    .select(`
      *,
      plan_units (
        id,
        unit_id,
        units ( id, title, term, is_final_review )
      )
    `)
    .order('grade_level', { ascending: true })
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data || [];
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

// ربط الوحدات بالباقة (يمسح القديم ويحط الجديد)
export const setPlanUnits = async (planId, unitIds) => {
  // امسح القديم
  const { error: delError } = await supabase
    .from('plan_units')
    .delete()
    .eq('plan_id', planId);
  if (delError) throw delError;

  if (!unitIds || unitIds.length === 0) return;

  // حط الجديد
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

// إدارة الأسئلة
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

// إدارة الاختيارات
export const saveQuestionOptions = async (questionId, options) => {
  // امسح القديم
  await supabase
    .from('exam_question_options')
    .delete()
    .eq('question_id', questionId);

  // حط الجديد
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