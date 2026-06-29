import { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Mail,
  Lock,
  User,
  Phone,
  GraduationCap,
  Loader2,
  AlertCircle,
  Eye,
  EyeOff,
  CheckCircle2,
} from 'lucide-react';
import loginBg from '../assets/Backgroun_login.png';

const AuthPage = () => {
  const [authState, setAuthState] = useState('login');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    fullName: '',
    phone: '',
    grade: '1',
    newPassword: '',
    confirmPassword: '',
  });

  useEffect(() => {
    const hash = window.location.hash;
    const search = window.location.search;

    if (
      hash.includes('type=recovery') ||
      search.includes('type=recovery') ||
      search.includes('mode=recovery')
    ) {
      setAuthState('reset');
      setErrorMsg('');
      setSuccessMsg('');
    }

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY') {
        setAuthState('reset');
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // ✅ Redirect مباشرة على الـ Dashboard
  const checkUserStatus = async (userId) => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error || !data) {
      navigate('/dashboard');
      return;
    }

    if (data.role === 'admin') {
      navigate('/admin');
      return;
    }

    navigate('/dashboard');
  };

  const switchState = (newState) => {
    setAuthState(newState);
    setErrorMsg('');
    setSuccessMsg('');
    setShowPassword(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');
    setSuccessMsg('');

    localStorage.setItem('rememberMe', String(rememberMe));

    try {
      // ════ LOGIN ════
      if (authState === 'login') {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: formData.email,
          password: formData.password,
        });

        if (error) throw error;

        if (data.user) {
          await checkUserStatus(data.user.id);
        }
      }

      // ════ SIGNUP ════
      else if (authState === 'signup') {
        const { data, error } = await supabase.auth.signUp({
          email: formData.email,
          password: formData.password,
          options: {
            emailRedirectTo: undefined,
          },
        });

        if (error) throw error;

        if (data?.user) {
          // ✅ تأكد إن grade_level رقم
          const gradeNumber = Number(formData.grade);
          
          if (![1, 2, 3].includes(gradeNumber)) {
            throw new Error('يجب اختيار صف دراسي صحيح');
          }

          const { error: profileError } = await supabase.from('profiles').insert([
            {
              id: data.user.id,
              full_name: formData.fullName,
              phone: formData.phone,
              grade_level: gradeNumber,
              role: 'student',
              is_active: false,
              subscription_status: 'pending',
              access_mode: 'full_grade',
            },
          ]);

          if (profileError) throw profileError;

          // ✅ يدخل الداشبورد على طول
          navigate('/dashboard');
        }
      }

      // ════ FORGOT PASSWORD ════
      else if (authState === 'forgot') {
        const { error } = await supabase.auth.resetPasswordForEmail(formData.email, {
          redirectTo: `${window.location.origin}/auth?mode=recovery`,
        });

        if (error) throw error;

        setSuccessMsg('تم إرسال رابط استعادة كلمة المرور إلى بريدك الإلكتروني.');
      }

      // ════ RESET PASSWORD ════
      else if (authState === 'reset') {
        if (!formData.newPassword || formData.newPassword.length < 6) {
          throw new Error('كلمة المرور الجديدة يجب أن تكون 6 أحرف على الأقل.');
        }

        if (formData.newPassword !== formData.confirmPassword) {
          throw new Error('تأكيد كلمة المرور غير مطابق.');
        }

        const { error } = await supabase.auth.updateUser({
          password: formData.newPassword,
        });

        if (error) throw error;

        setSuccessMsg('تم تغيير كلمة المرور بنجاح. يمكنك تسجيل الدخول الآن.');

        setFormData((prev) => ({
          ...prev,
          password: '',
          newPassword: '',
          confirmPassword: '',
        }));

        setTimeout(() => {
          switchState('login');
          navigate('/auth');
        }, 1500);
      }
    } catch (error) {
      let msg = error.message || String(error);

      if (msg.includes('Rate limit'))
        msg = 'تم تجاوز عدد المحاولات المسموح بها مؤقتًا. حاول بعد قليل.';
      if (msg.includes('Invalid login credentials'))
        msg = 'البريد الإلكتروني أو كلمة المرور غير صحيحة.';
      if (msg.includes('User already registered'))
        msg = 'هذا البريد مستخدم بالفعل.';
      if (msg.includes('Password should be at least'))
        msg = 'كلمة المرور يجب أن تكون 6 أحرف على الأقل.';
      if (msg.includes('Unable to validate email'))
        msg = 'البريد الإلكتروني غير صحيح.';
      if (msg.includes('Auth session missing'))
        msg = 'رابط إعادة التعيين غير صالح أو منتهي الصلاحية. اطلب رابطًا جديدًا.';

      setErrorMsg(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden font-readex">
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url(${loginBg})` }}
      >
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
            {authState === 'login' && 'مرحباً بك'}
            {authState === 'signup' && 'إنشاء حساب جديد'}
            {authState === 'forgot' && 'نسيت كلمة المرور؟'}
            {authState === 'reset' && 'تغيير كلمة المرور'}
          </h2>
          <p className="text-sm text-gray-400 mt-2">
            {authState === 'login' && 'سجل دخولك للوصول إلى محتوى المنصة'}
            {authState === 'signup' && 'أنشئ حسابك وابدأ رحلتك التعليمية فوراً'}
            {authState === 'forgot' && 'أدخل بريدك الإلكتروني وسنرسل لك رابط الاستعادة'}
            {authState === 'reset' && 'أدخل كلمة المرور الجديدة ثم أكدها'}
          </p>
        </div>

        <AnimatePresence>
          {errorMsg && (
            <motion.div
              key="error"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="bg-red-500/10 border border-red-500/40 text-red-300 text-sm p-3 rounded-xl mb-4 flex items-center gap-2"
            >
              <AlertCircle size={16} />
              <span>{errorMsg}</span>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {successMsg && (
            <motion.div
              key="success"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="bg-emerald-500/10 border border-emerald-500/40 text-emerald-300 text-sm p-3 rounded-xl mb-4 flex items-center gap-2"
            >
              <CheckCircle2 size={16} />
              <span>{successMsg}</span>
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

          {(authState === 'login' || authState === 'signup' || authState === 'forgot') && (
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
          )}

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
                  required
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

          {(authState === 'login' || authState === 'signup') && (
            <div className="space-y-1">
              <div className="flex items-center justify-between mb-1 px-1">
                <div>
                  {authState === 'login' && (
                    <button
                      type="button"
                      onClick={() => switchState('forgot')}
                      className="text-[11px] text-[#D4AF37] hover:underline transition"
                    >
                      نسيت كلمة السر؟
                    </button>
                  )}
                </div>
                <label className="text-xs text-gray-400">كلمة المرور</label>
              </div>

              <div className="relative">
                <Lock className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  required
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  className="auth-input pr-11 pl-11"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>
          )}

          {authState === 'reset' && (
            <>
              <div className="space-y-1">
                <label className="text-xs text-gray-400 mr-2">كلمة المرور الجديدة</label>
                <div className="relative">
                  <Lock className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    required
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    className="auth-input pr-11 pl-11"
                    value={formData.newPassword}
                    onChange={(e) => setFormData({ ...formData, newPassword: e.target.value })}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs text-gray-400 mr-2">تأكيد كلمة المرور الجديدة</label>
                <div className="relative">
                  <Lock className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    required
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    className="auth-input pr-11 pl-11"
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>
            </>
          )}

          {authState === 'login' && (
            <label
              className="flex items-center justify-end gap-2 text-xs text-gray-400 cursor-pointer select-none px-1"
              dir="rtl"
            >
              <span>تذكرني على هذا الجهاز</span>
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="accent-[#D4AF37] w-4 h-4 cursor-pointer"
              />
            </label>
          )}

          <button
            disabled={loading}
            type="submit"
            className="w-full bg-gradient-to-b from-[#D4AF37] to-[#AA7C11] text-black font-black py-4 rounded-2xl mt-4 flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loading ? (
              <Loader2 className="animate-spin" size={22} />
            ) : (
              <>
                {authState === 'login' && 'دخول للمنصة'}
                {authState === 'signup' && 'إنشاء حساب جديد'}
                {authState === 'forgot' && 'إرسال رابط الاستعادة'}
                {authState === 'reset' && 'حفظ كلمة المرور الجديدة'}
              </>
            )}
          </button>
        </form>

        <div className="mt-6 text-center space-y-3">
          {(authState === 'login' || authState === 'signup') && (
            <button
              onClick={() => switchState(authState === 'login' ? 'signup' : 'login')}
              className="text-sm text-gray-400 block w-full"
            >
              {authState === 'login' ? 'ليس لديك حساب؟ ' : 'لديك حساب بالفعل؟ '}
              <span className="text-[#D4AF37] font-bold">
                {authState === 'login' ? 'سجل الآن' : 'سجل دخول'}
              </span>
            </button>
          )}

          {authState === 'forgot' && (
            <button
              onClick={() => switchState('login')}
              className="text-sm text-gray-400 hover:text-white transition"
            >
              ← رجوع لتسجيل الدخول
            </button>
          )}

          {authState === 'reset' && (
            <button
              onClick={() => switchState('login')}
              className="text-sm text-gray-400 hover:text-white transition"
            >
              ← رجوع لتسجيل الدخول
            </button>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default AuthPage;