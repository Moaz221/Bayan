import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Check,
  Zap,
  Crown,
  Rocket,
  Loader2,
  Sparkles,
  BadgeCheck,
  ArrowLeft,
} from 'lucide-react';
import { supabase } from '../../supabaseClient';
import { getGradeLabel } from '../../lib/gradeOptions';

const GRADE_OPTIONS = [
  { value: 1, label: 'الصف الأول الثانوي', short: 'أولى ثانوي', emoji: '🎓' },
  { value: 2, label: 'الصف الثاني الثانوي', short: 'ثانية ثانوي', emoji: '🎓' },
  { value: 3, label: 'الصف الثالث الثانوي', short: 'ثالثة ثانوي', emoji: '🎓' },
];

const PLAN_TYPE_META = {
  monthly: {
    label: 'شهري',
    icon: Zap,
    border: 'border-sky-500/25 hover:border-sky-500/55',
    bg: 'from-sky-500/12 to-transparent',
    chip: 'bg-sky-500/12 text-sky-300 border-sky-500/25',
  },
  term: {
    label: 'ترم',
    icon: Crown,
    border: 'border-amber-500/30 hover:border-amber-500/70',
    bg: 'from-amber-500/15 to-transparent',
    chip: 'bg-amber-500/12 text-amber-300 border-amber-500/25',
  },
  yearly: {
    label: 'سنوي',
    icon: Rocket,
    border: 'border-violet-500/25 hover:border-violet-500/55',
    bg: 'from-violet-500/12 to-transparent',
    chip: 'bg-violet-500/12 text-violet-300 border-violet-500/25',
  },
  final_review: {
    label: 'مراجعة نهائية',
    icon: BadgeCheck,
    border: 'border-emerald-500/25 hover:border-emerald-500/55',
    bg: 'from-emerald-500/12 to-transparent',
    chip: 'bg-emerald-500/12 text-emerald-300 border-emerald-500/25',
  },
};

const PLAN_TYPE_ORDER = {
  monthly: 0,
  term: 1,
  yearly: 2,
  final_review: 3,
};

const getFallbackHighlights = (plan) => {
  switch (plan.plan_type) {
    case 'monthly':
      return ['وحدات مختارة بعناية', 'متابعة منظمة', 'اختبارات مرتبطة'];
    case 'term':
      return ['كل وحدات الترم', 'اختبارات شاملة', 'مراجعة قوية قبل الامتحان'];
    case 'yearly':
      return ['كل وحدات الترمين', 'مراجعات متدرجة', 'تحضير شامل طوال العام'];
    case 'final_review':
      return ['محتوى مراجعة نهائية', 'تركيز على أهم النقاط', 'تدريبات قوية قبل الامتحان'];
    default:
      return ['محتوى تعليمي مميز'];
  }
};

