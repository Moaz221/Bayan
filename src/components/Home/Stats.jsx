import { motion, useInView } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';
import { Users, BookOpen, Award, Clock, TrendingUp } from 'lucide-react';

const stats = [
  {
    icon: Clock,
    value: 30,
    suffix: '+',
    label: 'سنة خبرة',
    desc: 'رحلة طويلة في صناعة التفوق',
  },
  {
    icon: Users,
    value: 500,
    suffix: '+',
    label: 'طالب معنا',
    desc: 'طلاب وثقوا في بيان',
  },
  {
    icon: TrendingUp,
    value: 100,
    suffix: '%',
    label: 'رضا الطلاب',
    desc: 'تجربة تعليمية واضحة ومؤثرة',
  },
  {
    icon: BookOpen,
    value: 200,
    suffix: '+',
    label: 'درس مسجل',
    desc: 'شرح منظم لكل أجزاء المنهج',
  },
  {
    icon: Award,
    value: 100,
    suffix: '+',
    label: 'امتحان وتدريب',
    desc: 'قياس مستمر للمستوى',
  },
];

const Counter = ({ value, suffix }) => {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const inView = useInView(ref, { once: true });

  useEffect(() => {
    if (!inView) return;

    const duration = 1700;
    const steps = 70;
    const increment = value / steps;
    let current = 0;

    const timer = setInterval(() => {
      current += increment;

      if (current >= value) {
        setCount(value);
        clearInterval(timer);
      } else {
        setCount(Math.floor(current));
      }
    }, duration / steps);

    return () => clearInterval(timer);
  }, [inView, value]);

  return (
    <span ref={ref}>
      {count.toLocaleString('ar-EG')}
      {suffix}
    </span>
  );
};

export const Stats = () => {
  return (
    <section className="relative overflow-hidden py-14 islamic-bg-refined">
      {/* توهج خفيف في الخلفية */}
      <div className="absolute inset-x-0 top-1/2 h-56 -translate-y-1/2 bg-[radial-gradient(ellipse_at_center,rgba(212,175,55,0.06),transparent_70%)] blur-3xl pointer-events-none" />

      <div className="section-divider-refined mb-10" />

      <div className="container mx-auto px-6 lg:px-16 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 22 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="mb-10 text-center"
        >
          <div className="diamond-divider justify-center font-amiri mb-3">
            <span>✦ أرقام تتحدث ✦</span>
          </div>

          <h2 className="font-amiri text-3xl lg:text-5xl font-black luxury-section-title">
            رحلة من الخبرة والثقة
          </h2>

          <p className="mt-3 text-sm lg:text-base text-gray-400">
            منصة بَيان ليست مجرد دروس... بل تجربة متابعة وفهم وتدريب مستمر.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {stats.map((stat, i) => {
            const Icon = stat.icon;

            return (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 35, scale: 0.96 }}
                whileInView={{ opacity: 1, y: 0, scale: 1 }}
                viewport={{ once: true }}
                transition={{
                  duration: 0.65,
                  delay: i * 0.08,
                  ease: [0.22, 1, 0.36, 1],
                }}
                whileHover={{
                  y: -8,
                  scale: 1.025,
                  transition: { duration: 0.25 },
                }}
                className="luxury-card-refined rounded-3xl p-6 text-center"
              >
                <div className="relative mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl border border-amber-500/25 bg-amber-500/10">
                  <motion.div
                    className="absolute inset-0 rounded-2xl"
                    animate={{
                      boxShadow: [
                        '0 0 0 rgba(212,175,55,0)',
                        '0 0 28px rgba(212,175,55,0.28)',
                        '0 0 0 rgba(212,175,55,0)',
                      ],
                    }}
                    transition={{ duration: 3, repeat: Infinity, delay: i * 0.25 }}
                  />
                  <Icon className="relative z-10 h-7 w-7 text-amber-400" />
                </div>

                <div className="font-readex text-4xl font-black shimmer-text">
                  <Counter value={stat.value} suffix={stat.suffix} />
                </div>

                <h3 className="mt-2 font-amiri text-xl font-bold text-white">
                  {stat.label}
                </h3>

                <p className="mt-2 text-xs leading-6 text-gray-500">
                  {stat.desc}
                </p>
              </motion.div>
            );
          })}
        </div>
      </div>

      <div className="section-divider-refined mt-12" />
    </section>
  );
};