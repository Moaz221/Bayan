import { motion } from 'framer-motion';
import { 
  User, Phone, GraduationCap, CreditCard, Calendar, Shield, 
  CheckCircle2, Clock, XCircle, Ban, Crown, Send, Sparkles,
  Mail, MessageSquare, Award
} from 'lucide-react';
import { WHATSAPP_LINK } from '../../lib/contact';
import profileBackground from '../../assets/profile_background.jpg';

const GRADE_LABELS = { 
  1: 'الصف الأول الثانوي', 
  2: 'الصف الثاني الثانوي', 
  3: 'الصف الثالث الثانوي' 
};

const SUB_LABELS = { 
  monthly: 'شهري', 
  term: 'فصل دراسي', 
  yearly: 'سنوي شامل', 
  final_review: 'مراجعة نهائية' 
};

const STATUS_CONFIG = {
  active: { 
    label: 'نشط', 
    color: 'emerald',
    icon: CheckCircle2,
    description: 'اشتراكك مفعّل ويمكنك الوصول للمحتوى',
  },
  pending: { 
    label: 'قيد الانتظار', 
    color: 'amber',
    icon: Clock,
    description: 'في انتظار تأكيد الدفع وتفعيل اشتراكك',
  },
  expired: { 
    label: 'منتهي', 
    color: 'red',
    icon: XCircle,
    description: 'انتهى اشتراكك، يرجى التجديد للاستمرار',
  },
  cancelled: { 
    label: 'ملغي', 
    color: 'gray',
    icon: Ban,
    description: 'تم إلغاء اشتراكك',
  },
};

