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

  const SidebarContent = () => (
    <div className="flex h-full flex-col">
      {/* Logo */}
      <div className="border-b border-white/10 px-5 py-6">
        <div className="flex items-center justify-end gap-3">
          <div className="text-right">
            <h1 className="font-amiri text-2xl font-black text-white">بَيان</h1>
            <p className="text-xs text-gray-500">منصة تعليم اللغة العربية</p>
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
        <div className="rounded-2xl bg-white/[0.03] p-4 text-right">
          <p className="text-sm font-bold text-white">{profile?.full_name || 'الطالب'}</p>
          <p className="mt-1 text-xs text-gray-400">
            {GRADE_LABELS[profile?.grade_level] || '-'}
          </p>
          <div className="mt-3 flex items-center justify-end gap-2">
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
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-2 overflow-y-auto px-4 py-4">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.path);

          return (
            <Link
              key={item.id}
              to={item.path}
              onClick={() => setSidebarOpen(false)}
              className={`flex w-full items-center justify-between rounded-2xl border px-4 py-3.5 text-right transition-all ${
                active
                  ? 'border-[#D4AF37]/30 bg-[#D4AF37]/10 text-white'
                  : 'border-transparent bg-white/[0.02] text-gray-400 hover:border-white/10 hover:bg-white/[0.05] hover:text-white'
              }`}
            >
              <span className="text-sm font-medium">{item.label}</span>
              <span
                className={`flex h-9 w-9 items-center justify-center rounded-xl transition-all ${
                  active ? 'bg-[#D4AF37] text-black' : 'bg-white/5 text-gray-400'
                }`}
              >
                <Icon size={18} />
              </span>
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
      {/* ══ Mobile Overlay ══ */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSidebarOpen(false)}
            className="fixed inset-0 z-40 bg-black/70 lg:hidden"
          />
        )}
      </AnimatePresence>

      {/* ══ Mobile Sidebar ══ */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.aside
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed inset-y-0 right-0 z-50 w-72 border-l border-white/10 bg-[#0B1120] lg:hidden"
          >
            <button
              onClick={() => setSidebarOpen(false)}
              className="absolute left-4 top-4 rounded-xl p-2 text-gray-400 hover:bg-white/5"
            >
              <X size={20} />
            </button>
            <SidebarContent />
          </motion.aside>
        )}
      </AnimatePresence>

      {/* ══ Desktop Sidebar ══ */}
      <aside className="fixed inset-y-0 right-0 z-30 hidden w-72 border-l border-white/10 bg-[#0B1120] lg:block">
        <SidebarContent />
      </aside>

      {/* ══ Main Content ══ */}
      <div className="lg:pr-72">
        {/* Top Bar */}
        <header className="sticky top-0 z-20 flex items-center justify-between border-b border-white/10 bg-[#05070A]/90 px-4 py-4 backdrop-blur-xl lg:px-6">
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
            <div className="text-right hidden sm:block">
              <p className="text-sm font-bold text-white">{profile?.full_name}</p>
              <p className="text-xs text-gray-500">{GRADE_LABELS[profile?.grade_level]}</p>
            </div>

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