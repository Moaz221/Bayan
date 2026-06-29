import { useMemo, useState } from 'react';
import { Pencil, Trash2, Plus, FileQuestion, BookOpen, Calendar, Layers, Eye, EyeOff } from 'lucide-react';
import AdminSectionCard from './AdminSectionCard';
import EmptyState from '../shared/EmptyState';
import ConfirmModal from '../shared/ConfirmModal';
import ExamModal from './ExamModal';
import QuestionsManager from './QuestionsManager';
import { deleteExam } from '../../lib/admin';
import { getGradeLabel } from '../../lib/gradeOptions';
import { useToast } from '../shared/ToastProvider';

const SCOPE_LABELS = {
  lesson: 'درس',
  unit: 'وحدة',
  term: 'ترم كامل',
  yearly: 'سنوي شامل',
};

const SCOPE_COLORS = {
  lesson: 'bg-sky-500/15 text-sky-300 border-sky-500/20',
  unit: 'bg-violet-500/15 text-violet-300 border-violet-500/20',
  term: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/20',
  yearly: 'bg-amber-500/15 text-amber-300 border-amber-500/20',
};

const ExamsManager = ({ exams, units, lessons, onRefresh }) => {
  const [modalOpen, setModalOpen] = useState(false);
  const [editingExam, setEditingExam] = useState(null);
  const [loading, setLoading] = useState(false);
  const [deleteState, setDeleteState] = useState({ open: false, exam: null });
  const [questionsModal, setQuestionsModal] = useState({ open: false, exam: null });
  const [scopeFilter, setScopeFilter] = useState('all');

  const { showToast } = useToast();

  const filteredExams = useMemo(() => {
    if (scopeFilter === 'all') return exams;
    return (exams || []).filter((e) => e.scope_type === scopeFilter);
  }, [exams, scopeFilter]);

  const openCreate = () => {
    setEditingExam(null);
    setModalOpen(true);
  };

  const openEdit = (exam) => {
    setEditingExam(exam);
    setModalOpen(true);
  };

  const handleDelete = async () => {
    if (!deleteState.exam) return;
    try {
      setLoading(true);
      await deleteExam(deleteState.exam.id);
      showToast({ type: 'success', title: 'تم الحذف', message: `تم حذف الامتحان ${deleteState.exam.title}` });
      setDeleteState({ open: false, exam: null });
      await onRefresh();
    } catch (error) {
      showToast({ type: 'error', title: 'خطأ', message: error.message });
    } finally {
      setLoading(false);
    }
  };

  const getScopeDetails = (exam) => {
    if (exam.scope_type === 'lesson' && exam.lessons) {
      return `درس: ${exam.lessons.title}`;
    }
    if (exam.scope_type === 'unit' && exam.units) {
      return `وحدة: ${exam.units.title}`;
    }
    if (exam.scope_type === 'term') {
      return `${getGradeLabel(exam.grade_level)} - الترم ${exam.term === 1 ? 'الأول' : 'الثاني'}`;
    }
    if (exam.scope_type === 'yearly') {
      return `سنوي - ${getGradeLabel(exam.grade_level)}`;
    }
    return '-';
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
            إضافة امتحان جديد
          </button>

          <div className="text-right">
            <h3 className="text-xl font-bold text-white">إدارة الامتحانات</h3>
            <p className="mt-1 text-sm text-gray-400">امتحانات الدروس، الوحدات، الترم، أو السنوي.</p>
          </div>
        </div>

        {/* فلتر النوع */}
        <div className="mb-5 flex flex-wrap justify-end gap-2" dir="rtl">
          {[
            { value: 'all', label: 'الكل' },
            { value: 'lesson', label: 'دروس' },
            { value: 'unit', label: 'وحدات' },
            { value: 'term', label: 'ترم' },
            { value: 'yearly', label: 'سنوي' },
          ].map((s) => (
            <button
              key={s.value}
              onClick={() => setScopeFilter(s.value)}
              className={`rounded-xl px-4 py-2 text-sm font-bold transition ${
                scopeFilter === s.value
                  ? 'bg-[#D4AF37] text-black'
                  : 'bg-white/5 text-gray-300 hover:bg-white/10'
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>

        {filteredExams.length === 0 ? (
          <EmptyState title="لا توجد امتحانات" description="ابدأ بإضافة أول امتحان." />
        ) : (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
            {filteredExams.map((exam) => {
              const questionsCount = exam.exam_questions?.length || 0;
              return (
                <div
                  key={exam.id}
                  className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 text-right"
                  dir="rtl"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex gap-2">
                      <button
                        onClick={() => openEdit(exam)}
                        className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-sky-500/10 text-sky-300 hover:bg-sky-500/15"
                        title="تعديل البيانات"
                      >
                        <Pencil size={15} />
                      </button>
                      <button
                        onClick={() => setDeleteState({ open: true, exam })}
                        className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-red-500/10 text-red-300 hover:bg-red-500/15"
                        title="حذف الامتحان"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>

                    <span className={`inline-flex rounded-full border px-3 py-1 text-xs font-bold ${SCOPE_COLORS[exam.scope_type]}`}>
                      {SCOPE_LABELS[exam.scope_type]}
                    </span>
                  </div>

                  <h4 className="mt-3 text-lg font-bold text-white">{exam.title}</h4>
                  <p className="mt-2 text-xs text-gray-400">{getScopeDetails(exam)}</p>

                  <div className="mt-3 flex flex-wrap justify-end gap-2">
                    <span className="inline-flex items-center gap-1 rounded-full bg-white/5 px-2.5 py-1 text-[11px] text-gray-300">
                      <FileQuestion size={12} />
                      {questionsCount} سؤال
                    </span>
                    {exam.duration_minutes && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-white/5 px-2.5 py-1 text-[11px] text-gray-300">
                        <Calendar size={12} />
                        {exam.duration_minutes} دقيقة
                      </span>
                    )}
                    {exam.is_published ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2.5 py-1 text-[11px] text-emerald-300">
                        <Eye size={12} /> منشور
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 rounded-full bg-gray-500/10 px-2.5 py-1 text-[11px] text-gray-400">
                        <EyeOff size={12} /> مسودة
                      </span>
                    )}
                  </div>

                  <button
                    onClick={() => setQuestionsModal({ open: true, exam })}
                    className="mt-4 w-full rounded-xl bg-[#D4AF37]/10 px-4 py-2.5 text-sm font-bold text-[#D4AF37] transition hover:bg-[#D4AF37]/20"
                  >
                    إدارة الأسئلة ({questionsCount})
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </AdminSectionCard>

      <ExamModal
        open={modalOpen}
        exam={editingExam}
        units={units}
        lessons={lessons}
        onClose={() => setModalOpen(false)}
        onSaved={async () => {
          setModalOpen(false);
          await onRefresh();
        }}
      />

      <QuestionsManager
        open={questionsModal.open}
        exam={questionsModal.exam}
        onClose={() => setQuestionsModal({ open: false, exam: null })}
        onRefresh={onRefresh}
      />

      <ConfirmModal
        open={deleteState.open}
        onCancel={() => setDeleteState({ open: false, exam: null })}
        onConfirm={handleDelete}
        loading={loading}
        danger
        title="تأكيد حذف الامتحان"
        description={`هل أنت متأكد من حذف الامتحان ${deleteState.exam?.title || ''}؟ سيتم حذف كل الأسئلة والاختيارات معه.`}
        confirmText="حذف الامتحان"
      />
    </>
  );
};

export default ExamsManager;