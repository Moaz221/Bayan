import { useState } from 'react';
import { Link, Route, Routes, useParams } from 'react-router-dom';
import { BookOpen, Lock, Play, FileText, ChevronLeft, CalendarDays, CheckCircle2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { getLessonsWithAccess } from '../../lib/student';
import LoadingScreen from '../shared/LoadingScreen';
import EmptyState from '../shared/EmptyState';

const TERM_LABELS = { 1: 'الترم الأول', 2: 'الترم الثاني' };

// ══ قائمة الوحدات ══
const UnitsList = ({ units }) => {
  const [termFilter, setTermFilter] = useState('all');

  const filtered = (units || []).filter((u) =>
    termFilter === 'all' ? true : String(u.term) === String(termFilter)
  );

  return (
    <div className="space-y-5" dir="rtl">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex gap-2">
          {['all', '1', '2'].map((t) => (
            <button
              key={t}
              onClick={() => setTermFilter(t)}
              className={`rounded-xl px-4 py-2 text-sm font-bold transition ${
                termFilter === t ? 'bg-[#D4AF37] text-black' : 'bg-white/5 text-gray-300 hover:bg-white/10'
              }`}
            >
              {t === 'all' ? 'الكل' : t === '1' ? 'الترم الأول' : 'الترم الثاني'}
            </button>
          ))}
        </div>
        <h2 className="text-xl font-bold text-white">الوحدات والدروس</h2>
      </div>

      {filtered.length === 0 ? (
        <EmptyState title="لا توجد وحدات" description="لا توجد وحدات متاحة بهذا الفلتر." />
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {filtered.map((unit, i) => (
            <motion.div
              key={unit.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className={`relative overflow-hidden rounded-2xl border p-5 text-right transition ${
                unit.isAccessible
                  ? 'border-[#D4AF37]/20 bg-[#D4AF37]/5 hover:border-[#D4AF37]/40'
                  : 'border-white/10 bg-white/[0.02]'
              }`}
            >
              {/* Locked Overlay */}
              {!unit.isAccessible && (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-black/50 backdrop-blur-[3px]">
                  <Lock size={24} className="text-[#D4AF37]" />
                  <p className="text-sm font-bold text-[#D4AF37]">تحتاج اشتراك للوصول</p>
                </div>
              )}

              <div className={unit.isAccessible ? '' : 'opacity-30'}>
                <div className="flex items-start justify-between gap-2">
                  <div className="flex flex-wrap gap-1.5">
                    <span className="inline-flex items-center gap-1 rounded-full border border-violet-500/20 bg-violet-500/10 px-2.5 py-0.5 text-[11px] text-violet-300">
                      <CalendarDays size={10} />
                      {unit.term ? TERM_LABELS[unit.term] : 'عام'}
                    </span>
                    {unit.is_final_review && (
                      <span className="inline-flex items-center gap-1 rounded-full border border-[#D4AF37]/20 bg-[#D4AF37]/10 px-2.5 py-0.5 text-[11px] text-[#D4AF37]">
                        <CheckCircle2 size={10} />
                        مراجعة نهائية
                      </span>
                    )}
                  </div>
                  <BookOpen size={18} className="mt-0.5 text-[#D4AF37]" />
                </div>

                <h3 className="mt-3 text-lg font-bold text-white">{unit.title}</h3>
                <p className="mt-1 text-sm text-gray-400">{unit.lessonsCount} درس</p>

                {unit.isAccessible && (
                  <Link
                    to={`/dashboard/units/${unit.id}`}
                    className="mt-4 flex w-full items-center justify-between rounded-xl bg-[#D4AF37]/10 px-4 py-2.5 text-sm font-bold text-[#D4AF37] transition hover:bg-[#D4AF37]/20"
                  >
                    <ChevronLeft size={16} />
                    عرض الدروس
                  </Link>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

// ══ صفحة الوحدة - عرض الدروس ══
const UnitDetail = ({ units, profile }) => {
  const { unitId } = useParams();
  const [lessons, setLessons] = useState(null);
  const [loading, setLoading] = useState(true);

  const unit = (units || []).find((u) => String(u.id) === String(unitId));

  useState(() => {
    if (!unitId || !profile) return;
    getLessonsWithAccess(Number(unitId), profile)
      .then(setLessons)
      .catch(console.error)
      .finally(() => setLoading(false));
  });

  if (loading) return <LoadingScreen text="جاري تحميل الدروس..." />;

  return (
    <div className="space-y-5" dir="rtl">
      <div className="flex items-center gap-3">
        <Link to="/dashboard/units" className="text-sm text-gray-400 hover:text-white">
          ← الوحدات
        </Link>
        <span className="text-gray-600">/</span>
        <h2 className="text-xl font-bold text-white">{unit?.title}</h2>
      </div>

      {!lessons?.length ? (
        <EmptyState title="لا توجد دروس" description="لم يُضف الأستاذ دروساً لهذه الوحدة بعد." />
      ) : (
        <div className="space-y-3">
          {lessons.map((lesson, i) => (
            <motion.div
              key={lesson.id}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 text-right"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex flex-wrap gap-2">
                  {lesson.video_url && (
                    <a
                      href={lesson.isAccessible ? lesson.video_url : '#'}
                      target={lesson.isAccessible ? '_blank' : '_self'}
                      rel="noreferrer"
                      onClick={(e) => { if (!lesson.isAccessible) e.preventDefault(); }}
                      className={`inline-flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-bold transition ${
                        lesson.isAccessible
                          ? 'bg-red-500/10 text-red-300 hover:bg-red-500/20'
                          : 'cursor-not-allowed bg-white/5 text-gray-600'
                      }`}
                    >
                      {lesson.isAccessible ? <Play size={13} /> : <Lock size={13} />}
                      فيديو الشرح
                    </a>
                  )}
                  {lesson.lesson_pdf_url && (
                    <a
                      href={lesson.isAccessible ? lesson.lesson_pdf_url : '#'}
                      target={lesson.isAccessible ? '_blank' : '_self'}
                      rel="noreferrer"
                      onClick={(e) => { if (!lesson.isAccessible) e.preventDefault(); }}
                      className={`inline-flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-bold transition ${
                        lesson.isAccessible
                          ? 'bg-blue-500/10 text-blue-300 hover:bg-blue-500/20'
                          : 'cursor-not-allowed bg-white/5 text-gray-600'
                      }`}
                    >
                      {lesson.isAccessible ? <FileText size={13} /> : <Lock size={13} />}
                      ملف الشرح
                    </a>
                  )}
                  {lesson.exam_pdf_url && (
                    <a
                      href={lesson.isAccessible ? lesson.exam_pdf_url : '#'}
                      target={lesson.isAccessible ? '_blank' : '_self'}
                      rel="noreferrer"
                      onClick={(e) => { if (!lesson.isAccessible) e.preventDefault(); }}
                      className={`inline-flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-bold transition ${
                        lesson.isAccessible
                          ? 'bg-emerald-500/10 text-emerald-300 hover:bg-emerald-500/20'
                          : 'cursor-not-allowed bg-white/5 text-gray-600'
                      }`}
                    >
                      {lesson.isAccessible ? <FileText size={13} /> : <Lock size={13} />}
                      ملف الامتحان
                    </a>
                  )}
                </div>
                <div>
                  <h4 className="font-bold text-white">{lesson.title}</h4>
                  {!lesson.isAccessible && (
                    <span className="mt-1 inline-flex items-center gap-1 text-xs text-amber-400">
                      <Lock size={10} /> مقفول
                    </span>
                  )}
                </div>
              </div>
              {lesson.description && lesson.isAccessible && (
                <p className="mt-3 text-sm leading-6 text-gray-400">{lesson.description}</p>
              )}
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

// ══ الـ Router لقسم الوحدات ══
const StudentUnits = ({ units, profile }) => (
  <Routes>
    <Route index element={<UnitsList units={units} />} />
    <Route path=":unitId" element={<UnitDetail units={units} profile={profile} />} />
  </Routes>
);

export default StudentUnits;