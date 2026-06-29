import { useState, useEffect } from 'react';
import { Link, Route, Routes, useParams } from 'react-router-dom';
import { 
  BookOpen, Lock, Play, FileText, ChevronLeft, 
  CalendarDays, CheckCircle2, Send, BookMarked,
  X, ChevronRight, Sparkles, ArrowRight, ArrowLeft,
  Video, PlayCircle, Clock
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { getLessonsWithAccess } from '../../lib/student';
import LoadingScreen from '../shared/LoadingScreen';
import EmptyState from '../shared/EmptyState';

const TERM_LABELS = { 1: 'الترم الأول', 2: 'الترم الثاني' };

// ═══════════════════════════════════════════════════════
// 🎬 VIDEO PLAYER MODAL
// ═══════════════════════════════════════════════════════
const VideoModal = ({ videoUrl, lessonTitle, onClose }) => {
  // تحويل الـ URL لـ embed format
  const getEmbedUrl = (url) => {
    if (!url) return '';

    // YouTube
    const youtubeRegex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
    const youtubeMatch = url.match(youtubeRegex);
    if (youtubeMatch) {
      return `https://www.youtube.com/embed/${youtubeMatch[1]}?autoplay=1&rel=0&modestbranding=1`;
    }

    // Vimeo
    const vimeoRegex = /vimeo\.com\/(\d+)/;
    const vimeoMatch = url.match(vimeoRegex);
    if (vimeoMatch) {
      return `https://player.vimeo.com/video/${vimeoMatch[1]}?autoplay=1`;
    }

    // Google Drive
    if (url.includes('drive.google.com')) {
      const driveId = url.match(/[-\w]{25,}/);
      if (driveId) {
        return `https://drive.google.com/file/d/${driveId[0]}/preview`;
      }
    }

    return url; // direct video link
  };

  const embedUrl = getEmbedUrl(videoUrl);

  // Close on ESC
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [onClose]);

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 z-[200] flex items-center justify-center bg-black/95 backdrop-blur-md p-4"
        dir="rtl"
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 30 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 30 }}
          transition={{ duration: 0.3 }}
          onClick={(e) => e.stopPropagation()}
          className="relative w-full max-w-6xl"
        >
          {/* Header */}
          <div className="mb-4 flex items-center justify-between">
            <button
              onClick={onClose}
              className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/5 text-white transition hover:bg-white/10"
            >
              <X size={20} />
            </button>

            <div className="flex items-center gap-3 text-right">
              <div>
                <p className="text-xs text-[#D4AF37] flex items-center justify-end gap-1.5">
                  <Sparkles size={12} />
                  جاري التشغيل
                </p>
                <h3 className="text-lg font-bold text-white">{lessonTitle}</h3>
              </div>
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-500/20">
                <Video size={20} className="text-red-300" />
              </div>
            </div>
          </div>

          {/* Video Container */}
          <div className="relative aspect-video w-full overflow-hidden rounded-3xl border border-white/10 bg-black shadow-2xl shadow-[#D4AF37]/10">
            {embedUrl ? (
              <iframe
                src={embedUrl}
                title={lessonTitle}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
                className="absolute inset-0 h-full w-full"
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center text-gray-400">
                لا يمكن تشغيل هذا الفيديو
              </div>
            )}
          </div>

          {/* Hint */}
          <p className="mt-4 text-center text-xs text-gray-500">
            اضغط <kbd className="rounded bg-white/10 px-1.5 py-0.5 text-[10px]">ESC</kbd> للخروج
          </p>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

