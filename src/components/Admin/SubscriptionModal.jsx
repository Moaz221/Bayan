import { useEffect, useState, useMemo } from 'react';
import { X, Save, CreditCard, Calendar, Shield, FileText, ToggleRight, BookOpen, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { getUnitsByGrade, getLessonsByUnits, getStudentUnitAccess, getStudentLessonAccess } from '../../lib/admin';
import { useToast } from '../shared/ToastProvider';
import { GRADE_OPTIONS } from '../../lib/gradeOptions';

const SUBSCRIPTION_TYPES = [
  { value: '', label: 'بدون تحديد' },
  { value: 'monthly', label: 'شهري' },
  { value: 'term', label: 'ترم' },
  { value: 'yearly', label: 'سنوي' },
  { value: 'final_review', label: 'مراجعة نهائية' },
];

const SUBSCRIPTION_STATUSES = [
  { value: 'pending', label: 'قيد الانتظار' },
  { value: 'active', label: 'نشط' },
  { value: 'expired', label: 'منتهي' },
  { value: 'cancelled', label: 'ملغي' },
];

const ACCESS_MODES = [
  { value: 'full_grade', label: 'الصف كامل', desc: 'الوصول لكل وحدات الصف' },
  { value: 'final_review_only', label: 'مراجعة نهائية فقط', desc: 'وحدات المراجعة فقط' },
  { value: 'custom_units', label: 'وحدات مخصصة', desc: 'اختر وحدات معينة' },
  { value: 'custom_lessons', label: 'دروس مخصصة', desc: 'اختر دروس معينة' },
];

const TERM_LABELS = { 1: 'الترم الأول', 2: 'الترم الثاني' };

const SubscriptionModal = ({ open, student, loading, onClose, onSave }) => {
  const [form, setForm] = useState({
    grade_level: '',
    is_active: false,
    subscription_type: '',
    subscription_status: 'pending',
    subscription_start: '',
    subscription_end: '',
    access_mode: 'full_grade',
    term: '',
    notes: '',
    selected_unit_ids: [],
    selected_lesson_ids: [],
  });

  const [allUnits, setAllUnits] = useState([]);
  const [allLessons, setAllLessons] = useState([]);
  const [loadingUnits, setLoadingUnits] = useState(false);
  const { showToast } = useToast();

  // تحميل البيانات لما الـ Modal يفتح
  useEffect(() => {
    if (!student || !open) return;

    const loadData = async () => {
      try {
        setLoadingUnits(true);

        const [currentUnitIds, currentLessonIds] = await Promise.all([
          getStudentUnitAccess(student.id),
          getStudentLessonAccess(student.id),
        ]);

        const gradeLevel = student.grade_level || '';

        setForm({
          grade_level: gradeLevel,
          is_active: !!student.is_active,
          subscription_type: student.subscription_type || '',
          subscription_status: student.subscription_status || 'pending',
          subscription_start: student.subscription_start || '',
          subscription_end: student.subscription_end || '',
          access_mode: student.access_mode || 'full_grade',
          term: '',
          notes: student.notes || '',
          selected_unit_ids: currentUnitIds,
          selected_lesson_ids: currentLessonIds,
        });

        if (gradeLevel) {
          const units = await getUnitsByGrade(gradeLevel);
          setAllUnits(units);
          const unitIds = units.map(u => u.id);
          if (unitIds.length > 0) {
            const lessons = await getLessonsByUnits(unitIds);
            setAllLessons(lessons);
          }
        }
      } catch (err) {
        console.error('Error loading subscription data:', err);
        showToast({ type: 'error', title: 'خطأ', message: 'فشل في تحميل البيانات' });
      } finally {
        setLoadingUnits(false);
      }
    };

    loadData();
  }, [student, open]);

  // لما الـ grade_level يتغير من الـ select، حمّل الوحدات الجديدة
  const handleGradeChange = async (value) => {
    setForm(prev => ({ ...prev, grade_level: value, selected_unit_ids: [], selected_lesson_ids: [] }));
    if (!value) {
      setAllUnits([]);
      setAllLessons([]);
      return;
    }
    try {
      setLoadingUnits(true);
      const units = await getUnitsByGrade(value);
      setAllUnits(units);
      const unitIds = units.map(u => u.id);
      if (unitIds.length > 0) {
        const lessons = await getLessonsByUnits(unitIds);
        setAllLessons(lessons);
      } else {
        setAllLessons([]);
      }
    } catch (err) {
      showToast({ type: 'error', title: 'خطأ', message: 'فشل في تحميل الوحدات' });
    } finally {
      setLoadingUnits(false);
    }
  };

  const handleChange = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const visibleUnits = useMemo(() => {
    if (form.access_mode === 'final_review_only') {
      return allUnits.filter(u => u.is_final_review);
    }
    if (form.access_mode === 'full_grade' && form.subscription_type === 'term' && form.term) {
      return allUnits.filter(u => !u.is_final_review && String(u.term) === String(form.term));
    }
    if (form.access_mode === 'full_grade') {
      return allUnits.filter(u => !u.is_final_review);
    }
    return allUnits.filter(u => !u.is_final_review);
  }, [allUnits, form.access_mode, form.subscription_type, form.term]);

  const lessonsByUnit = useMemo(() => {
    const grouped = {};
    allLessons.forEach(lesson => {
      if (!grouped[lesson.unit_id]) grouped[lesson.unit_id] = [];
      grouped[lesson.unit_id].push(lesson);
    });
    return grouped;
  }, [allLessons]);

  const previewUnits = useMemo(() => {
    if (form.access_mode === 'custom_units') {
      return allUnits.filter(u => form.selected_unit_ids.includes(u.id));
    }
    if (form.access_mode === 'final_review_only') {
      return allUnits.filter(u => u.is_final_review);
    }
    if (form.access_mode === 'full_grade') {
      if (form.subscription_type === 'term' && form.term) {
        return allUnits.filter(u => !u.is_final_review && String(u.term) === String(form.term));
      }
      return allUnits.filter(u => !u.is_final_review);
    }
    return [];
  }, [form, allUnits]);

  const toggleUnit = (unitId) => {
    setForm(prev => ({
      ...prev,
      selected_unit_ids: prev.selected_unit_ids.includes(unitId)
        ? prev.selected_unit_ids.filter(id => id !== unitId)
        : [...prev.selected_unit_ids, unitId],
    }));
  };

  const toggleLesson = (lessonId) => {
    setForm(prev => ({
      ...prev,
      selected_lesson_ids: prev.selected_lesson_ids.includes(lessonId)
        ? prev.selected_lesson_ids.filter(id => id !== lessonId)
        : [...prev.selected_lesson_ids, lessonId],
    }));
  };

  const selectAllUnits = () => {
    setForm(prev => ({ ...prev, selected_unit_ids: visibleUnits.map(u => u.id) }));
  };

  const clearAllUnits = () => {
    setForm(prev => ({ ...prev, selected_unit_ids: [] }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!form.grade_level) {
      showToast({ type: 'error', title: 'خطأ', message: 'يجب تحديد الصف الدراسي أولاً' });
      return;
    }

    if (form.is_active && form.subscription_status === 'active' && !form.subscription_type) {
      showToast({ type: 'error', title: 'خطأ', message: 'يجب اختيار نوع الاشتراك' });
      return;
    }

    if (form.access_mode === 'custom_units' && form.selected_unit_ids.length === 0) {
      showToast({ type: 'error', title: 'خطأ', message: 'اختر وحدة واحدة على الأقل' });
      return;
    }

    if (form.access_mode === 'custom_lessons' && form.selected_lesson_ids.length === 0) {
      showToast({ type: 'error', title: 'خطأ', message: 'اختر درس واحد على الأقل' });
      return;
    }

    onSave(form);
  };

  if (!open || !student) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] flex items-start justify-center bg-black/80 backdrop-blur-sm px-4 py-8 overflow-y-auto"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, y: 30, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.95 }}
          transition={{ duration: 0.25 }}
          onClick={(e) => e.stopPropagation()}
          dir="rtl"
          className="relative w-full max-w-4xl my-auto rounded-3xl border border-[#D4AF37]/15 bg-gradient-to-b from-[#0E1422] to-[#070A12] shadow-[0_30px_80px_rgba(0,0,0,0.6)]"
        >
          {/* HEADER */}
          <div className="sticky top-0 z-10 flex items-center justify-between border-b border-white/10 bg-[#0E1422]/95 backdrop-blur px-6 py-5 rounded-t-3xl">
            <button onClick={onClose} className="rounded-xl p-2 text-gray-400 transition hover:bg-white/5 hover:text-white">
              <X size={20} />
            </button>
            <div className="flex items-center gap-3 text-right">
              <div>
                <h3 className="text-xl font-bold text-white">إدارة اشتراك الطالب</h3>
                <p className="mt-1 text-sm text-gray-400">
                  {student.full_name}
                  {form.grade_level && (
                    <span className="mr-2 text-[#D4AF37]">
                      — {GRADE_OPTIONS.find(g => String(g.value) === String(form.grade_level))?.label}
                    </span>
                  )}
                </p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#D4AF37]/10 text-[#D4AF37]">
                <CreditCard size={22} />
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5 p-6">

            {/* ══ الصف الدراسي - دايماً ظاهر ══ */}
            <div className="rounded-2xl border border-[#D4AF37]/20 bg-[#D4AF37]/5 p-4">
              <label className="mb-2 flex items-center justify-end gap-2 text-sm font-bold text-[#D4AF37]">
                الصف الدراسي
                <BookOpen size={16} />
              </label>
              <select
                value={form.grade_level}
                onChange={(e) => handleGradeChange(e.target.value)}
                className="w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-white outline-none focus:border-[#D4AF37]/40"
                required
              >
                <option value="" className="bg-[#0B1120]">اختر الصف الدراسي</option>
                {GRADE_OPTIONS.map(g => (
                  <option key={g.value} value={g.value} className="bg-[#0B1120]">{g.label}</option>
                ))}
              </select>
              {!form.grade_level && (
                <p className="mt-2 text-xs text-amber-400">⚠️ يجب تحديد الصف أولاً لتفعيل الاشتراك</p>
              )}
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {/* حالة الحساب */}
              <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                <label className="mb-2 flex items-center justify-end gap-2 text-sm font-medium text-gray-300">
                  حالة الحساب
                  <ToggleRight size={16} className="text-[#D4AF37]" />
                </label>
                <select
                  value={form.is_active ? 'active' : 'inactive'}
                  onChange={(e) => handleChange('is_active', e.target.value === 'active')}
                  className="w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-white outline-none focus:border-[#D4AF37]/40"
                >
                  <option value="active" className="bg-[#0B1120]">مُفعّل</option>
                  <option value="inactive" className="bg-[#0B1120]">غير مُفعّل</option>
                </select>
              </div>

              {/* نوع الاشتراك */}
              <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                <label className="mb-2 flex items-center justify-end gap-2 text-sm font-medium text-gray-300">
                  نوع الاشتراك
                  <CreditCard size={16} className="text-[#D4AF37]" />
                </label>
                <select
                  value={form.subscription_type}
                  onChange={(e) => {
                    const val = e.target.value;
                    handleChange('subscription_type', val);
                    if (val === 'final_review') {
                      handleChange('access_mode', 'final_review_only');
                    } else if (val === 'yearly' || val === 'monthly') {
                      handleChange('access_mode', 'full_grade');
                      handleChange('term', '');
                    }
                  }}
                  className="w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-white outline-none focus:border-[#D4AF37]/40"
                >
                  {SUBSCRIPTION_TYPES.map((item) => (
                    <option key={item.value} value={item.value} className="bg-[#0B1120]">{item.label}</option>
                  ))}
                </select>
              </div>

              {/* الترم */}
              {form.subscription_type === 'term' && (
                <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                  <label className="mb-2 flex items-center justify-end gap-2 text-sm font-medium text-gray-300">
                    الترم
                    <Calendar size={16} className="text-[#D4AF37]" />
                  </label>
                  <select
                    value={form.term}
                    onChange={(e) => handleChange('term', e.target.value)}
                    className="w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-white outline-none focus:border-[#D4AF37]/40"
                  >
                    <option value="" className="bg-[#0B1120]">اختر الترم</option>
                    <option value="1" className="bg-[#0B1120]">الترم الأول</option>
                    <option value="2" className="bg-[#0B1120]">الترم الثاني</option>
                  </select>
                </div>
              )}

              {/* حالة الاشتراك */}
              <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                <label className="mb-2 flex items-center justify-end gap-2 text-sm font-medium text-gray-300">
                  حالة الاشتراك
                  <Shield size={16} className="text-[#D4AF37]" />
                </label>
                <select
                  value={form.subscription_status}
                  onChange={(e) => handleChange('subscription_status', e.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-white outline-none focus:border-[#D4AF37]/40"
                >
                  {SUBSCRIPTION_STATUSES.map((item) => (
                    <option key={item.value} value={item.value} className="bg-[#0B1120]">{item.label}</option>
                  ))}
                </select>
              </div>

              {/* نوع الوصول */}
              <div className="rounded-2xl border border-white/10 bg-black/20 p-4 md:col-span-2">
                <label className="mb-2 flex items-center justify-end gap-2 text-sm font-medium text-gray-300">
                  نوع الوصول للمحتوى
                  <Shield size={16} className="text-[#D4AF37]" />
                </label>
                <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
                  {ACCESS_MODES.map((mode) => (
                    <label
                      key={mode.value}
                      className={`cursor-pointer rounded-xl border p-3 transition ${
                        form.access_mode === mode.value
                          ? 'border-[#D4AF37]/50 bg-[#D4AF37]/10'
                          : 'border-white/10 bg-black/20 hover:border-white/20'
                      }`}
                    >
                      <input
                        type="radio"
                        name="access_mode"
                        value={mode.value}
                        checked={form.access_mode === mode.value}
                        onChange={(e) => handleChange('access_mode', e.target.value)}
                        className="hidden"
                      />
                      <p className="text-sm font-bold text-white">{mode.label}</p>
                      <p className="mt-1 text-xs text-gray-400">{mode.desc}</p>
                    </label>
                  ))}
                </div>
              </div>

              {/* تاريخ بداية */}
              <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                <label className="mb-2 flex items-center justify-end gap-2 text-sm font-medium text-gray-300">
                  تاريخ بداية الاشتراك
                  <Calendar size={16} className="text-[#D4AF37]" />
                </label>
                <input
                  type="date"
                  value={form.subscription_start}
                  onChange={(e) => handleChange('subscription_start', e.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-white outline-none focus:border-[#D4AF37]/40"
                />
              </div>

              {/* تاريخ نهاية */}
              <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                <label className="mb-2 flex items-center justify-end gap-2 text-sm font-medium text-gray-300">
                  تاريخ نهاية الاشتراك
                  <Calendar size={16} className="text-[#D4AF37]" />
                </label>
                <input
                  type="date"
                  value={form.subscription_end}
                  onChange={(e) => handleChange('subscription_end', e.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-white outline-none focus:border-[#D4AF37]/40"
                />
              </div>
            </div>

            {/* اختيار الوحدات المخصصة */}
            {form.access_mode === 'custom_units' && (
              <div className="rounded-2xl border border-[#D4AF37]/20 bg-[#D4AF37]/5 p-4">
                <div className="mb-3 flex items-center justify-between">
                  <div className="flex gap-2">
                    <button type="button" onClick={selectAllUnits} className="rounded-lg bg-emerald-500/10 px-3 py-1.5 text-xs font-bold text-emerald-300 hover:bg-emerald-500/20">تحديد الكل</button>
                    <button type="button" onClick={clearAllUnits} className="rounded-lg bg-red-500/10 px-3 py-1.5 text-xs font-bold text-red-300 hover:bg-red-500/20">إلغاء الكل</button>
                  </div>
                  <label className="flex items-center gap-2 text-sm font-bold text-white">
                    <BookOpen size={16} className="text-[#D4AF37]" />
                    اختر الوحدات ({form.selected_unit_ids.length})
                  </label>
                </div>

                {loadingUnits ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="animate-spin text-[#D4AF37]" size={24} />
                  </div>
                ) : !form.grade_level ? (
                  <p className="py-4 text-center text-sm text-amber-400">حدد الصف الدراسي أولاً</p>
                ) : allUnits.length === 0 ? (
                  <p className="py-4 text-center text-sm text-gray-400">لا توجد وحدات لهذا الصف</p>
                ) : (
                  <div className="grid max-h-72 grid-cols-1 gap-2 overflow-y-auto md:grid-cols-2">
                    {allUnits.map((unit) => (
                      <label
                        key={unit.id}
                        className={`flex cursor-pointer items-center justify-between rounded-xl border p-3 transition ${
                          form.selected_unit_ids.includes(unit.id)
                            ? 'border-[#D4AF37]/50 bg-[#D4AF37]/10'
                            : 'border-white/10 bg-black/20 hover:border-white/20'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={form.selected_unit_ids.includes(unit.id)}
                          onChange={() => toggleUnit(unit.id)}
                          className="h-4 w-4 accent-[#D4AF37]"
                        />
                        <div className="flex-1 text-right">
                          <p className="text-sm font-bold text-white">{unit.title}</p>
                          <p className="mt-1 text-xs text-gray-400">
                            {unit.is_final_review ? 'مراجعة نهائية' : TERM_LABELS[unit.term] || '-'}
                          </p>
                        </div>
                      </label>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* اختيار الدروس المخصصة */}
            {form.access_mode === 'custom_lessons' && (
              <div className="rounded-2xl border border-[#D4AF37]/20 bg-[#D4AF37]/5 p-4">
                <label className="mb-3 flex items-center justify-end gap-2 text-sm font-bold text-white">
                  <BookOpen size={16} className="text-[#D4AF37]" />
                  اختر الدروس ({form.selected_lesson_ids.length})
                </label>

                {loadingUnits ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="animate-spin text-[#D4AF37]" size={24} />
                  </div>
                ) : !form.grade_level ? (
                  <p className="py-4 text-center text-sm text-amber-400">حدد الصف الدراسي أولاً</p>
                ) : allLessons.length === 0 ? (
                  <p className="py-4 text-center text-sm text-gray-400">لا توجد دروس لهذا الصف</p>
                ) : (
                  <div className="max-h-80 space-y-3 overflow-y-auto">
                    {allUnits.map((unit) => {
                      const unitLessons = lessonsByUnit[unit.id] || [];
                      if (unitLessons.length === 0) return null;
                      return (
                        <div key={unit.id} className="rounded-xl border border-white/10 bg-black/20 p-3">
                          <p className="mb-2 text-sm font-bold text-[#D4AF37]">{unit.title}</p>
                          <div className="space-y-1.5">
                            {unitLessons.map((lesson) => (
                              <label key={lesson.id} className="flex cursor-pointer items-center gap-2 rounded-lg p-2 hover:bg-white/5">
                                <input
                                  type="checkbox"
                                  checked={form.selected_lesson_ids.includes(lesson.id)}
                                  onChange={() => toggleLesson(lesson.id)}
                                  className="h-4 w-4 accent-[#D4AF37]"
                                />
                                <span className="flex-1 text-right text-sm text-white">{lesson.title}</span>
                              </label>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* معاينة الوحدات */}
            {(form.access_mode === 'full_grade' || form.access_mode === 'final_review_only') && previewUnits.length > 0 && (
              <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-4">
                <p className="mb-3 text-right text-sm font-bold text-emerald-300">
                  ✓ سيتم تفعيل {previewUnits.length} وحدة للطالب:
                </p>
                <div className="flex flex-wrap gap-2 justify-end">
                  {previewUnits.map((u) => (
                    <span key={u.id} className="rounded-lg bg-emerald-500/10 px-3 py-1 text-xs text-emerald-300">
                      {u.title}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* ملاحظات */}
            <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
              <label className="mb-2 flex items-center justify-end gap-2 text-sm font-medium text-gray-300">
                ملاحظات
                <FileText size={16} className="text-[#D4AF37]" />
              </label>
              <textarea
                rows="3"
                value={form.notes}
                onChange={(e) => handleChange('notes', e.target.value)}
                placeholder="اكتب أي ملاحظات تخص الاشتراك..."
                className="w-full resize-none rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-white outline-none focus:border-[#D4AF37]/40"
              />
            </div>

            {/* FOOTER */}
            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-white/10 pt-5">
              <p className="text-xs text-gray-500">
                💡 الوحدات/الدروس هتتسجل في جدول الـ access تلقائياً
              </p>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="rounded-xl border border-white/10 px-5 py-2.5 text-sm font-medium text-gray-300 transition hover:bg-white/5"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  disabled={loading || !form.grade_level}
                  className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#D4AF37] to-[#AA7C11] px-6 py-2.5 text-sm font-bold text-black transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <Save size={16} />
                  {loading ? 'جارٍ الحفظ...' : 'حفظ التعديلات'}
                </button>
              </div>
            </div>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default SubscriptionModal;