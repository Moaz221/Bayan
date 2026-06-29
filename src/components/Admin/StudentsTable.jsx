import { useMemo, useState } from 'react';
import { Crown, Search, Settings, UserCheck, UserX } from 'lucide-react';
import AdminSectionCard from './AdminSectionCard';
import EmptyState from '../shared/EmptyState';
import ConfirmModal from '../shared/ConfirmModal';
import SubscriptionModal from './SubscriptionModal';
import { getGradeLabel, GRADE_OPTIONS } from '../../lib/gradeOptions';
import {
  makeUserAdmin,
  toggleStudentActivation,
  updateStudentSubscriptionFull, // ✅ الجديد
} from '../../lib/admin';
import { useToast } from '../shared/ToastProvider';

const SUB_TYPE_LABELS = {
  monthly: 'شهري',
  term: 'ترم',
  yearly: 'سنوي',
  final_review: 'مراجعة نهائية',
};

const SUB_STATUS_STYLES = {
  active: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/20',
  pending: 'bg-amber-500/15 text-amber-300 border-amber-500/20',
  expired: 'bg-red-500/15 text-red-300 border-red-500/20',
  cancelled: 'bg-gray-500/15 text-gray-300 border-gray-500/20',
};

const SUB_STATUS_LABELS = {
  active: 'نشط',
  pending: 'قيد الانتظار',
  expired: 'منتهي',
  cancelled: 'ملغي',
};

