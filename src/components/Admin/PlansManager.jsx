import { useMemo, useState } from 'react';
import { Pencil, Trash2, Plus, BookOpen, DollarSign, Layers } from 'lucide-react';
import AdminSectionCard from './AdminSectionCard';
import EmptyState from '../shared/EmptyState';
import ConfirmModal from '../shared/ConfirmModal';
import PlanModal from './PlanModal';
import { deletePlan } from '../../lib/admin';
import { getGradeLabel } from '../../lib/gradeOptions';
import { useToast } from '../shared/ToastProvider';

const TYPE_LABELS = {
  monthly: 'شهري',
  term: 'ترم',
  yearly: 'سنوي',
  final_review: 'مراجعة نهائية',
};

const TYPE_COLORS = {
  monthly: 'bg-sky-500/15 text-sky-300 border-sky-500/20',
  term: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/20',
  yearly: 'bg-violet-500/15 text-violet-300 border-violet-500/20',
  final_review: 'bg-amber-500/15 text-amber-300 border-amber-500/20',
};

const PlansManager = ({ plans, units, onRefresh }) => {
  const [modalOpen, setModalOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState(null);
  const [loading, setLoading] = useState(false);
  const [deleteState, setDeleteState] = useState({ open: false, plan: null });
  const [gradeFilter, setGradeFilter] = useState('all');

  const { showToast } = useToast();

  const filteredPlans = useMemo(() => {
    if (gradeFilter === 'all') return plans;
    return plans.filter((p) => String(p.grade_level) === String(gradeFilter));
  }, [plans, gradeFilter]);

  const openCreate = () => {
    setEditingPlan(null);
    setModalOpen(true);
  };

  const openEdit = (plan) => {
    setEditingPlan(plan);
    setModalOpen(true);
  };

  const handleDelete = async () => {
    if (!deleteState.plan) return;
    try {
      setLoading(true);
      await deletePlan(deleteState.plan.id);
      showToast({ type: 'success', title: 'تم الحذف', message: `تم حذف باقة ${deleteState.plan.name}` });
      setDeleteState({ open: false, plan: null });
      await onRefresh();
    } catch (error) {
      showToast({ type: 'error', title: 'خطأ', message: error.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <AdminSectionCard className="p-6">
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <button
            onClick={openCreate}
            className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-[#D4AF37] to-[#AA7C11] px-5 py-3 font-bold text-black transition hover:scale-[1.02]"
          >
            <Plus size={18} />
            إضافة باقة جديدة
          </button>

          <div className="text-right">
            <h3 className="text-xl font-bold text-white">إدارة الباقات والاشتراكات</h3>
            <p className="mt-1 text-sm text-gray-400">حدّد لكل صف ونوع اشتراك الوحدات والسعر.</p>
          </div>
        </div>

        {/* فلتر الصف */}
        <div className="mb-5 flex flex-wrap justify-end gap-2" dir="rtl">
          {[
            { value: 'all', label: 'الكل' },
            { value: '1', label: 'أولى ثانوي' },
            { value: '2', label: 'ثانية ثانوي' },
            { value: '3', label: 'ثالثة ثانوي' },
          ].map((g) => (
            <button
              key={g.value}
              onClick={() => setGradeFilter(g.value)}
              className={`rounded-xl px-4 py-2 text-sm font-bold transition ${
                gradeFilter === g.value
                  ? 'bg-[#D4AF37] text-black'
                  : 'bg-white/5 text-gray-300 hover:bg-white/10'
              }`}
            >
              {g.label}
            </button>
          ))}
        </div>

        {filteredPlans.length === 0 ? (
          <EmptyState title="لا توجد باقات" description="ابدأ بإضافة أول باقة اشتراك." />
        ) : (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
            {filteredPlans.map((plan) => (
              <div
                key={plan.id}
                className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 text-right"
                dir="rtl"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex gap-2">
                    <button
                      onClick={() => openEdit(plan)}
                      className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-sky-500/10 text-sky-300 hover:bg-sky-500/15"
                    >
                      <Pencil size={15} />
                    </button>
                    <button
                      onClick={() => setDeleteState({ open: true, plan })}
                      className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-red-500/10 text-red-300 hover:bg-red-500/15"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>

                  <span className={`inline-flex rounded-full border px-3 py-1 text-xs font-bold ${TYPE_COLORS[plan.plan_type]}`}>
                    {TYPE_LABELS[plan.plan_type]}
                  </span>
                </div>

                <h4 className="mt-3 text-lg font-bold text-white">{plan.name}</h4>

                <div className="mt-3 space-y-2 text-sm text-gray-400">
                  <div className="flex items-center justify-end gap-2">
                    <span>{getGradeLabel(plan.grade_level)}</span>
                    <Layers size={14} />
                  </div>
                  {plan.term && (
                    <div className="flex items-center justify-end gap-2">
                      <span>الترم {plan.term === 1 ? 'الأول' : 'الثاني'}</span>
                      <BookOpen size={14} />
                    </div>
                  )}
                  <div className="flex items-center justify-end gap-2 text-[#D4AF37] font-bold">
                    <span>{plan.price} جنيه</span>
                    <DollarSign size={14} />
                  </div>
                </div>

                <div className="mt-3 border-t border-white/10 pt-3">
                  <p className="text-xs text-gray-500">
                    عدد الوحدات: {' '}
                    <span className="font-bold text-white">
                      {plan.plan_type === 'monthly'
                        ? (plan.plan_units?.length || 0)
                        : plan.plan_type === 'final_review'
                        ? 'كل المراجعة النهائية'
                        : plan.plan_type === 'term'
                        ? 'كل وحدات الترم'
                        : 'كل وحدات السنة'}
                    </span>
                  </p>
                </div>

                {!plan.is_active && (
                  <span className="mt-2 inline-flex rounded-full bg-gray-500/15 px-2.5 py-0.5 text-[10px] text-gray-400">
                    غير مفعّلة
                  </span>
                )}
              </div>
            ))}
          </div>
        )}
      </AdminSectionCard>

      <PlanModal
        open={modalOpen}
        plan={editingPlan}
        units={units}
        onClose={() => setModalOpen(false)}
        onSaved={async () => {
          setModalOpen(false);
          await onRefresh();
        }}
      />

      <ConfirmModal
        open={deleteState.open}
        onCancel={() => setDeleteState({ open: false, plan: null })}
        onConfirm={handleDelete}
        loading={loading}
        danger
        title="تأكيد حذف الباقة"
        description={`هل أنت متأكد من حذف باقة ${deleteState.plan?.name || ''}?`}
        confirmText="حذف الباقة"
      />
    </>
  );
};

export default PlansManager;
