import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';

import gsap from 'gsap';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';
import galleryData from './galleryData.json';

// Utility to resolve asset path just like in App.jsx
const resolveAsset = (path) => {
  if (!path) return '';
  if (path.startsWith('http')) return path;
  const base = import.meta.env.BASE_URL || '/';
  const cleanPath = path.startsWith('/') ? path.slice(1) : path;
  const baseName = base.replace(/\//g, '');
  if (baseName && cleanPath.startsWith(baseName + '/')) {
    return '/' + cleanPath.replace(/\/+/g, '/');
  }
  return (base + cleanPath).replace(/\/+/g, '/');
};

const ImageModal = ({ images, currentIndex, onClose, onNavigate }) => {
  const image = images[currentIndex];

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    const onKey = e => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft') onNavigate('prev');
      if (e.key === 'ArrowRight') onNavigate('next');
    };
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', onKey);
    };
  }, [onClose, onNavigate]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-8"
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
      style={{ background: 'rgba(4,4,8,0.95)', backdropFilter: 'blur(16px)' }}
    >
      <div className="relative w-full max-w-6xl h-full flex flex-col items-center justify-center pointer-events-none">
        
        {/* Controls */}
        <div className="absolute top-4 right-4 z-[110] pointer-events-auto">
          <button onClick={onClose} className="w-10 h-10 flex items-center justify-center bg-black/50 backdrop-blur-md rounded-full text-[#F5F0E8] hover:bg-[#C9A252] hover:text-[#0A0A0F] transition-all">
            <X size={20} />
          </button>
        </div>

        <button 
          onClick={(e) => { e.stopPropagation(); onNavigate('prev'); }}
          className="absolute left-2 md:left-8 top-1/2 -translate-y-1/2 z-[110] pointer-events-auto w-12 h-12 flex items-center justify-center bg-black/20 hover:bg-black/60 backdrop-blur-md rounded-full text-[#F5F0E8] transition-all"
        >
          <ChevronLeft size={28} />
        </button>

        <button 
          onClick={(e) => { e.stopPropagation(); onNavigate('next'); }}
          className="absolute right-2 md:right-8 top-1/2 -translate-y-1/2 z-[110] pointer-events-auto w-12 h-12 flex items-center justify-center bg-black/20 hover:bg-black/60 backdrop-blur-md rounded-full text-[#F5F0E8] transition-all"
        >
          <ChevronRight size={28} />
        </button>

        {/* Image Display */}
        <div className="relative w-full h-[85vh] flex items-center justify-center pointer-events-auto shadow-2xl">
          <img
            key={image.src}
            src={resolveAsset(image.src)}
            alt={image.alt}
            className="w-full h-full object-contain pointer-events-auto"
            style={{ WebkitUserSelect: 'none', userSelect: 'none' }}
            onClick={(e) => { e.stopPropagation(); onNavigate('next'); }}
          />
        </div>
        
        {/* Counter */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-[110] font-sans text-[0.6rem] tracking-[0.4em] text-[#C9A252] uppercase pointer-events-none">
          {currentIndex + 1} / {images.length}
        </div>
      </div>
    </motion.div>
  );
};

const GalleryPage = () => {
  const { t } = useTranslation();
  const [activeImageIndex, setActiveImageIndex] = useState(null);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const openLightbox = (index) => {
    setActiveImageIndex(index);
  };

  const handleNavigate = (direction) => {
    if (activeImageIndex === null) return;
    if (direction === 'prev') {
      setActiveImageIndex(prev => (prev > 0 ? prev - 1 : galleryData.length - 1));
    } else {
      setActiveImageIndex(prev => (prev < galleryData.length - 1 ? prev + 1 : 0));
    }
  };

  return (
    <div className="pt-32 pb-24 px-6 sm:px-8 md:px-12 max-w-[1400px] mx-auto min-h-screen">
      
      <AnimatePresence>
        {activeImageIndex !== null && (
          <ImageModal 
            images={galleryData} 
            currentIndex={activeImageIndex} 
            onClose={() => setActiveImageIndex(null)}
            onNavigate={handleNavigate}
          />
        )}
      </AnimatePresence>

      {/* Header */}
      <div className="mb-16 md:mb-24 text-center max-w-2xl mx-auto flex flex-col items-center">
        <p className="section-label mb-8">
          {t('nav.gallery') || 'Gallery'}
        </p>
        <h1 className="font-serif italic text-[#F5F0E8] text-5xl md:text-7xl leading-tight mb-8">
          <motion.span
            className="inline-block"
            initial={{ y: '100%', opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
          >
            {t('gallery.title') || 'Art in Focus'}
          </motion.span>
        </h1>
        <div className="w-12 h-[1px] bg-[#C9A252]/40 mb-8" />
      </div>

      {/* Masonry Grid */}
      <div className="columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-4 md:gap-6 space-y-4 md:space-y-6">
        {galleryData.map((img, index) => (
          <motion.div
            key={img.id}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: Math.min(index * 0.04, 0.8) }}
            className="break-inside-avoid shadow-lg transition-shadow duration-500 cursor-pointer overflow-hidden group bg-[#111118]"
            onClick={() => openLightbox(index)}
          >
            <div className="relative overflow-hidden w-full h-auto">
              {/* Aspect ratio padding for smooth loading */}
              <div style={{ paddingBottom: `${(img.height / img.width) * 100}%` }}>
                <img
                  src={resolveAsset(img.src)}
                  alt={img.alt}
                  className="absolute inset-0 w-full h-full object-cover will-change-transform
                    md:grayscale-[30%] md:group-hover:grayscale-0 md:group-hover:scale-[1.03] md:transition-all md:duration-700 md:ease-out"
                  loading="lazy"
                />
              </div>

              {/* Hover overlay — desktop only (no hover on touch) */}
              <div className="hidden md:flex absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300 pointer-events-none items-center justify-center">
                <div className="w-12 h-12 rounded-full border border-white/30 flex items-center justify-center bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 transform scale-90 group-hover:scale-100">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.5">
                    <path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7" />
                  </svg>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
      
    </div>
  );
};

export default GalleryPage;
