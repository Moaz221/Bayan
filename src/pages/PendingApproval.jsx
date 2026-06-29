import { motion } from 'framer-motion';
import { Clock, Phone, CheckCircle } from 'lucide-react';
import loginBg from '../assets/Backgroun_login.png';

const PendingApproval = () => {
  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden">
      <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${loginBg})` }}>
        <div className="absolute inset-0 bg-[#05070A]/90 backdrop-blur-xl" />
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="relative z-10 p-10 bg-white/5 border border-white/10 rounded-3xl max-w-lg text-center"
      >
        <div className="bg-bayan-gold/20 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
          <Clock className="w-10 h-10 text-bayan-gold animate-pulse" />
        </div>

        <h1 className="text-3xl font-amiri font-bold gold-text mb-4">حسابك قيد المراجعة</h1>
        <p className="text-gray-300 leading-relaxed mb-8">
          أهلاً بك يا بطل في منصة بَيان. لقد استلمنا طلب انضمامك، ويقوم الأستاذ بمراجعة البيانات الآن لتفعيل حسابك.
        </p>

        <div className="bg-black/40 p-6 rounded-2xl border border-white/5 mb-8 text-right" dir="rtl">
          <h3 className="text-bayan-gold font-bold mb-3 flex items-center gap-2">
            <CheckCircle size={18} /> خطواط تفعيل الاشتراك:
          </h3>
          <ul className="text-sm text-gray-400 space-y-3">
            <li>1. قم بتحويل مبلغ الاشتراك عبر (فودافون كاش) للرقم: <span className="text-white font-bold">010XXXXXXXX</span></li>
            <li>2. تواصل معنا عبر الواتساب لتأكيد الدفع.</li>
            <li>3. سيتم تفعيل حسابك فوراً وتظهر لك الدروس.</li>
          </ul>
        </div>

        <button
          onClick={() => window.open('https://wa.me/2010XXXXXXXX', '_blank')}
          className="w-full bg-[#25D366] text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 hover:bg-[#1da851] transition-all"
        >
          <Phone size={20} /> تواصل عبر واتساب للتفعيل
        </button>
      </motion.div>
    </div>
  );
};

export default PendingApproval;
