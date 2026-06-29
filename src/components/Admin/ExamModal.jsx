import { useEffect, useMemo, useState } from 'react';
import { X, Save } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { createExam, updateExam } from '../../lib/admin';
import { useToast } from '../shared/ToastProvider';

const SCOPES = [
  { value: 'lesson', label: 'امتحان على درس واحد' },
  { value: 'unit', label: 'امتحان على وحدة كاملة' },
  { value: 'term', label: 'امتحان شامل على ترم' },
  { value: 'yearly', label: 'امتحان سنوي شامل' },
];

const ExamModal = ({ open, exam, units, lessons, onClose, onSaved }) => {
  const [form, setForm] = useState({
    title: '',
    description: '',
    scope_type: 'lesson',
    lesson_id: '',
    unit_id: '',
    grade_level: 1,
    term: 1,
    duration_minutes: '',
    is_final_review: false,
    is_published: false,
  });
  const [loading, setLoading] = useState(false);
  const { showToast } = useToast();

  useEffect(() => {
    if (open) {
      if (exam) {
        setForm({
          title: exam.title || '',
          description: exam.description || '',
          scope_type: exam.scope_type || 'lesson',
          lesson_id: exam.lesson_id || '',
          unit_id: exam.unit_id || '',
          grade_level: exam.grade_level || 1,
          term: exam.term || 1,
          duration_minutes: exam.duration_minutes || '',
          is_final_review: exam.is_final_review || false,
          is_published: exam.is_published || false,
        });
      } else {
        setForm({
          title: '', description: '', scope_type: 'lesson',
          lesson_id: '', unit_id: '', grade_level: 1, term: 1,
          duration_minutes: '', is_final_review: false, is_published: false,
        });
      }
    }
  }, [exam, open]);

  const handleChange = (key, value) => setForm((p) => ({ ...p, [key]: value }));

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.title.trim()) {
      showToast({ type: 'error', title: 'العنوان مطلوب' });
      return;
    }

    // التحقق من الحقول حسب النوع
    if (form.scope_type === 'lesson' && !form.lesson_id) {
      showToast({ type: 'error', title: 'اختر الدرس' });
      return;
    }
    if (form.scope_type === 'unit' && !form.unit_id) {
      showToast({ type: 'error', title: 'اختر الوحدة' });
      return;
    }
    if (form.scope_type === 'term' && (!form.grade_level || !form.term)) {
      showToast({ type: 'error', title: 'اختر الصف والترم' });
      return;
    }
    if (form.scope_type === 'yearly' && !form.grade_level) {
      showToast({ type: 'error', title: 'اختر الصف الدراسي' });
      return;
    }

    // تحضير الـ payload بناءً على النوع
    const payload = {
      title: form.title.trim(),
      description: form.description.trim() || null,
      scope_type: form.scope_type,
      duration_minutes: form.duration_minutes ? Number(form.duration_minutes) : null,
      is_final_review: form.is_final_review,
      is_published: form.is_published,
      lesson_id: form.scope_type === 'lesson' ? Number(form.lesson_id) : null,
      unit_id: ['lesson', 'unit'].includes(form.scope_type)
        ? (form.scope_type === 'unit' ? Number(form.unit_id) : null)
        : null,
      grade_level: ['term', 'yearly'].includes(form.scope_type) ? Number(form.grade_level) : null,
      term: form.scope_type === 'term' ? Number(form.term) : null,
    };

    // لو النوع درس، خد الـ unit_id من الدرس نفسه
    if (form.scope_type === 'lesson' && form.lesson_id) {
      const selectedLesson = lessons?.find((l) => l.id === Number(form.lesson_id));
      if (selectedLesson) payload.unit_id = selectedLesson.unit_id;
    }

    try {
      setLoading(true);
      if (exam) {
        await updateExam(exam.id, payload);
        showToast({ type: 'success', title: 'تم تعديل الامتحان' });
      } else {
        await createExam(payload);
        showToast({ type: 'success', title: 'تم إنشاء الامتحان', message: 'الآن أضف الأسئلة' });
      }
      onSaved();
    } catch (error) {
      showToast({ type: 'error', title: 'خطأ', message: error.message });
    } finally {
      setLoading(false);
    }
  };

  // فلترة الدروس حسب الصف لو احتجنا
  const availableLessons = useMemo(() => lessons || [], [lessons]);
  const availableUnits = useMemo(() => units || [], [units]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm px-4 py-8 overflow-y-auto"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            onClick={(e) => e.stopPropagation()}
            dir="rtl"
            className="relative w-full max-w-3xl my-auto rounded-3xl border border-[#D4AF37]/15 bg-gradient-to-b from-[#0E1422] to-[#070A12] shadow-2xl"
          >
            <div className="flex items-center justify-between border-b border-white/10 px-6 py-5">
              <button onClick={onClose} className="rounded-xl p-2 text-gray-400 hover:bg-white/5 hover:text-white">
                <X size={20} />
              </button>
              <h3 className="text-xl font-bold text-white">
                {exam ? 'تعديل الامتحان' : 'إضافة امتحان جديد'}
              </h3>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5 p-6">
              {/* العنوان */}
              <div>
                <label className="mb-2 block text-sm text-gray-300">عنوان الامتحان</label>
                <input
                  type="text"
                  required
                  value={form.title}
                  onChange={(e) => handleChange('title', e.target.value)}
                  placeholder="مثال: امتحان شامل على الوحدة الأولى"
                  className="w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-white outline-none focus:border-[#D4AF37]/40"
                />
              </div>

              {/* النوع */}
              <div>
                <label className="mb-2 block text-sm text-gray-300">نوع الامتحان</label>
                <select
                  value={form.scope_type}
                  onChange={(e) => handleChange('scope_type', e.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-white outline-none focus:border-[#D4AF37]/40"
                >
                  {SCOPES.map((s) => (
                    <option key={s.value} value={s.value} className="bg-[#0B1120]">{s.label}</option>
                  ))}
                </select>
              </div>

              {/* الحقول الشرطية */}
              {form.scope_type === 'lesson' && (
                <div>
                  <label className="mb-2 block text-sm text-gray-300">الدرس</label>
                  <select
                    value={form.lesson_id}
                    onChange={(e) => handleChange('lesson_id', e.target.value)}
                    className="w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-white outline-none focus:border-[#D4AF37]/40"
                  >
                    <option value="" className="bg-[#0B1120]">اختر الدرس</option>
                    {availableLessons.map((l) => (
                      <option key={l.id} value={l.id} className="bg-[#0B1120]">
                        {l.title} {l.units?.title ? `(${l.units.title})` : ''}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {form.scope_type === 'unit' && (
                <div>
                  <label className="mb-2 block text-sm text-gray-300">الوحدة</label>
                  <select
                    value={form.unit_id}
                    onChange={(e) => handleChange('unit_id', e.target.value)}
                    className="w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-white outline-none focus:border-[#D4AF37]/40"
                  >
                    <option value="" className="bg-[#0B1120]">اختر الوحدة</option>
                    {availableUnits.map((u) => (
                      <option key={u.id} value={u.id} className="bg-[#0B1120]">
                        {u.title} (الصف {u.grade_level})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {(form.scope_type === 'term' || form.scope_type === 'yearly') && (
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div>
                    <label className="mb-2 block text-sm text-gray-300">الصف الدراسي</label>
                    <select
                      value={form.grade_level}
                      onChange={(e) => handleChange('grade_level', e.target.value)}
                      className="w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-white outline-none focus:border-[#D4AF37]/40"
                    >
                      <option value={1} className="bg-[#0B1120]">الصف الأول الثانوي</option>
                      <option value={2} className="bg-[#0B1120]">الصف الثاني الثانوي</option>
                      <option value={3} className="bg-[#0B1120]">الصف الثالث الثانوي</option>
                    </select>
                  </div>

                  {form.scope_type === 'term' && (
                    <div>
                      <label className="mb-2 block text-sm text-gray-300">الترم</label>
                      <select
                        value={form.term}
                        onChange={(e) => handleChange('term', e.target.value)}
                        className="w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-white outline-none focus:border-[#D4AF37]/40"
                      >
                        <option value={1} className="bg-[#0B1120]">الترم الأول</option>
                        <option value={2} className="bg-[#0B1120]">الترم الثاني</option>
                      </select>
                    </div>
                  )}
                </div>
              )}

              {/* المدة */}
              <div>
                <label className="mb-2 block text-sm text-gray-300">المدة (بالدقائق - اختياري)</label>
                <input
                  type="number"
                  min="0"
                  value={form.duration_minutes}
                  onChange={(e) => handleChange('duration_minutes', e.target.value)}
                  placeholder="مثال: 60"
                  className="w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-white outline-none focus:border-[#D4AF37]/40"
                />
              </div>

              {/* الوصف */}
              <div>
                <label className="mb-2 block text-sm text-gray-300">الوصف (اختياري)</label>
                <textarea
                  rows="2"
                  value={form.description}
                  onChange={(e) => handleChange('description', e.target.value)}
                  placeholder="تعليمات أو وصف الامتحان"
                  className="w-full resize-none rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-white outline-none focus:border-[#D4AF37]/40"
                />
              </div>

              {/* خيارات */}
              <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                <label className="flex cursor-pointer items-center justify-between rounded-xl border border-white/10 bg-black/20 p-3">
                  <input
                    type="checkbox"
                    checked={form.is_published}
                    onChange={(e) => handleChange('is_published', e.target.checked)}
                    className="h-5 w-5 accent-[#D4AF37]"
                  />
                  <span className="text-sm text-white">نشر الامتحان للطلاب</span>
                </label>

                <label className="flex cursor-pointer items-center justify-between rounded-xl border border-white/10 bg-black/20 p-3">
                  <input
                    type="checkbox"
                    checked={form.is_final_review}
                    onChange={(e) => handleChange('is_final_review', e.target.checked)}
                    className="h-5 w-5 accent-[#D4AF37]"
                  />
                  <span className="text-sm text-white">امتحان مراجعة نهائية</span>
                </label>
              </div>

              {/* أزرار */}
              <div className="flex items-center justify-end gap-3 border-t border-white/10 pt-5">
                <button
                  type="button"
                  onClick={onClose}
                  className="rounded-xl border border-white/10 px-5 py-2.5 text-sm font-medium text-gray-300 hover:bg-white/5"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#D4AF37] to-[#AA7C11] px-6 py-2.5 text-sm font-bold text-black hover:opacity-90 disabled:opacity-60"
                >
                  <Save size={16} />
                  {loading ? 'جارٍ الحفظ...' : 'حفظ الامتحان'}
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ExamModal;