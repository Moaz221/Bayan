import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Menu, X, MessageCircle, Sparkles } from 'lucide-react';
import BayanIcon from '../../assets/Bayan-Icon.png';

const navLinks = [
  { label: 'الرئيسية', href: '#hero' },
  { label: 'لماذا بَيان', href: '#why' },
  { label: 'السنوات', href: '#years' },
  { label: 'الباقات', href: '#pricing' },
  { label: 'تواصل معنا', href: '#contact' },
];

export const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('hero');

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 30);

      const sections = navLinks.map((l) => l.href.replace('#', ''));
      const current = sections.find((id) => {
        const el = document.getElementById(id);
        if (!el) return false;
        const rect = el.getBoundingClientRect();
        return rect.top <= 150 && rect.bottom >= 150;
      });
      if (current) setActiveSection(current);
    };
    window.addEventListener('scroll', onScroll);
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const scrollToSection = (id) => {
    setMobileOpen(false);
    const target = id.replace('#', '');
    const element = document.getElementById(target);
    if (element) {
      const top = element.getBoundingClientRect().top + window.scrollY - 100;
      window.scrollTo({ top, behavior: 'smooth' });
    }
  };

  return (
    <>
      <motion.header
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        className={`fixed top-0 left-0 right-0 z-50 navbar-premium ${
          scrolled ? 'scrolled' : ''
        }`}
      >
        {/* خط ذهبي تحت الـ navbar */}
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-amber-500/30 to-transparent" />

        <div className="container mx-auto px-6 lg:px-12">
          {/* تكبير الارتفاع لـ 90px */}
          <div className="flex items-center justify-between h-[90px]">

            {/* ══ Logo ══ */}
            <Link to="/" className="group flex items-center gap-3 select-none">
              <div className="relative">
                <motion.div
                  className="absolute inset-0 rounded-full pointer-events-none"
                  style={{
                    background: 'radial-gradient(circle, rgba(212,175,55,0.35) 0%, transparent 65%)',
                    filter: 'blur(10px)',
                    transform: 'scale(2)',
                  }}
                  animate={{ opacity: [0.5, 1, 0.5], scale: [1.8, 2.2, 1.8] }}
                  transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                />
                <motion.img
                  src={BayanIcon}
                  alt="بيان"
                  className="relative w-14 h-14 object-contain glow-pulse"
                  whileHover={{ rotate: [0, -8, 8, 0], scale: 1.1 }}
                  transition={{ duration: 0.6 }}
                />
              </div>

              <div className="flex flex-col leading-none">
                {/* تكبير خط اللوجو */}
                <span className="font-amiri text-3xl font-bold shimmer-text">
                  بَيَان
                </span>
                <span className="text-[11px] text-gray-500 font-tajawal tracking-[3px] mt-1">
                  PLATFORM
                </span>
              </div>
            </Link>

            {/* ══ Desktop Nav Links ══ */}
            <nav className="hidden lg:flex items-center gap-1 glass-premium rounded-full px-3 py-2">
              {navLinks.map((link) => {
                const isActive = activeSection === link.href.replace('#', '');
                return (
                  <button
                    key={link.label}
                    onClick={() => scrollToSection(link.href)}
                    className="relative px-6 py-2.5 text-base font-medium font-tajawal transition-colors duration-300"
                  >
                    <span
                      className={`relative z-10 ${
                        isActive ? 'text-[#07090D]' : 'text-gray-300 hover:text-white'
                      }`}
                    >
                      {link.label}
                    </span>

                    {isActive && (
                      <motion.div
                        layoutId="activePill"
                        className="absolute inset-0 rounded-full"
                        style={{
                          background: 'linear-gradient(135deg, #d4af37, #f5d76e)',
                          boxShadow: '0 4px 20px rgba(212, 175, 55, 0.4)',
                        }}
                        transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                      />
                    )}
                  </button>
                );
              })}
            </nav>

            {/* ══ Actions Desktop ══ */}
            <div className="hidden lg:flex items-center gap-4">
              <motion.a
                href="https://wa.me/2010XXXXXXXX"
                target="_blank"
                rel="noreferrer"
                whileHover={{ scale: 1.08, rotate: -5 }}
                whileTap={{ scale: 0.92 }}
                className="relative w-12 h-12 rounded-full glass-premium flex items-center justify-center text-emerald-400 hover:text-emerald-300 group"
              >
                <MessageCircle size={20} />
                <span className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-500 rounded-full">
                  <span className="absolute inset-0 rounded-full bg-emerald-400 animate-ping" />
                </span>
              </motion.a>

              <Link to="/auth">
                <motion.div
                  whileHover={{ scale: 1.04 }}
                  whileTap={{ scale: 0.97 }}
                  className="btn-gold btn-magnetic relative flex items-center gap-2 px-7 py-3.5 rounded-full text-base font-bold font-tajawal"
                >
                  <Sparkles size={16} className="relative z-10" />
                  <span className="relative z-10">ابدأ الآن</span>
                </motion.div>
              </Link>
            </div>

            {/* ══ Mobile Menu Button ══ */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="lg:hidden relative w-12 h-12 rounded-full glass-premium flex items-center justify-center text-white"
            >
              <AnimatePresence mode="wait">
                {mobileOpen ? (
                  <motion.div
                    key="x"
                    initial={{ rotate: -90, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    exit={{ rotate: 90, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <X size={22} />
                  </motion.div>
                ) : (
                  <motion.div
                    key="menu"
                    initial={{ rotate: 90, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    exit={{ rotate: -90, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Menu size={22} />
                  </motion.div>
                )}
              </AnimatePresence>
            </button>
          </div>
        </div>
      </motion.header>

      {/* ══ Mobile Menu Overlay ══ */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="lg:hidden fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
            onClick={() => setMobileOpen(false)}
          >
            <motion.div
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -20, opacity: 0 }}
              transition={{ duration: 0.3 }}
              onClick={(e) => e.stopPropagation()}
              // تعديل الـ top ليتناسب مع الـ Navbar الجديد
              className="absolute top-[90px] left-4 right-4 rounded-3xl glass-premium p-6"
            >
              <div className="space-y-2 text-right">
                {navLinks.map((link, i) => {
                  const isActive = activeSection === link.href.replace('#', '');
                  return (
                    <motion.button
                      key={link.label}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.08 }}
                      onClick={() => scrollToSection(link.href)}
                      className={`block w-full text-right py-4 px-5 rounded-2xl text-base font-tajawal font-medium transition ${
                        isActive
                          ? 'bg-gradient-to-l from-amber-500/20 to-transparent text-amber-400'
                          : 'text-gray-300 hover:bg-white/5'
                      }`}
                    >
                      {link.label}
                    </motion.button>
                  );
                })}

                <div className="pt-4 space-y-3 border-t border-white/10 mt-3">
                  <a
                    href="https://wa.me/2010XXXXXXXX"
                    target="_blank"
                    rel="noreferrer"
                    className="block w-full text-center py-3.5 rounded-2xl bg-emerald-500/10 text-emerald-300 font-medium font-tajawal text-base"
                  >
                    <MessageCircle size={18} className="inline ml-2" />
                    تواصل واتساب
                  </a>

                  <Link
                    to="/auth"
                    onClick={() => setMobileOpen(false)}
                    className="block w-full text-center py-3.5 rounded-2xl btn-gold font-bold font-tajawal text-base"
                  >
                    ابدأ رحلتك الآن
                  </Link>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};