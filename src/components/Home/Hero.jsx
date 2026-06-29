import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowLeft, Sparkles, Users, Award, Clock } from 'lucide-react';
import teacherImage from '../../assets/teacher.png';
import homeBg from '../../assets/Home_Background.png';

const PARTICLES = Array.from({ length: 20 }, (_, i) => ({
  id: i,
  x: Math.random() * 100,
  y: Math.random() * 100,
  size: Math.random() * 3 + 1,
  duration: Math.random() * 8 + 5,
  delay: Math.random() * 4,
}));

const Particles = () => (
  <div className="absolute inset-0 overflow-hidden pointer-events-none">
    {PARTICLES.map((p) => (
      <motion.div
        key={p.id}
        className="absolute rounded-full bg-amber-400"
        style={{ left: `${p.x}%`, top: `${p.y}%`, width: p.size, height: p.size }}
        animate={{ y: [-15, 15, -15], opacity: [0.05, 0.4, 0.05], scale: [1, 1.5, 1] }}
        transition={{ duration: p.duration, delay: p.delay, repeat: Infinity, ease: 'easeInOut' }}
      />
    ))}
  </div>
);

const AnimatedText = ({ text, className = '', delay = 0 }) => (
  <span className={className}>
    {text.split(' ').map((word, i) => (
      <motion.span
        key={i}
        initial={{ opacity: 0, y: 20, filter: 'blur(8px)' }}
        animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
        transition={{ duration: 0.6, delay: delay + i * 0.08, ease: [0.215, 0.610, 0.355, 1] }}
        className="inline-block ml-2"
      >
        {word}
      </motion.span>
    ))}
  </span>
);

const TeacherShowcase = () => (
  <motion.div
    initial={{ opacity: 0, scale: 0.85 }}
    animate={{ opacity: 1, scale: 1 }}
    transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
    className="relative flex items-end justify-center"
    style={{ width: 480, height: 600 }}
  >
    {/* الإطار العربي - محراب بسيط وأنيق */}
    <motion.div
      className="absolute pointer-events-none"
      style={{
        inset: '-15px',
        borderRadius: '50% 50% 0 0',
        border: '3px solid',
        borderImage: 'linear-gradient(135deg, rgba(212,175,55,0.8), rgba(212,175,55,0.4), rgba(212,175,55,0.8)) 1',
        zIndex: 2,
      }}
      animate={{ opacity: [0.7, 1, 0.7] }}
      transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
    />

    {/* الحد الداخلي للإطار */}
    <motion.div
      className="absolute pointer-events-none"
      style={{
        inset: '-12px',
        borderRadius: '50% 50% 0 0',
        border: '1px solid rgba(212,175,55,0.3)',
        zIndex: 1,
      }}
    />

    {/* صورة المدرس بحجمها الأصلي مع Gradient Mask في الأسفل */}
    <motion.div
      className="relative z-3"
      style={{
        width: '100%',
        height: '100%',
        position: 'relative',
        overflow: 'hidden',
        borderRadius: '0 0 8px 8px',
        // Gradient mask يخفي الجزء المقصوص ويدمجه بسلاسة
        WebkitMaskImage: 'linear-gradient(to bottom, rgba(0,0,0,1) 0%, rgba(0,0,0,1) 85%, rgba(0,0,0,0.6) 95%, rgba(0,0,0,0) 100%)',
        maskImage: 'linear-gradient(to bottom, rgba(0,0,0,1) 0%, rgba(0,0,0,1) 85%, rgba(0,0,0,0.6) 95%, rgba(0,0,0,0) 100%)',
      }}
    >
      <motion.img
        src={teacherImage}
        alt="الأستاذ إسماعيل رمضان"
        className="relative select-none object-contain"
        style={{
          width: '100%',
          height: '100%',
          objectPosition: 'center bottom',
          zIndex: 3,
          filter: 'drop-shadow(0 25px 60px rgba(0,0,0,0.85)) drop-shadow(0 0 30px rgba(212,175,55,0.3))',
        }}
        animate={{ y: [0, -10, 0] }}
        transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
      />
    </motion.div>

    {/* بطاقة الخبرة */}
    <motion.div
      initial={{ opacity: 0, x: -50 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 1, duration: 0.8 }}
      className="absolute float-card glass-premium rounded-2xl px-4 py-3 flex items-center gap-3"
      style={{ top: '15%', right: '-20px', zIndex: 5 }}
    >
      <div className="w-10 h-10 rounded-xl bg-amber-500/20 flex items-center justify-center">
        <Clock size={18} className="text-amber-400" />
      </div>
      <div className="text-right">
        <div className="text-white font-bold text-lg font-tajawal">+30</div>
        <div className="text-gray-400 text-xs font-tajawal">سنة خبرة</div>
      </div>
    </motion.div>

    {/* بطاقة الطلاب */}
    <motion.div
      initial={{ opacity: 0, x: 50 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 1.2, duration: 0.8 }}
      className="absolute float-card-delayed glass-premium rounded-2xl px-4 py-3 flex items-center gap-3"
      style={{ top: '45%', left: '-30px', zIndex: 5 }}
    >
      <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center">
        <Users size={18} className="text-blue-400" />
      </div>
      <div className="text-right">
        <div className="text-white font-bold text-lg font-tajawal">+500</div>
        <div className="text-gray-400 text-xs font-tajawal">طالب</div>
      </div>
    </motion.div>

    {/* بطاقة الاعتماد */}
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 1.4, duration: 0.8 }}
      className="absolute float-card glass-premium rounded-2xl px-4 py-3 flex items-center gap-3"
      style={{ bottom: '8%', right: '-10px', zIndex: 5 }}
    >
      <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center">
        <Award size={18} className="text-emerald-400" />
      </div>
      <div className="text-right">
        <div className="text-white font-bold text-sm font-tajawal">معتمد</div>
        <div className="text-gray-400 text-xs font-tajawal">منهج رسمي</div>
      </div>
    </motion.div>
  </motion.div>
);

