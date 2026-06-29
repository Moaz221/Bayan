import { useEffect, useState } from 'react';
import { X, Plus, Trash2, Save, CheckCircle2, Circle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  createQuestion,
  deleteQuestion,
  saveQuestionOptions,
  updateQuestion,
} from '../../lib/admin';
import { useToast } from '../shared/ToastProvider';
import ConfirmModal from '../shared/ConfirmModal';

const QuestionsManager = ({ open, exam, onClose, onRefresh }) => {
  const [questions, setQuestions] = useState([]);
  const [newQuestionText, setNewQuestionText] = useState('');
  const [loading, setLoading] = useState(false);
  const [deleteState, setDeleteState] = useState({ open: false, question: null });
  const { showToast } = useToast();

  useEffect(() => {
    if (exam && open) {
      // ترتيب الأسئلة والاختيارات
      const sorted = (exam.exam_questions || [])
        .map((q) => ({
          ...q,
          options: (q.exam_question_options || []).sort((a, b) => a.sort_order - b.sort_order),
        }))
        .sort((a, b) => a.sort_order - b.sort_order);

      // التأكد من وجود 4 اختيارات على الأقل
      const withOptions = sorted.map((q) => {
        const opts = [...q.options];
        while (opts.length < 4) {
          opts.push({ option_text: '', is_correct: false, sort_order: opts.length });
        }
        return { ...q, options: opts };
      });

      setQuestions(withOptions);
    }
  }, [exam, open]);

  const handleAddQuestion = async () => {
    if (!newQuestionText.trim()) {
      showToast({ type: 'error', title: 'اكتب نص السؤال' });
      return;
    }
    try {
      setLoading(true);
      const newQ = await createQuestion(exam.id, newQuestionText.trim(), questions.length);

      // إضافة 4 اختيارات فارغة
      const emptyOptions = [0, 1, 2, 3].map((i) => ({
        option_text: '',
        is_correct: false,
        sort_order: i,
      }));

      setQuestions([...questions, { ...newQ, options: emptyOptions }]);
      setNewQuestionText('');
      showToast({ type: 'success', title: 'تمت إضافة السؤال' });
    } catch (error) {
      showToast({ type: 'error', title: 'خطأ', message: error.message });
    } finally {
      setLoading(false);
    }
  };

  const handleQuestionTextChange = (qIndex, text) => {
    const updated = [...questions];
    updated[qIndex].question_text = text;
    setQuestions(updated);
  };

  const handleOptionTextChange = (qIndex, oIndex, text) => {
    const updated = [...questions];
    updated[qIndex].options[oIndex].option_text = text;
    setQuestions(updated);
  };

  const handleSetCorrect = (qIndex, oIndex) => {
    const updated = [...questions];
    updated[qIndex].options = updated[qIndex].options.map((opt, i) => ({
      ...opt,
      is_correct: i === oIndex,
    }));
    setQuestions(updated);
  };

  const handleSaveQuestion = async (qIndex) => {
    const q = questions[qIndex];

    if (!q.question_text.trim()) {
      showToast({ type: 'error', title: 'نص السؤال مطلوب' });
      return;
    }

    const validOptions = q.options.filter((o) => o.option_text.trim());
    if (validOptions.length < 2) {
      showToast({ type: 'error', title: 'يجب وجود اختيارين على الأقل' });
      return;
    }

    const hasCorrect = validOptions.some((o) => o.is_correct);
    if (!hasCorrect) {
      showToast({ type: 'error', title: 'حدد الإجابة الصحيحة' });
      return;
    }

    try {
      setLoading(true);
      await updateQuestion(q.id, q.question_text.trim());
      await saveQuestionOptions(q.id, validOptions);
      showToast({ type: 'success', title: 'تم حفظ السؤال' });
    } catch (error) {
      showToast({ type: 'error', title: 'خطأ', message: error.message });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteQuestion = async () => {
    if (!deleteState.question) return;
    try {
      setLoading(true);
      await deleteQuestion(deleteState.question.id);
      setQuestions(questions.filter((q) => q.id !== deleteState.question.id));
      setDeleteState({ open: false, question: null });
      showToast({ type: 'success', title: 'تم حذف السؤال' });
    } catch (error) {
      showToast({ type: 'error', title: 'خطأ', message: error.message });
    } finally {
      setLoading(false);
    }
  };

  const handleClose = async () => {
    await onRefresh();
    onClose();
  };

  if (!exam) return null;

  return (
    <>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm px-4 py-8 overflow-y-auto"
            onClick={handleClose}
          >
            <motion.div
              initial={{ opacity: 0, y: 30, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.95 }}
              onClick={(e) => e.stopPropagation()}
              dir="rtl"
              className="relative w-full max-w-4xl my-auto rounded-3xl border border-[#D4AF37]/15 bg-gradient-to-b from-[#0E1422] to-[#070A12] shadow-2xl"
            >
              <div className="flex items-center justify-between border-b border-white/10 px-6 py-5 sticky top-0 bg-[#0E1422] z-10 rounded-t-3xl">
                <button onClick={handleClose} className="rounded-xl p-2 text-gray-400 hover:bg-white/5 hover:text-white">
                  <X size={20} />
                </button>
                <div className="text-right">
                  <h3 className="text-xl font-bold text-white">إدارة أسئلة الامتحان</h3>
                  <p className="mt-1 text-sm text-gray-400">{exam.title}</p>
                </div>
              </div>

              <div className="p-6 space-y-5">
                {/* إضافة سؤال جديد */}
                <div className="rounded-2xl border border-[#D4AF37]/20 bg-[#D4AF37]/5 p-4">
                  <label className="mb-2 block text-sm font-bold text-[#D4AF37]">+ إضافة سؤال جديد</label>
                  <div className="flex gap-2">
                    <button
                      onClick={handleAddQuestion}
                      disabled={loading}
                      className="rounded-xl bg-[#D4AF37] px-4 py-3 text-sm font-bold text-black hover:opacity-90 disabled:opacity-50"
                    >
                      <Plus size={16} />
                    </button>
                    <input
                      type="text"
                      value={newQuestionText}
                      onChange={(e) => setNewQuestionText(e.target.value)}
                      placeholder="اكتب نص السؤال هنا..."
                      className="flex-1 rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-white outline-none focus:border-[#D4AF37]/40"
                    />
                  </div>
                </div>

                {/* قائمة الأسئلة */}
                {questions.length === 0 ? (
                  <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-8 text-center">
                    <p className="text-gray-400">لا توجد أسئلة بعد. ابدأ بإضافة أول سؤال.</p>
                  </div>
                ) : (
                  questions.map((q, qIndex) => (
                    <div key={q.id} className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
                      <div className="flex items-start gap-3">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#D4AF37] text-sm font-bold text-black">
                          {qIndex + 1}
                        </div>
                        <textarea
                          rows="2"
                          value={q.question_text}
                          onChange={(e) => handleQuestionTextChange(qIndex, e.target.value)}
                          placeholder="نص السؤال"
                          className="flex-1 resize-none rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-white outline-none focus:border-[#D4AF37]/40"
                        />
                        <button
                          onClick={() => setDeleteState({ open: true, question: q })}
                          className="rounded-xl bg-red-500/10 p-2.5 text-red-300 hover:bg-red-500/20"
                          title="حذف السؤال"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>

                      {/* الاختيارات */}
                      <div className="mt-4 space-y-2 pr-12">
                        <p className="text-xs text-gray-500">اضغط على الدائرة لتحديد الإجابة الصحيحة</p>
                        {q.options.map((opt, oIndex) => (
                          <div key={oIndex} className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => handleSetCorrect(qIndex, oIndex)}
                              className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl transition ${
                                opt.is_correct
                                  ? 'bg-emerald-500/20 text-emerald-300'
                                  : 'bg-white/5 text-gray-500 hover:bg-white/10'
                              }`}
                            >
                              {opt.is_correct ? <CheckCircle2 size={18} /> : <Circle size={18} />}
                            </button>
                            <input
                              type="text"
                              value={opt.option_text}
                              onChange={(e) => handleOptionTextChange(qIndex, oIndex, e.target.value)}
                              placeholder={`الاختيار ${oIndex + 1}`}
                              className={`flex-1 rounded-xl border bg-black/30 px-4 py-2.5 text-sm text-white outline-none focus:border-[#D4AF37]/40 ${
                                opt.is_correct ? 'border-emerald-500/40' : 'border-white/10'
                              }`}
                            />
                          </div>
                        ))}
                      </div>

                      {/* زرار الحفظ */}
                      <div className="mt-4 flex justify-end border-t border-white/5 pt-3">
                        <button
                          onClick={() => handleSaveQuestion(qIndex)}
                          disabled={loading}
                          className="inline-flex items-center gap-2 rounded-xl bg-emerald-500/10 px-4 py-2 text-sm font-bold text-emerald-300 hover:bg-emerald-500/20 disabled:opacity-50"
                        >
                          <Save size={14} />
                          حفظ السؤال
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <ConfirmModal
        open={deleteState.open}
        onCancel={() => setDeleteState({ open: false, question: null })}
        onConfirm={handleDeleteQuestion}
        loading={loading}
        danger
        title="حذف السؤال"
        description="هل أنت متأكد من حذف هذا السؤال وكل اختياراته؟"
        confirmText="حذف"
      />
    </>
  );
};

export default QuestionsManager;