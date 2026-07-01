import { motion } from 'framer-motion';
import {
  ArrowUp,
  Mail,
  MapPin,
  MessageCircle,
  Phone,
} from 'lucide-react';
import BayanIcon from '../../assets/Bayan-Icon.png';
import { WHATSAPP_LINK, WHATSAPP_DISPLAY } from '../../lib/contact';

/* ─────────────────────────────────────────────
   SEO: JSON-LD Structured Data (Organization)
   ───────────────────────────────────────────── */
const STRUCTURED_DATA = {
  '@context': 'https://schema.org',
  '@type': 'EducationalOrganization',
  name: 'بيان – منصة تعليم اللغة العربية',
  alternateName: 'Bayan Arabic Platform',
  description:
    'منصة تعليمية متخصصة في اللغة العربية لطلاب المرحلة الثانوية والبكالوريا، مع شرح منظم ومتابعة مستمرة.',
  url: 'https://bayan-gray.vercel.app',
  logo: 'https://bayan-gray.vercel.app/Bayan-Icon.png',
  sameAs: [
    'https://t.me/Ismail_Ram',
    'https://www.tiktok.com/@bayan_arabic70?_r=1&_t=ZS-97eEsaXzn4m',
    'https://www.youtube.com/@ismalrmdn2498',
    WHATSAPP_LINK,
  ],
  contactPoint: [
    {
      '@type': 'ContactPoint',
      telephone: WHATSAPP_DISPLAY.replace(/\s+/g, ''),
      contactType: 'customer support',
      areaServed: 'EG',
      availableLanguage: 'Arabic',
    },
  ],
  address: {
    '@type': 'PostalAddress',
    addressCountry: 'EG',
  },
};

/* ─────────────────────────────────────────────
   SVG Social Icons
   ───────────────────────────────────────────── */
const FacebookIcon = ({ className = '' }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true" role="img">
    <title>فيسبوك</title>
    <path d="M22 12.06C22 6.5 17.52 2 12 2S2 6.5 2 12.06c0 5.02 3.66 9.18 8.44 9.94v-7.03H7.9v-2.91h2.54V9.84c0-2.52 1.49-3.91 3.77-3.91 1.09 0 2.23.2 2.23.2v2.46h-1.26c-1.24 0-1.63.78-1.63 1.57v1.9h2.77l-.44 2.91h-2.33V22C18.34 21.24 22 17.08 22 12.06Z" />
  </svg>
);

const TelegramIcon = ({ className = '' }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true" role="img">
    <title>تيليجرام</title>
    <path d="M21.93 4.25a1.55 1.55 0 0 0-1.62-.25L3.72 10.4c-.66.26-1.1.78-1.08 1.35.02.57.49 1.05 1.17 1.26l4.12 1.27 1.58 5.02c.2.63.62 1.04 1.15 1.1.53.06 1.01-.23 1.36-.75l2.19-3.18 4.28 3.16c.43.32.9.42 1.32.29.42-.13.74-.49.89-1.02l2.97-13.08c.16-.69-.08-1.25-.74-1.57ZM9.43 13.42l8.34-5.2-6.88 6.58-.27 2.89-1.19-4.27Z" />
  </svg>
);

const TikTokIcon = ({ className = '' }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true" role="img">
    <title>تيك توك</title>
    <path d="M16.6 2h-3.1v13.1a2.75 2.75 0 1 1-2.75-2.75c.3 0 .58.05.85.14V9.3a6.2 6.2 0 0 0-.85-.06 5.86 5.86 0 1 0 5.86 5.86V8.44a7.4 7.4 0 0 0 4.35 1.4V6.73A4.37 4.37 0 0 1 16.6 2Z" />
  </svg>
);

const YouTubeIcon = ({ className = '' }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true" role="img">
    <title>يوتيوب</title>
    <path d="M23.5 6.2a3.02 3.02 0 0 0-2.12-2.13C19.5 3.56 12 3.56 12 3.56s-7.5 0-9.38.51A3.02 3.02 0 0 0 .5 6.2 31.45 31.45 0 0 0 0 12a31.45 31.45 0 0 0 .5 5.8 3.02 3.02 0 0 0 2.12 2.13c1.88.51 9.38.51 9.38.51s7.5 0 9.38-.51a3.02 3.02 0 0 0 2.12-2.13A31.45 31.45 0 0 0 24 12a31.45 31.45 0 0 0-.5-5.8ZM9.75 15.56V8.44L16 12l-6.25 3.56Z" />
  </svg>
);

/* ─────────────────────────────────────────────
   Data
   ───────────────────────────────────────────── */
