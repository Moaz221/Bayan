import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BookOpen, FileQuestion, Home, LogOut, Menu, User, X, GraduationCap, Lock } from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { signOutUser } from '../../lib/auth';
import BayanIcon from '../../assets/Bayan-Icon.png';
import Footer from '../shared/Footer';

const NAV_ITEMS = [
  { id: 'home', label: 'الرئيسية', icon: Home, path: '/dashboard' },
  { id: 'units', label: 'الوحدات والدروس', icon: BookOpen, path: '/dashboard/units' },
  { id: 'exams', label: 'الامتحانات', icon: FileQuestion, path: '/dashboard/exams' },
  { id: 'profile', label: 'حسابي', icon: User, path: '/dashboard/profile' },
];

const GRADE_LABELS = { 1: 'أولى ثانوي', 2: 'ثانية ثانوي', 3: 'ثالثة ثانوي' };
const SUB_TYPE_LABELS = {
  monthly: 'شهري',
  term: 'ترم',
  yearly: 'سنوي',
  final_review: 'مراجعة نهائية',
};

// ══════ كل الـ CSS المطلوب (شيمر + زجاج) جوه نفس الملف ══════
const GlobalStyles = () => (
  <style>{`
    @keyframes bayan-shimmer {
      0% { background-position: -200% center; }
      100% { background-position: 200% center; }
    }
    .shimmer-text {
      background: linear-gradient(
        90deg,
        #D4AF37 0%, #fff8dc 15%, #D4AF37 30%,
        #D4AF37 55%, #fff8dc 70%, #D4AF37 85%, #D4AF37 100%
      );
      background-size: 250% auto;
      -webkit-background-clip: text;
      background-clip: text;
      -webkit-text-fill-color: transparent;
      color: transparent;
      animation: bayan-shimmer 3.5s linear infinite;
    }
    .glass-panel {
      background: linear-gradient(135deg, rgba(255,255,255,0.07), rgba(255,255,255,0.02));
      backdrop-filter: blur(24px);
      -webkit-backdrop-filter: blur(24px);
    }
  `}</style>
);

