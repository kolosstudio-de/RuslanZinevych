import React, { useEffect, useRef, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence, useMotionValue, useSpring } from 'framer-motion';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ArrowDown, Mail, Phone, MapPin, MessageSquare, Play, ChevronRight, ExternalLink, X } from 'lucide-react';
import GalleryPage from './Gallery';

gsap.registerPlugin(ScrollTrigger);

// ─── UTILS ──────────────────────────────────────────────────────────────────

const resolveAsset = (path) => {
  if (!path) return '';
  if (path.startsWith('http')) return path;
  // Use Vite's BASE_URL and ensure it's properly formatted
  const base = import.meta.env.BASE_URL || '/';
  const cleanPath = path.startsWith('/') ? path.slice(1) : path;
  // Remove duplicate base if it's already there
  const baseName = base.replace(/\//g, '');
  if (baseName && cleanPath.startsWith(baseName + '/')) {
    return '/' + cleanPath.replace(/\/+/g, '/');
  }
  return (base + cleanPath).replace(/\/+/g, '/');
};

// ─── EFFECTS & ANIMATIONS ───────────────────────────────────────────────────

const CustomCursor = () => {
  const [isHovering, setIsHovering] = useState(false);

  const cursorX = useMotionValue(-100);
  const cursorY = useMotionValue(-100);

  // High-performance spring for zero-latency tracking
  const springConfig = { damping: 45, stiffness: 1500, mass: 0.01 };
  const smoothX = useSpring(cursorX, springConfig);
  const smoothY = useSpring(cursorY, springConfig);

  useEffect(() => {
    if (window.matchMedia('(pointer: coarse)').matches) return;

    const moveCursor = (e) => {
      const isHov = document.body.getAttribute('data-hovering') === 'true';
      cursorX.set(e.clientX - (isHov ? 24 : 8));
      cursorY.set(e.clientY - (isHov ? 24 : 8));
    };

    const handleHoverState = (e) => {
      const target = e.target;
      const shouldHover = target.tagName.toLowerCase() === 'a' ||
        target.tagName.toLowerCase() === 'button' ||
        target.closest('a') ||
        target.closest('button') ||
        target.closest('.cursor-pointer') ||
        window.getComputedStyle(target).cursor === 'pointer';

      setIsHovering(shouldHover);
      document.body.setAttribute('data-hovering', shouldHover);
    };

    window.addEventListener('mousemove', moveCursor);
    window.addEventListener('mouseover', handleHoverState);

    return () => {
      window.removeEventListener('mousemove', moveCursor);
      window.removeEventListener('mouseover', handleHoverState);
    };
  }, [cursorX, cursorY]);

  if (typeof window !== 'undefined' && window.matchMedia('(pointer: coarse)').matches) return null;

  return (
    <motion.div
      className="fixed top-0 left-0 rounded-full pointer-events-none z-[99999] mix-blend-exclusion"
      style={{ x: smoothX, y: smoothY }}
      animate={{
        width: isHovering ? 56 : 0,
        height: isHovering ? 56 : 0,
        backgroundColor: 'transparent',
        border: isHovering ? '1px solid #C9A252' : '0px solid transparent',
        opacity: isHovering ? 1 : 0
      }}
      transition={{ type: "tween", ease: "circOut", duration: 0.2 }}
    />
  );
};

const SplitText = ({ children, className = '', delay = 0 }) => {
  // Check if children is a string
  if (typeof children !== 'string') return <span className={className}>{children}</span>;

  const words = children.split(' ');
  return (
    <span className={`inline-block overflow-hidden ${className}`}>
      {words.map((word, i) => (
        <React.Fragment key={i}>
          <motion.span
            className="inline-block"
            initial={{ y: '120%', opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 1.0, ease: [0.16, 1, 0.3, 1], delay: delay + i * 0.12 }}
          >
            {word}
          </motion.span>
          {i < words.length - 1 && <span className="inline-block">&nbsp;</span>}
        </React.Fragment>
      ))}
    </span>
  );
};

// ─── DATA ───────────────────────────────────────────────────────────────────

// ─── SHARED COMPONENTS ──────────────────────────────────────────────────────

const LanguageSwitcher = () => {
  const { i18n } = useTranslation();
  const langs = ['de', 'en', 'uk', 'zh'];

  return (
    <div className="flex items-center gap-2">
      {langs.map((lang, idx) => {
        const isActive = i18n.language && i18n.language.startsWith(lang);
        return (
          <React.Fragment key={lang}>
            <button
              onClick={() => i18n.changeLanguage(lang)}
              className={`font-sans text-[0.6rem] tracking-[0.2em] uppercase transition-colors ${isActive ? 'text-champagne font-bold' : 'text-stone hover:text-cream'}`}
            >
              {lang}
            </button>
            {idx < langs.length - 1 && <span className="text-stone/30 text-[0.6rem]">·</span>}
          </React.Fragment>
        );
      })}
    </div>
  );
};

const Navbar = () => {
  const { t } = useTranslation();
  const navRef = useRef(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();
  const isAbout = location.pathname.includes('/about');

  useEffect(() => { setMenuOpen(false); }, [location]);

  useEffect(() => {
    const onScroll = () => {
      if (window.scrollY > 80) navRef.current?.classList.add('nav-glass');
      else navRef.current?.classList.remove('nav-glass');
    };
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [menuOpen]);

  return (
    <>
      <nav
        ref={navRef}
        className="fixed top-0 left-0 right-0 z-[60] flex items-center justify-between px-6 md:px-16 py-6 transition-all duration-500"
      >
        <Link to="/" className={`font-serif text-cream text-lg tracking-[0.2em] uppercase font-light hover:text-champagne transition-all duration-300 ${menuOpen ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
          Ruslan Zinevych
        </Link>

        {/* Desktop nav */}
        <div className="hidden lg:flex items-center gap-10">
          <Link to="/" className="nav-link">{t('nav.home')}</Link>
          <Link to="/about" className={`nav-link ${isAbout ? 'text-champagne' : ''}`}>{t('nav.about')}</Link>
          <Link to="/gallery" className={`nav-link ${location.pathname.includes('/gallery') ? 'text-champagne' : ''}`}>{t('nav.gallery') || 'Gallery'}</Link>
          <Link to="/contact" className="nav-link">{t('nav.contact')}</Link>
        </div>

        <div className="flex items-center gap-4 md:gap-6">
          <div className="hidden lg:flex items-center gap-6">
            <LanguageSwitcher />
            <a
              href="https://wa.me/4915112032072"
              target="_blank"
              rel="noopener noreferrer"
              className="btn-gold text-xs"
            >
              {t('nav.bookNow')}
            </a>
          </div>

          {/* Hamburger — mobile only */}
          <button
            className="lg:hidden flex flex-col items-center justify-center w-12 h-12 gap-[5px] z-[60] relative"
            onClick={() => setMenuOpen(o => !o)}
            aria-label="Toggle menu"
          >
            <span
              className="block w-6 h-[1.5px] bg-cream transition-all duration-300 origin-center"
              style={menuOpen ? { transform: 'translateY(6.5px) rotate(45deg)' } : {}}
            />
            <span
              className="block w-6 h-[1.5px] bg-cream transition-all duration-300"
              style={menuOpen ? { opacity: 0 } : {}}
            />
            <span
              className="block w-6 h-[1.5px] bg-cream transition-all duration-300 origin-center"
              style={menuOpen ? { transform: 'translateY(-6.5px) rotate(-45deg)' } : {}}
            />
          </button>
        </div>
      </nav>

      {/* Mobile full-screen overlay */}
      <div
        className="fixed inset-0 z-50 flex flex-col justify-center px-10 lg:hidden transition-opacity duration-500"
        style={{
          backgroundColor: '#0A0A0F',
          opacity: menuOpen ? 1 : 0,
          pointerEvents: menuOpen ? 'all' : 'none',
        }}
      >
        {/* Gold accent top */}
        <div className="absolute top-0 left-0 right-0 h-[1px] bg-champagne/30" />

        <nav className="flex flex-col gap-6 md:gap-10">
          {[
            { to: '/', label: t('nav.home') },
            { to: '/about', label: t('nav.about') },
            { to: '/gallery', label: t('nav.gallery') || 'Gallery' },
            { to: '/contact', label: t('nav.contact') },
          ].map(({ to, label }) => (
            <Link
              key={to}
              to={to}
              onClick={() => setMenuOpen(false)}
              className="font-serif italic text-cream text-[clamp(2.5rem,14vw,5rem)] leading-tight hover:text-champagne transition-colors duration-300"
            >
              {label}
            </Link>
          ))}
        </nav>

        <div className="mt-12 flex justify-start">
          <LanguageSwitcher />
        </div>

        <div className="mt-12">
          <a
            href="https://wa.me/4915112032072"
            target="_blank"
            rel="noopener noreferrer"
            className="btn-gold text-sm"
          >
            {t('nav.bookNow')}
          </a>
        </div>

        <div className="absolute bottom-8 left-10 pb-[env(safe-area-inset-bottom)]">
          <p className="font-sans text-stone text-[0.6rem] tracking-widest uppercase">{t('nav.tenor')}</p>
        </div>
      </div>
    </>
  );
};

const Footer = () => {
  const { t } = useTranslation();
  return (
    <footer className="bg-obsidian border-t border-champagne/10 px-6 md:px-16 py-12">
      <div className="max-w-6xl mx-auto flex flex-col items-center gap-10">
        <div className="flex flex-col md:flex-row items-center justify-between w-full gap-6">
          <div>
            <p className="font-serif italic text-cream text-xl">Ruslan Zinevych</p>
            <p className="font-sans text-stone text-[0.6rem] tracking-widest uppercase mt-0.5">{t('footer.subtitle')}</p>
          </div>
          <div className="flex items-center gap-6 md:gap-10 font-sans text-[0.65rem] tracking-[0.2em] uppercase">
            <Link to="/" className="text-stone hover:text-champagne transition-colors">{t('nav.home')}</Link>
            <Link to="/about" className="text-stone hover:text-champagne transition-colors">{t('nav.about')}</Link>
            <Link to="/gallery" className="text-stone hover:text-champagne transition-colors">{t('nav.gallery') || 'Gallery'}</Link>
            <Link to="/contact" className="text-stone hover:text-champagne transition-colors">{t('nav.contact')}</Link>
          </div>
          <div className="flex items-center gap-6 font-sans text-[0.6rem] tracking-widest uppercase text-stone/40">
            <Link to="/impressum" className="hover:text-champagne transition-colors">{t('footer.impressum')}</Link>
            <Link to="/privacy" className="hover:text-champagne transition-colors">{t('footer.privacy')}</Link>
          </div>
        </div>
        <p className="font-sans text-stone/30 text-[0.6rem] tracking-[0.3em] uppercase">
          © {new Date().getFullYear()} Ruslan Zinevych · {t('footer.rights')}
        </p>
      </div>
    </footer>
  );
};

// ─── VIDEO MODAL ─────────────────────────────────────────────────────────────


const VideoModal = ({ perf, onClose }) => {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(true);
  const overlayRef = useRef(null);

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    const onKey = e => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', onKey);
    };
  }, [onClose]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.4 }}
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-8"
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
      style={{ background: 'rgba(4,4,8,0.95)', backdropFilter: 'blur(16px)' }}
    >
      <div className="relative w-full max-w-5xl bg-black shadow-2xl overflow-hidden group">
        <div className="absolute top-4 right-4 z-50">
          <button onClick={onClose} className="w-10 h-10 flex items-center justify-center bg-black/50 backdrop-blur-md rounded-full text-cream hover:bg-champagne hover:text-obsidian transition-all">
            <X size={20} />
          </button>
        </div>

        <div className="relative bg-obsidian flex items-center justify-center" style={{ aspectRatio: '16/9' }}>
          {loading && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 z-10 bg-obsidian pointer-events-none">
              <div className="w-12 h-12 border-2 border-champagne/20 border-t-champagne rounded-full animate-spin" />
              <p className="font-sans text-champagne text-[0.6rem] tracking-[0.4em] uppercase">{t('performances.loading')}</p>
            </div>
          )}

          <video
            key={perf.src}
            className="w-full h-full object-contain"
            autoPlay
            playsInline
            controls
            preload="auto"
            onLoadedMetadata={() => setLoading(false)}
            onCanPlay={() => setLoading(false)}
            onPlaying={() => setLoading(false)}
          >
            <source src={resolveAsset(perf.src)} type="video/mp4" />
          </video>
        </div>

        <div className="p-8 border-t border-champagne/10 bg-darkcard">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="flex-1">
              <p className="font-sans text-champagne text-[0.6rem] tracking-[0.4em] uppercase mb-3">{t('performances.nowPlaying')}</p>
              <h2 className="font-serif italic text-cream text-3xl md:text-4xl leading-none mb-2">{perf.aria}</h2>
              <p className="font-serif text-cream/60 text-lg">{perf.opera} · {perf.composer}</p>
            </div>
            <div className="flex items-center gap-4 font-sans text-xs tracking-widest uppercase text-stone whitespace-nowrap">
              <div className="hidden md:block w-10 h-[1px] bg-champagne/30" />
              <span>{perf.role ? `${t('performances.role')}: ${perf.role}` : 'Tenor'}</span>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

// ─── VIDEO CARD ─────────────────────────────────────────────────────────────

const PerfCard = ({ perf, onOpen }) => {
  const cardRef = useRef(null);
  const videoRef = useRef(null);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    const el = cardRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            gsap.to(el, { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out' });
            observer.unobserve(el);
          }
        });
      },
      { threshold: 0.1 }
    );
    gsap.set(el, { opacity: 0, y: 30 });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const handleMouseEnter = () => {
    setIsHovered(true);
    if (videoRef.current) {
      videoRef.current.play().catch(() => {});
    }
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    if (videoRef.current) {
      videoRef.current.pause();
      videoRef.current.currentTime = 0;
    }
  };

  return (
    <div
      ref={cardRef}
      className="perf-card border border-champagne/15 hover:border-champagne/40 transition-colors duration-500 bg-darkcard cursor-pointer group"
      onClick={() => onOpen(perf)}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div className="relative aspect-video bg-obsidian overflow-hidden">
        {/* Thumbnail img — reliable on all devices including iOS Safari */}
        <img
          src={resolveAsset(perf.src.replace('videos/video-', 'thumbnails/thumb-').replace('.mp4', '.jpg'))}
          alt={perf.aria}
          className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-700 ${isHovered ? 'opacity-0' : 'opacity-80'}`}
          loading="lazy"
        />
        {/* Video — loads and plays only on hover (desktop) */}
        <video
          ref={videoRef}
          key={perf.src}
          className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-700 ${isHovered ? 'opacity-100' : 'opacity-0'}`}
          muted
          loop
          playsInline
          preload="none"
        >
          <source src={resolveAsset(perf.src)} type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-gradient-to-t from-darkcard via-transparent to-transparent pointer-events-none" />
        
        {/* Play overlay on hover */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <div className="w-14 h-14 rounded-full border border-champagne/80 flex items-center justify-center bg-black/40 backdrop-blur-sm">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="#C9A252">
              <path d="M8 5v14l11-7z" />
            </svg>
          </div>
        </div>
        <span className="absolute top-4 left-4 font-sans text-xs tracking-[0.25em] text-champagne/60 uppercase">
          {perf.num}
        </span>
      </div>
      <div className="p-6">
        <p className="font-serif italic text-cream text-2xl leading-tight mb-1 group-hover:text-champagne transition-colors duration-300">{perf.aria}</p>
        {perf.role && <p className="font-sans text-stone text-xs tracking-widest uppercase mb-3">{perf.role}</p>}
        <div>
          <p className="font-serif text-cream/70 text-sm">{perf.opera}</p>
          <p className="font-sans text-stone text-xs tracking-widest mt-1">{perf.composer}</p>
        </div>
      </div>
    </div>
  );
};

// ─── HOME PAGE ───────────────────────────────────────────────────────────────

const HomePage = () => {
  const { t } = useTranslation();
  const [activeVideo, setActiveVideo] = useState(null);
  const [filter, setFilter] = useState('All');

  const performancesResult = t('performancesData', { returnObjects: true });
  const performances = Array.isArray(performancesResult) ? performancesResult : [];
  const filters = ['All', 'Puccini', 'Verdi', 'Bizet', 'Strauss', 'Other'];
  const filteredPerformances = filter === 'All'
    ? performances
    : performances.filter(p => p.filter === filter);

  const timelineItems = t('timelineData', { returnObjects: true });

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Hero — very slow dramatic entrance
      gsap.from('.hero-enter', {
        y: 60, opacity: 0, duration: 2.4, stagger: 0.3, ease: 'power4.out', delay: 1.2,
      });
      // Section reveals — slow and cinematic
      gsap.utils.toArray('.will-animate').forEach(el => {
        gsap.from(el, {
          scrollTrigger: { trigger: el, start: 'top 88%' },
          opacity: 0, y: 50, duration: 1.8, ease: 'power3.out',
        });
      });
      
      // Timeline items — animation
      if (document.querySelectorAll('.tl-item').length > 0) {
        gsap.from('.tl-item', {
          scrollTrigger: { trigger: '#timeline', start: 'top 80%' },
          opacity: 0, x: -30, duration: 1.2, stagger: 0.22, ease: 'power3.out',
        });
      }
    });
    return () => ctx.revert();
  }, [timelineItems]);

  return (
    <div>
      <AnimatePresence>
        {activeVideo && <VideoModal perf={activeVideo} onClose={() => setActiveVideo(null)} />}
      </AnimatePresence>
      {/* ── HERO ─────────────────────────────────────────────────── */}
      <section className="relative h-screen w-full overflow-hidden flex items-center md:items-end">
        <video
          autoPlay
          loop
          muted
          playsInline
          className="hidden md:block absolute inset-0 w-full h-full object-cover opacity-50 ken-burns"
        >
          <source src={resolveAsset('videos/video-1.mp4')} type="video/mp4" />
        </video>

        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-obsidian via-obsidian/50 to-obsidian/10" />
        <div className="absolute inset-0 bg-gradient-to-r from-obsidian/60 to-transparent" />

        {/* Hero content */}
        <div className="relative z-10 px-6 md:px-16 pb-8 md:pb-24 pt-20 md:pt-64 w-full max-w-5xl mx-auto text-center flex flex-col items-center">
          <h1 className="hero-enter hero-title text-cream text-[clamp(2.5rem,10vw,8rem)] leading-[0.9] tracking-tighter mb-2 z-10 relative">
            {t('hero.name1')}
          </h1>
          <h1 className="hero-enter hero-title text-champagne text-[clamp(2.5rem,10vw,8rem)] leading-[0.9] tracking-tighter mb-10 z-10 relative">
            {t('hero.name2')}
          </h1>

          <p className="hero-enter font-sans text-champagne text-[0.6rem] tracking-[0.4em] uppercase mb-10 flex items-center justify-center gap-4">
            <span className="w-10 h-[1px] bg-champagne/30" />
            {t('hero.label')}
            <span className="w-10 h-[1px] bg-champagne/30" />
          </p>

          <div className="hero-enter max-w-xl">
            <p className="font-sans text-cream/70 text-base md:text-lg leading-relaxed mb-12">
              {t('hero.subtitle')}
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <a href="#performances" className="btn-gold">
                {t('hero.watch')}
              </a>
              <Link to="/about" className="btn-ghost">
                {t('hero.meet')}
              </Link>
            </div>
          </div>
        </div>

        {/* Scroll cue */}
        <div className="absolute bottom-8 right-16 hidden md:flex flex-col items-center gap-3">
          <span className="font-sans text-[0.6rem] tracking-[0.4em] uppercase text-champagne animate-pulse rotate-90 origin-right translate-y-[-20px]">
            {t('hero.scroll')}
          </span>
          <div className="w-[1px] h-12 bg-gradient-to-t from-champagne to-transparent" />
        </div>
      </section>

      {/* ── ABOUT STRIP ──────────────────────────────────────────── */}
      <section className="py-24 md:py-32 bg-obsidian border-y border-champagne/10 overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 md:px-16 grid md:grid-cols-12 gap-16 items-center">
          <div className="md:col-span-7">
            <p className="section-label mb-8">{t('aboutStrip.label')}</p>
            <h2 className="font-serif italic text-cream text-4xl md:text-5xl leading-tight mb-12 will-animate">
              {t('aboutStrip.quote')}
            </h2>
            <div className="space-y-8 font-sans text-cream/70 text-lg leading-relaxed will-animate">
              <p>{t('aboutStrip.desc1')}</p>
              <p>{t('aboutStrip.desc2')}</p>
            </div>
            <Link to="/about" className="btn-gold mt-12 inline-flex">
              {t('aboutStrip.fullBio')}
            </Link>
          </div>
          <div className="md:col-span-5 will-animate">
            <div className="relative aspect-[3/4] overflow-hidden bg-charcoal">
              <img
                src={resolveAsset('maestro.jpg')}
                alt="Ruslan Zinevych"
                className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-700 ken-burns" style={{ objectPosition: 'center 12%' }}
              />
              <div className="absolute inset-0 border border-champagne/20 pointer-events-none" />
              <div className="absolute bottom-0 left-0 right-0 h-1/3 bg-gradient-to-t from-obsidian/80 to-transparent" />
            </div>
          </div>
        </div>
      </section>

      {/* ── PERFORMANCES GRID ───────────────────────────────────── */}
      <section id="performances" className="py-32 bg-obsidian-light">
        <div className="max-w-7xl mx-auto px-6 md:px-16">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-20 gap-8">
            <div>
              <p className="section-label mb-6">{t('performances.label')}</p>
              <h2 className="font-serif italic text-cream text-6xl md:text-8xl leading-none">{t('performances.title')}</h2>
            </div>

            {/* Simple filters */}
            <div className="flex flex-wrap gap-4 font-sans text-[0.6rem] tracking-[0.2em] uppercase">
              {filters.map(f => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`px-6 py-3 border transition-all ${filter === f ? 'bg-champagne text-obsidian border-champagne' : 'border-champagne/20 text-cream/60 hover:border-champagne/60'}`}
                >
                  {f === 'All' ? t('performances.all') : f}
                </button>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredPerformances.map(perf => (
              <PerfCard key={perf.num} perf={perf} onOpen={setActiveVideo} />
            ))}
          </div>
        </div>
      </section>

      {/* ── CAREER TIMELINE ──────────────────────────────────────── */}
      <section id="timeline" className="py-20 md:py-32 px-6 sm:px-6 md:px-16 max-w-5xl mx-auto">
        <div className="will-animate mb-16">
          <p className="section-label mb-6">{t('timeline.label')}</p>
          <h2 className="font-serif italic text-cream text-5xl md:text-6xl">{t('timeline.title')}</h2>
        </div>

        <div className="relative">
          <div className="space-y-0">
            {(Array.isArray(t('timelineData', { returnObjects: true })) ? t('timelineData', { returnObjects: true }) : []).map((item, i) => (
              <div key={i} className="tl-item group flex gap-8 md:gap-16 relative">
                {/* Year pillar */}
                <div className="w-12 md:w-24 shrink-0 text-right font-sans text-champagne text-xs md:text-sm tracking-[0.2em] pt-1">
                  {item.year}
                </div>

                {/* Vertical line and dot */}
                <div className="relative flex justify-center w-[1px] shrink-0">
                  <div className="absolute inset-y-0 w-[1px] bg-champagne/10 shadow-[0_0_15px_rgba(201,162,82,0.1)]" />
                  <div className="timeline-dot z-10 bg-obsidian border-champagne ring-[6px] ring-obsidian group-hover:scale-125 transition-transform duration-500 mt-2" />
                </div>

                {/* Content */}
                <div className="flex-1 pb-16 md:pb-24 pt-0">
                  <h3 className="font-serif text-cream text-xl md:text-2xl mb-3 group-hover:text-champagne transition-colors duration-300">
                    {item.title}
                  </h3>
                  <p className="font-sans text-stone text-sm md:text-base leading-relaxed max-w-2xl">
                    {item.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── MASTERCLASS CTA ──────────────────────────────────────── */}
      <section className="bg-charcoal py-24 md:py-32 px-6 md:px-16 text-center">
        <div className="will-animate max-w-3xl mx-auto">
          <p className="section-label justify-center mb-8">{t('masterclass.label')}</p>
          <h2 className="font-serif italic text-cream text-5xl md:text-7xl mb-8">{t('masterclass.title')}</h2>
          <p className="font-sans text-cream/60 text-base md:text-lg leading-relaxed mb-12 max-w-xl mx-auto">
            {t('masterclass.desc')}
          </p>
          <a href="mailto:info@ruslanzinevych.de" className="btn-gold text-sm">
            {t('masterclass.enquire')}
          </a>
        </div>
      </section>
    </div>
  );
};

// ─── ABOUT PAGE ──────────────────────────────────────────────────────────────

const AboutPage = () => {
  const { t } = useTranslation();
  useEffect(() => { window.scrollTo(0, 0); }, []);

  const awardsResult = t('awardsData', { returnObjects: true });
  const awards = Array.isArray(awardsResult) ? awardsResult : [];
  const languagesResult = t('languagesData', { returnObjects: true });
  const languages = Array.isArray(languagesResult) ? languagesResult : [];
  const repertoireResult = t('repertoireData', { returnObjects: true });
  const repertoire = Array.isArray(repertoireResult) ? repertoireResult : [];

  return (
    <div className="pt-24 pb-24 px-6 sm:px-6 md:px-16 max-w-6xl mx-auto">

      {/* Header */}
      <div className="border-b border-champagne/20 pb-16 mb-16 grid grid-cols-1 md:grid-cols-12 gap-12 items-start">
        <div className="md:col-span-4">
          <div className="relative aspect-[3/4] overflow-hidden">
            <img
              src={resolveAsset('maestro.jpg')}
              alt="Ruslan Zinevych"
              className="w-full h-full object-cover ken-burns" style={{ objectPosition: 'center 12%' }}
            />
            <div className="absolute inset-0 border border-champagne/20 pointer-events-none" />
          </div>
        </div>
        <div className="md:col-span-8">
          <p className="section-label mb-8">{t('aboutPage.label')}</p>
          <h1 className="font-serif text-cream text-5xl md:text-7xl leading-tight mb-8">
            <SplitText delay={0.2}>{t('aboutPage.title1')}</SplitText><br />
            <SplitText delay={0.4}>{t('aboutPage.title2')}</SplitText>
          </h1>
          <p className="font-sans text-cream/70 text-lg leading-relaxed mb-8">
            {t('aboutPage.desc')}
          </p>
          <div className="flex gap-12 font-sans text-xs tracking-widest uppercase">
            <div>
              <p className="text-stone mb-1">{t('aboutPage.origin')}</p>
              <p className="text-cream">{t('aboutPage.originVal')}</p>
            </div>
            <div>
              <p className="text-stone mb-1">{t('aboutPage.based')}</p>
              <p className="text-cream">{t('aboutPage.basedVal')}</p>
            </div>
            <div>
              <p className="text-stone mb-1">{t('aboutPage.voice')}</p>
              <p className="text-cream">{t('aboutPage.voiceVal')}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Career narrative */}
      <div className="about-reveal grid grid-cols-1 md:grid-cols-2 gap-16 mb-20 pb-20 border-b border-champagne/20">
        <div>
          <p className="section-label mb-8">{t('aboutPage.careerLabel')}</p>
          <div className="space-y-6 font-sans text-cream/70 leading-relaxed">
            <p>{t('aboutPage.careerP1')}</p>
            <p>{t('aboutPage.careerP2')}</p>
          </div>
        </div>
        <div>
          <p className="section-label mb-8">{t('aboutPage.pedagogyLabel')}</p>
          <div className="space-y-6 font-sans text-cream/70 leading-relaxed">
            <p>{t('aboutPage.pedagogyP1')}</p>
            <p>{t('aboutPage.pedagogyP2')}</p>
          </div>
        </div>
      </div>

      {/* Awards & Languages */}
      <div className="about-reveal grid grid-cols-1 md:grid-cols-2 gap-16 mb-20 pb-20 border-b border-champagne/20">
        <div>
          <p className="section-label mb-8">{t('aboutPage.awardsLabel')}</p>
          <ul className="space-y-6">
            {awards.map((a, i) => (
              <li key={i} className="flex gap-6">
                <span className="font-sans text-champagne text-sm shrink-0 mt-0.5">{a.year}</span>
                <div>
                  <p className="font-serif text-cream text-lg">{a.prize}</p>
                  <p className="font-sans text-stone text-xs tracking-wide mt-0.5">{a.comp} · {a.location}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <p className="section-label mb-8">{t('aboutPage.langLabel')}</p>
          <div className="grid grid-cols-2 gap-4">
            {languages.map(l => (
              <div key={l.lang} className="py-3 border-b border-champagne/10">
                <p className="font-serif text-cream text-base">{l.lang}</p>
                <p className="font-sans text-stone text-[0.6rem] tracking-widest uppercase mt-0.5">{l.level}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Press Reviews */}
      <div className="about-reveal mb-20 pb-20 border-b border-champagne/20">
        <p className="section-label mb-8">{t('aboutPage.pressReviewsLabel')}</p>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {(Array.isArray(t('aboutPage.pressReviews', { returnObjects: true })) ? t('aboutPage.pressReviews', { returnObjects: true }) : []).map((review, i) => (
            <motion.a
              key={i}
              href={review.url}
              target="_blank"
              rel="noopener noreferrer"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: i * 0.1 }}
              className="block p-8 border border-champagne/10 bg-darkcard/50 relative group hover:border-champagne/30 transition-all duration-500 hover:-translate-y-2"
            >
              <div className="absolute top-0 left-0 w-1 h-0 bg-champagne group-hover:h-full transition-all duration-700" />
              <div className="mb-6 flex justify-between items-start">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#C9A252" strokeWidth="1.5" className="opacity-40">
                  <path d="M3 21c3 0 7-1 7-8V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v6c0 1.1.9 2 2 2h2v4l-4 4z" />
                  <path d="M13 21c3 0 7-1 7-8V5c0-1.1-.9-2-2-2h-3c-1.1 0-2 .9-2 2v6c0 1.1.9 2 2 2h2v4l-4 4z" />
                </svg>
                <div className="p-2 rounded-full bg-champagne/5 opacity-0 group-hover:opacity-100 transition-opacity">
                  <ExternalLink size={14} className="text-champagne" />
                </div>
              </div>
              <p className="font-serif italic text-cream text-lg leading-relaxed mb-6">
                {review.quote}
              </p>
              <div className="mt-auto">
                <p className="font-sans text-champagne text-[0.65rem] tracking-[0.2em] uppercase font-bold mb-1">
                  {review.author}
                </p>
                <p className="font-sans text-stone text-[0.6rem] tracking-widest uppercase opacity-60">
                  {review.role}
                </p>
              </div>
            </motion.a>
          ))}
        </div>
      </div>

      {/* Repertoire table */}
      <div className="about-reveal mb-20 pb-20 border-b border-champagne/20">
        <p className="section-label mb-8">{t('aboutPage.repLabel')}</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-px bg-champagne/10">
          {repertoire.map((item, i) => (
            <div key={i} className="bg-obsidian p-6 hover:bg-darkcard transition-colors">
              <p className="font-sans text-champagne text-xs tracking-widest uppercase mb-2">{item.composer}</p>
              <p className="font-serif text-cream text-lg leading-snug">{item.roles}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Press Kit */}
      <div className="about-reveal mb-20 border border-champagne/20 p-10 relative bg-darkcard flex flex-col items-center text-center">
        <div className="absolute -top-3 -left-3 w-6 h-6 border-t border-l border-champagne/60" />
        <div className="absolute -bottom-3 -right-3 w-6 h-6 border-b border-r border-champagne/60" />

        <p className="section-label mb-6">{t('aboutPage.pressLabel')}</p>
        <h2 className="font-serif italic text-cream text-3xl md:text-4xl mb-4">{t('aboutPage.pressTitle')}</h2>
        <p className="font-sans text-cream/60 leading-relaxed mb-8 max-w-xl mx-auto">
          {t('aboutPage.pressDesc')}
        </p>

        <a
          href="/press-kit.pdf"
          download="Ruslan_Zinevych_CV.pdf"
          className="btn-gold inline-flex items-center gap-3"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3" />
          </svg>
          Download PDF
        </a>
      </div>

      <div className="text-center">
        <Link to="/" className="inline-flex items-center gap-2 font-sans text-xs tracking-widest text-stone uppercase hover:text-champagne transition-colors">
          <ChevronRight size={14} className="rotate-180" /> Back to Home
        </Link>
      </div>
    </div>
  );
};

// ─── CONTACT PAGE ─────────────────────────────────────────────────────────────

const ContactPage = () => {
  const { t, i18n } = useTranslation();
  const isZh = i18n.language && i18n.language.startsWith('zh');
  useEffect(() => { window.scrollTo(0, 0); }, []);

  return (
    <div className="min-h-screen pt-24 pb-24 px-6 sm:px-6 md:px-16">
      <div className="max-w-5xl mx-auto">

        {/* Page heading */}
        <div className="mb-20 border-b border-champagne/20 pb-16">
          <p className="section-label mb-6">{t('contact.label')}</p>
          <h1 className="font-serif italic text-cream text-6xl md:text-8xl leading-none mb-8">
            <SplitText delay={0.2}>{t('contact.title1')}</SplitText><br />
            <span className="text-champagne"><SplitText delay={0.4}>{t('contact.title2')}</SplitText></span>
          </h1>
          <p className="font-sans text-cream/60 text-lg max-w-xl leading-relaxed">
            {t('contact.desc')}
          </p>
        </div>

        {/* Contact blocks grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-px bg-champagne/10 mb-20">

          {/* WhatsApp */}
          <a
            href="https://wa.me/4915112032072"
            target="_blank"
            rel="noopener noreferrer"
            className="group bg-obsidian hover:bg-darkcard transition-colors duration-500 p-10 flex flex-col gap-6"
          >
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 border border-champagne/30 group-hover:border-champagne/70 flex items-center justify-center transition-colors duration-300">
                <MessageSquare size={16} className="text-champagne" />
              </div>
              <p className="font-sans text-champagne text-[0.6rem] tracking-[0.4em] uppercase">{t('contact.whatsappTitle')}</p>
            </div>
            <div>
              <p className="font-serif text-cream text-2xl mb-1 group-hover:text-champagne transition-colors duration-300">{t('contact.whatsappLabel')}</p>
              <p className="font-sans text-stone text-sm">+49 151 120 320 72</p>
            </div>
            <p className="font-sans text-cream/50 text-xs leading-relaxed">
              {t('contact.whatsappDesc')}
            </p>
            <div className="flex items-center gap-2 text-champagne/60 group-hover:text-champagne transition-colors duration-300 mt-auto">
              <span className="font-sans text-xs tracking-widest uppercase">{t('contact.mcEnquire')}</span>
              <ChevronRight size={12} />
            </div>
          </a>

          {/* Email */}
          <a
            href="mailto:info@ruslanzinevych.de"
            className="group bg-obsidian hover:bg-darkcard transition-colors duration-500 p-10 flex flex-col gap-6"
          >
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 border border-champagne/30 group-hover:border-champagne/70 flex items-center justify-center transition-colors duration-300">
                <Mail size={16} className="text-champagne" />
              </div>
              <p className="font-sans text-champagne text-[0.6rem] tracking-[0.4em] uppercase">{t('contact.email')}</p>
            </div>
            <div>
              <p className="font-serif text-cream text-2xl mb-1 group-hover:text-champagne transition-colors duration-300">{t('contact.emailLabel')}</p>
              <p className="font-sans text-stone text-sm">info@ruslanzinevych.de</p>
            </div>
            <p className="font-sans text-cream/50 text-xs leading-relaxed">
              {t('contact.emailDesc')}
            </p>
            <div className="flex items-center gap-2 text-champagne/60 group-hover:text-champagne transition-colors duration-300 mt-auto">
              <span className="font-sans text-xs tracking-widest uppercase">{t('contact.sendEmail')}</span>
              <ChevronRight size={12} />
            </div>
          </a>

          {/* Phone */}
          <a
            href="tel:+4915112032072"
            className="group bg-obsidian hover:bg-darkcard transition-colors duration-500 p-10 flex flex-col gap-6"
          >
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 border border-champagne/30 group-hover:border-champagne/70 flex items-center justify-center transition-colors duration-300">
                <Phone size={16} className="text-champagne" />
              </div>
              <p className="font-sans text-champagne text-[0.6rem] tracking-[0.4em] uppercase">{t('contact.phone')}</p>
            </div>
            <div>
              <p className="font-serif text-cream text-2xl mb-1 group-hover:text-champagne transition-colors duration-300">{t('contact.phoneLabel')}</p>
              <p className="font-sans text-stone text-sm">+49 151 120 320 72</p>
            </div>
            <p className="font-sans text-cream/50 text-xs leading-relaxed">
              {t('contact.phoneDesc')}
            </p>
            <div className="flex items-center gap-2 text-champagne/60 group-hover:text-champagne transition-colors duration-300 mt-auto">
              <span className="font-sans text-xs tracking-widest uppercase">{t('contact.call')}</span>
              <ChevronRight size={12} />
            </div>
          </a>

          {/* Location */}
          <div className="bg-obsidian p-10 flex flex-col gap-6">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 border border-champagne/30 flex items-center justify-center">
                <MapPin size={16} className="text-champagne" />
              </div>
              <p className="font-sans text-champagne text-[0.6rem] tracking-[0.4em] uppercase">{t('contact.location')}</p>
            </div>
            <div>
              <p className="font-serif text-cream text-2xl mb-1">{t('contact.locationLabel')}</p>
              <p className="font-sans text-stone text-sm">{t('aboutPage.basedVal')}</p>
            </div>
            <p className="font-sans text-cream/50 text-xs leading-relaxed">
              {t('contact.locationDesc')}
            </p>
            <div className="mt-auto">
              <p className="font-sans text-stone text-[0.6rem] tracking-widest uppercase">{t('contact.timezone')}</p>
            </div>
          </div>

          {/* WeChat — Chinese version only */}
          {isZh && (
            <div className="group bg-obsidian hover:bg-darkcard transition-colors duration-500 p-10 flex flex-col gap-6 col-span-1 md:col-span-2">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 border border-champagne/30 group-hover:border-champagne/70 flex items-center justify-center transition-colors duration-300">
                  {/* WeChat icon */}
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="text-champagne">
                    <path d="M8.5 11.5a1 1 0 1 0 0-2 1 1 0 0 0 0 2ZM15.5 11.5a1 1 0 1 0 0-2 1 1 0 0 0 0 2Z" fill="#C9A252"/>
                    <path d="M2 9c0-3.866 4.477-7 10-7s10 3.134 10 7c0 3.866-4.477 7-10 7a12.9 12.9 0 0 1-3.29-.424L5 17l1.394-2.79A6.87 6.87 0 0 1 2 9Z" stroke="#C9A252" strokeWidth="1.5" strokeLinejoin="round"/>
                  </svg>
                </div>
                <p className="font-sans text-champagne text-[0.6rem] tracking-[0.4em] uppercase">{t('contact.wechatTitle')}</p>
              </div>
              <div>
                <p className="font-serif text-cream text-2xl mb-1">{t('contact.wechatLabel')}</p>
                <p className="font-sans text-stone text-sm">{t('contact.wechatId')}</p>
              </div>
              <p className="font-sans text-cream/50 text-xs leading-relaxed">{t('contact.wechatDesc')}</p>
              <div className="flex items-center gap-2 text-champagne/60 mt-auto">
                <span className="font-sans text-xs tracking-widest uppercase">{t('contact.wechatAdd')}</span>
                <ChevronRight size={12} />
              </div>
            </div>
          )}
        </div>

        {/* Masterclass enquiry highlight */}
        <div className="border border-champagne/20 p-10 mb-16 relative">
          <div className="absolute -top-3 -left-3 w-6 h-6 border-t border-l border-champagne/60" />
          <div className="absolute -bottom-3 -right-3 w-6 h-6 border-b border-r border-champagne/60" />
          <p className="section-label mb-6">{t('contact.mcLabel')}</p>
          <h2 className="font-serif italic text-cream text-3xl md:text-4xl mb-6">
            {t('contact.mcTitle')}
          </h2>
          <p className="font-sans text-cream/60 leading-relaxed mb-8 max-w-2xl">
            {t('contact.mcDesc')}
          </p>
          <a
            href={`https://wa.me/4915112032072?text=${encodeURIComponent('Hello Ruslan, I am interested in a masterclass enquiry.')}`}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-gold text-xs inline-flex items-center gap-2"
          >
            {t('contact.mcEnquire')} <ChevronRight size={12} />
          </a>
        </div>

        {/* Back */}
        <div className="text-center">
          <Link to="/" className="inline-flex items-center gap-2 font-sans text-xs tracking-widest text-stone uppercase hover:text-champagne transition-colors">
            <ChevronRight size={14} className="rotate-180" /> {t('legal.back')}
          </Link>
        </div>

      </div>
    </div>
  );
};

// ─── LEGAL PAGES (GERMAN COMPLIANCE) ──────────────────────────────────────────

const ImpressumPage = () => {
  const { t } = useTranslation();
  useEffect(() => { window.scrollTo(0, 0); }, []);
  return (
    <div className="min-h-screen pt-28 pb-24 px-6 md:px-16 max-w-4xl mx-auto">
      <h1 className="font-serif italic text-cream text-5xl mb-12">{t('legal.impressum')}</h1>
      <div className="prose prose-invert max-w-none font-sans text-cream/70 leading-relaxed space-y-8">
        <section>
          <h2 className="text-champagne text-xs tracking-widest uppercase mb-4">{t('legal.sections.angaben')}</h2>
          <p>
            Ruslan Zinevych<br />
            Ruckäckerweg 4<br />
            93055 Regensburg<br />
            Deutschland
          </p>
        </section>
        <section>
          <h2 className="text-champagne text-xs tracking-widest uppercase mb-4">{t('legal.sections.kontakt')}</h2>
          <p>
            Telefon: +49 151 120 320 72<br />
            E-Mail: info@ruslanzinevych.de
          </p>
        </section>
        <section>
          <h2 className="text-champagne text-xs tracking-widest uppercase mb-4">{t('legal.sections.verantwortlich')}</h2>
          <p>
            Ruslan Zinevych<br />
            Regensburg
          </p>
        </section>
      </div>
      <Link to="/" className="inline-flex items-center gap-2 font-sans text-xs tracking-widest text-stone uppercase hover:text-champagne transition-colors mt-16">
        <ChevronRight size={14} className="rotate-180" /> {t('legal.back')}
      </Link>
    </div>
  );
};

const PrivacyPage = () => {
  const { t } = useTranslation();
  useEffect(() => { window.scrollTo(0, 0); }, []);
  return (
    <div className="min-h-screen pt-28 pb-24 px-6 md:px-16 max-w-4xl mx-auto">
      <h1 className="font-serif italic text-cream text-5xl mb-12">{t('legal.privacy')}</h1>
      <div className="prose prose-invert max-w-none font-sans text-cream/70 leading-relaxed space-y-8 text-sm">
        <section>
          <h2 className="text-champagne text-xs tracking-widest uppercase mb-4">1. Datenschutz auf einen Blick</h2>
          <p>Die folgenden Hinweise geben einen einfachen Überblick darüber, was mit Ihren personenbezogenen Daten passiert, wenn Sie diese Website besuchen.</p>
        </section>
        <section>
          <h2 className="text-champagne text-xs tracking-widest uppercase mb-4">2. Hosting</h2>
          <p>Wir hosten die Inhalte unserer Website bei folgendem Anbieter: <strong>IONOS SE</strong>, Elgendorfer Str. 57, 56410 Montabaur. Details entnehmen Sie der Datenschutzerklärung von IONOS: <a href="https://www.ionos.de/terms-gtc/terms-privacy" target="_blank" className="underline">https://www.ionos.de/terms-gtc/terms-privacy</a>.</p>
        </section>
        <section>
          <h2 className="text-champagne text-xs tracking-widest uppercase mb-4">3. Allgemeine Hinweise und Pflichtinformationen</h2>
          <p>
            Der Verantwortliche für die Datenverarbeitung auf dieser Website ist:<br />
            <strong>Ruslan Zinevych</strong>, Ruckäckerweg 4, 93055 Regensburg. E-Mail: info@ruslanzinevych.de
          </p>
          <p className="mt-4">
            Sie haben im Rahmen der geltenden gesetzlichen Bestimmungen jederzeit das Recht auf unentgeltliche <strong>Auskunft</strong> über Ihre gespeicherten personenbezogenen Daten, deren Herkunft und Empfänger und den Zweck der Datenverarbeitung und ggf. ein Recht auf <strong>Berichtigung oder Löschung</strong> dieser Daten.
          </p>
        </section>
        <section>
          <h2 className="text-champagne text-xs tracking-widest uppercase mb-4">4. Bereitstellung der Website (Lokale Schriften)</h2>
          <p>
            Diese Website nutzt zur einheitlichen Darstellung von Schriftarten ausschließlich lokal bereitgestellte Schriftarten. Eine Verbindung zu Servern von Google Fonts oder anderen Drittanbietern findet nicht statt. Dadurch wird keine IP-Adresse an externe Server übertragen.
          </p>
        </section>
        <section>
          <h2 className="text-champagne text-xs tracking-widest uppercase mb-4">5. Kontakt via WhatsApp / E-Mail</h2>
          <p>
            Wenn Sie uns per E-Mail oder WhatsApp kontaktieren, werden Ihre Angaben zwecks Bearbeitung der Anfrage gespeichert. Diese Daten geben wir nicht ohne Ihre Einwilligung weiter. Die Verarbeitung dieser Daten erfolgt auf Grundlage von Art. 6 Abs. 1 lit. b DSGVO, sofern Ihre Anfrage mit der Erfüllung eines Vertrags zusammenhängt.
          </p>
        </section>
      </div>
      <Link to="/" className="inline-flex items-center gap-2 font-sans text-xs tracking-widest text-stone uppercase hover:text-champagne transition-colors mt-16">
        <ChevronRight size={14} className="rotate-180" /> {t('legal.back')}
      </Link>
    </div>
  );
};

const CookieBanner = () => {
  const { t } = useTranslation();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem('ruslan-cookie-consent');
    if (!consent) setVisible(true);
  }, []);

  const handleAccept = () => {
    localStorage.setItem('ruslan-cookie-consent', 'true');
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-[100] p-6 lg:p-8 animate-fade-in">
      <div className="max-w-4xl mx-auto bg-obsidian/80 backdrop-blur-2xl border border-champagne/20 p-6 md:p-8 shadow-2xl flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex-1">
          <p className="font-sans text-cream text-sm leading-relaxed mb-1">
            {t('cookies.title')}
          </p>
          <p className="font-sans text-stone text-xs leading-relaxed">
            {t('cookies.desc')}
            <Link to="/privacy" className="text-champagne underline ml-1 hover:text-cream transition-colors">{t('cookies.policyLink')}</Link>{t('cookies.policyAgree')}
          </p>
        </div>
        <button
          onClick={handleAccept}
          className="btn-gold text-[0.6rem] whitespace-nowrap min-w-[140px] py-3 h-full"
        >
          {t('cookies.accept')}
        </button>
      </div>
    </div>
  );
};

const PageWrapper = ({ children }) => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0, transition: { duration: 0.4 } }}
    transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
    className="w-full bg-obsidian"
  >
    {children}
  </motion.div>
);

const AnimatedRoutes = () => {
  const location = useLocation();
  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<PageWrapper><HomePage /></PageWrapper>} />
        <Route path="/about" element={<PageWrapper><AboutPage /></PageWrapper>} />
        <Route path="/gallery" element={<PageWrapper><GalleryPage /></PageWrapper>} />
        <Route path="/contact" element={<PageWrapper><ContactPage /></PageWrapper>} />
        <Route path="/impressum" element={<PageWrapper><ImpressumPage /></PageWrapper>} />
        <Route path="/privacy" element={<PageWrapper><PrivacyPage /></PageWrapper>} />
      </Routes>
    </AnimatePresence>
  );
};

function App() {
  return (
    <Router basename="/">
      <div className="grain min-h-screen bg-obsidian text-cream">
        <CustomCursor />
        <Navbar />
        <AnimatedRoutes />
        <Footer />
        <CookieBanner />
      </div>
    </Router>
  );
}

export default App;
