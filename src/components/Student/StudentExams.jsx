import { useState } from 'react';
import { Link, Route, Routes, useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FileQuestion, Lock, Clock, CheckCircle2, XCircle, Trophy, ChevronLeft } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { checkExamAttempt, getExamForStudent, submitExamAttempt } from '../../lib/student';
import LoadingScreen from '../shared/LoadingScreen';
import EmptyState from '../shared/EmptyState';

const SCOPE_LABELS = { lesson: 'درس', unit: 'وحدة', term: 'ترم', yearly: 'سنوي' };

// ══ قائمة الامتحانات ══
const ExamsList = ({ exams }) => (
  <div className="space-y-5" dir="rtl">
    <h2 className="text-xl font-bold text-white">الامتحانات المتاحة</h2>

    {exams.length === 0 ? (
      <EmptyState title="لا توجد امتحانات" description="لم يُضف الأستاذ امتحانات بعد." />
    ) : (
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {exams.map((exam, i) => (
          <motion.div
            key={exam.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className={`relative overflow-hidden rounded-2xl border p-5 text-right transition ${
              exam.isAccessible
                ? 'border-emerald-500/20 bg-emerald-500/5 hover:border-emerald-500/40'
                : 'border-white/10 bg-white/[0.02]'
            }`}
          >
            {!exam.isAccessible && (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-black/50 backdrop-blur-[3px]">
                <Lock size={24} className="text-[#D4AF37]" />
                <p className="text-sm font-bold text-[#D4AF37]">اشترك للوصول</p>
              </div>
            )}

            <div className={exam.isAccessible ? '' : 'opacity-30'}>
              <div className="flex items-center justify-end gap-2">
                <span className="rounded-full border border-sky-500/20 bg-sky-500/10 px-2.5 py-0.5 text-[11px] text-sky-300">
                  {SCOPE_LABELS[exam.scope_type]}
                </span>
              </div>

              <h3 className="mt-3 font-bold text-white">{exam.title}</h3>

              <div className="mt-2 flex flex-wrap justify-end gap-2 text-xs text-gray-400">
                <span className="flex items-center gap-1">
                  <FileQuestion size={12} />
                  {exam.questionsCount} سؤال
                </span>
                {exam.duration_minutes && (
                  <span className="flex items-center gap-1">
                    <Clock size={12} />
                    {exam.duration_minutes} دقيقة
                  </span>
                )}
              </div>

              {exam.isAccessible && (
                <Link
                  to={`/dashboard/exams/${exam.id}`}
                  className="mt-4 flex w-full items-center justify-between rounded-xl bg-emerald-500/10 px-4 py-2.5 text-sm font-bold text-emerald-300 hover:bg-emerald-500/20"
                >
                  <ChevronLeft size={16} />
                  ادخل الامتحان
                </Link>
              )}
            </div>
          </motion.div>
        ))}
      </div>
    )}
  </div>
);

// ══ صفحة الامتحان الفعلية ══
const ExamTaker = () => {
  const { examId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [exam, setExam] = useState(null);
  const [attempt, setAttempt] = useState(null);
  const [loading, setLoading] = useState(true);
  const [answers, setAnswers] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState(null);
  const [currentQ, setCurrentQ] = useState(0);

  useState(() => {
    if (!examId || !user) return;

    const init = async () => {
      try {
        const [examData, prevAttempt] = await Promise.all([
          getExamForStudent(Number(examId)),
          checkExamAttempt(Number(examId), user.id),
        ]);
        setExam(examData);
        setAttempt(prevAttempt);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    init();
  });

  const handleSelect = (questionId, optionId) => {
    setAnswers((prev) => ({ ...prev, [questionId]: optionId }));
  };

  const handleSubmit = async () => {
    if (!exam || !user) return;

    const totalQ = exam.exam_questions.length;
    const answeredAll = Object.keys(answers).length === totalQ;

    if (!answeredAll) {
      const unanswered = totalQ - Object.keys(answers).length;
      if (!window.confirm(`لم تجب على ${unanswered} سؤال. هل تريد التسليم؟`)) return;
    }

    try {
      setSubmitting(true);
      const submitData = exam.exam_questions.map((q) => ({
        question_id: q.id,
        selected_option_id: answers[q.id] || null,
      }));

      const res = await submitExamAttempt({
        examId: Number(examId),
        studentId: user.id,
        answers: submitData,
        totalQuestions: totalQ,
      });

      setResult(res);
    } catch (error) {
      alert(error.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <LoadingScreen text="جاري تحميل الامتحان..." />;

  // لو سبق وأدى الامتحان
  if (attempt) {
    const percentage = Math.round((attempt.score / attempt.total_questions) * 100);
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center" dir="rtl">
        <Trophy size={60} className="mb-4 text-[#D4AF37]" />
        <h2 className="font-amiri text-3xl font-bold text-white">سبق وأديت هذا الامتحان</h2>
        <p className="mt-2 text-gray-400">لا يمكن إعادة الامتحان مرة أخرى</p>
        <div className="mt-6 rounded-2xl border border-[#D4AF37]/20 bg-[#D4AF37]/5 px-10 py-6">
          <p className="text-5xl font-black text-[#D4AF37]">{percentage}%</p>
          <p className="mt-2 text-gray-300">
            {attempt.score} / {attempt.total_questions} إجابة صحيحة
          </p>
        </div>
        <button
          onClick={() => navigate('/dashboard/exams')}
          className="mt-6 rounded-xl bg-white/10 px-6 py-3 text-sm text-gray-300 hover:bg-white/15"
        >
          العودة للامتحانات
        </button>
      </div>
    );
  }

  // عرض النتيجة بعد التسليم
  if (result) {
    const percentage = Math.round((result.score / result.total) * 100);
    const passed = percentage >= 50;

    return (
      <div className="space-y-5" dir="rtl">
        <div className="rounded-3xl border border-white/10 bg-white/[0.02] p-8 text-center">
          {passed ? (
            <CheckCircle2 size={60} className="mx-auto mb-4 text-emerald-400" />
          ) : (
            <XCircle size={60} className="mx-auto mb-4 text-red-400" />
          )}
          <h2 className="font-amiri text-3xl font-bold text-white">
            {passed ? 'أحسنت! نتيجة ممتازة 🎉' : 'حاول مرة أخرى في الدرس 💪'}
          </h2>
          <div className="mt-6 rounded-2xl border border-[#D4AF37]/20 bg-[#D4AF37]/5 px-10 py-6">
            <p className="text-6xl font-black text-[#D4AF37]">{percentage}%</p>
            <p className="mt-2 text-gray-300">{result.score} / {result.total} صحيحة</p>
          </div>
        </div>

        {/* مراجعة الإجابات */}
        <h3 className="text-lg font-bold text-white">مراجعة الإجابات</h3>
        {exam.exam_questions.map((q, i) => {
          const detail = result.detailedAnswers.find((a) => a.question_id === q.id);
          return (
            <div key={q.id} className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 text-right">
              <p className="mb-3 font-bold text-white">
                <span className="ml-2 text-[#D4AF37]">{i + 1}.</span>
                {q.question_text}
              </p>
              <div className="space-y-2">
                {q.exam_question_options.map((opt) => {
                  const isSelected = answers[q.id] === opt.id;
                  const isCorrect = detail?.correct_option_id === opt.id;
                  return (
                    <div
                      key={opt.id}
                      className={`rounded-xl border px-4 py-2.5 text-sm ${
                        isCorrect
                          ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-300'
                          : isSelected
                          ? 'border-red-500/40 bg-red-500/10 text-red-300'
                          : 'border-white/10 bg-white/[0.02] text-gray-400'
                      }`}
                    >
                      <span className="ml-2">
                        {isCorrect ? '✓' : isSelected ? '✗' : ''}
                      </span>
                      {opt.option_text}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}

        <button
          onClick={() => navigate('/dashboard/exams')}
          className="w-full rounded-xl bg-[#D4AF37] py-3 font-bold text-black hover:opacity-90"
        >
          العودة للامتحانات
        </button>
      </div>
    );
  }

  if (!exam) return <EmptyState title="امتحان غير موجود" />;

  const questions = exam.exam_questions || [];
  const currentQuestion = questions[currentQ];
  const progress = ((Object.keys(answers).length / questions.length) * 100).toFixed(0);

  // ══ واجهة الامتحان ══
  return (
    <div className="space-y-5" dir="rtl">
      {/* Header */}
      <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="text-left">
            <p className="text-sm text-gray-400">
              {Object.keys(answers).length} / {questions.length} سؤال تمت الإجابة عليه
            </p>
            <div className="mt-2 h-2 w-40 overflow-hidden rounded-full bg-white/10">
              <div
                className="h-full rounded-full bg-[#D4AF37] transition-all"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
          <div className="text-right">
            <h2 className="font-bold text-white">{exam.title}</h2>
            {exam.duration_minutes && (
              <p className="mt-1 flex items-center justify-end gap-1 text-sm text-gray-400">
                <Clock size={14} />
                {exam.duration_minutes} دقيقة
              </p>
            )}
          </div>
        </div>
      </div>

      {/* السؤال الحالي */}
      {currentQuestion && (
        <motion.div
          key={currentQ}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 text-right"
        >
          <div className="mb-5 flex items-start gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#D4AF37] text-sm font-black text-black">
              {currentQ + 1}
            </div>
            <p className="text-lg font-bold text-white">{currentQuestion.question_text}</p>
          </div>

          <div className="space-y-3">
            {currentQuestion.exam_question_options.map((opt) => {
              const selected = answers[currentQuestion.id] === opt.id;
              return (
                <button
                  key={opt.id}
                  onClick={() => handleSelect(currentQuestion.id, opt.id)}
                  className={`flex w-full items-center justify-end gap-3 rounded-xl border px-4 py-3.5 text-right transition ${
                    selected
                      ? 'border-[#D4AF37]/50 bg-[#D4AF37]/10 text-white'
                      : 'border-white/10 bg-white/[0.02] text-gray-300 hover:border-white/20 hover:bg-white/[0.05]'
                  }`}
                >
                  <span className="flex-1 text-sm">{opt.option_text}</span>
                  <span
                    className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 transition ${
                      selected ? 'border-[#D4AF37] bg-[#D4AF37]' : 'border-gray-600'
                    }`}
                  >
                    {selected && <span className="h-2 w-2 rounded-full bg-black" />}
                  </span>
                </button>
              );
            })}
          </div>
        </motion.div>
      )}

      {/* Navigation */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <button
          disabled={currentQ === questions.length - 1}
          onClick={() => setCurrentQ((p) => Math.min(p + 1, questions.length - 1))}
          className="rounded-xl bg-white/10 px-5 py-2.5 text-sm font-bold text-gray-300 disabled:opacity-40 hover:bg-white/15"
        >
          التالي ←
        </button>

        <div className="flex flex-wrap gap-2">
          {questions.map((q, i) => (
            <button
              key={q.id}
              onClick={() => setCurrentQ(i)}
              className={`h-9 w-9 rounded-xl text-xs font-bold transition ${
                i === currentQ
                  ? 'bg-[#D4AF37] text-black'
                  : answers[q.id]
                  ? 'bg-emerald-500/20 text-emerald-300'
                  : 'bg-white/5 text-gray-400'
              }`}
            >
              {i + 1}
            </button>
          ))}
        </div>

        <button
          disabled={currentQ === 0}
          onClick={() => setCurrentQ((p) => Math.max(p - 1, 0))}
          className="rounded-xl bg-white/10 px-5 py-2.5 text-sm font-bold text-gray-300 disabled:opacity-40 hover:bg-white/15"
        >
          → السابق
        </button>
      </div>

      {/* Submit */}
      <button
        onClick={handleSubmit}
        disabled={submitting}
        className="w-full rounded-2xl bg-gradient-to-r from-[#D4AF37] to-[#AA7C11] py-4 font-bold text-black disabled:opacity-60 hover:opacity-90"
      >
        {submitting ? 'جاري التسليم...' : 'تسليم الامتحان 📝'}
      </button>
    </div>
  );
};

// ══ Router ══
const StudentExams = ({ exams }) => (
  <Routes>
    <Route index element={<ExamsList exams={exams} />} />
    <Route path=":examId" element={<ExamTaker />} />
  </Routes>
);

export default StudentExams;