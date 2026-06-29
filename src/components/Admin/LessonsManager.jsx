import { useMemo, useState } from 'react';
import { FileText, Link2, Pencil, Play, Search, Trash2, Video } from 'lucide-react';
import AdminSectionCard from './AdminSectionCard';
import EmptyState from '../shared/EmptyState';
import ConfirmModal from '../shared/ConfirmModal';
import { createLesson, deleteLesson, updateLesson } from '../../lib/admin';
import { getGradeLabel } from '../../lib/gradeOptions';
import { useToast } from '../shared/ToastProvider';

const LessonsManager = ({ lessons, units, onRefresh }) => {
  const [form, setForm] = useState({
    unit_id: '', // يبدأ فارغاً لعدم وجود اختيار افتراضي
    title: '',
    video_url: '',
    lesson_pdf_url: '',
    exam_pdf_url: '',
    description: '',
  });

  const [loading, setLoading] = useState(false);
  const [editingLessonId, setEditingLessonId] = useState(null);
  const [deleteState, setDeleteState] = useState({ open: false, lesson: null });
  
  const [search, setSearch] = useState('');
  const [gradeFilter, setGradeFilter] = useState('all');

  // التأكد من أن units مصفوفة صحيحة
  const validUnits = useMemo(() => Array.isArray(units) ? units : [], [units]);
  const { showToast } = useToast();

  const filteredLessons = useMemo(() => {
    return Array.isArray(lessons) ? lessons.filter((lesson) => {
      // التحقق من صحة البيانات قبل الفلترة
      const unitName = lesson.title?.toLowerCase() || '';
      const searchLower = search.toLowerCase();
      const matchesSearch = unitName.includes(searchLower);
      
      const gradeLevel = String(lesson.units?.grade_level || '');
      const matchesGrade = gradeFilter === 'all' ? true : gradeLevel === String(gradeFilter);

      return matchesSearch && matchesGrade;
    }) : [];
  }, [lessons, search, gradeFilter]);

  const resetForm = () => {
    setForm({
      unit_id: '',
      title: '',
      video_url: '',
      lesson_pdf_url: '',
      exam_pdf_url: '',
      description: '',
    });
    setEditingLessonId(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.unit_id) {
      showToast({ type: 'error', title: 'خطأ', message: 'يرجى اختيار الوحدة الدراسية أولاً' });
      return;
    }

    const payload = {
      unit_id: Number(form.unit_id), // تحويل للرقم الصحيح
      title: form.title.trim(),
      video_url: form.video_url.trim() || null,
      lesson_pdf_url: form.lesson_pdf_url.trim() || null,
      exam_pdf_url: form.exam_pdf_url.trim() || null,
      description: form.description.trim() || null,
    };

    try {
      setLoading(true);

      if (editingLessonId) {
        await updateLesson(editingLessonId, payload);
        showToast({ type: 'success', title: 'تم التعديل بنجاح' });
      } else {
        await createLesson(payload);
        showToast({ type: 'success', title: 'تمت إضافة الدرس بنجاح' });
      }

      resetForm();
      await onRefresh();
    } catch (error) {
      console.error("Error saving lesson:", error);
      showToast({ 
        type: 'error', 
        title: 'حدث خطأ', 
        message: error.message || 'فشل في حفظ الدرس. تأكد من صحة البيانات.' 
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (lesson) => {
    setEditingLessonId(lesson.id);
    setForm({
      unit_id: lesson.unit_id ? String(lesson.unit_id) : '',
      title: lesson.title || '',
      video_url: lesson.video_url || '',
      lesson_pdf_url: lesson.lesson_pdf_url || '',
      exam_pdf_url: lesson.exam_pdf_url || '',
      description: lesson.description || '',
    });
  };

  const handleDelete = async () => {
    if (!deleteState.lesson) return;
    try {
      setLoading(true);
      await deleteLesson(deleteState.lesson.id);
      showToast({ type: 'success', title: 'تم الحذف', message: `تم حذف ${deleteState.lesson.title}` });
      setDeleteState({ open: false, lesson: null });
      resetForm();
      await onRefresh();
    } catch (error) {
      showToast({ type: 'error', title: 'خطأ', message: error.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="grid grid-cols-1 gap-5 xl:grid-cols-[450px_1fr]">
        {/* FORM */}
        <AdminSectionCard className="p-6">
          <div className="mb-5 text-right">
            <h3 className="text-xl font-bold text-white">
              {editingLessonId ? 'تعديل الدرس' : 'إضافة درس جديد'}
            </h3>
            <p className="mt-1 text-sm text-gray-400">
              أضف روابط الفيديو وملفات الشرح والامتحان.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4" dir="rtl">
            {/* الوحدة - مهم جداً هنا */}
            <div>
              <label className="mb-2 block text-sm text-gray-300">الوحدة الدراسية</label>
              <select
                value={form.unit_id}
                onChange={(e) => setForm({ ...form, unit_id: e.target.value })}
                disabled={validUnits.length === 0} // تعطيل الخيارات إذا لم توجد وحدات
                className={`w-full rounded-2xl border bg-black/30 px-4 py-3 text-white outline-none focus:border-[#D4AF37]/40 ${validUnits.length === 0 ? 'border-red-500/50 cursor-not-allowed opacity-50' : 'border-white/10'}`}
              >
                <option value="" className="bg-[#0B1120]">اختر الوحدة</option>
                {validUnits.map((unit) => (
                  <option key={unit.id} value={unit.id} className="bg-[#0B1120]">
                    {unit.title} — {getGradeLabel(unit.grade_level)}
                  </option>
                ))}
              </select>
              {validUnits.length === 0 && (
                <p className="mt-1 text-xs text-red-400">
                  يرجى إضافة وحدات دراسية أولاً لتتمكن من إنشاء دروس.
                </p>
              )}
            </div>

            {/* العنوان */}
            <div>
              <label className="mb-2 block text-sm text-gray-300">عنوان الدرس</label>
              <input
                type="text"
                required
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                className="w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-white outline-none focus:border-[#D4AF37]/40"
                placeholder="مثال: شرح قاعدة المبتدأ والخبر"
              />
            </div>

            {/* الفيديو */}
            <div>
              <label className="mb-2 flex items-center justify-end gap-2 text-sm text-gray-300">
                رابط فيديو الشرح
                <Video size={14} className="text-red-400" />
              </label>
              <input
                type="text"
                value={form.video_url}
                onChange={(e) => setForm({ ...form, video_url: e.target.value })}
                className="w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-white outline-none focus:border-[#D4AF37]/40"
                placeholder="https://youtube.com/..."
              />
            </div>

            {/* PDF الشرح */}
            <div>
              <label className="mb-2 flex items-center justify-end gap-2 text-sm text-gray-300">
                رابط ملف الشرح (PDF)
                <FileText size={14} className="text-blue-400" />
              </label>
              <input
                type="text"
                value={form.lesson_pdf_url}
                onChange={(e) => setForm({ ...form, lesson_pdf_url: e.target.value })}
                className="w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-white outline-none focus:border-[#D4AF37]/40"
                placeholder="https://...pdf"
              />
            </div>

            {/* PDF الامتحان */}
            <div>
              <label className="mb-2 flex items-center justify-end gap-2 text-sm text-gray-300">
                رابط ملف الامتحان (PDF)
                <FileText size={14} className="text-emerald-400" />
              </label>
              <input
                type="text"
                value={form.exam_pdf_url}
                onChange={(e) => setForm({ ...form, exam_pdf_url: e.target.value })}
                className="w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-white outline-none focus:border-[#D4AF37]/40"
                placeholder="https://...pdf"
              />
            </div>

            {/* الوصف */}
            <div>
              <label className="mb-2 block text-sm text-gray-300">الوصف (اختياري)</label>
              <textarea
                rows="3"
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                className="w-full resize-none rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-white outline-none focus:border-[#D4AF37]/40"
                placeholder="وصف مختصر لمحتوى الدرس..."
              />
            </div>

            {/* الأزرار */}
            <div className="flex gap-3 pt-2">
              <button
                type="submit"
                disabled={loading || validUnits.length === 0}
                className="flex-1 rounded-2xl bg-gradient-to-r from-[#D4AF37] to-[#AA7C11] px-4 py-4 font-bold text-black transition hover:scale-[1.01] disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {loading ? 'جاري الحفظ...' : editingLessonId ? 'حفظ التعديلات' : 'إضافة الدرس'}
              </button>

              {editingLessonId && (
                <button
                  type="button"
                  onClick={resetForm}
                  className="rounded-2xl border border-white/10 bg-white/5 px-4 py-4 text-gray-300 transition hover:bg-white/10"
                >
                  إلغاء
                </button>
              )}
            </div>
          </form>
        </AdminSectionCard>

        {/* LIST */}
        <AdminSectionCard className="p-6">
          <div className="mb-5 text-right">
            <h3 className="text-xl font-bold text-white">الدروس الحالية</h3>
            <p className="mt-1 text-sm text-gray-400">إدارة محتوى الدروس والملفات المرفقة.</p>
          </div>

          {/* فلاتر */}
          <div className="mb-5 grid grid-cols-1 gap-3 lg:grid-cols-2" dir="rtl">
            <div className="relative">
              <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
              <input
                type="text"
                placeholder="ابحث بعنوان الدرس"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full rounded-2xl border border-white/10 bg-black/30 py-3 pr-11 pl-4 text-white outline-none focus:border-[#D4AF37]/40"
              />
            </div>

            <select
              value={gradeFilter}
              onChange={(e) => setGradeFilter(e.target.value)}
              className="w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-white outline-none focus:border-[#D4AF37]/40"
            >
              <option value="all" className="bg-[#0B1120]">كل الصفوف</option>
              <option value="1" className="bg-[#0B1120]">أولى ثانوي</option>
              <option value="2" className="bg-[#0B1120]">ثانية ثانوي</option>
              <option value="3" className="bg-[#0B1120]">ثالثة ثانوي</option>
            </select>
          </div>

          {filteredLessons.length === 0 ? (
            <EmptyState title="لا توجد دروس" description="أضف أول درس ليظهر هنا." />
          ) : (
            <div className="space-y-4">
              {filteredLessons.map((lesson) => (
                <div
                  key={lesson.id}
                  className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 text-right transition hover:border-[#D4AF37]/20"
                  dir="rtl"
                >
                  <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEdit(lesson)}
                        className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-sky-500/10 text-sky-300 transition hover:bg-sky-500/15"
                      >
                        <Pencil size={16} />
                      </button>
                      <button
                        onClick={() => setDeleteState({ open: true, lesson })}
                        className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-red-500/10 text-red-300 transition hover:bg-red-500/15"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>

                    <div className="flex-1">
                      <h4 className="text-lg font-bold text-white">{lesson.title}</h4>
                      <p className="mt-1 text-sm text-gray-400">
                        الوحدة: <span className="text-white">{lesson.units?.title || 'غير مرتبطة'}</span>
                        <span className="mx-2 text-gray-600">|</span>
                        الصف: {lesson.units?.grade_level ? getGradeLabel(lesson.units.grade_level) : '-'}
                      </p>
                    </div>
                  </div>

                  {/* الروابط والملفات */}
                  <div className="mt-4 flex flex-wrap gap-3 border-t border-white/5 pt-4">
                    {lesson.video_url && (
                      <a
                        href={lesson.video_url}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-2 rounded-xl bg-red-500/10 px-3 py-2 text-xs font-bold text-red-300 transition hover:bg-red-500/20"
                      >
                        <Play size={14} />
                        فيديو الشرح
                      </a>
                    )}
                    {lesson.lesson_pdf_url && (
                      <a
                        href={lesson.lesson_pdf_url}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-2 rounded-xl bg-blue-500/10 px-3 py-2 text-xs font-bold text-blue-300 transition hover:bg-blue-500/20"
                      >
                        <FileText size={14} />
                        ملف الشرح
                      </a>
                    )}
                    {lesson.exam_pdf_url && (
                      <a
                        href={lesson.exam_pdf_url}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-2 rounded-xl bg-emerald-500/10 px-3 py-2 text-xs font-bold text-emerald-300 transition hover:bg-emerald-500/20"
                      >
                        <FileText size={14} />
                        ملف الامتحان
                      </a>
                    )}
                  </div>

                  {lesson.description && (
                    <p className="mt-4 text-sm leading-7 text-gray-400">{lesson.description}</p>
                  )}
                </div>
              ))}
            </div>
          )}
        </AdminSectionCard>
      </div>

      <ConfirmModal
        open={deleteState.open}
        onCancel={() => setDeleteState({ open: false, lesson: null })}
        onConfirm={handleDelete}
        loading={loading}
        danger
        title="تأكيد حذف الدرس"
        description={`هل أنت متأكد من حذف الدرس ${deleteState.lesson?.title || ''}؟`}
        confirmText="حذف الدرس"
      />
    </>
  );
};

export default LessonsManager;