const Pricing = () => {
  const [plans, setPlans] = useState([]);
  const [selectedGrade, setSelectedGrade] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchPlans = async () => {
      try {
        setLoading(true);
        setError('');

        const { data, error: fetchError } = await supabase
          .from('subscription_plans')
          .select(`
            *,
            plan_units (
              id,
              unit_id,
              units (
                id,
                title,
                term,
                is_final_review
              )
            )
          `)
          .eq('is_active', true)
          .order('grade_level', { ascending: true })
          .order('price', { ascending: true });

        if (fetchError) throw fetchError;

        setPlans(data || []);
      } catch (err) {
        console.error('Pricing fetch error:', err);
        setError(err.message || 'حدث خطأ أثناء تحميل الباقات');
      } finally {
        setLoading(false);
      }
    };

    fetchPlans();
  }, []);

  const gradePlans = useMemo(() => {
    return [...plans]
      .filter((plan) => Number(plan.grade_level) === Number(selectedGrade))
      .sort((a, b) => {
        const orderA = PLAN_TYPE_ORDER[a.plan_type] ?? 99;
        const orderB = PLAN_TYPE_ORDER[b.plan_type] ?? 99;
        if (orderA !== orderB) return orderA - orderB;
        return Number(a.price || 0) - Number(b.price || 0);
      });
  }, [plans, selectedGrade]);

  const selectedGradeLabel = getGradeLabel(selectedGrade);

  const gradeCounts = useMemo(() => {
    return GRADE_OPTIONS.map((g) => ({
      ...g,
      count: plans.filter((p) => Number(p.grade_level) === g.value).length,
    }));
  }, [plans]);

  return (
    <section id="pricing" className="relative overflow-hidden py-24">
      {/* خلفية ناعمة جدًا عشان الصورة الرئيسية تبان */}
      <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(180deg,rgba(7,9,13,0.68),rgba(7,9,13,0.35),rgba(7,9,13,0.72))]" />
      <div className="absolute top-10 right-0 h-[320px] w-[320px] rounded-full bg-amber-500/8 blur-[100px] pointer-events-none" />
      <div className="absolute bottom-10 left-0 h-[320px] w-[320px] rounded-full bg-blue-500/8 blur-[100px] pointer-events-none" />

      <div className="container mx-auto px-6 lg:px-16 relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 22 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="mx-auto mb-14 max-w-3xl text-center"
        >
          <div className="diamond-divider justify-center font-amiri mb-4">
            <span>✦ الاشتراكات ✦</span>
          </div>

          <h2 className="font-amiri text-4xl lg:text-6xl font-black luxury-section-title">
            اختر صفك الدراسي ثم شاهد الباقات الخاصة به
          </h2>

          <p className="mx-auto mt-5 max-w-2xl text-gray-400 leading-8">
            كل صف له باقاته الخاصة. اختر الصف أولًا، وبعدها ستظهر لك جميع العروض
            والاشتراكات المتاحة له فقط بشكل منظم وواضح.
          </p>
        </motion.div>

        {/* Grade Selector */}
        <div id="years" className="scroll-mt-28">
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="mb-8 text-center"
          >
            <h3 className="font-amiri text-3xl lg:text-4xl font-bold text-white">
              اختر الصف الدراسي
            </h3>
            <p className="mt-2 text-sm text-gray-500">
              بعد اختيار الصف، ستظهر كل باقاته فقط.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            {gradeCounts.map((grade, i) => {
              const active = Number(selectedGrade) === Number(grade.value);

              return (
                <motion.button
                  key={grade.value}
                  initial={{ opacity: 0, y: 24 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.08 }}
                  whileHover={{ y: -4, scale: 1.01 }}
                  onClick={() => setSelectedGrade(grade.value)}
                  className={`relative overflow-hidden rounded-3xl border px-6 py-5 text-right text-white transition-all duration-300 ${
                    active
                      ? 'border-[#D4AF37]/45 bg-[#D4AF37]/10 shadow-[0_0_35px_rgba(212,175,55,0.12)]'
                      : 'border-white/10 bg-white/[0.03] hover:border-[#D4AF37]/25 hover:bg-white/[0.05]'
                  }`}
                  dir="rtl"
                >
                  <div className="flex items-center justify-between gap-4">
                    <div className="text-right">
                      <h4 className="font-amiri text-2xl font-bold">
                        {grade.label}
                      </h4>
                      <p className="mt-1 text-xs text-gray-400">
                        {grade.count} باقة مفعلة
                      </p>
                    </div>

                    <div
                      className={`flex h-14 w-14 items-center justify-center rounded-2xl border ${
                        active
                          ? 'border-[#D4AF37]/30 bg-[#D4AF37]/15'
                          : 'border-white/10 bg-white/5'
                      }`}
                    >
                      <span className="text-2xl">{grade.emoji}</span>
                    </div>
                  </div>

                  <div className="mt-4 flex items-center justify-end gap-2">
                    {active && (
                      <span className="inline-flex items-center gap-1 rounded-full border border-[#D4AF37]/25 bg-[#D4AF37]/10 px-3 py-1 text-[11px] font-bold text-[#D4AF37]">
                        <Sparkles size={12} />
                        الصف المختار
                      </span>
                    )}
                  </div>
                </motion.button>
              );
            })}
          </div>
        </div>

        {/* Plans Header */}
        <div id="pricing-plans" className="scroll-mt-28 mt-20">
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="mb-10 text-center"
          >
            <div className="diamond-divider justify-center text-amber-400/60 text-lg mb-4">
              ✦ باقات {selectedGradeLabel} ✦
            </div>
            <h3 className="font-amiri text-3xl lg:text-5xl font-black text-white">
              كل العروض المتاحة لهذا الصف
            </h3>
            <p className="mt-3 text-sm lg:text-base text-gray-400">
              من باقات الشهر إلى السنة، وكل عرض أو كومبو يضيفه الأستاذ سيظهر هنا تلقائيًا.
            </p>
          </motion.div>

          {loading ? (
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="animate-pulse rounded-3xl border border-white/10 bg-white/[0.03] p-6"
                >
                  <div className="mb-6 h-8 w-28 rounded-full bg-white/10" />
                  <div className="mb-4 h-6 w-3/4 rounded bg-white/10" />
                  <div className="mb-3 h-4 w-1/2 rounded bg-white/10" />
                  <div className="space-y-3">
                    <div className="h-3 w-full rounded bg-white/10" />
                    <div className="h-3 w-5/6 rounded bg-white/10" />
                    <div className="h-3 w-4/6 rounded bg-white/10" />
                  </div>
                  <div className="mt-6 h-12 rounded-2xl bg-white/10" />
                </div>
              ))}
            </div>
          ) : error ? (
            <div className="rounded-3xl border border-red-500/20 bg-red-500/5 p-6 text-center">
              <p className="text-red-300 font-bold">{error}</p>
              <p className="mt-2 text-sm text-gray-400">
                لو المشكلة استمرت، راجع إعدادات قاعدة البيانات أو سياسات القراءة.
              </p>
            </div>
          ) : gradePlans.length === 0 ? (
            <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-8 text-center">
              <p className="font-amiri text-2xl font-bold text-white">
                لا توجد باقات مفعلة لهذا الصف الآن
              </p>
              <p className="mt-2 text-sm text-gray-400">
                عندما يضيف الأستاذ باقات جديدة لهذا الصف ستظهر هنا مباشرة.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
              {gradePlans.map((plan, index) => {
                const meta = PLAN_TYPE_META[plan.plan_type] || PLAN_TYPE_META.monthly;
                const Icon = meta.icon;

                const unitTitles = (plan.plan_units || [])
                  .map((pu) => pu?.units?.title)
                  .filter(Boolean);

                const unitCount = plan.plan_units?.length || 0;
                const hasOriginalPrice =
                  plan.original_price && Number(plan.original_price) > Number(plan.price || 0);

                const highlights =
                  unitTitles.length > 0 ? unitTitles.slice(0, 4) : getFallbackHighlights(plan);

                return (
                  <motion.div
                    key={plan.id}
                    initial={{ opacity: 0, y: 30, scale: 0.97 }}
                    whileInView={{ opacity: 1, y: 0, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.08, duration: 0.65 }}
                    whileHover={{ y: -7, transition: { duration: 0.25 } }}
                    className={`relative overflow-hidden rounded-[28px] border bg-gradient-to-b ${meta.bg} ${meta.border} p-6 text-right shadow-[0_20px_50px_rgba(0,0,0,0.25)]`}
                    dir="rtl"
                  >
                    {/* Top badges */}
                    <div className="mb-5 flex items-start justify-between gap-3">
                      <div className="flex flex-wrap items-center gap-2">
                        {plan.discount_label && (
                          <span className="inline-flex rounded-full border border-amber-500/25 bg-amber-500/10 px-3 py-1 text-[11px] font-bold text-amber-300">
                            {plan.discount_label}
                          </span>
                        )}

                        {plan.is_featured && (
                          <span className="popular-badge text-xs px-4 py-1.5 rounded-full shadow-lg">
                            الأفضل
                          </span>
                        )}
                      </div>

                      <span
                        className={`inline-flex rounded-full border px-3 py-1 text-xs font-bold ${meta.chip}`}
                      >
                        {meta.label}
                      </span>
                    </div>

                    {/* Title */}
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="mb-2 flex items-center gap-3 justify-end">
                          <div className="text-right">
                            <h4 className="font-amiri text-2xl font-bold text-white">
                              {plan.name}
                            </h4>
                            <p className="mt-1 text-xs text-gray-400">
                              {getGradeLabel(plan.grade_level)} •{' '}
                              {plan.term ? `الترم ${plan.term === 1 ? 'الأول' : 'الثاني'}` : 'بدون ترم'}
                            </p>
                          </div>

                          <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.03]">
                            <Icon className="h-5 w-5 text-amber-400" />
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Price */}
                    <div className="mt-6 border-y border-white/10 py-5">
                      <div className="flex items-end justify-end gap-2">
                        <span className="text-gray-400 text-sm pb-1">جنيه/مصري</span>
                        <span className="font-readex text-4xl font-black gold-text">
                          {Number(plan.price || 0).toLocaleString('ar-EG')}
                        </span>
                      </div>

                      {hasOriginalPrice && (
                        <div className="mt-2 flex items-center justify-end gap-2 text-sm">
                          <span className="text-gray-500 line-through">
                            {Number(plan.original_price).toLocaleString('ar-EG')} جنيه
                          </span>
                          <span className="rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2.5 py-0.5 text-[11px] font-bold text-emerald-300">
                            خصم
                          </span>
                        </div>
                      )}

                      {plan.duration_months ? (
                        <p className="mt-3 text-xs text-gray-400">
                          مدة الاشتراك: {plan.duration_months} شهر
                        </p>
                      ) : null}
                    </div>

                    {/* Units summary */}
                    <div className="mt-5 rounded-2xl border border-white/10 bg-black/20 p-4">
                      <div className="mb-3 flex items-center justify-between gap-2">
                        <span className="text-xs text-gray-500">
                          {plan.plan_type === 'monthly'
                            ? `${unitCount} وحدة مخصصة`
                            : plan.plan_type === 'final_review'
                            ? 'مراجعة نهائية فقط'
                            : plan.plan_type === 'term'
                            ? 'كل وحدات الترم المختار'
                            : 'كل وحدات السنة الدراسية'}
                        </span>

                        <span className="text-xs font-bold text-[#D4AF37]">
                          {unitCount ? `${unitCount} وحدة` : '—'}
                        </span>
                      </div>

                      <div className="space-y-2">
                        {highlights.map((item, idx) => (
                          <div
                            key={idx}
                            className="flex items-center justify-end gap-2 text-sm text-gray-300"
                          >
                            <span>{item}</span>
                            <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-amber-400/25 bg-amber-400/10">
                              <Check className="h-3 w-3 text-amber-400" />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* CTA */}
                    <Link to="/auth">
                      <motion.div
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className={`mt-5 flex items-center justify-center gap-2 rounded-2xl px-5 py-3 text-sm font-bold transition-all ${
                          plan.plan_type === 'term' || plan.is_featured
                            ? 'btn-gold shadow-xl shadow-amber-500/20'
                            : 'border border-amber-500/30 text-amber-300 hover:bg-amber-500/5'
                        }`}
                      >
                        اشترك الآن
                        <ArrowLeft className="h-4 w-4" />
                      </motion.div>
                    </Link>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      <div className="section-divider-refined mt-16" />
    </section>
  );
};

export { Pricing };
export default Pricing;