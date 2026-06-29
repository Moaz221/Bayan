import { useState } from 'react';
import { supabase } from '../supabaseClient';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Lock, User, Phone, GraduationCap, Loader2, AlertCircle } from 'lucide-react';
import loginBg from '../assets/Backgroun_login.png';

const AuthPage = () => {
  const [authState, setAuthState] = useState('login');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    fullName: '',
    phone: '',
    grade: '1',
  });

  const checkUserStatus = async (userId) => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error || !data) {
      navigate('/pending');
      return;
    }

    if (data.role === 'admin') {
      navigate('/admin');
      return;
    }

    if (data.is_active) {
      navigate('/dashboard');
      return;
    }

    navigate('/pending');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');

    try {
      if (authState === 'login') {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: formData.email,
          password: formData.password,
        });

        if (error) throw error;

        if (data.user) {
          await checkUserStatus(data.user.id);
        }
      } else {
        const { data, error } = await supabase.auth.signUp({
          email: formData.email,
          password: formData.password,
          options: {
            emailRedirectTo: undefined,
          },
        });

        if (error) throw error;

        if (data?.user) {
          const { error: profileError } = await supabase.from('profiles').insert([
            {
              id: data.user.id,
              full_name: formData.fullName,
              phone: formData.phone,
              grade_level: formData.grade,
              role: 'student',
              is_active: false,
            },
          ]);

          if (profileError) throw profileError;

          navigate('/pending');
        }
      }
    } catch (error) {
      let msg = error.message || String(error);

      if (msg.includes('Rate limit')) msg = 'تم تجاوز عدد المحاولات المسموح بها مؤقتًا. حاول بعد قليل.';
      if (msg.includes('Invalid login credentials')) msg = 'البريد الإلكتروني أو كلمة المرور غير صحيحة.';
      if (msg.includes('User already registered')) msg = 'هذا البريد مستخدم بالفعل.';
      if (msg.includes('Password should be at least')) msg = 'كلمة المرور يجب أن تكون 6 أحرف على الأقل.';

      setErrorMsg(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden font-readex">
      <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${loginBg})` }}>
        <div className="absolute inset-0 bg-[#05070A]/50 backdrop-blur-sm" />
      </div>

      <motion.div
        layout
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-10 w-full max-w-[460px] bg-[#111827]/60 border border-white/10 backdrop-blur-2xl rounded-[2.5rem] p-8 shadow-2xl mx-4"
      >
        <div className="text-center mb-6">
          <div className="inline-flex bg-[#D4AF37] p-3 rounded-2xl mb-4 shadow-lg">
            <GraduationCap className="w-8 h-8 text-black" />
          </div>
          <h2 className="text-3xl font-amiri font-bold gold-text">
            {authState === 'login' ? 'مرحباً بك' : 'إنشاء حساب جديد'}
          </h2>
          <p className="text-sm text-gray-400 mt-2">
            {authState === 'login'
              ? 'سجل دخولك للوصول إلى محتوى المنصة'
              : 'أنشئ حسابك وسيتم مراجعته وتفعيله من الإدارة'}
          </p>
        </div>

        <AnimatePresence>
          {errorMsg && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-red-500/10 border border-red-500/40 text-red-300 text-sm p-3 rounded-xl mb-4 flex items-center gap-2"
            >
              <AlertCircle size={16} />
              <span>{errorMsg}</span>
            </motion.div>
          )}
        </AnimatePresence>

        <form onSubmit={handleSubmit} className="space-y-4 text-right" dir="rtl">
          {authState === 'signup' && (
            <div className="space-y-1">
              <label className="text-xs text-gray-400 mr-2">الاسم الثلاثي</label>
              <div className="relative">
                <User className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  required
                  type="text"
                  placeholder="الاسم بالكامل"
                  className="auth-input pr-11"
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                />
              </div>
            </div>
          )}

          <div className="space-y-1">
            <label className="text-xs text-gray-400 mr-2">البريد الإلكتروني</label>
            <div className="relative">
              <Mail className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                required
                type="email"
                placeholder="email@example.com"
                className="auth-input pr-11 text-left"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>
          </div>

          {authState === 'signup' && (
            <>
              <div className="space-y-1">
                <label className="text-xs text-gray-400 mr-2">رقم الهاتف</label>
                <div className="relative">
                  <Phone className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    required
                    type="tel"
                    placeholder="010XXXXXXXX"
                    className="auth-input pr-11 text-left"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs text-gray-400 mr-2">الصف الدراسي</label>
                <select
                  className="auth-input pr-4"
                  value={formData.grade}
                  onChange={(e) => setFormData({ ...formData, grade: e.target.value })}
                >
                  <option value="1">الصف الأول الثانوي</option>
                  <option value="2">الصف الثاني الثانوي</option>
                  <option value="3">الصف الثالث الثانوي</option>
                </select>
              </div>
            </>
          )}

          <div className="space-y-1">
            <label className="text-xs text-gray-400 mr-2">كلمة المرور</label>
            <div className="relative">
              <Lock className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                required
                type="password"
                placeholder="••••••••"
                className="auth-input pr-11"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              />
            </div>
          </div>

          <button
            disabled={loading}
            type="submit"
            className="w-full bg-gradient-to-b from-[#D4AF37] to-[#AA7C11] text-black font-black py-4 rounded-2xl mt-4 flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-95 transition-all"
          >
            {loading ? <Loader2 className="animate-spin" /> : authState === 'login' ? 'دخول للمنصة' : 'إنشاء حساب جديد'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <button
            onClick={() => setAuthState(authState === 'login' ? 'signup' : 'login')}
            className="text-sm text-gray-400"
          >
            {authState === 'login' ? 'ليس لديك حساب؟ ' : 'لديك حساب بالفعل؟ '}
            <span className="text-[#D4AF37] font-bold">{authState === 'login' ? 'سجل الآن' : 'سجل دخول'}</span>
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default AuthPage;