// ═══════════════════════════════════════════════════════
// 📚 UNITS LIST
// ═══════════════════════════════════════════════════════
const UnitsList = ({ units }) => {
  const [termFilter, setTermFilter] = useState('all');

  const filtered = (units || []).filter((u) =>
    termFilter === 'all' ? true : String(u.term) === String(termFilter)
  );

  return (
    <div className="space-y-6" dir="rtl">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-3xl border border-white/10 bg-gradient-to-br from-[#1a1f2e] via-[#0f1420] to-[#0a0e18] p-6"
      >
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap gap-2">
            {[
              { value: 'all', label: 'الكل' },
              { value: '1', label: 'الترم الأول' },
              { value: '2', label: 'الترم الثاني' },
            ].map((t) => (
              <button
                key={t.value}
                onClick={() => setTermFilter(t.value)}
                className={`rounded-xl px-5 py-2.5 text-sm font-bold transition ${
                  termFilter === t.value
                    ? 'bg-gradient-to-r from-[#D4AF37] to-[#AA7C11] text-black shadow-lg shadow-[#D4AF37]/30'
                    : 'bg-white/5 text-gray-300 hover:bg-white/10'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-3 text-right">
            <div>
              <h2 className="text-2xl font-bold text-white">الوحدات والدروس</h2>
              <p className="mt-1 text-sm text-gray-400">{filtered.length} وحدة متاحة</p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#D4AF37]/10">
              <BookOpen size={22} className="text-[#D4AF37]" />
            </div>
          </div>
        </div>
      </motion.div>

      {filtered.length === 0 ? (
        <EmptyState title="لا توجد وحدات" description="لا توجد وحدات متاحة بهذا الفلتر." />
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filtered.map((unit, i) => (
            <motion.div
              key={unit.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className={`group relative h-full overflow-hidden rounded-2xl border transition-all ${
                unit.isAccessible
                  ? 'border-white/10 bg-gradient-to-br from-[#1a1f2e] to-[#0f1420] hover:border-[#D4AF37]/40 hover:shadow-xl hover:shadow-[#D4AF37]/5'
                  : 'border-white/5 bg-white/[0.02]'
              }`}
            >
              {/* Lock Overlay */}
              {!unit.isAccessible && (
                <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-3 bg-gradient-to-br from-black/70 via-black/60 to-black/80 backdrop-blur-[3px]">
                  <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#D4AF37]/20 backdrop-blur">
                    <Lock size={22} className="text-[#D4AF37]" />
                  </div>
                  <p className="text-sm font-bold text-[#D4AF37]">تحتاج اشتراك للوصول</p>
                </div>
              )}

              {/* Background Effect */}
              {unit.isAccessible && (
                <div className="absolute -top-10 -left-10 h-32 w-32 rounded-full bg-[#D4AF37]/5 opacity-0 blur-2xl transition-opacity group-hover:opacity-100" />
              )}

              <div className={`relative p-5 ${unit.isAccessible ? '' : 'opacity-30'}`}>
                {/* Header */}
                <div className="mb-4 flex items-start justify-between">
                  <div className="flex flex-wrap gap-1.5">
                    {unit.term && (
                      <span className="inline-flex items-center gap-1 rounded-full border border-violet-500/20 bg-violet-500/10 px-2.5 py-1 text-[11px] font-bold text-violet-300">
                        <CalendarDays size={10} />
                        {TERM_LABELS[unit.term]}
                      </span>
                    )}
                    {unit.is_final_review && (
                      <span className="inline-flex items-center gap-1 rounded-full border border-[#D4AF37]/20 bg-[#D4AF37]/10 px-2.5 py-1 text-[11px] font-bold text-[#D4AF37]">
                        <CheckCircle2 size={10} />
                        مراجعة
                      </span>
                    )}
                  </div>
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#D4AF37]/10 transition group-hover:scale-110">
                    <BookOpen size={20} className="text-[#D4AF37]" />
                  </div>
                </div>

                {/* Title */}
                <h3 className="mb-2 text-right text-lg font-bold text-white transition group-hover:text-[#D4AF37]">
                  {unit.title}
                </h3>

                {/* Footer */}
                <div className="mt-4 flex items-center justify-between border-t border-white/5 pt-4">
                  <p className="flex items-center gap-1.5 text-xs text-gray-400">
                    <PlayCircle size={12} />
                    {unit.lessonsCount} درس
                  </p>

                  {unit.isAccessible && (
                    <Link
                      to={`/dashboard/units/${unit.id}`}
                      className="inline-flex items-center gap-1.5 rounded-xl bg-[#D4AF37]/10 px-4 py-2 text-xs font-bold text-[#D4AF37] transition hover:bg-[#D4AF37]/20 group-hover:bg-[#D4AF37] group-hover:text-black"
                    >
                      <ArrowLeft size={14} />
                      ابدأ الآن
                    </Link>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

// ═══════════════════════════════════════════════════════
// 📖 UNIT DETAIL
// ═══════════════════════════════════════════════════════
const UnitDetail = ({ units, profile }) => {
  const { unitId } = useParams();
  const [lessons, setLessons] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeVideo, setActiveVideo] = useState(null); // { url, title }

  const unit = (units || []).find((u) => String(u.id) === String(unitId));

  useEffect(() => {
    if (!unitId || !profile) return;
    setLoading(true);
    getLessonsWithAccess(Number(unitId), profile)
      .then(setLessons)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [unitId, profile]);

  if (loading) return <LoadingScreen text="جاري تحميل الدروس..." />;

  return (
    <>
      <div className="space-y-6" dir="rtl">
        {/* Breadcrumb */}
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex items-center gap-2 text-sm"
        >
          <Link 
            to="/dashboard/units" 
            className="flex items-center gap-1 text-gray-400 transition hover:text-[#D4AF37]"
          >
            <ChevronRight size={14} />
            الوحدات
          </Link>
          <span className="text-gray-600">/</span>
          <span className="font-bold text-white">{unit?.title}</span>
        </motion.div>

        {/* Unit Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-3xl border border-white/10 bg-gradient-to-br from-[#1a1f2e] via-[#0f1420] to-[#0a0e18] p-6"
        >
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex flex-wrap gap-2">
              {unit?.term && (
                <span className="inline-flex items-center gap-1 rounded-full border border-violet-500/20 bg-violet-500/10 px-3 py-1 text-xs font-bold text-violet-300">
                  <CalendarDays size={12} />
                  {TERM_LABELS[unit.term]}
                </span>
              )}
              {unit?.is_final_review && (
                <span className="inline-flex items-center gap-1 rounded-full border border-[#D4AF37]/20 bg-[#D4AF37]/10 px-3 py-1 text-xs font-bold text-[#D4AF37]">
                  <CheckCircle2 size={12} />
                  مراجعة نهائية
                </span>
              )}
            </div>

            <div className="flex items-center gap-3 text-right">
              <div>
                <h2 className="text-2xl font-bold text-white md:text-3xl">{unit?.title}</h2>
                <p className="mt-1 text-sm text-gray-400">{lessons?.length || 0} درس متاح</p>
              </div>
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-[#D4AF37] to-[#AA7C11] shadow-lg shadow-[#D4AF37]/30">
                <BookOpen size={24} className="text-black" />
              </div>
            </div>
          </div>
        </motion.div>

        {/* Telegram Card */}
        {unit?.telegram_group_url && (
          <motion.a
            href={unit.telegram_group_url}
            target="_blank"
            rel="noreferrer"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="group flex items-center justify-between gap-3 rounded-2xl border border-sky-500/30 bg-gradient-to-l from-sky-500/15 to-sky-500/5 p-5 transition hover:border-sky-500/50 hover:shadow-lg hover:shadow-sky-500/10"
          >
            <ArrowLeft className="text-sky-300 transition group-hover:-translate-x-1" size={20} />
            <div className="flex flex-1 items-center gap-3 justify-end">
              <div className="text-right">
                <p className="text-base font-bold text-white">جروب التيليجرام للوحدة</p>
                <p className="mt-0.5 text-xs text-sky-300">انضم للتواصل مع زملائك والأستاذ</p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-sky-500/20 transition group-hover:scale-110">
                <Send size={20} className="text-sky-300" />
              </div>
            </div>
          </motion.a>
        )}

        {/* Lessons */}
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
                className={`rounded-2xl border p-5 transition ${
                  lesson.isAccessible
                    ? 'border-white/10 bg-gradient-to-br from-white/[0.04] to-white/[0.02] hover:border-[#D4AF37]/20'
                    : 'border-white/5 bg-white/[0.01]'
                }`}
              >
                <div className="flex flex-col gap-4 md:flex-row-reverse md:items-center md:justify-between">
                  {/* Title */}
                  <div className="flex items-start gap-3 text-right md:flex-1">
                    <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${
                      lesson.isAccessible 
                        ? 'bg-[#D4AF37]/10 text-[#D4AF37]' 
                        : 'bg-white/5 text-gray-600'
                    }`}>
                      <span className="font-bold">{i + 1}</span>
                    </div>
                    <div className="flex-1">
                      <h4 className="text-lg font-bold text-white">{lesson.title}</h4>
                      {!lesson.isAccessible ? (
                        <span className="mt-1 inline-flex items-center gap-1 text-xs text-amber-400">
                          <Lock size={10} /> مقفول — يحتاج اشتراك
                        </span>
                      ) : lesson.description ? (
                        <p className="mt-1 text-sm leading-6 text-gray-400 line-clamp-2">
                          {lesson.description}
                        </p>
                      ) : null}
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-wrap gap-2 md:justify-end">
                    {/* فيديو الشرح - يفتح Modal */}
                    {lesson.video_url && (
                      <button
                        onClick={() => {
                          if (lesson.isAccessible) {
                            setActiveVideo({ url: lesson.video_url, title: lesson.title });
                          }
                        }}
                        disabled={!lesson.isAccessible}
                        className={`inline-flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-bold transition ${
                          lesson.isAccessible
                            ? 'bg-red-500/10 text-red-300 hover:bg-red-500/20'
                            : 'cursor-not-allowed bg-white/5 text-gray-600'
                        }`}
                      >
                        {lesson.isAccessible ? <Play size={13} /> : <Lock size={13} />}
                        مشاهدة الشرح
                      </button>
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
                        الشرح
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
                        الامتحان
                      </a>
                    )}

                    {lesson.homework_pdf_url && (
                      <a
                        href={lesson.isAccessible ? lesson.homework_pdf_url : '#'}
                        target={lesson.isAccessible ? '_blank' : '_self'}
                        rel="noreferrer"
                        onClick={(e) => { if (!lesson.isAccessible) e.preventDefault(); }}
                        className={`inline-flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-bold transition ${
                          lesson.isAccessible
                            ? 'bg-orange-500/10 text-orange-300 hover:bg-orange-500/20'
                            : 'cursor-not-allowed bg-white/5 text-gray-600'
                        }`}
                      >
                        {lesson.isAccessible ? <BookMarked size={13} /> : <Lock size={13} />}
                        الواجب
                      </a>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Video Modal */}
      {activeVideo && (
        <VideoModal
          videoUrl={activeVideo.url}
          lessonTitle={activeVideo.title}
          onClose={() => setActiveVideo(null)}
        />
      )}
    </>
  );
};

const StudentUnits = ({ units, profile }) => (
  <Routes>
    <Route index element={<UnitsList units={units} />} />
    <Route path=":unitId" element={<UnitDetail units={units} profile={profile} />} />
  </Routes>
);

export default StudentUnits;