// ══════ Avatar بحرف اسم الطالب + نقطة حالة الاشتراك ══════
const Avatar = ({ name, active }) => {
  const initial = name?.trim()?.charAt(0) || 'ط';
  return (
    <div className="relative shrink-0">
      <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-[#D4AF37] to-[#AA7C11] text-lg font-black text-black shadow-lg shadow-[#D4AF37]/20">
        {initial}
      </div>
      <span
        className={`absolute -bottom-0.5 -left-0.5 h-3.5 w-3.5 rounded-full border-2 border-[#05070A] ${
          active ? 'bg-emerald-400' : 'bg-amber-400'
        }`}
      />
    </div>
  );
};

const StudentLayout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { profile } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await signOutUser();
    navigate('/');
  };

  const isActive = (path) => {
    if (path === '/dashboard') return location.pathname === '/dashboard';
    return location.pathname.startsWith(path);
  };

  const isSubscriptionActive = profile?.subscription_status === 'active';

  // ══════ محتوى السايدبار — نفسه بالظبط في الـ PC والموبايل ══════
  const SidebarContent = ({ layoutIdPrefix }) => (
    <div className="flex h-full flex-col">
      {/* Logo */}
      <div className="border-b border-white/10 px-5 py-6">
        <div className="flex items-center justify-end gap-3">
          <div className="text-right">
            <h1 className="font-amiri text-2xl font-black text-white">بَيان</h1>
            <p className="text-xs text-gray-400">منصة تعليم اللغة العربية</p>
          </div>
          <img
            src={BayanIcon}
            alt="بيان"
            className="h-10 w-10 object-contain"
            style={{ filter: 'drop-shadow(0 0 8px rgba(212,175,55,0.5))' }}
          />
        </div>
      </div>

      {/* Student Info */}
      <div className="border-b border-white/10 px-5 py-4">
        <div className="flex items-center justify-end gap-3 rounded-2xl border border-white/5 bg-black/20 p-3">
          <div className="text-right">
            <p className="shimmer-text text-sm font-bold">{profile?.full_name || 'الطالب'}</p>
            <p className="mt-0.5 text-xs text-gray-400">{GRADE_LABELS[profile?.grade_level] || '-'}</p>
          </div>
          <Avatar name={profile?.full_name} active={isSubscriptionActive} />
        </div>
        <div className="mt-3 flex justify-end">
          {isSubscriptionActive ? (
            <span className="inline-flex items-center gap-1 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs font-bold text-emerald-300">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
              {SUB_TYPE_LABELS[profile?.subscription_type] || 'مشترك'}
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 rounded-full border border-amber-500/30 bg-amber-500/10 px-3 py-1 text-xs font-bold text-amber-300">
              <Lock size={10} />
              غير مشترك
            </span>
          )}
        </div>
      </div>

      {/* Navigation — بمؤشر ذهبي متحرك */}
      <nav className="flex-1 space-y-2 overflow-y-auto px-4 py-4">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.path);
          return (
            <Link
              key={item.id}
              to={item.path}
              onClick={() => setSidebarOpen(false)}
              className="relative block"
            >
              {active && (
                <motion.div
                  layoutId={`${layoutIdPrefix}-active-pill`}
                  transition={{ type: 'spring', damping: 22, stiffness: 260 }}
                  className="absolute inset-0 rounded-2xl border border-[#D4AF37]/40 bg-[#D4AF37]/10"
                />
              )}
              <div className="relative flex items-center justify-between px-4 py-3.5 text-right">
                <span className={`text-sm font-medium ${active ? 'text-white' : 'text-gray-400'}`}>
                  {item.label}
                </span>
                <span
                  className={`flex h-9 w-9 items-center justify-center rounded-xl transition-colors ${
                    active ? 'bg-[#D4AF37] text-black' : 'bg-white/5 text-gray-400'
                  }`}
                >
                  <Icon size={18} />
                </span>
              </div>
            </Link>
          );
        })}
      </nav>

      {/* Logout */}
      <div className="border-t border-white/10 p-4">
        <button
          onClick={handleLogout}
          className="flex w-full items-center justify-between rounded-2xl border border-transparent px-4 py-3 text-right text-sm text-gray-400 transition hover:border-red-500/20 hover:bg-red-500/5 hover:text-red-300"
        >
          <span>تسجيل الخروج</span>
          <LogOut size={16} />
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#05070A] text-white" dir="rtl">
      <GlobalStyles />

      {/* ══ Mobile Overlay ══ */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSidebarOpen(false)}
            className="fixed inset-0 z-40 bg-black/70 backdrop-blur-sm lg:hidden"
          />
        )}
      </AnimatePresence>

      {/* ══ Mobile Sidebar — نفس شكل الـ PC بالظبط، عائم زجاجي ══ */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.aside
            initial={{ x: '110%' }}
            animate={{ x: 0 }}
            exit={{ x: '110%' }}
            transition={{ type: 'spring', damping: 26, stiffness: 220 }}
            className="fixed inset-y-3 right-3 z-50 w-72 max-w-[85vw] lg:hidden"
          >
            <div className="glass-panel relative h-full rounded-[2rem] border border-[#D4AF37]/20 shadow-2xl shadow-black/50">
              <button
                onClick={() => setSidebarOpen(false)}
                className="absolute -left-3 -top-3 flex h-9 w-9 items-center justify-center rounded-full border border-[#D4AF37]/30 bg-[#0B1120] text-gray-300 shadow-lg"
              >
                <X size={16} />
              </button>
              <SidebarContent layoutIdPrefix="mobile" />
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      {/* ══ Desktop Sidebar — عائم زجاجي ثابت ══ */}
      <aside className="fixed inset-y-0 right-0 z-30 hidden w-72 p-3 lg:block">
        <div className="glass-panel flex h-full flex-col rounded-[2rem] border border-[#D4AF37]/20 shadow-2xl shadow-black/40">
          <SidebarContent layoutIdPrefix="desktop" />
        </div>
      </aside>

      {/* ══ Main Content ══ */}
      <div className="lg:pr-72">
        {/* Top Bar */}
        <header className="sticky top-0 z-20 flex items-center justify-between border-b border-white/10 bg-[#05070A]/90 px-4 py-3 backdrop-blur-xl lg:px-6 lg:py-4">
          <div className="flex items-center gap-3">
            {!isSubscriptionActive && (
              <Link
                to="/auth"
                className="hidden items-center gap-2 rounded-xl bg-[#D4AF37] px-4 py-2 text-sm font-bold text-black transition hover:opacity-90 sm:flex"
              >
                <GraduationCap size={16} />
                اشترك الآن
              </Link>
            )}
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden text-right sm:block">
              <p className="shimmer-text text-sm font-bold">{profile?.full_name}</p>
              <p className="text-xs text-gray-500">{GRADE_LABELS[profile?.grade_level]}</p>
            </div>

            <Avatar name={profile?.full_name} active={isSubscriptionActive} />

            <button
              onClick={() => setSidebarOpen(true)}
              className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-gray-300 lg:hidden"
            >
              <Menu size={20} />
            </button>
          </div>
        </header>

        {/* Page Content */}
        <main className="min-h-screen p-4 lg:p-6">
          {children}
        </main>
        <Footer compact />
      </div>
    </div>
  );
};

export default StudentLayout;