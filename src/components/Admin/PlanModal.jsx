import { useEffect, useMemo, useState } from 'react';
import { X, Save, CheckSquare, Square } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { createPlan, updatePlan, setPlanUnits } from '../../lib/admin';
import { useToast } from '../shared/ToastProvider';

const GRADES = [
  { value: 1, label: 'الصف الأول الثانوي' },
  { value: 2, label: 'الصف الثاني الثانوي' },
  { value: 3, label: 'الصف الثالث الثانوي' },
];

const TYPES = [
  { value: 'monthly', label: 'شهري (تختار الوحدات يدويًا)' },
  { value: 'term', label: 'ترم (كل وحدات الترم تلقائيًا)' },
  { value: 'yearly', label: 'سنوي (كل وحدات السنة تلقائيًا)' },
  { value: 'final_review', label: 'مراجعة نهائية (وحدات المراجعة فقط)' },
];

const PlanModal = ({ open, plan, units, onClose, onSaved }) => {
  const [form, setForm] = useState({
    name: '',
    grade_level: 1,
    plan_type: 'monthly',
    term: 1,
    price: '',
    is_active: true,
  });
  const [selectedUnits, setSelectedUnits] = useState([]);
  const [loading, setLoading] = useState(false);
  const { showToast } = useToast();

  useEffect(() => {
    if (open) {
      if (plan) {
        setForm({
          name: plan.name || '',
          grade_level: plan.grade_level || 1,
          plan_type: plan.plan_type || 'monthly',
          term: plan.term || 1,
          price: plan.price || '',
          is_active: plan.is_active ?? true,
        });
        setSelectedUnits(plan.plan_units?.map((pu) => pu.unit_id) || []);
      } else {
        setForm({ name: '', grade_level: 1, plan_type: 'monthly', term: 1, price: '', is_active: true });
        setSelectedUnits([]);
      }
    }
  }, [plan, open]);

  const handleChange = (key, value) => setForm((p) => ({ ...p, [key]: value }));

  // فلترة الوحدات المتاحة حسب الصف والترم والنوع
  const availableUnits = useMemo(() => {
    if (!units) return [];
    return units.filter((u) => {
      if (String(u.grade_level) !== String(form.grade_level)) return false;

      if (form.plan_type === 'final_review') return u.is_final_review === true;
      if (form.plan_type === 'monthly') {
        if (u.is_final_review) return false;
        return String(u.term) === String(form.term);
      }
      if (form.plan_type === 'term') {
        return !u.is_final_review && String(u.term) === String(form.term);
      }
      if (form.plan_type === 'yearly') return !u.is_final_review;
      return true;
    });
  }, [units, form.grade_level, form.term, form.plan_type]);

  const isAutoSelect = ['term', 'yearly', 'final_review'].includes(form.plan_type);

  const toggleUnit = (unitId) => {
    setSelectedUnits((prev) =>
      prev.includes(unitId) ? prev.filter((id) => id !== unitId) : [...prev, unitId]
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);

      let planId;
      if (plan) {
        const updated = await updatePlan(plan.id, form);
        planId = updated.id;
      } else {
        const created = await createPlan(form);
        planId = created.id;
      }

      // تحديد الوحدات
      let unitsToSave;
      if (isAutoSelect) {
        // أوتوماتيك: كل الوحدات المتاحة
        unitsToSave = availableUnits.map((u) => u.id);
      } else {
        // شهري: اللي الأدمن اختارهم
        unitsToSave = selectedUnits;
      }

      await setPlanUnits(planId, unitsToSave);

      showToast({
        type: 'success',
        title: plan ? 'تم تعديل الباقة' : 'تم إنشاء الباقة',
        message: `تم حفظ "${form.name}" بنجاح`,
      });

      onSaved();
    } catch (error) {
      showToast({ type: 'error', title: 'خطأ', message: error.message });
    } finally {
      setLoading(false);
    }
  };

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
                {plan ? 'تعديل الباقة' : 'إضافة باقة جديدة'}
              </h3>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5 p-6">
              {/* اسم الباقة */}
              <div>
                <label className="mb-2 block text-sm text-gray-300">اسم الباقة</label>
                <input
                  type="text"
                  required
                  value={form.name}
                  onChange={(e) => handleChange('name', e.target.value)}
                  placeholder="مثال: اشتراك شهر أكتوبر - أولى ثانوي"
                  className="w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-white outline-none focus:border-[#D4AF37]/40"
                />
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                {/* الصف */}
                <div>
                  <label className="mb-2 block text-sm text-gray-300">الصف الدراسي</label>
                  <select
                    value={form.grade_level}
                    onChange={(e) => handleChange('grade_level', e.target.value)}
                    className="w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-white outline-none focus:border-[#D4AF37]/40"
                  >
                    {GRADES.map((g) => (
                      <option key={g.value} value={g.value} className="bg-[#0B1120]">{g.label}</option>
                    ))}
                  </select>
                </div>

                {/* النوع */}
                <div>
                  <label className="mb-2 block text-sm text-gray-300">نوع الاشتراك</label>
                  <select
                    value={form.plan_type}
                    onChange={(e) => handleChange('plan_type', e.target.value)}
                    className="w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-white outline-none focus:border-[#D4AF37]/40"
                  >
                    {TYPES.map((t) => (
                      <option key={t.value} value={t.value} className="bg-[#0B1120]">{t.label}</option>
                    ))}
                  </select>
                </div>

                {/* الترم - يظهر للشهري والترم */}
                {(form.plan_type === 'monthly' || form.plan_type === 'term') && (
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

                {/* السعر */}
                <div>
                  <label className="mb-2 block text-sm text-gray-300">السعر (جنيه)</label>
                  <input
                    type="number"
                    min="0"
                    value={form.price}
                    onChange={(e) => handleChange('price', e.target.value)}
                    placeholder="مثال: 150"
                    className="w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-white outline-none focus:border-[#D4AF37]/40"
                  />
                </div>
              </div>

              {/* تفعيل الباقة */}
              <label className="flex cursor-pointer items-center justify-end gap-3">
                <span className="text-sm text-gray-300">باقة مفعّلة للطلاب</span>
                <input
                  type="checkbox"
                  checked={form.is_active}
                  onChange={(e) => handleChange('is_active', e.target.checked)}
                  className="h-5 w-5 accent-[#D4AF37]"
                />
              </label>

              {/* قسم الوحدات */}
              <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                <div className="mb-3 flex items-center justify-between">
                  <span className="text-xs text-gray-500">
                    {availableUnits.length} وحدة متاحة
                  </span>
                  <h4 className="text-sm font-bold text-white">الوحدات المتضمنة</h4>
                </div>

                {isAutoSelect ? (
                  <div className="rounded-xl bg-emerald-500/10 border border-emerald-500/20 p-3 text-center text-sm text-emerald-300">
                    ✅ سيتم تضمين كل الوحدات المتاحة تلقائيًا ({availableUnits.length} وحدة)
                  </div>
                ) : availableUnits.length === 0 ? (
                  <p className="text-center text-sm text-gray-500 py-3">
                    لا توجد وحدات لهذا الصف/الترم. أضف وحدات أولًا.
                  </p>
                ) : (
                  <div className="max-h-52 space-y-2 overflow-y-auto pr-1">
                    {availableUnits.map((unit) => {
                      const checked = selectedUnits.includes(unit.id);
                      return (
                        <button
                          type="button"
                          key={unit.id}
                          onClick={() => toggleUnit(unit.id)}
                          className={`flex w-full items-center justify-between rounded-xl border px-4 py-3 text-right transition ${
                            checked
                              ? 'border-[#D4AF37]/40 bg-[#D4AF37]/10 text-white'
                              : 'border-white/10 bg-white/[0.02] text-gray-300 hover:bg-white/5'
                          }`}
                        >
                          <span>{unit.title}</span>
                          {checked ? (
                            <CheckSquare size={18} className="text-[#D4AF37]" />
                          ) : (
                            <Square size={18} className="text-gray-500" />
                          )}
                        </button>
                      );
                    })}
                  </div>
                )}
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
                  {loading ? 'جارٍ الحفظ...' : 'حفظ الباقة'}
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default PlanModal;
