import { useState, useEffect, useRef, useCallback } from 'react';
import { Link, Route, Routes, useNavigate, useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FileQuestion, Lock, Clock, CheckCircle2, XCircle, Trophy,
  ChevronLeft, AlertTriangle, Maximize, Shield, Eye
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { checkExamAttempt, getExamForStudent, submitExamAttempt } from '../../lib/student';
import LoadingScreen from '../shared/LoadingScreen';
import EmptyState from '../shared/EmptyState';

const SCOPE_LABELS = { lesson: 'درس', unit: 'وحدة', term: 'ترم', yearly: 'سنوي' };

// ══ مكوّن التايمر ══
const ExamTimer = ({ totalMinutes, onTimeUp, onWarning }) => {
  const [secondsLeft, setSecondsLeft] = useState(totalMinutes * 60);
  const intervalRef = useRef(null);
  const warned5  = useRef(false);
  const warned1  = useRef(false);

  useEffect(() => {
    intervalRef.current = setInterval(() => {
      setSecondsLeft((prev) => {
        const next = prev - 1;

        if (next <= 300 && !warned5.current) {
          warned5.current = true;
          onWarning?.('5 دقائق متبقية! أسرع في الإجابة.');
        }
        if (next <= 60 && !warned1.current) {
          warned1.current = true;
          onWarning?.('دقيقة واحدة فقط!');
        }
        if (next <= 0) {
          clearInterval(intervalRef.current);
          onTimeUp?.();
          return 0;
        }
        return next;
      });
    }, 1000);

    return () => clearInterval(intervalRef.current);
  }, [onTimeUp, onWarning]);

  const mins = Math.floor(secondsLeft / 60);
  const secs = secondsLeft % 60;
  const pct  = (secondsLeft / (totalMinutes * 60)) * 100;

  const colorClass =
    secondsLeft <= 60
      ? 'text-red-400 border-red-500/40 bg-red-500/10'
      : secondsLeft <= 300
      ? 'text-amber-400 border-amber-500/40 bg-amber-500/10'
      : 'text-emerald-400 border-emerald-500/40 bg-emerald-500/10';

  const ringColor =
    secondsLeft <= 60  ? '#f87171' :
    secondsLeft <= 300 ? '#fbbf24' : '#34d399';

  const radius = 26;
  const circ   = 2 * Math.PI * radius;
  const dash   = (pct / 100) * circ;

  return (
    <div className={`flex items-center gap-3 rounded-2xl border px-4 py-2.5 transition-all duration-500 ${colorClass}`}>
      <div className="relative flex h-14 w-14 shrink-0 items-center justify-center">
        <svg className="absolute inset-0 -rotate-90" width="56" height="56" viewBox="0 0 56 56">
          <circle cx="28" cy="28" r={radius} fill="none" stroke="currentColor" strokeOpacity="0.15" strokeWidth="4" />
          <circle
            cx="28" cy="28" r={radius} fill="none"
            stroke={ringColor} strokeWidth="4"
            strokeDasharray={`${dash} ${circ}`}
            strokeLinecap="round"
            style={{ transition: 'stroke-dasharray 1s linear, stroke 0.5s' }}
          />
        </svg>
        <span className="relative text-sm font-black tabular-nums">
          {String(mins).padStart(2, '0')}:{String(secs).padStart(2, '0')}
        </span>
      </div>
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-widest opacity-60">الوقت</p>
        <p className="text-xs font-bold">
          {secondsLeft <= 60 ? '⚠️ الوقت ينفذ!' : secondsLeft <= 300 ? 'تبقى 5 دقائق' : 'متبقي'}
        </p>
      </div>
    </div>
  );
};

// ══ تحذير مغادرة الامتحان ══
const LeaveWarningBanner = ({ count }) => {
  if (!count) return null;
  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex items-center gap-3 rounded-2xl border border-red-500/40 bg-red-500/10 px-4 py-3"
      dir="rtl"
    >
      <AlertTriangle size={18} className="shrink-0 text-red-400" />
      <div>
        <p className="text-sm font-bold text-red-300">تحذير! ({count}/3) حاولت مغادرة الامتحان</p>
        <p className="text-xs text-red-400/80">
          {count >= 3 ? 'سيتم تسليم الامتحان تلقائياً عند المغادرة مجدداً.' : 'لا تغادر الصفحة أثناء الامتحان.'}
        </p>
      </div>
    </motion.div>
  );
};