const socialLinks = [
  {
    name: 'Facebook',
    label: 'فيسبوك',
    href: 'https://facebook.com/bayan.platform',
    Icon: FacebookIcon,
    className: 'hover:border-blue-400/40 hover:bg-blue-500/10 hover:text-blue-300',
    rel: 'noopener noreferrer me',
  },
  {
    name: 'Telegram',
    label: 'تيليجرام',
    href: 'https://t.me/Ismail_Ram',
    Icon: TelegramIcon,
    className: 'hover:border-sky-400/40 hover:bg-sky-500/10 hover:text-sky-300',
    rel: 'noopener noreferrer me',
  },
  {
    name: 'TikTok',
    label: 'تيك توك',
    href: 'https://www.tiktok.com/@bayan_arabic70?_r=1&_t=ZS-97eEsaXzn4m',
    Icon: TikTokIcon,
    className: 'hover:border-pink-400/40 hover:bg-pink-500/10 hover:text-pink-300',
    rel: 'noopener noreferrer me',
  },
  {
    name: 'YouTube',
    label: 'يوتيوب',
    href: 'https://www.youtube.com/@ismalrmdn2498',
    Icon: YouTubeIcon,
    className: 'hover:border-red-400/40 hover:bg-red-500/10 hover:text-red-300',
    rel: 'noopener noreferrer me',
  },
];

const contactItems = [
  {
    title: 'واتساب',
    value: WHATSAPP_DISPLAY,
    href: WHATSAPP_LINK,
    Icon: MessageCircle,
    ariaLabel: 'تواصل معنا عبر واتساب',
  },
  {
    title: 'العنوان',
    value: 'بني سويف – أهناسيا – المدينة – كوم الرمل البحري',
    href: 'https://maps.google.com/?q=بني%20سويف%20اهناسيا%20المدينة%20كوم%20الرمل%20البحري',
    Icon: MapPin,
    ariaLabel: 'موقعنا على الخريطة',
  },
];

const quickLinks = [
  { label: 'الرئيسية', href: '/#hero' },
  { label: 'لماذا بَيان', href: '/#why' },
  { label: 'الباقات', href: '/#pricing' },
  { label: 'تواصل معنا', href: '#contact' },
];

/* ─────────────────────────────────────────────
   Component
   ───────────────────────────────────────────── */
