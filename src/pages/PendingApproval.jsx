import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Clock, Phone, CheckCircle, RefreshCw } from 'lucide-react';
import { supabase } from '../supabaseClient';
import { useNavigate } from 'react-router-dom';
import loginBg from '../assets/Backgroun_login.png';

const PendingApproval = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  // Check Status Logic
  const checkStatus = async () => {
    setIsLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      navigate('/auth');
      return;
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('is_active, role')
      .eq('id', user.id)
      .single();

    setIsLoading(false);

    if (profile) {
      if (profile.is_active || profile.role === 'admin') {
        // Redirect to appropriate place
        navigate(profile.role === 'admin' ? '/admin' : '/dashboard');
      }
    }
  };

  // Check every 15 seconds automatically
  useEffect(() => {
    checkStatus();
    const interval = setInterval(checkStatus, 15000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden">
      <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${loginBg})` }}>
        <div className="absolute inset-0 bg-[#05070A]/95 backdrop-blur-xl" />
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.92 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: 'spring', damping: 20 }}
        className="relative z-10 p-8 lg:p-10 bg-white/[0.03] border border-white/10 backdrop-blur-2xl rounded-[2.5rem] max-w-lg w-full mx-4 text-center shadow-2xl"
        dir="rtl"
      >
        <div className="relative inline-block mb-6">
          <div className="absolute inset-0 bg-bayan-gold/20 rounded-full blur-xl animate-pulse"></div>
          <div className="relative bg-[#111827] border border-bayan-gold/30 w-24 h-24 rounded-full flex items-center justify-center mx-auto shadow-[0_0_30px_rgba(212,175,55,0.15)]">
             <Clock className="w-10 h-10 text-bayan-gold animate-[spin_10s_linear_infinite]" style={{ animationDirection: 'reverse' }} />
          </div>
        </div>

        <h1 className="text-3xl lg:text-4xl font-amiri font-bold gold-text mb-3">حسابك قيد التنشيط</h1>
        <p className="text-gray-300 text-sm lg:text-base leading-loose mb-8 max-w-md mx-auto">
          تم تسجيل طلبك بنجاح! <br/>
          الآن يمكنك إتمام خطوات الدفع ليتم تفعيل الدروس والامتحانات أمامك.
        </p>

        {/* Steps Card */}
        <div className="bg-black/40 border border-white/5 rounded-2xl p-6 mb-8 text-right">
          <h3 className="text-bayan-gold font-bold mb-5 flex items-center justify-end gap-2 text-lg">
            خطوات تفعيل الاشتراك 
            <CheckCircle size={20} className="text-emerald-400" />
          </h3>
          
          <ul className="space-y-5">
            <li className="flex items-start gap-3 text-gray-300 text-sm font-tajawal">
              <span className="shrink-0 mt-1 w-6 h-6 rounded-full bg-bayan-gold/20 text-bayan-gold flex items-center justify-center text-xs font-bold">١</span>
              <span>قم بتحويل مبلغ الاشتراك عبر <strong className="text-white">(فودافون كاش / انستاباي)</strong> للرقم المعروض.</span>
            </li>
            <li className="flex items-start gap-3 text-gray-300 text-sm font-tajawal">
              <span className="shrink-0 mt-1 w-6 h-6 rounded-full bg-bayan-gold/20 text-bayan-gold flex items-center justify-center text-xs font-bold">٢</span>
              <span>احتفظ بصورة التحويل أو رقم العملية.</span>
            </li>
            <li className="flex items-start gap-3 text-gray-300 text-sm font-tajawal">
              <span className="shrink-0 mt-1 w-6 h-6 rounded-full bg-bayan-gold/20 text-bayan-gold flex items-center justify-center text-xs font-bold">٣</span>
              <span>تواصل معنا عبر الواتساب بإرسال صورة التحويل.</span>
            </li>
          </ul>
          
          <div className="mt-6 p-3 rounded-xl bg-emerald-500/5 border border-emerald-500/20 text-emerald-300 text-xs">
            💡 سيتم التفعيل خلال دقائق من تأكيد التحويل.
          </div>
        </div>

        <div className="grid grid-cols-1 gap-3">
          <button
            onClick={() => window.open('https://wa.me/2010XXXXXXXX', '_blank')}
            className="w-full bg-[#25D366] hover:bg-[#1da851] text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg shadow-green-900/20 group"
          >
            <Phone size={20} /> تواصل عبر واتساب للتفعيل
          </button>

          <button
            onClick={checkStatus}
            disabled={isLoading}
            className="w-full bg-white/5 hover:bg-white/10 border border-white/10 text-gray-300 hover:text-white font-medium py-3 rounded-xl flex items-center justify-center gap-2 transition-all"
          >
             <RefreshCw size={16} className={`${isLoading ? 'animate-spin' : ''}`} /> 
             {isLoading ? 'جاري الفحص...' : 'التحقق من الحالة'}
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default PendingApproval;