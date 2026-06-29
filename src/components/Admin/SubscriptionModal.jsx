import { useEffect, useState } from 'react';
import { X, Save, CreditCard, Calendar, Shield, FileText, ToggleRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

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
  { value: 'full_grade', label: 'الصف كامل' },
  { value: 'final_review_only', label: 'مراجعة نهائية فقط' },
  { value: 'custom_units', label: 'وحدات مخصصة' },
  { value: 'custom_lessons', label: 'دروس مخصصة' },
];

const SUB_STATUS_STYLES = {
  active: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/20',
  pending: 'bg-amber-500/15 text-amber-300 border-amber-500/20',
  expired: 'bg-red-500/15 text-red-300 border-red-500/20',
  cancelled: 'bg-gray-500/15 text-gray-300 border-gray-500/20',
};

const SubscriptionModal = ({ open, student, loading, onClose, onSave }) => {
  const [form, setForm] = useState({
    is_active: false,
    subscription_type: '',
    subscription_status: 'pending',
    subscription_start: '',
    subscription_end: '',
    access_mode: 'full_grade',
    notes: '',
  });

  useEffect(() => {
    if (student && open) {
      setForm({
        is_active: !!student.is_active,
        subscription_type: student.subscription_type || '',
        subscription_status: student.subscription_status || 'pending',
        subscription_start: student.subscription_start || '',
        subscription_end: student.subscription_end || '',
        access_mode: student.access_mode || 'full_grade',
        notes: student.notes || '',
      });
    }
  }, [student, open]);

  const handleChange = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(form);
  };

  return (
    <AnimatePresence>
      {open && student && (
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
            transition={{ duration: 0.25 }}
            onClick={(e) => e.stopPropagation()}
            dir="rtl"
            className="relative w-full max-w-3xl my-auto rounded-3xl border border-[#D4AF37]/15 bg-gradient-to-b from-[#0E1422] to-[#070A12] shadow-[0_30px_80px_rgba(0,0,0,0.6)]"
          >
            {/* HEADER */}
            <div className="flex items-center justify-between border-b border-white/10 px-6 py-5">
              <button
                onClick={onClose}
                className="rounded-xl p-2 text-gray-400 transition hover:bg-white/5 hover:text-white"
              >
                <X size={20} />
              </button>

              <div className="flex items-center gap-3 text-right">
                <div>
                  <h3 className="text-xl font-bold text-white">إدارة اشتراك الطالب</h3>
                  <p className="mt-1 text-sm text-gray-400">{student.full_name}</p>
                </div>
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#D4AF37]/10 text-[#D4AF37]">
                  <CreditCard size={22} />
                </div>
              </div>
            </div>

            {/* FORM */}
            <form onSubmit={handleSubmit} className="space-y-5 p-6">
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
                    onChange={(e) => handleChange('subscription_type', e.target.value)}
                    className="w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-white outline-none focus:border-[#D4AF37]/40"
                  >
                    {SUBSCRIPTION_TYPES.map((item) => (
                      <option key={item.value} value={item.value} className="bg-[#0B1120]">
                        {item.label}
                      </option>
                    ))}
                  </select>
                </div>

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
                      <option key={item.value} value={item.value} className="bg-[#0B1120]">
                        {item.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* نوع الوصول */}
                <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                  <label className="mb-2 flex items-center justify-end gap-2 text-sm font-medium text-gray-300">
                    نوع الوصول
                    <Shield size={16} className="text-[#D4AF37]" />
                  </label>
                  <select
                    value={form.access_mode}
                    onChange={(e) => handleChange('access_mode', e.target.value)}
                    className="w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-white outline-none focus:border-[#D4AF37]/40"
                  >
                    {ACCESS_MODES.map((item) => (
                      <option key={item.value} value={item.value} className="bg-[#0B1120]">
                        {item.label}
                      </option>
                    ))}
                  </select>
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

                {/* ملاحظات */}
                <div className="rounded-2xl border border-white/10 bg-black/20 p-4 md:col-span-2">
                  <label className="mb-2 flex items-center justify-end gap-2 text-sm font-medium text-gray-300">
                    ملاحظات
                    <FileText size={16} className="text-[#D4AF37]" />
                  </label>
                  <textarea
                    rows="3"
                    value={form.notes}
                    onChange={(e) => handleChange('notes', e.target.value)}
                    placeholder="اكتب أي ملاحظات تخص الاشتراك أو الوصول..."
                    className="w-full resize-none rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-white outline-none focus:border-[#D4AF37]/40"
                  />
                </div>
              </div>

              {/* FOOTER */}
              <div className="flex flex-wrap items-center justify-between gap-3 border-t border-white/10 pt-5">
                <p className="text-xs text-gray-500">
                  يمكنك لاحقًا ربط الوصول المخصص بوحدات أو دروس محددة
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
                    disabled={loading}
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
      )}
    </AnimatePresence>
  );
};

export default SubscriptionModal;