const StudentsTable = ({ students, onRefresh }) => {
  const [loadingId, setLoadingId] = useState(null);
  const [search, setSearch] = useState('');
  const [gradeFilter, setGradeFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  const [confirmState, setConfirmState] = useState({
    open: false,
    type: null,
    student: null,
  });

  const [subscriptionModal, setSubscriptionModal] = useState({
    open: false,
    student: null,
  });

  const { showToast } = useToast();

  const filteredStudents = useMemo(() => {
    return students.filter((student) => {
      const matchesSearch =
        student.full_name?.toLowerCase().includes(search.toLowerCase()) ||
        student.phone?.toLowerCase().includes(search.toLowerCase());

      const matchesGrade =
        gradeFilter === 'all' ? true : String(student.grade_level) === String(gradeFilter);

      const matchesStatus =
        statusFilter === 'all'
          ? true
          : statusFilter === 'active'
          ? student.is_active === true
          : student.is_active === false;

      return matchesSearch && matchesGrade && matchesStatus;
    });
  }, [students, search, gradeFilter, statusFilter]);

  const openConfirm = (type, student) => {
    setConfirmState({ open: true, type, student });
  };
  const closeConfirm = () => {
    setConfirmState({ open: false, type: null, student: null });
  };

  const handleConfirmAction = async () => {
    const { type, student } = confirmState;
    if (!student || !type) return;

    try {
      setLoadingId(student.id);

      if (type === 'toggle-active') {
        await toggleStudentActivation(student.id, student.is_active);
        showToast({
          type: 'success',
          title: student.is_active ? 'تم إلغاء التفعيل' : 'تم تفعيل الطالب',
          message: `تم تحديث حالة الحساب للطالب ${student.full_name}`,
        });
      }

      if (type === 'make-admin') {
        await makeUserAdmin(student.id);
        showToast({
          type: 'success',
          title: 'تمت ترقية المستخدم',
          message: `${student.full_name} أصبح Admin بنجاح`,
        });
      }

      closeConfirm();
      await onRefresh();
    } catch (error) {
      showToast({
        type: 'error',
        title: 'حدث خطأ',
        message: error.message || 'تعذر تنفيذ العملية',
      });
    } finally {
      setLoadingId(null);
    }
  };

  const openSubscriptionModal = (student) => {
    setSubscriptionModal({ open: true, student });
  };
  const closeSubscriptionModal = () => {
    setSubscriptionModal({ open: false, student: null });
  };

  const handleSaveSubscription = async (formData) => {
    if (!subscriptionModal.student) return;

    try {
      setLoadingId(subscriptionModal.student.id);
      
      // ✅ الـ function الجديدة - بتسجل الـ access تلقائياً
      await updateStudentSubscriptionFull(subscriptionModal.student.id, formData);

      showToast({
        type: 'success',
        title: 'تم تحديث الاشتراك',
        message: `تم حفظ بيانات اشتراك ${subscriptionModal.student.full_name} وتفعيل الوحدات`,
      });

      closeSubscriptionModal();
      await onRefresh();
    } catch (error) {
      console.error('Subscription error:', error);
      showToast({
        type: 'error',
        title: 'حدث خطأ',
        message: error.message || 'تعذر حفظ بيانات الاشتراك',
      });
    } finally {
      setLoadingId(null);
    }
  };

  return (
    <>
      <AdminSectionCard className="p-6">
        <div className="mb-5 text-right">
          <h3 className="text-xl font-bold text-white">إدارة الطلاب</h3>
          <p className="mt-1 text-sm text-gray-400">
            بحث وفلترة وإدارة تفعيل وصلاحيات واشتراكات الطلاب.
          </p>
        </div>

        <div className="mb-5 grid grid-cols-1 gap-3 lg:grid-cols-3">
          <div className="relative">
            <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
            <input
              type="text"
              placeholder="ابحث بالاسم أو الهاتف"
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
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-white outline-none focus:border-[#D4AF37]/40"
          >
            <option value="all" className="bg-[#0B1120]">كل الحالات</option>
            <option value="active" className="bg-[#0B1120]">المفعّلون</option>
            <option value="pending" className="bg-[#0B1120]">قيد الانتظار</option>
          </select>
        </div>

        {filteredStudents.length === 0 ? (
          <EmptyState title="لا توجد نتائج" description="جرّب تعديل البحث أو الفلاتر." />
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full border-separate border-spacing-y-3 text-right">
              <thead>
                <tr className="text-sm text-gray-400">
                  <th className="px-4 py-3">الاسم</th>
                  <th className="px-4 py-3">الهاتف</th>
                  <th className="px-4 py-3">الصف</th>
                  <th className="px-4 py-3">الحالة</th>
                  <th className="px-4 py-3">الاشتراك</th>
                  <th className="px-4 py-3">الصلاحية</th>
                  <th className="px-4 py-3">الإجراءات</th>
                </tr>
              </thead>

              <tbody>
                {filteredStudents.map((student) => (
                  <tr key={student.id} className="bg-white/[0.03] text-white">
                    <td className="px-4 py-4 rounded-r-2xl">{student.full_name}</td>
                    <td className="px-4 py-4 text-gray-300">{student.phone || '-'}</td>
                    <td className="px-4 py-4 text-gray-300">{getGradeLabel(student.grade_level)}</td>

                    <td className="px-4 py-4">
                      <span
                        className={`inline-flex rounded-full px-3 py-1 text-xs font-bold border ${
                          student.is_active
                            ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/20'
                            : 'bg-amber-500/15 text-amber-300 border-amber-500/20'
                        }`}
                      >
                        {student.is_active ? 'مُفعّل' : 'قيد الانتظار'}
                      </span>
                    </td>

                    <td className="px-4 py-4">
                      <div className="flex flex-col items-end gap-1.5">
                        <span className="text-xs font-bold text-white">
                          {SUB_TYPE_LABELS[student.subscription_type] || (
                            <span className="text-gray-500">— لا يوجد —</span>
                          )}
                        </span>
                        <span
                          className={`inline-flex rounded-full px-2.5 py-0.5 text-[10px] font-bold border ${
                            SUB_STATUS_STYLES[student.subscription_status || 'pending']
                          }`}
                        >
                          {SUB_STATUS_LABELS[student.subscription_status || 'pending']}
                        </span>
                      </div>
                    </td>

                    <td className="px-4 py-4">
                      <span
                        className={`inline-flex rounded-full px-3 py-1 text-xs font-bold border ${
                          student.role === 'admin'
                            ? 'bg-violet-500/15 text-violet-300 border-violet-500/20'
                            : 'bg-sky-500/15 text-sky-300 border-sky-500/20'
                        }`}
                      >
                        {student.role === 'admin' ? 'Admin' : 'Student'}
                      </span>
                    </td>

                    <td className="px-4 py-4 rounded-l-2xl">
                      <div className="flex flex-wrap justify-end gap-2">
                        <button
                          onClick={() => openSubscriptionModal(student)}
                          disabled={loadingId === student.id}
                          className="inline-flex items-center gap-2 rounded-xl bg-[#D4AF37]/10 px-3 py-2 text-xs font-bold text-[#D4AF37] transition hover:bg-[#D4AF37]/20"
                        >
                          <Settings size={14} />
                          إدارة الاشتراك
                        </button>

                        <button
                          onClick={() => openConfirm('toggle-active', student)}
                          disabled={loadingId === student.id}
                          className={`inline-flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-bold transition ${
                            student.is_active
                              ? 'bg-red-500/10 text-red-300 hover:bg-red-500/15'
                              : 'bg-emerald-500/10 text-emerald-300 hover:bg-emerald-500/15'
                          }`}
                        >
                          {student.is_active ? <UserX size={14} /> : <UserCheck size={14} />}
                          {student.is_active ? 'إلغاء التفعيل' : 'تفعيل'}
                        </button>

                        {student.role !== 'admin' && (
                          <button
                            onClick={() => openConfirm('make-admin', student)}
                            disabled={loadingId === student.id}
                            className="inline-flex items-center gap-2 rounded-xl bg-violet-500/10 px-3 py-2 text-xs font-bold text-violet-300 transition hover:bg-violet-500/15"
                          >
                            <Crown size={14} />
                            جعله Admin
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </AdminSectionCard>

      <ConfirmModal
        open={confirmState.open}
        onCancel={closeConfirm}
        onConfirm={handleConfirmAction}
        loading={!!loadingId}
        danger={confirmState.type === 'toggle-active' && confirmState.student?.is_active}
        title={
          confirmState.type === 'make-admin'
            ? 'تأكيد ترقية المستخدم'
            : confirmState.student?.is_active
            ? 'تأكيد إلغاء التفعيل'
            : 'تأكيد تفعيل الحساب'
        }
        description={
          confirmState.type === 'make-admin'
            ? `سيتم منح ${confirmState.student?.full_name || 'هذا المستخدم'} صلاحيات Admin.`
            : confirmState.student?.is_active
            ? `سيتم إلغاء تفعيل حساب ${confirmState.student?.full_name || 'هذا الطالب'}.`
            : `سيتم تفعيل حساب ${confirmState.student?.full_name || 'هذا الطالب'}.`
        }
        confirmText={
          confirmState.type === 'make-admin'
            ? 'تأكيد الترقية'
            : confirmState.student?.is_active
            ? 'إلغاء التفعيل'
            : 'تفعيل الحساب'
        }
      />

      <SubscriptionModal
        open={subscriptionModal.open}
        student={subscriptionModal.student}
        loading={loadingId === subscriptionModal.student?.id}
        onClose={closeSubscriptionModal}
        onSave={handleSaveSubscription}
      />
    </>
  );
};

export default StudentsTable;