const Footer = ({ compact = false }) => {
  const year = new Date().getFullYear();

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <>
      {/* ── SEO: JSON-LD structured data ── */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(STRUCTURED_DATA) }}
      />

      <footer
        id="contact"
        dir="rtl"
        lang="ar"
        aria-label="تذييل الصفحة – معلومات التواصل وروابط المنصة"
        itemScope
        itemType="https://schema.org/EducationalOrganization"
        className={`relative overflow-hidden border-t border-[#D4AF37]/15 bg-[#05070A]/85 backdrop-blur-xl ${
          compact ? 'mt-6' : ''
        }`}
      >
        {/* Hidden SEO meta text – visible only to crawlers */}
        <span className="sr-only" itemProp="name">بيان – منصة تعليم اللغة العربية</span>
        <span className="sr-only" itemProp="description">
          منصة تعليمية متخصصة في اللغة العربية لطلاب المرحلة الثانوية والبكالوريا، تقدم دروساً
          منظمة وامتحانات وملفات تعليمية مع متابعة مستمرة لمساعدة الطلاب على الفهم والتفوق.
        </span>

        {/* Background effects */}
        <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
          <div className="absolute top-0 right-1/4 h-40 w-40 rounded-full bg-[#D4AF37] blur-[120px] opacity-[0.06]" />
          <div className="absolute bottom-0 left-1/4 h-40 w-40 rounded-full bg-blue-600 blur-[120px] opacity-[0.06]" />
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-amber-500/40 to-transparent" />
        </div>

        <div
          className={`container mx-auto relative z-10 ${
            compact ? 'px-4 py-8 lg:px-6' : 'px-6 py-12 lg:px-16 lg:py-16'
          }`}
        >


          {/* ── Main Grid ── */}
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.6 }}
            className="grid gap-8 lg:grid-cols-[1.15fr_1fr]"
          >
            {/* Brand */}
            <div className="text-right">
              <div className="mb-5 flex items-center justify-start gap-3 lg:justify-end">
                <div>
                  <h2
                    className="font-amiri text-3xl font-black shimmer-text"
                    itemProp="name"
                    aria-label="بيان – منصة تعليم اللغة العربية"
                  >
                    بَيَان
                  </h2>
                  <p className="mt-1 text-xs tracking-[3px] text-gray-500" aria-hidden="true">
                    PLATFORM
                  </p>
                </div>

                <img
                  src={BayanIcon}
                  alt="شعار منصة بيان لتعليم اللغة العربية"
                  width={56}
                  height={56}
                  loading="lazy"
                  decoding="async"
                  className="h-14 w-14 object-contain glow-pulse"
                  itemProp="logo"
                />
              </div>

              <p
                className="max-w-md text-sm leading-8 text-gray-400 lg:mr-auto"
                itemProp="description"
              >
                منصة تعليمية متخصصة في اللغة العربية لطلاب المرحلة الثانوية والبكالوريا، مع شرح
                منظم ومتابعة مستمرة تساعدك على الفهم والتفوق.
              </p>

              <nav
                aria-label="روابط سريعة لأقسام الموقع"
                className="mt-6 flex flex-wrap gap-3 lg:justify-end"
              >
                {quickLinks.map((link) => (
                  <a
                    key={link.label}
                    href={link.href}
                    className="rounded-full border border-white/10 bg-white/[0.03] px-4 py-2 text-xs text-gray-400 transition hover:border-amber-500/30 hover:bg-amber-500/10 hover:text-amber-300"
                  >
                    {link.label}
                  </a>
                ))}
              </nav>
            </div>

            {/* Social */}
            <div>
              <h3 className="mb-5 text-right font-tajawal text-lg font-bold text-white">
                تابعنا على وسائل التواصل
              </h3>

              <nav aria-label="حسابات منصة بيان على وسائل التواصل الاجتماعي">
                <ul className="grid grid-cols-2 gap-3 list-none p-0">
                  {socialLinks.map((item) => {
                    const Icon = item.Icon;
                    return (
                      <li key={item.name}>
                        <motion.a
                          href={item.href}
                          target="_blank"
                          rel={item.rel}
                          aria-label={`تابعنا على ${item.label}`}
                          whileHover={{ y: -4, scale: 1.02 }}
                          whileTap={{ scale: 0.97 }}
                          className={`group flex rounded-2xl border border-white/10 bg-white/[0.03] p-4 text-gray-400 transition ${item.className}`}
                          itemProp="sameAs"
                        >
                          <div className="flex w-full items-center justify-between gap-3">
                            <span className="text-sm font-bold">{item.label}</span>
                            <Icon className="h-6 w-6" />
                          </div>
                        </motion.a>
                      </li>
                    );
                  })}
                </ul>
              </nav>

              <div className="mt-4 space-y-2">
                {contactItems.map((item) => {
                  const Icon = item.Icon;
                  return (
                    <motion.a
                      key={item.title}
                      href={item.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={item.ariaLabel}
                      whileHover={{ x: -3 }}
                      className="flex items-center justify-between gap-3 rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 text-right transition hover:border-amber-500/30 hover:bg-amber-500/10"
                    >
                      <div className="min-w-0">
                        <p className="text-sm font-bold text-white">{item.title}</p>
                        <p className="mt-0.5 text-xs text-gray-500">{item.value}</p>
                      </div>
                      <span
                        className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-500/10 text-amber-300"
                        aria-hidden="true"
                      >
                        <Icon size={16} />
                      </span>
                    </motion.a>
                  );
                })}
              </div>
            </div>
          </motion.div>

          {/* ── Bottom Bar ── */}
          <div className="mt-10 border-t border-white/10 pt-6">
            <div className="flex flex-col gap-4 text-center text-xs text-gray-500 sm:flex-row sm:items-center sm:justify-between">
              {/* Copyright */}
              <p>
                <span itemProp="copyrightYear">{year}</span>
                {' '}© بَيان.{' '}
                <span itemProp="copyrightHolder">جميع الحقوق محفوظة.</span>
              </p>

              {/* Developer credit */}
              <p className="text-gray-600">
                Developed by{' '}
                <a
                  href="https://moaz221.github.io/portfolio/"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="زيارة موقع المطور Moaz Ragab"
                  className="font-semibold text-amber-400/80 transition-colors hover:text-amber-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 focus-visible:ring-offset-2 focus-visible:ring-offset-[#05070A] rounded-sm"
                >
                  MOAZ RAGAB
                </a>
              </p>

              {/* Back to top */}
              <button
                type="button"
                onClick={scrollToTop}
                aria-label="الرجوع إلى أعلى الصفحة"
                className="mx-auto inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-4 py-2 text-gray-400 transition hover:border-amber-500/30 hover:bg-amber-500/10 hover:text-amber-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 sm:mx-0"
              >
                <ArrowUp size={14} aria-hidden="true" />
                الرجوع لأعلى
              </button>
            </div>
          </div>
        </div>
      </footer>
    </>
  );
};

export default Footer;