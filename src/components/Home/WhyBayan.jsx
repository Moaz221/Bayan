import { motion } from 'framer-motion';
import { BookOpen, FileText, FileQuestion, BarChart3, LockKeyhole, Sparkles, CheckCircle2 } from 'lucide-react';
import homeBg from '../../assets/Home_Background.png';

const features = [
  { icon: BookOpen, title: 'شرح منظم وواضح', desc: 'كل درس مبني بطريقة تساعد الطالب يفهم قبل ما يحفظ، ويربط أجزاء المنهج ببعضها.', color: 'text-sky-300', bg: 'bg-sky-500/10', border: 'border-sky-500/20' },
  { icon: FileText, title: 'ملفات PDF مع كل درس', desc: 'ملخصات وملفات شرح وامتحانات PDF تساعد الطالب يراجع بسرعة قبل أي اختبار.', color: 'text-blue-300', bg: 'bg-blue-500/10', border: 'border-blue-500/20' },
  { icon: FileQuestion, title: 'امتحانات تفاعلية', desc: 'امتحانات على الدروس والوحدات والترم والسنة، مع نتيجة فورية تمنع العشوائية.', color: 'text-emerald-300', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20' },
  { icon: BarChart3, title: 'متابعة المستوى', desc: 'الطالب يعرف هو فين، وإيه اللي محتاج يراجعه، بدل ما يدخل الامتحان وهو مش مستعد.', color: 'text-violet-300', bg: 'bg-violet-500/10', border: 'border-violet-500/20' },
  { icon: LockKeyhole, title: 'اشتراك ذكي ومنظم', desc: 'كل طالب يظهر له المحتوى كامل، لكن المتاح فقط حسب اشتراكه، بدون فوضى أو لخبطة.', color: 'text-amber-300', bg: 'bg-amber-500/10', border: 'border-amber-500/20' },
  { icon: Sparkles, title: 'تجربة استخدام فاخرة', desc: 'واجهة مريحة، منظمة، وسهلة على الطالب سواء من الكمبيوتر أو الموبايل.', color: 'text-[#D4AF37]', bg: 'bg-[#D4AF37]/10', border: 'border-[#D4AF37]/20' },
];

const steps = ['سجّل حسابك واختر صفك الدراسي', 'تواصل مع الأستاذ لتفعيل الاشتراك', 'ادخل على وحداتك ودروسك وامتحاناتك فورًا'];

export const WhyBayan = () => {
  return (
    <section id="why" className="relative overflow-hidden py-24">
      {/* الخلفية */}
      <div className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat opacity-15" style={{ backgroundImage: `url(${homeBg})` }} />
      <div className="absolute inset-0 z-[1] bg-gradient-to-b from-[#07090D] via-[#07090D]/85 to-[#07090D]" />

      <div className="container mx-auto px-6 lg:px-16 relative z-10">
        <motion.div initial={{ opacity: 0, y: 26 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.75 }} className="mx-auto mb-14 max-w-3xl text-center">
          <div className="diamond-divider justify-center font-amiri mb-4"><span>✦ لماذا بَيان؟ ✦</span></div>
          <h2 className="font-amiri text-4xl lg:text-6xl font-black luxury-section-title">لأن التفوق لا يأتي صدفة</h2>
          <p className="mx-auto mt-5 max-w-2xl text-gray-400 leading-8">منصة بَيان تجمع بين شرح الأستاذ، تنظيم المنهج، ملفات المراجعة، والامتحانات التفاعلية في تجربة واحدة واضحة ومريحة للطالب.</p>
        </motion.div>

        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
          {features.map((item, i) => {
            const Icon = item.icon;
            return (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 35, scale: 0.96 }}
                whileInView={{ opacity: 1, y: 0, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.65, delay: i * 0.08, ease: [0.22, 1, 0.36, 1] }}
                whileHover={{ y: -8, scale: 1.015 }}
                className="luxury-card rounded-3xl p-6 text-right relative z-10"
                dir="rtl"
              >
                <div className={`mb-5 inline-flex h-14 w-14 items-center justify-center rounded-2xl border ${item.bg} ${item.border}`}><Icon size={26} className={item.color} /></div>
                <h3 className="font-amiri text-2xl font-bold text-white">{item.title}</h3>
                <p className="mt-3 text-sm leading-7 text-gray-400">{item.desc}</p>
              </motion.div>
            );
          })}
        </div>

        <motion.div initial={{ opacity: 0, y: 35 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.75, delay: 0.2 }} className="mt-14 luxury-card rounded-[2rem] p-6 lg:p-8 relative z-10">
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_360px] lg:items-center">
            <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
              {steps.map((step, i) => (
                <motion.div key={step} whileHover={{ y: -4 }} className="rounded-2xl border border-white/10 bg-black/20 p-4 text-right" dir="rtl">
                  <div className="mb-3 flex items-center justify-end gap-2"><span className="text-sm font-bold text-white">{step}</span><CheckCircle2 size={18} className="text-[#D4AF37]" /></div>
                  <p className="text-xs text-gray-500">خطوة {i + 1} من 3</p>
                </motion.div>
              ))}
            </div>
            <div className="text-right">
              <h3 className="font-amiri text-3xl font-bold text-white">ابدأ رحلتك الآن</h3>
              <p className="mt-2 text-sm leading-7 text-gray-400">سجّل حسابك، وسيتم تفعيل اشتراكك يدويًا بعد التواصل مع الأستاذ.</p>
              <a href="/auth" className="btn-gold btn-magnetic mt-5 inline-flex rounded-2xl px-6 py-3 font-bold text-black">إنشاء حساب جديد</a>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};