import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  Users, UserCheck, TrendingUp, DollarSign,
  GraduationCap, BookOpen, FileQuestion, Crown,
  Calendar, Award, Sparkles, CheckCircle2, Clock, 
  Activity, Target, Zap, BarChart3, Wallet, 
  ArrowUpRight, Layers, PlayCircle, PieChart, 
  AlertTriangle
} from 'lucide-react';
import { getAdvancedAnalytics } from '../../lib/admin';
import LoadingScreen from '../shared/LoadingScreen';

const GRADE_COLORS = ['from-sky-500 to-blue-500', 'from-violet-500 to-purple-500', 'from-emerald-500 to-teal-500'];
const SUB_TYPE_CONFIG = {
  monthly: { label: 'شهري', color: 'sky', icon: Calendar },
  term: { label: 'فصل', color: 'violet', icon: BookOpen },
  yearly: { label: 'سنوي', color: 'emerald', icon: Crown },
  final_review: { label: 'مراجعة', color: 'amber', icon: Award },
};

const AdminOverview = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAnalytics();
  }, []);

  const loadAnalytics = async () => {
    try {
      setLoading(true);
      const analytics = await getAdvancedAnalytics();
      setData(analytics);
    } catch (err) {
      console.error('Analytics error:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading || !data) return <LoadingScreen text="جاري تحميل التحليلات..." />;

  const { overview, byGrade, bySubscriptionType, newSubsLast7Days, expiringSoon, recentStudents, contentStats } = data;

  const maxNewSubs = Math.max(...newSubsLast7Days.map(d => d.count), 1);
  const maxSubType = Math.max(...bySubscriptionType.map(s => s.count), 1);

  return (
    <div className="space-y-6" dir="rtl">

      {/* ════════════════════════ HEADER ════════════════════════ */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-[#1a1f2e] via-[#0f1420] to-[#0a0e18] p-6 md:p-8"
      >
        <div className="absolute -top-20 -right-20 h-64 w-64 rounded-full bg-[#D4AF37]/10 blur-3xl" />
        <div className="absolute -bottom-20 -left-20 h-64 w-64 rounded-full bg-emerald-500/10 blur-3xl" />

        <div className="relative flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
          <div className="flex items-center gap-3">
            <button
              onClick={loadAnalytics}
              className="inline-flex items-center gap-2 rounded-xl bg-[#D4AF37]/10 px-4 py-2 text-sm font-bold text-[#D4AF37] transition hover:bg-[#D4AF37]/20"
            >
              <Activity size={16} />
              تحديث البيانات
            </button>
          </div>

          <div className="text-right">
            <p className="mb-1 flex items-center justify-end gap-1.5 text-xs text-[#D4AF37]">
              <Sparkles size={12} />
              لوحة التحكم الرئيسية
            </p>
            <h1 className="font-amiri text-3xl font-bold text-white md:text-4xl">
              نظرة عامة شاملة 📊
            </h1>
            <p className="mt-2 text-sm text-gray-400">
              تحليلات تفصيلية لأداء المنصة والإيرادات
            </p>
          </div>
        </div>
      </motion.div>

      {/* ════════════════════════ KPI CARDS ════════════════════════ */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <KpiCard
          icon={DollarSign}
          label="إجمالي الإيرادات"
          value={`${overview.totalRevenue.toLocaleString('ar-EG')} ج.م`}
          subtitle="من الاشتراكات النشطة"
          gradient="from-emerald-500/20 to-green-500/5"
          border="border-emerald-500/30"
          iconColor="text-emerald-300"
          iconBg="bg-emerald-500/20"
          highlight
          delay={0}
        />
        <KpiCard
          icon={Wallet}
          label="إيراد الشهر الحالي"
          value={`${overview.monthlyRevenue.toLocaleString('ar-EG')} ج.م`}
          subtitle="هذا الشهر"
          gradient="from-[#D4AF37]/20 to-yellow-500/5"
          border="border-[#D4AF37]/30"
          iconColor="text-[#D4AF37]"
          iconBg="bg-[#D4AF37]/20"
          delay={0.1}
        />
        <KpiCard
          icon={Users}
          label="إجمالي الطلاب"
          value={overview.totalStudents}
          subtitle={`${overview.activeStudents} مفعّل`}
          gradient="from-sky-500/20 to-blue-500/5"
          border="border-sky-500/30"
          iconColor="text-sky-300"
          iconBg="bg-sky-500/20"
          delay={0.2}
        />
        <KpiCard
          icon={Target}
          label="معدل التحويل"
          value={`${overview.conversionRate}%`}
          subtitle="طلاب مشتركون فعلاً"
          gradient="from-violet-500/20 to-purple-500/5"
          border="border-violet-500/30"
          iconColor="text-violet-300"
          iconBg="bg-violet-500/20"
          delay={0.3}
        />
      </div>

      {/* ════════════════════════ STATS GRID ════════════════════════ */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">

        {/* ─── الاشتراكات النشطة ─── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="rounded-3xl border border-white/10 bg-gradient-to-br from-white/[0.03] to-white/[0.01] p-6"
        >
          <div className="mb-5 flex items-center justify-between">
            <div className="text-xs text-emerald-300 inline-flex items-center gap-1">
              <CheckCircle2 size={12} />
              نشط
            </div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-white">حالة الاشتراكات</h3>
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500/10">
                <Activity size={18} className="text-emerald-300" />
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <StatusBar
              label="نشط"
              value={overview.activeSubscriptions}
              total={overview.totalStudents}
              color="emerald"
            />
            <StatusBar
              label="قيد الانتظار"
              value={overview.pendingStudents}
              total={overview.totalStudents}
              color="amber"
            />
            <StatusBar
              label="منتهي"
              value={overview.expiredSubscriptions}
              total={overview.totalStudents}
              color="red"
            />
          </div>
        </motion.div>

        {/* ─── توزيع أنواع الاشتراكات ─── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="rounded-3xl border border-white/10 bg-gradient-to-br from-white/[0.03] to-white/[0.01] p-6"
        >
          <div className="mb-5 flex items-center justify-between">
            <div className="text-xs text-violet-300 inline-flex items-center gap-1">
              <PieChart size={12} />
              توزيع
            </div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-white">أنواع الاشتراكات</h3>
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-violet-500/10">
                <Crown size={18} className="text-violet-300" />
              </div>
            </div>
          </div>

          <div className="space-y-3">
            {bySubscriptionType.map(({ type, count }) => {
              const config = SUB_TYPE_CONFIG[type];
              const Icon = config.icon;
              const percentage = maxSubType ? (count / maxSubType) * 100 : 0;

              return (
                <div key={type} className="text-right">
                  <div className="mb-1.5 flex items-center justify-between">
                    <span className="text-sm font-bold text-white">{count}</span>
                    <div className="flex items-center gap-1.5 text-xs text-gray-400">
                      <span>{config.label}</span>
                      <Icon size={12} className={`text-${config.color}-300`} />
                    </div>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-white/5">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${percentage}%` }}
                      transition={{ duration: 1, delay: 0.6 }}
                      className={`h-full rounded-full bg-gradient-to-l ${
                        config.color === 'sky' ? 'from-sky-500 to-sky-300' :
                        config.color === 'violet' ? 'from-violet-500 to-violet-300' :
                        config.color === 'emerald' ? 'from-emerald-500 to-emerald-300' :
                        'from-amber-500 to-amber-300'
                      }`}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </motion.div>

        {/* ─── الطلاب حسب الصف ─── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="rounded-3xl border border-white/10 bg-gradient-to-br from-white/[0.03] to-white/[0.01] p-6"
        >
          <div className="mb-5 flex items-center justify-between">
            <div className="text-xs text-sky-300 inline-flex items-center gap-1">
              <Layers size={12} />
              صفوف
            </div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-white">الطلاب حسب الصف</h3>
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-sky-500/10">
                <GraduationCap size={18} className="text-sky-300" />
              </div>
            </div>
          </div>

          <div className="space-y-3">
            {byGrade.map((g, i) => (
              <div 
                key={g.grade}
                className="rounded-xl border border-white/5 bg-black/20 p-3"
              >
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-xs text-gray-400">
                    {g.subscribed} مشترك
                  </span>
                  <span className="text-sm font-bold text-white">{g.label}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-2xl font-black text-[#D4AF37]">{g.total}</span>
                  <div className="flex-1">
                    <div className="h-1.5 overflow-hidden rounded-full bg-white/5">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${g.total > 0 ? (g.subscribed / g.total) * 100 : 0}%` }}
                        transition={{ duration: 1, delay: 0.7 }}
                        className={`h-full rounded-full bg-gradient-to-l ${GRADE_COLORS[i]}`}
                      />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* ════════════════════════ CHART + EXPIRING ════════════════════════ */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">

        {/* ─── الاشتراكات الجديدة آخر 7 أيام ─── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="rounded-3xl border border-white/10 bg-gradient-to-br from-white/[0.03] to-white/[0.01] p-6"
        >
          <div className="mb-5 flex items-center justify-between">
            <div className="text-xs text-emerald-300 inline-flex items-center gap-1">
              <TrendingUp size={12} />
              7 أيام
            </div>
            <div className="flex items-center gap-2">
              <div>
                <h3 className="font-bold text-white">طلاب جدد</h3>
                <p className="text-xs text-gray-400">آخر 7 أيام</p>
              </div>
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500/10">
                <BarChart3 size={18} className="text-emerald-300" />
              </div>
            </div>
          </div>

          {/* Bar Chart */}
          <div className="flex items-end justify-between gap-2 h-40 px-2">
            {newSubsLast7Days.map((day, i) => {
              const height = maxNewSubs ? (day.count / maxNewSubs) * 100 : 0;
              return (
                <div key={day.day} className="flex flex-1 flex-col items-center gap-2">
                  <div className="relative flex-1 w-full flex items-end">
                    <motion.div
                      initial={{ height: 0 }}
                      animate={{ height: `${height}%` }}
                      transition={{ duration: 0.8, delay: 0.8 + i * 0.05 }}
                      className="w-full rounded-t-lg bg-gradient-to-t from-[#D4AF37] to-[#fde08a] relative group cursor-pointer"
                    >
                      {day.count > 0 && (
                        <span className="absolute -top-6 left-1/2 -translate-x-1/2 text-xs font-bold text-[#D4AF37]">
                          {day.count}
                        </span>
                      )}
                    </motion.div>
                  </div>
                  <span className="text-[10px] text-gray-500">{day.label}</span>
                </div>
              );
            })}
          </div>
        </motion.div>

        {/* ─── الاشتراكات اللي قربت تخلص ─── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="rounded-3xl border border-amber-500/20 bg-gradient-to-br from-amber-500/5 to-transparent p-6"
        >
          <div className="mb-5 flex items-center justify-between">
            <div className="text-xs text-amber-300 inline-flex items-center gap-1">
              <AlertTriangle size={12} />
              تنبيه
            </div>
            <div className="flex items-center gap-2">
              <div>
                <h3 className="font-bold text-white">اشتراكات قاربت على الانتهاء</h3>
                <p className="text-xs text-gray-400">خلال 7 أيام</p>
              </div>
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-500/10">
                <Clock size={18} className="text-amber-300" />
              </div>
            </div>
          </div>

          {expiringSoon.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <CheckCircle2 size={32} className="mb-2 text-emerald-400" />
              <p className="text-sm text-gray-400">لا توجد اشتراكات قاربت على الانتهاء</p>
            </div>
          ) : (
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {expiringSoon.map((student) => (
                <div
                  key={student.id}
                  className="flex items-center justify-between gap-3 rounded-xl border border-white/5 bg-black/20 p-3"
                >
                  <div className={`flex h-10 w-12 flex-col items-center justify-center rounded-lg ${
                    student.daysLeft <= 2 ? 'bg-red-500/20 text-red-300' :
                    student.daysLeft <= 5 ? 'bg-amber-500/20 text-amber-300' :
                    'bg-emerald-500/20 text-emerald-300'
                  }`}>
                    <span className="text-lg font-black leading-none">{student.daysLeft}</span>
                    <span className="text-[8px]">يوم</span>
                  </div>
                  <div className="flex-1 text-right">
                    <p className="text-sm font-bold text-white">{student.full_name}</p>
                    <p className="text-xs text-gray-400">{student.phone || 'لا يوجد رقم'}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </motion.div>
      </div>

      {/* ════════════════════════ RECENT + CONTENT ════════════════════════ */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">

        {/* ─── أحدث الطلاب ─── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9 }}
          className="rounded-3xl border border-white/10 bg-gradient-to-br from-white/[0.03] to-white/[0.01] p-6"
        >
          <div className="mb-5 flex items-center justify-between">
            <div className="text-xs text-sky-300 inline-flex items-center gap-1">
              <Zap size={12} />
              جديد
            </div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-white">أحدث التسجيلات</h3>
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-sky-500/10">
                <UserCheck size={18} className="text-sky-300" />
              </div>
            </div>
          </div>

          {recentStudents.length === 0 ? (
            <p className="py-8 text-center text-sm text-gray-400">لا يوجد طلاب بعد</p>
          ) : (
            <div className="space-y-2">
              {recentStudents.map((student, i) => (
                <motion.div
                  key={student.id}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 1 + i * 0.05 }}
                  className="flex items-center justify-between gap-3 rounded-xl border border-white/5 bg-black/20 p-3 transition hover:border-[#D4AF37]/20"
                >
                  <div className={`inline-flex rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                    student.is_active 
                      ? 'bg-emerald-500/20 text-emerald-300' 
                      : 'bg-amber-500/20 text-amber-300'
                  }`}>
                    {student.is_active ? 'مفعّل' : 'انتظار'}
                  </div>
                  <div className="flex flex-1 items-center gap-3 justify-end">
                    <div className="text-right">
                      <p className="text-sm font-bold text-white">{student.full_name}</p>
                      <p className="text-xs text-gray-400">
                        {new Date(student.created_at).toLocaleDateString('ar-EG', { 
                          day: 'numeric', month: 'short' 
                        })}
                      </p>
                    </div>
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#D4AF37]/10 text-[#D4AF37] font-bold">
                      {student.full_name?.charAt(0) || '؟'}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>

        {/* ─── إحصائيات المحتوى ─── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1 }}
          className="rounded-3xl border border-white/10 bg-gradient-to-br from-white/[0.03] to-white/[0.01] p-6"
        >
          <div className="mb-5 flex items-center justify-between">
            <div className="text-xs text-[#D4AF37] inline-flex items-center gap-1">
              <Sparkles size={12} />
              محتوى
            </div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-white">إحصائيات المنصة</h3>
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#D4AF37]/10">
                <BookOpen size={18} className="text-[#D4AF37]" />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <MiniStat
              icon={BookOpen}
              label="الوحدات"
              value={contentStats.totalUnits}
              extra={`${contentStats.finalReviewUnits} مراجعة`}
              color="sky"
            />
            <MiniStat
              icon={PlayCircle}
              label="الدروس"
              value={contentStats.totalLessons}
              color="emerald"
            />
            <MiniStat
              icon={FileQuestion}
              label="الامتحانات"
              value={contentStats.totalExams}
              extra={`${contentStats.publishedExams} منشور`}
              color="violet"
            />
            <MiniStat
              icon={Crown}
              label="الباقات"
              value={contentStats.totalPlans}
              extra={`${contentStats.activePlans} نشطة`}
              color="amber"
            />
          </div>

          {/* Exam stats */}
          <div className="mt-4 rounded-2xl border border-[#D4AF37]/20 bg-[#D4AF37]/5 p-4">
            <div className="flex items-center justify-between gap-3">
              <div className="text-left">
                <p className="text-3xl font-black text-[#D4AF37]">{overview.avgScore}%</p>
                <p className="text-xs text-gray-400">متوسط النجاح</p>
              </div>
              <div className="text-right">
                <p className="text-sm font-bold text-white">{overview.totalAttempts}</p>
                <p className="text-xs text-gray-400">إجمالي المحاولات</p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

    </div>
  );
};

// ═══════════════════════════ SUB COMPONENTS ═══════════════════════════

const KpiCard = ({ icon: Icon, label, value, subtitle, gradient, border, iconColor, iconBg, highlight, delay }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay }}
    whileHover={{ y: -4 }}
    className={`relative overflow-hidden rounded-2xl border ${border} bg-gradient-to-br ${gradient} p-5 text-right`}
  >
    {highlight && (
      <div className="absolute top-2 left-2">
        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/20 px-2 py-0.5 text-[10px] font-bold text-emerald-300">
          <ArrowUpRight size={10} />
          مهم
        </span>
      </div>
    )}
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

const StatusBar = ({ label, value, total, color }) => {
  const percentage = total ? (value / total) * 100 : 0;
  const colorClasses = {
    emerald: { bar: 'from-emerald-500 to-emerald-300', text: 'text-emerald-300' },
    amber: { bar: 'from-amber-500 to-amber-300', text: 'text-amber-300' },
    red: { bar: 'from-red-500 to-red-300', text: 'text-red-300' },
  };
  const c = colorClasses[color];

  return (
    <div className="text-right">
      <div className="mb-1.5 flex items-center justify-between">
        <span className={`text-sm font-bold ${c.text}`}>{value}</span>
        <span className="text-xs text-gray-400">{label}</span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-white/5">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 1 }}
          className={`h-full rounded-full bg-gradient-to-l ${c.bar}`}
        />
      </div>
    </div>
  );
};

const MiniStat = ({ icon: Icon, label, value, extra, color }) => {
  const colors = {
    sky: 'bg-sky-500/10 text-sky-300 border-sky-500/20',
    emerald: 'bg-emerald-500/10 text-emerald-300 border-emerald-500/20',
    violet: 'bg-violet-500/10 text-violet-300 border-violet-500/20',
    amber: 'bg-amber-500/10 text-amber-300 border-amber-500/20',
  };

  return (
    <div className={`rounded-xl border p-3 ${colors[color]}`}>
      <div className="flex items-start justify-between gap-2">
        <Icon size={16} />
        <div className="text-right">
          <p className="text-xl font-black">{value}</p>
        </div>
      </div>
      <p className="mt-2 text-xs text-gray-300">{label}</p>
      {extra && <p className="text-[10px] text-gray-500">{extra}</p>}
    </div>
  );
};

export default AdminOverview;