export const Hero = () => {
  return (
    <section id="hero" className="relative min-h-[100dvh] flex items-center pt-28 pb-20 overflow-hidden">
      {/* الخلفية الرئيسية */}
      <div
        className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${homeBg})` }}
      />
      
      {/* طبقة تعتيم خفيفة عشان النص يبان */}
      <div className="absolute inset-0 z-[1] bg-gradient-to-r from-[#07090D]/90 via-[#07090D]/70 to-[#07090D]/85" />

      <Particles />

      <div className="container mx-auto px-6 lg:px-16 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="flex justify-center items-center order-1 lg:order-2">
            <TeacherShowcase />
          </div>

          <div className="text-right space-y-6 order-2 lg:order-1">
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="inline-flex items-center gap-2 glass-premium rounded-full px-5 py-2 text-sm"
            >
              <Sparkles className="w-4 h-4 text-amber-400 glow-pulse" />
              <span className="text-amber-300 font-tajawal font-medium">منصة تعليم اللغة العربية الأولى</span>
            </motion.div>

            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }} className="flex justify-end">
              <div className="diamond-divider font-amiri"><span>✦ لُغَةُ الضَّاد ✦</span></div>
            </motion.div>

            <div>
              <motion.h1
                initial={{ opacity: 0, scale: 0.85, y: 25, filter: 'blur(14px)' }}
                animate={{ opacity: 1, scale: 1, y: 0, filter: 'blur(0px)' }}
                transition={{ duration: 1.35, delay: 0.5, ease: [0.22, 1, 0.36, 1] }}
                className="font-amiri font-black leading-none bayan-hero-title relative"
                data-text="بَيَان"
                style={{ fontSize: 'clamp(5.6rem, 12vw, 10rem)' }}
              >
                بَيَان
              </motion.h1>

              <motion.p initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1 }} className="text-lg lg:text-xl text-gray-400 font-tajawal mt-3">
                مع الأستاذ
              </motion.p>

              <motion.h2 initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.1 }} className="text-3xl lg:text-5xl text-white font-bold font-amiri mt-1" style={{ textShadow: '0 2px 20px rgba(212,175,55,0.25)' }}>
                إسماعيل رمضان
              </motion.h2>
            </div>

            <motion.div initial={{ opacity: 0, scaleX: 0 }} animate={{ opacity: 1, scaleX: 1 }} transition={{ delay: 1.3, duration: 0.8 }} style={{ transformOrigin: 'right' }} className="flex items-center gap-3 justify-end">
              <div className="h-px w-32 bg-gradient-to-l from-amber-500/60 to-transparent" />
              <motion.div className="w-2.5 h-2.5 rounded-full bg-amber-500" style={{ boxShadow: '0 0 12px rgba(212,175,55,1)' }} animate={{ scale: [1, 1.5, 1] }} transition={{ duration: 2, repeat: Infinity }} />
              <div className="h-px w-12 bg-amber-500/40" />
            </motion.div>

            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.4 }} className="space-y-1">
              <p className="text-xl lg:text-2xl text-white font-amiri font-bold">
                <AnimatedText text="شرحٌ يصنع الفهم" className="text-amber-400" delay={1.5} />
                <span className="mx-2 text-gray-600">•</span>
                <AnimatedText text="ومتابعةٌ تصنع التفوق" className="text-white" delay={2} />
              </p>
              <p className="text-sm lg:text-base text-gray-400 font-tajawal pt-1">لطلاب المرحله الثانويه و البكالوريا </p>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 2.5 }} className="flex flex-wrap gap-2 justify-end pt-1">
              {[{ icon: Sparkles, label: 'دروس فيديو HD' }, { icon: Award, label: 'امتحانات تفاعلية' }, { icon: Sparkles, label: 'ملفات PDF' }].map((tag, i) => {
                const Icon = tag.icon;
                return (
                  <motion.div key={i} whileHover={{ y: -3, borderColor: 'rgba(212,175,55,0.5)' }} className="flex items-center gap-2 glass-premium rounded-full px-4 py-2 text-xs text-gray-300 font-tajawal">
                    <Icon size={13} className="text-amber-400" />
                    {tag.label}
                  </motion.div>
                );
              })}
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 2.8 }} className="flex flex-wrap gap-4 pt-4 justify-end">
              <Link to="/auth">
                <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }} className="btn-gold btn-magnetic px-8 py-4 rounded-2xl flex items-center gap-3 text-base font-bold font-tajawal shadow-xl shadow-amber-500/30">
                  <span className="relative z-10">ابدأ رحلتك الآن</span>
                  <ArrowLeft className="w-5 h-5 relative z-10" />
                </motion.div>
              </Link>

              <motion.button
                whileHover={{ scale: 1.04, borderColor: 'rgba(212,175,55,0.5)' }}
                whileTap={{ scale: 0.97 }}
                onClick={() => document.getElementById('pricing')?.scrollIntoView({ behavior: 'smooth' })}
                className="glass-premium px-8 py-4 rounded-2xl text-base text-white font-tajawal font-medium hover:text-amber-300 transition"
              >
                استعرض الباقات
              </motion.button>
            </motion.div>
          </div>
        </div>
      </div>

      <div className="absolute bottom-0 left-0 right-0 h-32 pointer-events-none z-[3]" style={{ background: 'linear-gradient(to top, #07090D, transparent)' }} />
    </section>
  );
};