const StudentProfile = ({ profile }) => {
  const status = STATUS_CONFIG[profile?.subscription_status || 'pending'];
  const StatusIcon = status.icon;

  // حساب الأيام المتبقية
  const daysRemaining = profile?.subscription_end
    ? Math.max(0, Math.ceil((new Date(profile.subscription_end) - new Date()) / (1000 * 60 * 60 * 24)))
    : null;

  return (
    <div
      className="relative min-h-screen bg-cover bg-center bg-no-repeat"
      dir="rtl"
      style={{
        backgroundImage: `url(${profileBackground})`,
      }}
    >
      <div className="absolute inset-0 bg-black/80 backdrop-blur-md" />
      <div className="relative space-y-6 px-4 py-8 sm:px-6 lg:px-8 max-w-6xl mx-auto">

        {/* ════════════════════════ HEADER CARD ════════════════════════ */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative overflow-hidden rounded-3xl border border-white/20 bg-black/70 backdrop-blur-2xl p-8 shadow-2xl shadow-black/50"
        >
        <div className="absolute inset-0 bg-black/40" />
        <div className="absolute -top-20 -right-20 h-64 w-64 rounded-full bg-[#D4AF37]/10 blur-3xl" />
        <div className="absolute -bottom-20 -left-20 h-64 w-64 rounded-full bg-violet-500/10 blur-3xl" />
        <div className="relative flex flex-col items-center gap-5 md:flex-row md:items-center md:justify-between">
          
          {/* البادج للحالة */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className={`inline-flex items-center gap-2 rounded-full border bg-${status.color}-500/10 border-${status.color}-500/30 px-4 py-2 ${
              status.color === 'emerald' ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300' :
              status.color === 'amber' ? 'bg-amber-500/10 border-amber-500/30 text-amber-300' :
              status.color === 'red' ? 'bg-red-500/10 border-red-500/30 text-red-300' :
              'bg-gray-500/10 border-gray-500/30 text-gray-300'
            }`}
          >
            <StatusIcon size={16} />
            <span className="text-sm font-bold">{status.label}</span>
          </motion.div>

          {/* المعلومات الأساسية */}
          <div className="flex items-center gap-5 text-right">
            <div>
              <p className="text-xs text-[#D4AF37] flex items-center justify-end gap-1.5 mb-1">
                <Sparkles size={12} />
                طالب في منصة بَيان
              </p>
              <h2 className="font-amiri text-3xl font-bold text-white md:text-4xl">
                {profile?.full_name || 'طالب'}
              </h2>
              <p className="mt-1 text-sm text-gray-400">
                {GRADE_LABELS[profile?.grade_level] || 'لم يحدد الصف'}
              </p>
            </div>

            {/* Avatar */}
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ delay: 0.3, type: 'spring' }}
              className="flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-[#D4AF37] to-[#AA7C11] shadow-2xl shadow-[#D4AF37]/30"
            >
              <span className="font-amiri text-3xl font-bold text-black">
                {profile?.full_name?.charAt(0) || '؟'}
              </span>
            </motion.div>
          </div>
        </div>
      </motion.div>

      {/* ════════════════════════ المعلومات الشخصية ════════════════════════ */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="rounded-3xl border border-white/10 bg-black/60 backdrop-blur-xl p-6 shadow-black/20 shadow-inner"
      >
        <div className="mb-5 flex items-center justify-end gap-2">
          <h3 className="text-lg font-bold text-white">البيانات الشخصية</h3>
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#D4AF37]/10">
            <User size={18} className="text-[#D4AF37]" />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
          <InfoCard
            icon={User}
            label="الاسم الكامل"
            value={profile?.full_name || 'غير محدد'}
            iconColor="text-blue-300"
            iconBg="bg-blue-500/10"
          />
          <InfoCard
            icon={GraduationCap}
            label="الصف الدراسي"
            value={GRADE_LABELS[profile?.grade_level] || 'غير محدد'}
            iconColor="text-violet-300"
            iconBg="bg-violet-500/10"
          />
          <InfoCard
            icon={Phone}
            label="رقم الهاتف"
            value={profile?.phone || 'غير محدد'}
            iconColor="text-emerald-300"
            iconBg="bg-emerald-500/10"
            dir="ltr"
          />
        </div>
      </motion.div>

      {/* ════════════════════════ بيانات الاشتراك ════════════════════════ */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="rounded-3xl border border-white/10 bg-black/60 backdrop-blur-xl p-6 shadow-black/20 shadow-inner"
      >
        <div className="mb-5 flex items-center justify-end gap-2">
          <h3 className="text-lg font-bold text-white">تفاصيل الاشتراك</h3>
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#D4AF37]/10">
            <CreditCard size={18} className="text-[#D4AF37]" />
          </div>
        </div>

        {/* Status Banner */}
        <div className={`mb-4 rounded-2xl border p-4 ${
          status.color === 'emerald' ? 'border-emerald-500/30 bg-emerald-500/5' :
          status.color === 'amber' ? 'border-amber-500/30 bg-amber-500/5' :
          status.color === 'red' ? 'border-red-500/30 bg-red-500/5' :
          'border-gray-500/30 bg-gray-500/5'
        }`}>
          <div className="flex items-center justify-between gap-3">
            {daysRemaining !== null && status.color === 'emerald' && (
              <div className="text-left">
                <p className={`text-2xl font-black ${
                  daysRemaining > 30 ? 'text-emerald-300' :
                  daysRemaining > 7 ? 'text-amber-300' :
                  'text-red-300'
                }`}>
                  {daysRemaining}
                </p>
                <p className="text-xs text-gray-400">يوم متبقي</p>
              </div>
            )}

            <div className="flex items-center gap-3 text-right">
              <div>
                <p className={`text-sm font-bold ${
                  status.color === 'emerald' ? 'text-emerald-300' :
                  status.color === 'amber' ? 'text-amber-300' :
                  status.color === 'red' ? 'text-red-300' :
                  'text-gray-300'
                }`}>
                  {status.label}
                </p>
                <p className="mt-0.5 text-xs text-gray-400">{status.description}</p>
              </div>
              <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${
                status.color === 'emerald' ? 'bg-emerald-500/20 text-emerald-300' :
                status.color === 'amber' ? 'bg-amber-500/20 text-amber-300' :
                status.color === 'red' ? 'bg-red-500/20 text-red-300' :
                'bg-gray-500/20 text-gray-300'
              }`}>
                <StatusIcon size={18} />
              </div>
            </div>
          </div>
        </div>

        {/* Subscription Details Grid */}
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          <InfoCard
            icon={Crown}
            label="نوع الاشتراك"
            value={SUB_LABELS[profile?.subscription_type] || 'لا يوجد'}
            iconColor="text-[#D4AF37]"
            iconBg="bg-[#D4AF37]/10"
            highlighted={!!profile?.subscription_type}
          />
          <InfoCard
            icon={Shield}
            label="نوع الوصول"
            value={
              profile?.access_mode === 'full_grade' ? 'الصف كامل' :
              profile?.access_mode === 'final_review_only' ? 'مراجعة نهائية فقط' :
              profile?.access_mode === 'custom_units' ? 'وحدات مخصصة' :
              profile?.access_mode === 'custom_lessons' ? 'دروس مخصصة' :
              '—'
            }
            iconColor="text-cyan-300"
            iconBg="bg-cyan-500/10"
          />
          <InfoCard
            icon={Calendar}
            label="بداية الاشتراك"
            value={profile?.subscription_start
              ? new Date(profile.subscription_start).toLocaleDateString('ar-EG', { 
                  year: 'numeric', month: 'long', day: 'numeric' 
                })
              : 'غير محدد'}
            iconColor="text-blue-300"
            iconBg="bg-blue-500/10"
          />
          <InfoCard
            icon={Calendar}
            label="نهاية الاشتراك"
            value={profile?.subscription_end
              ? new Date(profile.subscription_end).toLocaleDateString('ar-EG', { 
                  year: 'numeric', month: 'long', day: 'numeric' 
                })
              : 'غير محدد'}
            iconColor="text-purple-300"
            iconBg="bg-purple-500/10"
          />
        </div>

        {/* ملاحظات الأستاذ */}
        {profile?.notes && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mt-4 rounded-2xl border border-[#D4AF37]/25 bg-gradient-to-l from-[#D4AF37]/10 to-transparent p-4"
          >
            <div className="flex items-start gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#D4AF37]/20">
                <MessageSquare size={16} className="text-[#D4AF37]" />
              </div>
              <div className="flex-1 text-right">
                <p className="mb-1 text-sm font-bold text-[#D4AF37]">ملاحظات من الأستاذ:</p>
                <p className="text-sm leading-6 text-gray-300">{profile.notes}</p>
              </div>
            </div>
          </motion.div>
        )}
      </motion.div>

      {/* ════════════════════════ CTA للاشتراك ════════════════════════ */}
      {profile?.subscription_status !== 'active' && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
          className="relative overflow-hidden rounded-3xl border-2 border-[#D4AF37]/30 bg-gradient-to-br from-[#D4AF37]/15 via-[#D4AF37]/5 to-transparent p-6 md:p-8"
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
            </div>

            <div className="text-right">
              <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-[#D4AF37]/20 px-3 py-1 text-xs font-bold text-[#D4AF37]">
                <Award size={12} />
                ابدأ رحلتك التعليمية
              </div>
              <h3 className="text-xl font-bold text-white md:text-2xl">
                هل تريد الاشتراك؟ 🚀
              </h3>
              <p className="mt-1 text-sm text-gray-400">
                تواصل معنا عبر الواتساب لتفعيل اشتراكك والوصول لكل المحتوى
              </p>
            </div>
          </div>
        </motion.div>
      )}
      </div>
    </div>
  );
};

// ═══════════════════════════ Sub Components ═══════════════════════════

const InfoCard = ({ icon: Icon, label, value, iconColor, iconBg, dir = 'rtl', highlighted = false }) => (
  <motion.div
    whileHover={{ y: -2 }}
    className={`rounded-2xl border p-4 transition ${
      highlighted 
        ? 'border-[#D4AF37]/25 bg-[#D4AF37]/10 text-white' 
        : 'border-white/10 bg-black/40 text-white'
    }`}
  >
    <div className="flex items-start gap-3">
      <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${iconBg}`}>
        <Icon size={18} className={iconColor} />
      </div>
      <div className="flex-1 text-right">
        <p className="mb-1 text-xs text-gray-400">{label}</p>
        <p className="text-sm font-bold text-white truncate" dir={dir}>{value}</p>
      </div>
    </div>
  </motion.div>
);

export default StudentProfile;