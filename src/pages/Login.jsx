import { motion } from 'framer-motion';
import { Mail, Lock, ArrowRight, GraduationCap } from 'lucide-react';
import loginBg from '../assets/Backgroun_login.png';

const Login = () => {
  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden font-readex">
      {/* الخلفية مع طبقة تعتيم */}
      <div
        className="absolute inset-0 bg-cover bg-center z-0"
        style={{ backgroundImage: `url(${loginBg})` }}
      >
        <div className="absolute inset-0 bg-[#05070A]/80 backdrop-blur-sm" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-10 w-full max-w-md p-8 bg-[#111827]/40 border border-white/10 backdrop-blur-xl rounded-3xl shadow-2xl mx-4"
      >
        {/* اللوجو */}
        <div className="text-center mb-10">
          <div className="inline-flex bg-bayan-gold p-3 rounded-2xl mb-4 shadow-[0_0_20px_rgba(212,175,55,0.3)]">
            <GraduationCap className="w-8 h-8 text-black" />
          </div>
          <h1 className="text-3xl font-amiri font-bold gold-text">مرحباً بك في بَيان</h1>
          <p className="text-gray-400 mt-2">سجل دخولك لمتابعة رحلة تعلمك</p>
        </div>

        <form className="space-y-6 text-right" dir="rtl">
          {/* البريد الإلكتروني */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2 mr-1">البريد الإلكتروني</label>
            <div className="relative">
              <Mail className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
              <input
                type="email"
                placeholder="example@gmail.com"
                className="w-full bg-black/40 border border-white/10 rounded-xl py-3 pr-11 pl-4 text-white focus:border-bayan-gold outline-none transition-all"
              />
            </div>
          </div>

          {/* كلمة السر */}
          <div>
            <div className="flex justify-between mb-2 px-1">
              <a href="#" className="text-xs text-bayan-gold hover:underline">نسيت كلمة السر؟</a>
              <label className="text-sm font-medium text-gray-300">كلمة السر</label>
            </div>
            <div className="relative">
              <Lock className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
              <input
                type="password"
                placeholder="••••••••"
                className="w-full bg-black/40 border border-white/10 rounded-xl py-3 pr-11 pl-4 text-white focus:border-bayan-gold outline-none transition-all"
              />
            </div>
          </div>

          {/* زر الدخول */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="w-full bg-gradient-to-r from-[#D4AF37] to-[#AA7C11] text-black font-bold py-4 rounded-xl shadow-lg hover:shadow-bayan-gold/20 transition-all flex items-center justify-center gap-2"
          >
            <span>تسجيل الدخول</span>
            <ArrowRight className="w-5 h-5 rotate-180" />
          </motion.button>
        </form>

        <div className="mt-8 text-center">
          <p className="text-gray-400 text-sm">
            ليس لديك حساب؟ <a href="#" className="text-bayan-gold font-bold hover:underline">أنشئ حسابك الآن</a>
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;
