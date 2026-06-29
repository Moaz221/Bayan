import { useMemo, useState } from 'react';
import { BookOpen, CalendarDays, CheckCircle2, Pencil, Search, Trash2 } from 'lucide-react';
import AdminSectionCard from './AdminSectionCard';
import EmptyState from '../shared/EmptyState';
import ConfirmModal from '../shared/ConfirmModal';
import { createUnit, deleteUnit, updateUnit } from '../../lib/admin';
import { GRADE_OPTIONS, getGradeLabel } from '../../lib/gradeOptions';
import { useToast } from '../shared/ToastProvider';

const TERM_LABELS = {
  1: 'الترم الأول',
  2: 'الترم الثاني',
};

const UnitsManager = ({ units, onRefresh }) => {
  const [form, setForm] = useState({
    title: '',
    grade_level: '1',
    term: '1',
    is_final_review: false,
  });

  const [loading, setLoading] = useState(false);
  const [editingUnitId, setEditingUnitId] = useState(null);
  const [deleteState, setDeleteState] = useState({ open: false, unit: null });

  const [search, setSearch] = useState('');
  const [gradeFilter, setGradeFilter] = useState('all');
  const [termFilter, setTermFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');

  const { showToast } = useToast();

  const filteredUnits = useMemo(() => {
    return (units || []).filter((unit) => {
      const matchesSearch = unit.title?.toLowerCase().includes(search.toLowerCase());

      const matchesGrade =
        gradeFilter === 'all' ? true : String(unit.grade_level) === String(gradeFilter);

      const matchesTerm =
        termFilter === 'all'
          ? true
          : termFilter === 'none'
          ? !unit.term
          : String(unit.term) === String(termFilter);

      const matchesType =
        typeFilter === 'all'
          ? true
          : typeFilter === 'final'
          ? unit.is_final_review === true
          : unit.is_final_review !== true;

      return matchesSearch && matchesGrade && matchesTerm && matchesType;
    });
  }, [units, search, gradeFilter, termFilter, typeFilter]);

  const resetForm = () => {
    setForm({
      title: '',
      grade_level: '1',
      term: '1',
      is_final_review: false,
    });
    setEditingUnitId(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.title.trim()) {
      showToast({
        type: 'error',
        title: 'اسم الوحدة مطلوب',
        message: 'اكتب اسم الوحدة أولًا',
      });
      return;
    }

    if (!form.is_final_review && !form.term) {
      showToast({
        type: 'error',
        title: 'الترم مطلوب',
        message: 'اختر الترم الخاص بالوحدة',
      });
      return;
    }

    const payload = {
      title: form.title.trim(),
      grade_level: Number(form.grade_level),
      term: form.term ? Number(form.term) : null,
      is_final_review: !!form.is_final_review,
    };

    try {
      setLoading(true);

      if (editingUnitId) {
        await updateUnit(editingUnitId, payload);

        showToast({
          type: 'success',
          title: 'تم تعديل الوحدة',
          message: 'تم حفظ التعديلات بنجاح',
        });
      } else {
        await createUnit(payload);

        showToast({
          type: 'success',
          title: 'تمت إضافة الوحدة',
          message: 'أضيفت الوحدة الجديدة بنجاح',
        });
      }

      resetForm();
      await onRefresh();
    } catch (error) {
      showToast({
        type: 'error',
        title: 'تعذر حفظ الوحدة',
        message: error.message || 'حدث خطأ غير متوقع',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (unit) => {
    setEditingUnitId(unit.id);
    setForm({
      title: unit.title || '',
      grade_level: String(unit.grade_level || '1'),
      term: unit.term ? String(unit.term) : '',
      is_final_review: !!unit.is_final_review,
    });
  };

  const openDelete = (unit) => {
    setDeleteState({ open: true, unit });
  };

  const closeDelete = () => {
    setDeleteState({ open: false, unit: null });
  };

  const handleDelete = async () => {
    if (!deleteState.unit) return;

    try {
      setLoading(true);
      await deleteUnit(deleteState.unit.id);

      showToast({
        type: 'success',
        title: 'تم حذف الوحدة',
        message: `تم حذف وحدة ${deleteState.unit.title}`,
      });

      closeDelete();
      resetForm();
      await onRefresh();
    } catch (error) {
      showToast({
        type: 'error',
        title: 'تعذر حذف الوحدة',
        message: error.message || 'قد تكون الوحدة مرتبطة بدروس أو باقات حالية',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="grid grid-cols-1 gap-5 xl:grid-cols-[420px_1fr]">
        {/* FORM */}
        <AdminSectionCard className="p-6">
          <div className="mb-5 text-right">
            <h3 className="text-xl font-bold text-white">
              {editingUnitId ? 'تعديل الوحدة' : 'إضافة وحدة جديدة'}
            </h3>
            <p className="mt-1 text-sm leading-6 text-gray-400">
              حدّد الصف والترم ونوع الوحدة حتى يتم ربطها لاحقًا بالباقات والاشتراكات.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4" dir="rtl">
            {/* اسم الوحدة */}
            <div>
              <label className="mb-2 block text-sm text-gray-300">اسم الوحدة</label>
              <input
                type="text"
                required
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                className="w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-white outline-none transition focus:border-[#D4AF37]/40"
                placeholder="مثال: الوحدة الأولى - النحو"
              />
            </div>

            {/* الصف */}
            <div>
              <label className="mb-2 block text-sm text-gray-300">الصف الدراسي</label>
              <select
                value={form.grade_level}
                onChange={(e) => setForm({ ...form, grade_level: e.target.value })}
                className="w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-white outline-none transition focus:border-[#D4AF37]/40"
              >
                {GRADE_OPTIONS.map((grade) => (
                  <option key={grade.value} value={grade.value} className="bg-[#0B1120]">
                    {grade.label}
                  </option>
                ))}
              </select>
            </div>

            {/* الترم */}
            <div>
              <label className="mb-2 block text-sm text-gray-300">الترم</label>
              <select
                value={form.term}
                onChange={(e) => setForm({ ...form, term: e.target.value })}
                className="w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-white outline-none transition focus:border-[#D4AF37]/40"
              >
                {form.is_final_review && (
                  <option value="" className="bg-[#0B1120]">
                    بدون ترم / مراجعة نهائية عامة
                  </option>
                )}
                <option value="1" className="bg-[#0B1120]">الترم الأول</option>
                <option value="2" className="bg-[#0B1120]">الترم الثاني</option>
              </select>
            </div>

            {/* مراجعة نهائية */}
            <label className="flex cursor-pointer items-center justify-between rounded-2xl border border-white/10 bg-black/20 p-4 transition hover:bg-white/[0.03]">
              <input
                type="checkbox"
                checked={form.is_final_review}
                onChange={(e) => {
                  const checked = e.target.checked;
                  setForm((prev) => ({
                    ...prev,
                    is_final_review: checked,
                    term: checked ? prev.term : prev.term || '1',
                  }));
                }}
                className="h-5 w-5 accent-[#D4AF37]"
              />

              <div className="text-right">
                <p className="text-sm font-bold text-white">وحدة مراجعة نهائية</p>
                <p className="mt-1 text-xs text-gray-500">
                  سيتم فصلها عن اشتراكات الترم والسنوي العادية
                </p>
              </div>
            </label>

            {/* أزرار */}
            <div className="flex gap-3 pt-2">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 rounded-2xl bg-gradient-to-r from-[#D4AF37] to-[#AA7C11] px-4 py-4 font-bold text-black transition hover:scale-[1.01] disabled:opacity-70"
              >
                {loading ? 'جاري الحفظ...' : editingUnitId ? 'حفظ التعديلات' : 'إضافة الوحدة'}
              </button>

              {editingUnitId && (
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
            <h3 className="text-xl font-bold text-white">الوحدات الحالية</h3>
            <p className="mt-1 text-sm text-gray-400">
              عرض وتعديل وحذف الوحدات حسب الصف والترم ونوع المحتوى.
            </p>
          </div>

          {/* Filters */}
          <div className="mb-5 grid grid-cols-1 gap-3 lg:grid-cols-4" dir="rtl">
            <div className="relative">
              <Search
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500"
                size={18}
              />
              <input
                type="text"
                placeholder="ابحث باسم الوحدة"
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
              {GRADE_OPTIONS.map((grade) => (
                <option key={grade.value} value={grade.value} className="bg-[#0B1120]">
                  {grade.label}
                </option>
              ))}
            </select>

            <select
              value={termFilter}
              onChange={(e) => setTermFilter(e.target.value)}
              className="w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-white outline-none focus:border-[#D4AF37]/40"
            >
              <option value="all" className="bg-[#0B1120]">كل الترمات</option>
              <option value="1" className="bg-[#0B1120]">الترم الأول</option>
              <option value="2" className="bg-[#0B1120]">الترم الثاني</option>
              <option value="none" className="bg-[#0B1120]">بدون ترم</option>
            </select>

            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-white outline-none focus:border-[#D4AF37]/40"
            >
              <option value="all" className="bg-[#0B1120]">كل الأنواع</option>
              <option value="normal" className="bg-[#0B1120]">وحدات عادية</option>
              <option value="final" className="bg-[#0B1120]">مراجعة نهائية</option>
            </select>
          </div>

          {filteredUnits.length === 0 ? (
            <EmptyState
              title="لا توجد وحدات"
              description="ابدأ بإضافة وحدات للصفوف والترمات أو غيّر الفلاتر الحالية."
            />
          ) : (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {filteredUnits.map((unit) => (
                <div
                  key={unit.id}
                  className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 text-right"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEdit(unit)}
                        className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-sky-500/10 text-sky-300 transition hover:bg-sky-500/15"
                      >
                        <Pencil size={16} />
                      </button>

                      <button
                        onClick={() => openDelete(unit)}
                        className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-red-500/10 text-red-300 transition hover:bg-red-500/15"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>

                    <div>
                      <h4 className="text-lg font-bold text-white">{unit.title}</h4>

                      <div className="mt-3 flex flex-wrap justify-end gap-2">
                        <span className="inline-flex items-center gap-1 rounded-full border border-sky-500/20 bg-sky-500/10 px-3 py-1 text-xs font-bold text-sky-300">
                          <BookOpen size={12} />
                          {getGradeLabel(unit.grade_level)}
                        </span>

                        <span className="inline-flex items-center gap-1 rounded-full border border-violet-500/20 bg-violet-500/10 px-3 py-1 text-xs font-bold text-violet-300">
                          <CalendarDays size={12} />
                          {unit.term ? TERM_LABELS[unit.term] : 'بدون ترم'}
                        </span>

                        {unit.is_final_review && (
                          <span className="inline-flex items-center gap-1 rounded-full border border-[#D4AF37]/25 bg-[#D4AF37]/10 px-3 py-1 text-xs font-bold text-[#D4AF37]">
                            <CheckCircle2 size={12} />
                            مراجعة نهائية
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </AdminSectionCard>
      </div>

      <ConfirmModal
        open={deleteState.open}
        onCancel={closeDelete}
        onConfirm={handleDelete}
        loading={loading}
        danger
        title="تأكيد حذف الوحدة"
        description={`هل أنت متأكد من حذف وحدة ${deleteState.unit?.title || ''}؟`}
        confirmText="حذف الوحدة"
      />
    </>
  );
};

export default UnitsManager;