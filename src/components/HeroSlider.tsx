import React, { useState, useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight, Play, Pause, ArrowRight, Image as ImageIcon } from 'lucide-react';
import { HeroSlide } from '../types/database';

interface HeroSliderProps {
  slides: HeroSlide[];
  onNavigate?: (tab: 'beranda' | 'jelajahi' | 'upload' | 'tentang' | 'dashboard-mhs' | 'dashboard-admin') => void;
  className?: string;
  autoPlayIntervalMs?: number;
  children?: React.ReactNode;
}

export const HeroSlider: React.FC<HeroSliderProps> = ({
  slides,
  onNavigate,
  className = '',
  autoPlayIntervalMs = 4000,
  children,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const activeSlides = slides.filter((s) => s.isActive);
  const total = activeSlides.length;

  // Auto-advance timer
  useEffect(() => {
    if (total <= 1 || isPaused) {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }

    timerRef.current = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % total);
    }, autoPlayIntervalMs);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [total, isPaused, autoPlayIntervalMs]);

  // Handle index out of bounds
  useEffect(() => {
    if (currentIndex >= total && total > 0) {
      setCurrentIndex(0);
    }
  }, [total, currentIndex]);

  if (total === 0) {
    if (children) {
      return (
        <div className={`relative w-full min-h-[480px] bg-slate-100 flex items-center justify-center ${className}`}>
          {children}
        </div>
      );
    }
    return (
      <div className={`h-80 sm:h-96 rounded-3xl bg-slate-100 border border-slate-200 flex flex-col items-center justify-center text-slate-400 p-6 ${className}`}>
        <ImageIcon className="w-12 h-12 mb-3 text-slate-300" />
        <p className="font-semibold text-sm">Belum ada slide beranda yang aktif</p>
        <p className="text-xs mt-1 text-slate-400">Silakan tambahkan atau aktifkan slide melalui menu backend admin.</p>
      </div>
    );
  }

  const currentSlide = activeSlides[currentIndex];

  const handlePrev = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentIndex((prev) => (prev - 1 + total) % total);
  };

  const handleNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentIndex((prev) => (prev + 1) % total);
  };

  const handleSlideClick = () => {
    if (currentSlide.targetTab && onNavigate) {
      onNavigate(currentSlide.targetTab);
    }
  };

  // FULL-WIDTH LANDSCAPE HEADER MODE (When wrapping content like the left panel)
  if (children) {
    return (
      <div
        className={`relative w-full min-h-[480px] sm:min-h-[520px] lg:min-h-[550px] overflow-hidden bg-slate-950 group select-none ${className}`}
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
      >
        {/* Full Landscape Background Slides */}
        <div className="absolute inset-0 z-0">
          {activeSlides.map((slide, idx) => {
            const isActive = idx === currentIndex;
            return (
              <div
                key={slide.id}
                className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
                  isActive ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'
                }`}
              >
                <img
                  src={slide.imageUrl}
                  alt={slide.title}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover object-center transform transition-transform duration-1000 group-hover:scale-103"
                  onError={(e) => {
                    const target = e.target as HTMLElement;
                    target.style.display = 'none';
                  }}
                />
                {/* Balanced overlay scrim so text & glass panel pop cleanly while slide image shines through */}
                <div className="absolute inset-0 bg-gradient-to-r from-slate-950/45 via-slate-950/20 to-transparent" />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/50 via-transparent to-slate-950/15" />
              </div>
            );
          })}
        </div>

        {/* Content Container (holds left panel text) */}
        <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14 min-h-[480px] sm:min-h-[520px] lg:min-h-[550px] flex items-center">
          {/* Main Left Content Panel */}
          <div className="w-full max-w-xl">
            {children}
          </div>
        </div>

        {/* Navigation Arrows on Left and Right Sides */}
        {total > 1 && (
          <>
            <button
              type="button"
              onClick={handlePrev}
              aria-label="Slide Sebelumnya"
              className="absolute left-3 sm:left-6 top-1/2 -translate-y-1/2 z-20 w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-slate-900/60 hover:bg-slate-900/90 text-white backdrop-blur-md border border-white/20 flex items-center justify-center transition-all opacity-80 hover:opacity-100 hover:scale-105 cursor-pointer shadow-xl"
            >
              <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6" />
            </button>

            <button
              type="button"
              onClick={handleNext}
              aria-label="Slide Berikutnya"
              className="absolute right-3 sm:right-6 top-1/2 -translate-y-1/2 z-20 w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-slate-900/60 hover:bg-slate-900/90 text-white backdrop-blur-md border border-white/20 flex items-center justify-center transition-all opacity-80 hover:opacity-100 hover:scale-105 cursor-pointer shadow-xl"
            >
              <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6" />
            </button>
          </>
        )}

        {/* BOTTOM-RIGHT CORNER: 2 Slide Info Components (Badge + Caption) & Navigation Controls */}
        <div className="absolute bottom-4 sm:bottom-6 right-4 sm:right-6 lg:right-8 z-20 flex flex-col items-end gap-2.5 max-w-xs sm:max-w-sm pointer-events-auto">
          {/* 2 Components: Badge and Slide Info Card */}
          <div className="hidden sm:flex flex-col items-end gap-1.5 text-right">
            {currentSlide.badge && (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider bg-teal-400 text-slate-950 shadow-md">
                <span>{currentSlide.badge}</span>
              </span>
            )}
            <div
              onClick={handleSlideClick}
              className="bg-slate-950/70 hover:bg-slate-950/85 backdrop-blur-md px-3.5 py-2.5 rounded-2xl border border-white/15 text-white shadow-xl cursor-pointer transition-all group/caption text-right max-w-xs"
            >
              <h4 className="font-display font-bold text-xs sm:text-sm text-white group-hover/caption:text-teal-300 transition-colors line-clamp-1">
                {currentSlide.title}
              </h4>
              <p className="text-[11px] text-slate-300 mt-0.5 line-clamp-1 leading-relaxed">
                {currentSlide.subtitle}
              </p>
              {currentSlide.targetTab && (
                <div className="mt-1 flex items-center justify-end gap-1 text-[11px] font-semibold text-teal-400 group-hover/caption:translate-x-0.5 transition-transform">
                  <span>Lihat Media</span>
                  <ArrowRight className="w-3 h-3" />
                </div>
              )}
            </div>
          </div>

          {/* Slider Controls Bar (Counter, Dots, Play/Pause) */}
          {total > 1 && (
            <div className="flex items-center gap-3 bg-slate-950/70 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-white/15 text-white shadow-lg">
              {/* Counter */}
              <span className="font-mono text-xs text-white/80">
                {currentIndex + 1} / {total}
              </span>

              {/* Dots */}
              <div className="flex items-center gap-1.5">
                {activeSlides.map((_, dotIdx) => {
                  const isCurrent = dotIdx === currentIndex;
                  return (
                    <button
                      key={dotIdx}
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setCurrentIndex(dotIdx);
                      }}
                      aria-label={`Ke slide ${dotIdx + 1}`}
                      className={`transition-all duration-300 rounded-full cursor-pointer ${
                        isCurrent
                          ? 'w-6 h-2 bg-teal-400'
                          : 'w-2 h-2 bg-white/40 hover:bg-white/70'
                      }`}
                    />
                  );
                })}
              </div>

              {/* Pause/Play Toggle */}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsPaused(!isPaused);
                }}
                title={isPaused ? 'Putar Otomatis' : 'Jeda Otomatis'}
                className="hover:text-teal-300 text-white/70 transition-colors cursor-pointer pl-1 border-l border-white/20"
              >
                {isPaused ? <Play className="w-3.5 h-3.5 fill-current" /> : <Pause className="w-3.5 h-3.5 fill-current" />}
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  // STANDALONE / PREVIEW MODE (For Admin Dashboard)
  return (
    <div
      className={`relative rounded-3xl overflow-hidden shadow-xl border border-slate-200/90 group select-none ${className}`}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      style={{ minHeight: '340px' }}
    >
      <div
        onClick={handleSlideClick}
        className="w-full h-84 sm:h-96 md:h-[410px] relative cursor-pointer overflow-hidden bg-slate-900"
      >
        {activeSlides.map((slide, idx) => {
          const isActive = idx === currentIndex;
          return (
            <div
              key={slide.id}
              className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${
                isActive ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'
              }`}
            >
              <img
                src={slide.imageUrl}
                alt={slide.title}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover object-center transform transition-transform duration-700 group-hover:scale-105"
                onError={(e) => {
                  const target = e.target as HTMLElement;
                  target.style.display = 'none';
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/50 to-slate-950/15" />

              <div className="absolute top-4 left-4 right-4 flex items-center justify-between z-20">
                {slide.badge && (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold tracking-wide uppercase bg-teal-500 text-slate-950 shadow-md">
                    <span>{slide.badge}</span>
                  </span>
                )}

                <div className="flex items-center gap-2 bg-slate-900/80 backdrop-blur-md border border-white/10 text-white text-xs px-2.5 py-1 rounded-full font-mono">
                  <span>
                    {currentIndex + 1} / {total}
                  </span>
                  <span className="text-white/40">|</span>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsPaused(!isPaused);
                    }}
                    title={isPaused ? 'Lanjutkan Putar Otomatis' : 'Jeda Slider'}
                    className="hover:text-teal-300 transition-colors cursor-pointer"
                  >
                    {isPaused ? <Play className="w-3 h-3 fill-current" /> : <Pause className="w-3 h-3 fill-current" />}
                  </button>
                </div>
              </div>

              <div className="absolute bottom-0 inset-x-0 p-5 sm:p-7 text-left z-20">
                <div className="max-w-xl space-y-1.5">
                  <h3 className="font-display font-extrabold text-lg sm:text-xl md:text-2xl text-white tracking-tight leading-snug drop-shadow-md">
                    {slide.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-200 line-clamp-2 leading-relaxed drop-shadow-xs">
                    {slide.subtitle}
                  </p>

                  {slide.targetTab && (
                    <div className="pt-2 flex items-center gap-2 text-xs font-bold text-teal-300 group-hover:text-teal-200 transition-colors">
                      <span>Buka Media Edukasi</span>
                      <ArrowRight className="w-3.5 h-3.5 transform group-hover:translate-x-1 transition-transform" />
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {total > 1 && (
        <>
          <button
            type="button"
            onClick={handlePrev}
            aria-label="Slide Sebelumnya"
            className="absolute left-3 top-1/2 -translate-y-1/2 z-30 w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-slate-900/60 hover:bg-slate-900/90 text-white backdrop-blur-md border border-white/20 flex items-center justify-center transition-all opacity-80 hover:opacity-100 hover:scale-105 cursor-pointer shadow-lg"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          <button
            type="button"
            onClick={handleNext}
            aria-label="Slide Berikutnya"
            className="absolute right-3 top-1/2 -translate-y-1/2 z-30 w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-slate-900/60 hover:bg-slate-900/90 text-white backdrop-blur-md border border-white/20 flex items-center justify-center transition-all opacity-80 hover:opacity-100 hover:scale-105 cursor-pointer shadow-lg"
          >
            <ChevronRight className="w-5 h-5" />
          </button>

          <div className="absolute bottom-3 right-5 z-30 flex items-center gap-1.5 bg-slate-950/50 backdrop-blur-md px-2.5 py-1.5 rounded-full border border-white/10">
            {activeSlides.map((_, dotIdx) => {
              const isCurrent = dotIdx === currentIndex;
              return (
                <button
                  key={dotIdx}
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setCurrentIndex(dotIdx);
                  }}
                  aria-label={`Ke slide ${dotIdx + 1}`}
                  className={`transition-all duration-300 rounded-full cursor-pointer ${
                    isCurrent
                      ? 'w-6 h-2 bg-teal-400'
                      : 'w-2 h-2 bg-white/40 hover:bg-white/70'
                  }`}
                />
              );
            })}
          </div>
        </>
      )}
    </div>
  );
};
