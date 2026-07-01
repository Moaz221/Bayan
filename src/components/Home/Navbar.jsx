import { useState, useEffect, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Menu, X, MessageCircle, Sparkles } from 'lucide-react';
import BayanIcon from '../../assets/Bayan-Icon.png';

// ══ Constants ══
// مصدر واحد لرابط الواتساب - يتستخدم في الديسكتوب والموبايل من نفس المكان
const WHATSAPP_NUMBER = '201153463139';
const WHATSAPP_MESSAGE =
  'السلام عليكم ورحمة الله وبركاته يا أستاذ إسماعيل. أرغب في الاشتراك بـ [الصف الأول الثانوي] - [الترم الأول]. شكرا';
const WHATSAPP_LINK = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(
  WHATSAPP_MESSAGE
)}`;

const NAVBAR_HEIGHT = 90; // px
const SCROLL_THRESHOLD = 30; // px - بعده يبقى الـ navbar "scrolled"
const ACTIVE_SECTION_OFFSET = 150; // px - المسافة من فوق الشاشة اللي بيتحدد عندها الـ section النشط
const SCROLL_TO_OFFSET = 100; // px - المسافة اللي نسيبها فوق العنصر لما نعمل scroll ليه

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
  const rafRef = useRef(null);

  // ══ Scroll handling (مع throttle عبر requestAnimationFrame) ══
  useEffect(() => {
    const handleScroll = () => {
      if (rafRef.current) return; // فيه فريم شغال، متعمل حاجة

      rafRef.current = requestAnimationFrame(() => {
        setScrolled(window.scrollY > SCROLL_THRESHOLD);

        const sections = navLinks.map((l) => l.href.replace('#', ''));
        const current = sections.find((id) => {
          const el = document.getElementById(id);
          if (!el) return false;
          const rect = el.getBoundingClientRect();
          return rect.top <= ACTIVE_SECTION_OFFSET && rect.bottom >= ACTIVE_SECTION_OFFSET;
        });
        if (current) setActiveSection(current);

        rafRef.current = null;
      });
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();

    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  // ══ قفل السكرول على body لما المنيو مفتوحة ══
  useEffect(() => {
    if (mobileOpen) {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = originalOverflow;
      };
    }
  }, [mobileOpen]);

  // ══ قفل المنيو بـ Escape ══
  useEffect(() => {
    if (!mobileOpen) return;

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') setMobileOpen(false);
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [mobileOpen]);

  const scrollToSection = useCallback((id) => {
    setMobileOpen(false);
    const target = id.replace('#', '');
    setActiveSection(target); // تحديث فوري للـ pill لحظة الضغط
    const element = document.getElementById(target);
    if (element) {
      const top = element.getBoundingClientRect().top + window.scrollY - SCROLL_TO_OFFSET;
      window.scrollTo({ top, behavior: 'smooth' });
    }
  }, []);

  const scrollToTop = useCallback(() => {
    setMobileOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

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
          <div className="flex items-center justify-between" style={{ height: `${NAVBAR_HEIGHT}px` }}>

            {/* ══ Logo ══ */}
            <Link to="/" onClick={scrollToTop} className="group flex items-center gap-3 select-none">
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
                <span className="font-amiri text-3xl font-bold shimmer-text">
                  بَيَان
                </span>
                <span className="text-[11px] text-gray-500 font-tajawal tracking-[3px] mt-1">
                  PLATFORM
                </span>
              </div>
            </Link>

            {/* ══ Desktop Nav Links ══ */}
            <nav
              className="hidden lg:flex items-center gap-1 glass-premium rounded-full px-3 py-2"
              aria-label="التنقل الرئيسي"
            >
              {navLinks.map((link) => {
                const isActive = activeSection === link.href.replace('#', '');
                return (
                  <a
                    key={link.label}
                    href={link.href}
                    onClick={(e) => {
                      e.preventDefault();
                      scrollToSection(link.href);
                    }}
                    aria-current={isActive ? 'true' : undefined}
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
                  </a>
                );
              })}
            </nav>

            {/* ══ Actions Desktop ══ */}
            <div className="hidden lg:flex items-center gap-4">
              <motion.a
                href={WHATSAPP_LINK}
                target="_blank"
                rel="noreferrer"
                whileHover={{ scale: 1.08, rotate: -5 }}
                whileTap={{ scale: 0.92 }}
                aria-label="تواصل معنا عبر واتساب"
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
              aria-expanded={mobileOpen}
              aria-label={mobileOpen ? 'إغلاق القائمة' : 'فتح القائمة'}
              aria-controls="mobile-menu"
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
              id="mobile-menu"
              role="dialog"
              aria-modal="true"
              aria-label="قائمة التنقل"
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -20, opacity: 0 }}
              transition={{ duration: 0.3 }}
              onClick={(e) => e.stopPropagation()}
              className="absolute left-4 right-4 rounded-3xl glass-premium p-6"
              style={{ top: `${NAVBAR_HEIGHT}px` }}
            >
              <div className="space-y-2 text-right">
                {navLinks.map((link, i) => {
                  const isActive = activeSection === link.href.replace('#', '');
                  return (
                    <motion.a
                      key={link.label}
                      href={link.href}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.08 }}
                      onClick={(e) => {
                        e.preventDefault();
                        scrollToSection(link.href);
                      }}
                      aria-current={isActive ? 'true' : undefined}
                      className={`block w-full text-right py-4 px-5 rounded-2xl text-base font-tajawal font-medium transition ${
                        isActive
                          ? 'bg-gradient-to-l from-amber-500/20 to-transparent text-amber-400'
                          : 'text-gray-300 hover:bg-white/5'
                      }`}
                    >
                      {link.label}
                    </motion.a>
                  );
                })}

                <div className="pt-4 space-y-3 border-t border-white/10 mt-3">
                  <a
                    href={WHATSAPP_LINK}
                    target="_blank"
                    rel="noreferrer"
                    className="block w-full text-center py-3.5 rounded-2xl bg-emerald-500/10 text-emerald-300 font-medium font-tajawal text-base"
                  >
                    <MessageCircle size={18} className="inline ml-2" />
                    تواصل معنا عبر واتساب
                  </a>

                  <Link
                    to="/auth"
                    onClick={() => setMobileOpen(false)}
                    className="block w-full text-center py-3.5 rounded-2xl btn-gold font-bold font-tajawal text-base"
                  >
                    ابدأ الآن
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