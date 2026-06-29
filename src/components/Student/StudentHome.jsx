import { useMemo } from 'react';
import { BookOpen, FileQuestion, Lock, TrendingUp, Award } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const GRADE_LABELS = { 1: 'أولى ثانوي', 2: 'ثانية ثانوي', 3: 'ثالثة ثانوي' };
const SUB_LABELS = { monthly: 'شهري', term: 'ترم', yearly: 'سنوي', final_review: 'مراجعة نهائية' };

const StudentHome = ({ units, exams, profile }) => {
  const accessibleUnits = useMemo(() => (units || []).filter((u) => u.isAccessible), [units]);
  const accessibleExams = useMemo(() => (exams || []).filter((e) => e.isAccessible), [exams]);
  const lockedUnits = useMemo(() => (units || []).filter((u) => !u.isAccessible), [units]);
  const isActive = profile?.subscription_status === 'active';

  const stats = [
    {
      icon: BookOpen,
      label: 'وحدات متاحة',
      value: accessibleUnits.length,
      total: units.length,
      color: 'text-sky-300',
      bg: 'bg-sky-500/10',
      border: 'border-sky-500/20',
    },
    {
      icon: FileQuestion,
      label: 'امتحانات متاحة',
      value: accessibleExams.length,
      total: exams.length,
      color: 'text-emerald-300',
      bg: 'bg-emerald-500/10',
      border: 'border-emerald-500/20',
    },
    {
      icon: TrendingUp,
      label: 'حالة الاشتراك',
      value: isActive ? 'نشط' : 'غير نشط',
      total: null,
      color: isActive ? 'text-emerald-300' : 'text-amber-300',
      bg: isActive ? 'bg-emerald-500/10' : 'bg-amber-500/10',
      border: isActive ? 'border-emerald-500/20' : 'border-amber-500/20',
    },
    {
      icon: Award,
      label: 'نوع الاشتراك',
      value: SUB_LABELS[profile?.subscription_type] || '-',
      total: null,
      color: 'text-[#D4AF37]',
      bg: 'bg-[#D4AF37]/10',
      border: 'border-[#D4AF37]/20',
    },
  ];

  return (
    <div className="space-y-6" dir="rtl">
      {/* Greeting */}
      <div>
        <h2 className="font-amiri text-3xl font-bold text-white">
          أهلاً، {profile?.full_name?.split(' ')[0]} 👋
        </h2>
        <p className="mt-1 text-gray-400">
          {GRADE_LABELS[profile?.grade_level]} — لوحة المتابعة الخاصة بك
        </p>
      </div>

      {/* لو مش مشترك */}
      {!isActive && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl border border-[#D4AF37]/25 bg-[#D4AF37]/5 p-5"
        >
          <div className="flex flex-wrap items-center justify-between gap-4">
            <Link
              to="/auth"
              className="rounded-xl bg-[#D4AF37] px-5 py-2.5 text-sm font-bold text-black hover:opacity-90"
            >
              اشترك الآن للوصول الكامل
            </Link>
            <div className="text-right">
              <p className="font-bold text-[#D4AF37]">
                🔒 حسابك غير مشترك حتى الآن
              </p>
              <p className="mt-1 text-sm text-gray-400">
                يمكنك رؤية كل المحتوى لكنه مقفول. تواصل مع الأستاذ لتفعيل اشتراكك.
              </p>
            </div>
          </div>
        </motion.div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {stats.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className={`rounded-2xl border p-5 text-right ${stat.bg} ${stat.border}`}
            >
              <div className={`mb-3 inline-flex h-10 w-10 items-center justify-center rounded-xl ${stat.bg} border ${stat.border}`}>
                <Icon size={20} className={stat.color} />
              </div>
              <p className={`text-2xl font-black ${stat.color}`}>{stat.value}</p>
              {stat.total !== null && (
                <p className="text-xs text-gray-500">من إجمالي {stat.total}</p>
              )}
              <p className="mt-1 text-xs text-gray-400">{stat.label}</p>
            </motion.div>
          );
        })}
      </div>

      {/* الوحدات المتاحة */}
      {accessibleUnits.length > 0 && (
        <div>
          <div className="mb-4 flex items-center justify-between">
            <Link to="/dashboard/units" className="text-sm text-[#D4AF37] hover:underline">
              عرض الكل
            </Link>
            <h3 className="text-lg font-bold text-white">الوحدات المتاحة لك</h3>
          </div>
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
            {accessibleUnits.slice(0, 3).map((unit) => (
              <Link
                key={unit.id}
                to={`/dashboard/units/${unit.id}`}
                className="group rounded-2xl border border-[#D4AF37]/20 bg-[#D4AF37]/5 p-4 text-right transition hover:border-[#D4AF37]/40"
              >
                <p className="font-bold text-white group-hover:text-[#D4AF37]">{unit.title}</p>
                <p className="mt-1 text-xs text-gray-400">
                  {unit.lessonsCount} درس — الترم {unit.term === 1 ? 'الأول' : 'الثاني'}
                </p>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* معاينة الوحدات المقفولة */}
      {lockedUnits.length > 0 && (
        <div>
          <h3 className="mb-4 text-right text-lg font-bold text-white">
            وحدات أخرى
            <span className="mr-2 text-sm font-normal text-gray-500">
              (اشترك للوصول إليها)
            </span>
          </h3>
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
            {lockedUnits.slice(0, 6).map((unit) => (
              <div
                key={unit.id}
                className="relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.02] p-4 text-right"
              >
                <div className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-[2px]">
                  <div className="flex flex-col items-center gap-1">
                    <Lock size={20} className="text-[#D4AF37]" />
                    <span className="text-xs font-bold text-[#D4AF37]">اشترك للوصول</span>
                  </div>
                </div>
                <p className="font-bold text-white opacity-40">{unit.title}</p>
                <p className="mt-1 text-xs text-gray-500 opacity-40">
                  {unit.lessonsCount} درس
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentHome;