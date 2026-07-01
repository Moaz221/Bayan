import { useMemo } from 'react';
import { 
  BookOpen, 
  FileQuestion, 
  Lock, 
  Sparkles, 
  Crown,
  ArrowLeft,
  CheckCircle2,
  Clock,
  TrendingUp,
  Flame,
  Calendar,
  Target,
  Send,
  PlayCircle,
  GraduationCap,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { WHATSAPP_LINK } from '../../lib/contact';

const GRADE_LABELS = { 1: 'أولى ثانوي', 2: 'ثانية ثانوي', 3: 'ثالثة ثانوي' };
const SUB_LABELS = { 
  monthly: 'شهري', 
  term: 'فصل دراسي', 
  yearly: 'سنوي شامل', 
  final_review: 'مراجعة نهائية' 
};

const StudentHome = ({ units, exams, profile }) => {
  const accessibleUnits = useMemo(() => (units || []).filter((u) => u.isAccessible), [units]);
  const accessibleExams = useMemo(() => (exams || []).filter((e) => e.isAccessible), [exams]);
  const lockedUnits = useMemo(() => (units || []).filter((u) => !u.isAccessible), [units]);
  const isActive = profile?.subscription_status === 'active' && profile?.is_active;

  // حساب نسبة التقدم
  const progressPercent = units?.length 
    ? Math.round((accessibleUnits.length / units.length) * 100) 
    : 0;

  // التحية حسب الوقت
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'صباح الخير';
    if (hour < 18) return 'مساء الخير';
    return 'مساء النور';
  };

  return (
    <div className="space-y-8" dir="rtl">

      {/* ════════════════════════ HERO HEADER ════════════════════════ */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-[#1a1f2e] via-[#0f1420] to-[#0a0e18] p-8"
      >
        {/* تأثيرات خلفية */}
        <div className="absolute -top-20 -right-20 h-64 w-64 rounded-full bg-[#D4AF37]/10 blur-3xl" />
        <div className="absolute -bottom-20 -left-20 h-64 w-64 rounded-full bg-violet-500/10 blur-3xl" />
        
        <div className="relative flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          {/* الأيقونة */}
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ delay: 0.2, type: 'spring' }}
            className="hidden md:flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-[#D4AF37] to-[#AA7C11] shadow-2xl shadow-[#D4AF37]/30"
          >
            <GraduationCap size={36} className="text-black" />
          </motion.div>

          {/* النصوص */}
          <div className="flex-1 text-right">
            <div className="mb-2 flex items-center justify-end gap-2">
              <span className="text-sm font-medium text-[#D4AF37]">{getGreeting()}</span>
              <Sparkles size={14} className="text-[#D4AF37]" />
            </div>
            <h1 className="font-amiri text-4xl font-bold text-white md:text-5xl">
              أهلاً، <span className="bg-gradient-to-l from-[#D4AF37] to-[#fde08a] bg-clip-text text-transparent">{profile?.full_name?.split(' ')[0] || 'طالب'}</span>
            </h1>
            <p className="mt-3 flex items-center justify-end gap-2 text-gray-400">
              <span>{GRADE_LABELS[profile?.grade_level] || '-'}</span>
              <span className="text-gray-600">•</span>
              <span>منصة بَيان لتعلم اللغة العربية</span>
            </p>
          </div>
        </div>

        {/* شريط التقدم */}
        {isActive && units?.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="relative mt-6 rounded-2xl border border-white/5 bg-black/30 p-4"
          >
            <div className="mb-2 flex items-center justify-between">
              <span className="text-sm font-bold text-[#D4AF37]">{progressPercent}%</span>
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-300">تقدمك في المنصة</span>
                <Target size={14} className="text-[#D4AF37]" />
              </div>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-white/5">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${progressPercent}%` }}
                transition={{ duration: 1.2, ease: 'easeOut', delay: 0.6 }}
                className="h-full rounded-full bg-gradient-to-l from-[#D4AF37] via-[#fde08a] to-[#D4AF37]"
              />
            </div>
          </motion.div>
        )}
      </motion.div>

      {/* ════════════════════════ ALERT FOR INACTIVE ════════════════════════ */}
      {!isActive && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="relative overflow-hidden rounded-3xl border-2 border-[#D4AF37]/30 bg-gradient-to-l from-[#D4AF37]/15 via-[#D4AF37]/5 to-transparent p-6 md:p-8"
        >
          <div className="absolute top-0 right-0 h-32 w-32 -translate-y-8 translate-x-8 rounded-full bg-[#D4AF37]/20 blur-2xl" />
          
          <div className="relative flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
            <div className="flex flex-wrap gap-2">
              <a
                href={WHATSAPP_LINK}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 rounded-xl bg-[#25D366] px-5 py-3 text-sm font-bold text-white shadow-lg shadow-green-900/30 transition hover:scale-105"
              >
                <Send size={16} />
                واتساب للاشتراك
              </a>
              <Link
                to="/#pricing"
                className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-l from-[#D4AF37] to-[#AA7C11] px-5 py-3 text-sm font-bold text-black shadow-lg shadow-[#D4AF37]/20 transition hover:scale-105"
              >
                <Crown size={16} />
                عرض الباقات
              </Link>
            </div>

            <div className="text-right">
              <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-amber-500/20 px-3 py-1 text-xs font-bold text-amber-300">
                <Clock size={12} />
                في انتظار التفعيل
              </div>
              <h3 className="text-xl font-bold text-white md:text-2xl">
                ابدأ رحلتك التعليمية الآن 🚀
              </h3>
              <p className="mt-1 text-sm text-gray-400">
                اشترك في إحدى باقاتنا واستمتع بالوصول الكامل لكل المحتوى
              </p>
            </div>
          </div>
        </motion.div>
      )}

      {/* ════════════════════════ STATS GRID ════════════════════════ */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard
          icon={BookOpen}
          label="وحدات متاحة"
          value={accessibleUnits.length}
          subtitle={`من ${units?.length || 0} وحدة`}
          gradient="from-sky-500/20 to-blue-500/5"
          border="border-sky-500/30"
          iconColor="text-sky-300"
          iconBg="bg-sky-500/20"
          delay={0}
        />
        <StatCard
          icon={FileQuestion}
          label="امتحانات"
          value={accessibleExams.length}
          subtitle={`من ${exams?.length || 0} امتحان`}
          gradient="from-emerald-500/20 to-green-500/5"
          border="border-emerald-500/30"
          iconColor="text-emerald-300"
          iconBg="bg-emerald-500/20"
          delay={0.1}
        />
        <StatCard
          icon={isActive ? CheckCircle2 : Clock}
          label="حالة الاشتراك"
          value={isActive ? 'نشط' : 'مُعلّق'}
          subtitle={isActive ? 'مستمر' : 'غير مفعّل'}
          gradient={isActive 
            ? 'from-emerald-500/20 to-green-500/5' 
            : 'from-amber-500/20 to-orange-500/5'}
          border={isActive ? 'border-emerald-500/30' : 'border-amber-500/30'}
          iconColor={isActive ? 'text-emerald-300' : 'text-amber-300'}
          iconBg={isActive ? 'bg-emerald-500/20' : 'bg-amber-500/20'}
          delay={0.2}
        />
        <StatCard
          icon={Crown}
          label="نوع الاشتراك"
          value={SUB_LABELS[profile?.subscription_type] || 'لا يوجد'}
          subtitle={profile?.subscription_end 
            ? `حتى ${new Date(profile.subscription_end).toLocaleDateString('ar-EG')}` 
            : '—'}
          gradient="from-[#D4AF37]/20 to-yellow-500/5"
          border="border-[#D4AF37]/30"
          iconColor="text-[#D4AF37]"
          iconBg="bg-[#D4AF37]/20"
          delay={0.3}
        />
      </div>

      {/* ════════════════════════ AVAILABLE UNITS ════════════════════════ */}
      {accessibleUnits.length > 0 && (
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <SectionHeader
            icon={Flame}
            title="ابدأ التعلم الآن"
            subtitle="الوحدات المتاحة في اشتراكك"
            linkTo="/dashboard/units"
            linkText="كل الوحدات"
          />

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {accessibleUnits.slice(0, 6).map((unit, i) => (
              <motion.div
                key={unit.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 + i * 0.05 }}
              >
                <Link
                  to={`/dashboard/units/${unit.id}`}
                  className="group block h-full"
                >
                  <div className="relative h-full overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-[#1a1f2e] to-[#0f1420] p-5 transition-all hover:border-[#D4AF37]/40 hover:shadow-xl hover:shadow-[#D4AF37]/5">
                    {/* تأثير hover */}
                    <div className="absolute inset-0 opacity-0 transition-opacity group-hover:opacity-100">
                      <div className="absolute -top-10 -left-10 h-32 w-32 rounded-full bg-[#D4AF37]/10 blur-2xl" />
                    </div>

                    <div className="relative">
                      {/* Badges */}
                      <div className="mb-4 flex items-center justify-between">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#D4AF37]/10 transition group-hover:bg-[#D4AF37]/20">
                          <BookOpen size={18} className="text-[#D4AF37]" />
                        </div>
                        <div className="flex gap-1.5">
                          {unit.is_final_review && (
                            <span className="rounded-full bg-[#D4AF37]/10 px-2 py-0.5 text-[10px] font-bold text-[#D4AF37]">
                              مراجعة
                            </span>
                          )}
                          {unit.term && (
                            <span className="rounded-full bg-violet-500/10 px-2 py-0.5 text-[10px] font-bold text-violet-300">
                              ترم {unit.term === 1 ? '١' : '٢'}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* العنوان */}
                      <h4 className="mb-2 text-right text-lg font-bold text-white transition group-hover:text-[#D4AF37]">
                        {unit.title}
                      </h4>

                      {/* العدد */}
                      <div className="flex items-center justify-between border-t border-white/5 pt-3">
                        <ArrowLeft 
                          size={16} 
                          className="text-[#D4AF37] transition group-hover:-translate-x-1" 
                        />
                        <p className="flex items-center gap-1.5 text-xs text-gray-400">
                          <PlayCircle size={12} />
                          {unit.lessonsCount} درس
                        </p>
                      </div>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </motion.section>
      )}

      {/* ════════════════════════ LOCKED UNITS PREVIEW ════════════════════════ */}
      {lockedUnits.length > 0 && (
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <SectionHeader
            icon={Lock}
            title="محتوى إضافي"
            subtitle={isActive 
              ? "محتوى متوفر بباقات أعلى" 
              : "اشترك للوصول لكل هذا المحتوى"}
            iconColor="text-amber-400"
          />

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {lockedUnits.slice(0, 6).map((unit, i) => (
              <motion.div
                key={unit.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 + i * 0.05 }}
                className="relative h-full overflow-hidden rounded-2xl border border-white/5 bg-white/[0.02] p-5"
              >
                {/* Overlay مقفول */}
                <div className="absolute inset-0 z-10 flex items-center justify-center bg-gradient-to-br from-black/60 via-black/50 to-black/70 backdrop-blur-[3px]">
                  <div className="text-center">
                    <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-[#D4AF37]/20 backdrop-blur-md">
                      <Lock size={20} className="text-[#D4AF37]" />
                    </div>
                    <p className="text-xs font-bold text-[#D4AF37]">
                      {isActive ? 'باقة مختلفة' : 'تحتاج اشتراك'}
                    </p>
                  </div>
                </div>

                {/* المحتوى الباهت */}
                <div className="opacity-30">
                  <div className="mb-4 flex items-center justify-between">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/5">
                      <BookOpen size={18} className="text-gray-500" />
                    </div>
                    {unit.term && (
                      <span className="rounded-full bg-white/5 px-2 py-0.5 text-[10px] font-bold text-gray-500">
                        ترم {unit.term === 1 ? '١' : '٢'}
                      </span>
                    )}
                  </div>
                  <h4 className="text-right text-lg font-bold text-gray-400">
                    {unit.title}
                  </h4>
                  <p className="mt-3 border-t border-white/5 pt-3 text-xs text-gray-500">
                    {unit.lessonsCount} درس
                  </p>
                </div>
              </motion.div>
            ))}
          </div>

          {/* CTA لو مش مشترك */}
          {!isActive && lockedUnits.length > 6 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1 }}
              className="mt-5 rounded-2xl border border-[#D4AF37]/20 bg-[#D4AF37]/5 p-4 text-center"
            >
              <p className="text-sm text-gray-300">
                وأكثر من <span className="font-bold text-[#D4AF37]">{lockedUnits.length - 6}</span> وحدة أخرى تنتظرك!
              </p>
            </motion.div>
          )}
        </motion.section>
      )}

      {/* ════════════════════════ EMPTY STATE ════════════════════════ */}
      {accessibleUnits.length === 0 && lockedUnits.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="rounded-3xl border border-white/10 bg-white/[0.02] p-12 text-center"
        >
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[#D4AF37]/10">
            <BookOpen size={28} className="text-[#D4AF37]" />
          </div>
          <h3 className="text-xl font-bold text-white">لا توجد وحدات بعد</h3>
          <p className="mt-2 text-sm text-gray-400">
            سيتم إضافة المحتوى قريباً، تابعنا!
          </p>
        </motion.div>
      )}
    </div>
  );
};

// ════════════════════════ SUB-COMPONENTS ════════════════════════

const StatCard = ({ icon: Icon, label, value, subtitle, gradient, border, iconColor, iconBg, delay }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay }}
    whileHover={{ y: -4 }}
    className={`relative overflow-hidden rounded-2xl border ${border} bg-gradient-to-br ${gradient} p-5 text-right transition-all`}
  >
    <div className="flex items-start justify-between gap-3">
      <div className={`flex h-11 w-11 items-center justify-center rounded-xl ${iconBg}`}>
        <Icon size={20} className={iconColor} />
      </div>
      <div className="flex-1">
        <p className={`text-2xl font-black ${iconColor}`}>{value}</p>
        <p className="mt-0.5 text-xs text-gray-400">{subtitle}</p>
      </div>
    </div>
    <p className="mt-3 border-t border-white/5 pt-3 text-xs font-medium text-gray-300">
      {label}
    </p>
  </motion.div>
);

const SectionHeader = ({ icon: Icon, title, subtitle, linkTo, linkText, iconColor = 'text-[#D4AF37]' }) => (
  <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
    {linkTo && (
      <Link 
        to={linkTo} 
        className="inline-flex items-center gap-1 rounded-lg px-3 py-1.5 text-xs font-bold text-[#D4AF37] transition hover:bg-[#D4AF37]/10"
      >
        <ArrowLeft size={12} />
        {linkText}
      </Link>
    )}
    <div className="flex items-center gap-3 text-right">
      <div>
        <h3 className="text-xl font-bold text-white">{title}</h3>
        {subtitle && <p className="mt-0.5 text-sm text-gray-400">{subtitle}</p>}
      </div>
      <div className={`flex h-10 w-10 items-center justify-center rounded-xl bg-white/5 ${iconColor}`}>
        <Icon size={18} />
      </div>
    </div>
  </div>
);

export default StudentHome;