// ══ تحذير Toast ══
const ToastWarning = ({ message, onDone }) => {
  useEffect(() => {
    const t = setTimeout(onDone, 3500);
    return () => clearTimeout(t);
  }, [onDone]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 30, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 30, scale: 0.9 }}
      className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2 rounded-2xl border border-amber-500/40 bg-[#1a1a1a] px-6 py-3.5 shadow-2xl"
    >
      <p className="flex items-center gap-2 font-bold text-amber-400" dir="rtl">
        <Clock size={16} />
        {message}
      </p>
    </motion.div>
  );
};

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
              <div className="flex items-center justify-between">
                <div className="flex gap-2">
                  {exam.duration_minutes && (
                    <span className="flex items-center gap-1 rounded-full border border-amber-500/20 bg-amber-500/10 px-2.5 py-0.5 text-[11px] text-amber-300">
                      <Clock size={10} />
                      {exam.duration_minutes} د
                    </span>
                  )}
                </div>
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

// ══ صفحة الامتحان الاحترافية ══
const ExamTaker = () => {
  const { examId } = useParams();
  const { user }   = useAuth();
  const navigate   = useNavigate();

  const [exam,        setExam]        = useState(null);
  const [attempt,     setAttempt]     = useState(null);
  const [loading,     setLoading]     = useState(true);
  const [answers,     setAnswers]     = useState({});
  const [submitting,  setSubmitting]  = useState(false);
  const [result,      setResult]      = useState(null);
  const [currentQ,    setCurrentQ]    = useState(0);
  const [toastMsg,    setToastMsg]    = useState('');
  const [leaveCount,  setLeaveCount]  = useState(0);
  const [examStarted, setExamStarted] = useState(false);
  const [timeUp,      setTimeUp]      = useState(false);
  const containerRef = useRef(null);

  // ── تحميل البيانات ──
  useEffect(() => {
    if (!examId || !user) return;
    const init = async () => {
      try {
        const [examData, prevAttempt] = await Promise.all([
          getExamForStudent(Number(examId)),
          checkExamAttempt(Number(examId), user.id),
        ]);
        setExam(examData);
        setAttempt(prevAttempt);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    init();
  }, [examId, user]);

  // ── Anti-cheat: كشف مغادرة التاب / النافذة ──
  useEffect(() => {
    if (!examStarted || result) return;

    const handleBlur = () => {
      setLeaveCount((prev) => {
        const next = prev + 1;
        if (next >= 3) {
          setToastMsg('تم رصد مغادرتك! سيُسلَّم الامتحان تلقائياً.');
          setTimeout(() => handleSubmit(true), 2000);
        } else {
          setToastMsg(`⚠️ تحذير ${next}/3: لا تغادر الامتحان!`);
        }
        return next;
      });
    };

    window.addEventListener('blur', handleBlur);
    return () => window.removeEventListener('blur', handleBlur);
  }, [examStarted, result]);

  // ── منع Right-click و Copy ──
  useEffect(() => {
    if (!examStarted || result) return;
    const prevent = (e) => e.preventDefault();
    document.addEventListener('contextmenu', prevent);
    document.addEventListener('copy', prevent);
    document.addEventListener('cut', prevent);
    return () => {
      document.removeEventListener('contextmenu', prevent);
      document.removeEventListener('copy', prevent);
      document.removeEventListener('cut', prevent);
    };
  }, [examStarted, result]);

  // ── Fullscreen ──
  const enterFullscreen = useCallback(() => {
    const el = containerRef.current || document.documentElement;
    if (el.requestFullscreen)            el.requestFullscreen();
    else if (el.webkitRequestFullscreen) el.webkitRequestFullscreen();
  }, []);

  const exitFullscreen = useCallback(() => {
    if (document.exitFullscreen)            document.exitFullscreen();
    else if (document.webkitExitFullscreen) document.webkitExitFullscreen();
  }, []);

  // ── تسليم الامتحان ──
  const handleSubmit = useCallback(async (auto = false) => {
    if (!exam || !user) return;

    if (!auto) {
      const totalQ   = exam.exam_questions.length;
      const answered = Object.keys(answers).length;
      if (answered < totalQ) {
        const unanswered = totalQ - answered;
        if (!window.confirm(`لم تجب على ${unanswered} سؤال. هل تريد التسليم؟`)) return;
      }
    }

    try {
      setSubmitting(true);
      exitFullscreen();
      const submitData = exam.exam_questions.map((q) => ({
        question_id:        q.id,
        selected_option_id: answers[q.id] || null,
      }));
      const res = await submitExamAttempt({
        examId:         Number(examId),
        studentId:      user.id,
        answers:        submitData,
        totalQuestions: exam.exam_questions.length,
      });
      setResult(res);
    } catch (err) {
      alert(err.message);
    } finally {
      setSubmitting(false);
    }
  }, [exam, user, answers, examId, exitFullscreen]);

  // ── عند انتهاء الوقت ──
  useEffect(() => {
    if (timeUp) {
      setToastMsg('انتهى الوقت! سيتم تسليم الامتحان تلقائياً...');
      const t = setTimeout(() => handleSubmit(true), 2500);
      return () => clearTimeout(t);
    }
  }, [timeUp, handleSubmit]);

  // ══ شاشات الحالة ══
  if (loading) return <LoadingScreen text="جاري تحميل الامتحان..." />;

  if (attempt) {
    const pct = Math.round((attempt.score / attempt.total_questions) * 100);
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center" dir="rtl">
        <Trophy size={60} className="mb-4 text-[#D4AF37]" />
        <h2 className="font-amiri text-3xl font-bold text-white">سبق وأديت هذا الامتحان</h2>
        <p className="mt-2 text-gray-400">لا يمكن إعادة الامتحان مرة أخرى</p>
        <div className="mt-6 rounded-2xl border border-[#D4AF37]/20 bg-[#D4AF37]/5 px-10 py-6">
          <p className="text-5xl font-black text-[#D4AF37]">{pct}%</p>
          <p className="mt-2 text-gray-300">{attempt.score} / {attempt.total_questions} إجابة صحيحة</p>
        </div>
        <button onClick={() => navigate('/dashboard/exams')} className="mt-6 rounded-xl bg-white/10 px-6 py-3 text-sm text-gray-300 hover:bg-white/15">
          العودة للامتحانات
        </button>
      </div>
    );
  }

  if (result) {
    const pct    = Math.round((result.score / result.total) * 100);
    const passed = pct >= 50;
    return (
      <div className="space-y-5" dir="rtl">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1,   opacity: 1 }}
          className="rounded-3xl border border-white/10 bg-white/[0.02] p-8 text-center"
        >
          {passed
            ? <CheckCircle2 size={60} className="mx-auto mb-4 text-emerald-400" />
            : <XCircle     size={60} className="mx-auto mb-4 text-red-400" />
          }
          <h2 className="font-amiri text-3xl font-bold text-white">
            {passed ? 'أحسنت! نتيجة ممتازة 🎉' : 'حاول مرة أخرى في الدرس 💪'}
          </h2>

          <div className="mx-auto mt-6 max-w-xs">
            {/* شريط النسبة */}
            <div className="h-3 w-full overflow-hidden rounded-full bg-white/10">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${pct}%` }}
                transition={{ duration: 1, ease: 'easeOut' }}
                className={`h-full rounded-full ${passed ? 'bg-emerald-400' : 'bg-red-400'}`}
              />
            </div>
            <div className="mt-4 rounded-2xl border border-[#D4AF37]/20 bg-[#D4AF37]/5 px-10 py-6">
              <p className="text-6xl font-black text-[#D4AF37]">{pct}%</p>
              <p className="mt-2 text-gray-300">{result.score} / {result.total} صحيحة</p>
            </div>
          </div>
        </motion.div>

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
                  const isCorrect  = detail?.correct_option_id === opt.id;
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
                      <span className="ml-2">{isCorrect ? '✓' : isSelected ? '✗' : ''}</span>
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

  // ══ شاشة بدء الامتحان ══
  if (!examStarted) {
    const q   = exam.exam_questions?.length ?? 0;
    const dur = exam.duration_minutes;
    return (
      <div className="flex min-h-[70vh] flex-col items-center justify-center" dir="rtl">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md space-y-6 rounded-3xl border border-white/10 bg-white/[0.03] p-8 text-center"
        >
          <div className="flex h-20 w-20 mx-auto items-center justify-center rounded-2xl bg-[#D4AF37]/10 border border-[#D4AF37]/20">
            <Shield size={40} className="text-[#D4AF37]" />
          </div>

          <div>
            <h2 className="font-amiri text-2xl font-bold text-white">{exam.title}</h2>
            <p className="mt-1 text-sm text-gray-400">
              {SCOPE_LABELS[exam.scope_type]} • {q} سؤال{dur && ` • ${dur} دقيقة`}
            </p>
          </div>

          {/* قواعد الامتحان */}
          <div className="space-y-2 rounded-2xl border border-white/10 bg-white/[0.02] p-4 text-right">
            <p className="mb-3 text-sm font-bold text-[#D4AF37]">📋 قبل البدء – اقرأ بعناية:</p>
            {[
              dur && `⏱️ مدة الامتحان ${dur} دقيقة فقط`,
              '🚫 لا تغادر الصفحة أثناء الامتحان',
              '👁️ سيُرصد أي تغيير في التاب أو النافذة',
              '📵 أغلق أي تطبيقات مشتتة',
              '✅ يمكنك التنقل بين الأسئلة بحرية',
            ].filter(Boolean).map((rule, i) => (
              <p key={i} className="text-sm text-gray-300">{rule}</p>
            ))}
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => navigate('/dashboard/exams')}
              className="flex-1 rounded-xl border border-white/10 py-3 text-sm text-gray-400 hover:bg-white/5"
            >
              رجوع
            </button>
            <button
              onClick={() => { setExamStarted(true); enterFullscreen(); }}
              className="flex-1 rounded-xl bg-gradient-to-r from-[#D4AF37] to-[#AA7C11] py-3 font-bold text-black hover:opacity-90"
            >
              <span className="flex items-center justify-center gap-2">
                <Maximize size={16} />
                ابدأ الامتحان
              </span>
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  // ══ واجهة الامتحان الفعلية ══
  const questions      = exam.exam_questions || [];
  const currentQuestion = questions[currentQ];
  const answeredCount  = Object.keys(answers).length;
  const progress       = questions.length > 0 ? (answeredCount / questions.length) * 100 : 0;

  return (
    <div ref={containerRef} className="space-y-4" dir="rtl">

      {/* Toast */}
      <AnimatePresence>
        {toastMsg && (
          <ToastWarning message={toastMsg} onDone={() => setToastMsg('')} />
        )}
      </AnimatePresence>

      {/* تحذير المغادرة */}
      <LeaveWarningBanner count={leaveCount} />

      {/* Header شريط المعلومات */}
      <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">

          {/* التايمر */}
          {exam.duration_minutes ? (
            <ExamTimer
              totalMinutes={exam.duration_minutes}
              onTimeUp={() => setTimeUp(true)}
              onWarning={(msg) => setToastMsg(msg)}
            />
          ) : (
            <div className="flex items-center gap-2 text-sm text-gray-400">
              <Clock size={14} />
              <span>بدون وقت محدد</span>
            </div>
          )}

          {/* معلومات الامتحان */}
          <div className="text-right">
            <h2 className="font-bold text-white">{exam.title}</h2>
            <p className="mt-0.5 text-xs text-gray-400">
              {answeredCount} / {questions.length} سؤال تمت الإجابة عليه
            </p>
          </div>
        </div>

        {/* شريط التقدم */}
        <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-white/10">
          <motion.div
            className="h-full rounded-full bg-[#D4AF37]"
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.4 }}
          />
        </div>
      </div>

      {/* السؤال الحالي */}
      <AnimatePresence mode="wait">
        {currentQuestion && (
          <motion.div
            key={currentQ}
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -30 }}
            transition={{ duration: 0.2 }}
            className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 text-right"
          >
            <div className="mb-5 flex items-start gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#D4AF37] text-sm font-black text-black">
                {currentQ + 1}
              </div>
              <p className="text-lg font-bold leading-relaxed text-white">
                {currentQuestion.question_text}
              </p>
            </div>

            <div className="space-y-3">
              {currentQuestion.exam_question_options.map((opt, oi) => {
                const selected   = answers[currentQuestion.id] === opt.id;
                const optLetters = ['أ', 'ب', 'ج', 'د'];
                return (
                  <motion.button
                    key={opt.id}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => {
                      setAnswers((prev) => ({ ...prev, [currentQuestion.id]: opt.id }));
                      // الانتقال للسؤال التالي تلقائياً بعد 300ms
                      if (currentQ < questions.length - 1) {
                        setTimeout(() => setCurrentQ((p) => p + 1), 350);
                      }
                    }}
                    className={`flex w-full items-center gap-3 rounded-xl border px-4 py-3.5 text-right transition-all ${
                      selected
                        ? 'border-[#D4AF37]/60 bg-[#D4AF37]/10 text-white shadow-[0_0_0_1px_rgba(212,175,55,0.3)]'
                        : 'border-white/10 bg-white/[0.02] text-gray-300 hover:border-white/20 hover:bg-white/[0.05]'
                    }`}
                  >
                    {/* حرف الاختيار */}
                    <span
                      className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-sm font-bold transition-all ${
                        selected ? 'bg-[#D4AF37] text-black' : 'bg-white/5 text-gray-400'
                      }`}
                    >
                      {optLetters[oi] ?? oi + 1}
                    </span>
                    <span className="flex-1 text-sm leading-relaxed">{opt.option_text}</span>

                    {/* دائرة التحديد */}
                    <span
                      className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 transition-all ${
                        selected ? 'border-[#D4AF37] bg-[#D4AF37]' : 'border-gray-600'
                      }`}
                    >
                      {selected && <span className="h-2 w-2 rounded-full bg-black" />}
                    </span>
                  </motion.button>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Navigation: أزرار + شبكة الأسئلة */}
      <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
        {/* شبكة الأسئلة */}
        <div className="mb-4 flex flex-wrap gap-2 justify-center">
          {questions.map((q, i) => (
            <button
              key={q.id}
              onClick={() => setCurrentQ(i)}
              className={`h-9 w-9 rounded-xl text-xs font-bold transition-all ${
                i === currentQ
                  ? 'bg-[#D4AF37] text-black scale-110 shadow-md'
                  : answers[q.id]
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                  : 'bg-white/5 text-gray-400 hover:bg-white/10'
              }`}
            >
              {i + 1}
            </button>
          ))}
        </div>

        {/* أزرار السابق / التالي */}
        <div className="flex items-center justify-between gap-3">
          <button
            disabled={currentQ === questions.length - 1}
            onClick={() => setCurrentQ((p) => Math.min(p + 1, questions.length - 1))}
            className="rounded-xl bg-white/10 px-5 py-2.5 text-sm font-bold text-gray-300 disabled:opacity-30 hover:bg-white/15"
          >
            التالي ←
          </button>

          <span className="text-xs text-gray-500">
            {currentQ + 1} / {questions.length}
          </span>

          <button
            disabled={currentQ === 0}
            onClick={() => setCurrentQ((p) => Math.max(p - 1, 0))}
            className="rounded-xl bg-white/10 px-5 py-2.5 text-sm font-bold text-gray-300 disabled:opacity-30 hover:bg-white/15"
          >
            → السابق
          </button>
        </div>
      </div>

      {/* زر التسليم */}
      <motion.button
        whileTap={{ scale: 0.98 }}
        onClick={() => handleSubmit(false)}
        disabled={submitting || timeUp}
        className="w-full rounded-2xl bg-gradient-to-r from-[#D4AF37] to-[#AA7C11] py-4 font-bold text-black disabled:opacity-60 hover:opacity-90"
      >
        {submitting
          ? 'جاري التسليم...'
          : timeUp
          ? 'انتهى الوقت...'
          : `تسليم الامتحان 📝  (${answeredCount}/${questions.length})`
        }
      </motion.button>

      {/* Anti-cheat notice */}
      <p className="flex items-center justify-center gap-1.5 text-center text-xs text-gray-600">
        <Eye size={11} />
        هذا الامتحان محمي – لا تغادر الصفحة
      </p>
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