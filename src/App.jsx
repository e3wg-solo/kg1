import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { Play, ArrowRight, Menu, X, Camera, Film, Users, Zap, Mail, Phone, MapPin, Instagram, Globe, Facebook, Link, Send, Youtube, YoutubeIcon, ChevronLeft, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence, useInView, useAnimation } from 'framer-motion';
import useEmblaCarousel from 'embla-carousel-react';
// Import Aurora directly to avoid flicker on scroll
import Aurora from './Aurora';

/* --- Utility: Throttle function --- */
const throttle = (func, limit) => {
  let inThrottle;
  return function(...args) {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
};

/* --- Custom Styles for Animations --- */
const GlobalStyles = () => (
  <style>{`
    @keyframes scroll {
      0% { transform: translateX(0); }
      100% { transform: translateX(-50%); }
    }
    .animate-scroll {
      animation: scroll 20s linear infinite;
    }
    .animate-scroll:hover {
      animation-play-state: paused;
    }
    @keyframes scrollPartners {
      0% { transform: translateX(0); }
      100% { transform: translateX(-50%); }
    }
    .animate-scroll-partners {
      width: max-content;
      animation: scrollPartners 65s linear infinite;
    }
    .animate-scroll-partners:hover {
      animation-play-state: paused;
    }
    @keyframes tilt {
      0%, 50%, 100% { transform: rotate(0deg); }
      25% { transform: rotate(1deg); }
      75% { transform: rotate(-1deg); }
    }
    .animate-tilt {
      animation: tilt 10s infinite linear;
    }
  `}</style>
);

/* --- Custom Components & Styles --- */

const FireGlow = ({ className = "" }) => (
  <div className={`absolute -inset-0.5 bg-gradient-to-r from-red-600 to-yellow-500 rounded-3xl blur opacity-30 group-hover:opacity-100 transition duration-500 ${className}`}></div>
);

const BentoCard = ({ children, className = "", title, subtitle, colSpan = "col-span-1" }) => (
  <div className={`relative group ${colSpan} ${className} rounded-3xl`}>
    <FireGlow />
    <div className="relative h-full bg-neutral-900 rounded-3xl p-6 flex flex-col justify-between border border-neutral-800 z-10 overflow-hidden">
      {children}
    </div>
  </div>
);

const SectionTitle = ({ children, subtitle }) => (
  <div className="mb-12 md:mb-20 px-4">
    {subtitle && <span className="text-red-500 font-bold tracking-widest uppercase text-sm mb-2 block animate-pulse">КиноГорыныч</span>}
    <h2 className="text-4xl md:text-6xl font-bold text-white leading-tight">
      {children}
    </h2>
  </div>
);

const PrimaryButton = ({ text, onClick, href, className = "" }) => (
  <button onClick={onClick} className={`relative inline-flex group ${className}`}>
    <div className="absolute transition-all duration-1000 opacity-70 -inset-px bg-gradient-to-r from-[#FF4D4D] via-[#F9CB28] to-[#FF4D4D] rounded-full blur-lg group-hover:opacity-100 group-hover:-inset-1 group-hover:duration-200 animate-tilt"></div>
    <a href={href} title={text} className="relative inline-flex items-center justify-center px-8 py-4 text-lg font-bold text-white transition-all duration-200 bg-neutral-900 font-pj rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-900 border border-neutral-700 group-hover:bg-neutral-800 w-full md:w-auto">
      {text}
      <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
    </a>
  </button>
);

const SecondaryButton = ({ text, onClick, href, className = "" }) => (
  <button onClick={onClick} className={`relative inline-flex group ${className}`}>
    <div className="absolute transition-all duration-1000 opacity-70 -inset-px bg-gradient-to-r from-[#F97316] via-[#F97316] to-[#F97316] rounded-full blur-lg group-hover:opacity-100 group-hover:-inset-1 group-hover:duration-200 animate-tilt"></div>
    <a href={href} title={text} className="relative inline-flex items-center justify-center px-4 py-2.5 md:px-8 md:py-4 text-base md:text-lg font-bold text-white transition-all duration-200 bg-neutral-900 font-pj rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 border border-orange-500/50 group-hover:bg-neutral-800 w-full md:w-auto">
      {text}
      <ArrowRight className="ml-2 w-4 h-4 md:w-5 md:h-5 group-hover:translate-x-1 transition-transform" />
    </a>
  </button>
);

/* --- Framer Motion Animation Components --- */

// Варианты анимаций (оптимизированные для производительности)
const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.4, ease: [0.25, 0.1, 0.25, 1] }
  }
};

const fadeInLeft = {
  hidden: { opacity: 0, x: -20 },
  visible: { 
    opacity: 1, 
    x: 0,
    transition: { duration: 0.4, ease: [0.25, 0.1, 0.25, 1] }
  }
};

const fadeInRight = {
  hidden: { opacity: 0, x: 20 },
  visible: { 
    opacity: 1, 
    x: 0,
    transition: { duration: 0.4, ease: [0.25, 0.1, 0.25, 1] }
  }
};

const fadeIn = {
  hidden: { opacity: 0 },
  visible: { 
    opacity: 1,
    transition: { duration: 0.4, ease: "easeOut" }
  }
};

const scaleIn = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: { 
    opacity: 1, 
    scale: 1,
    transition: { duration: 0.4, ease: [0.25, 0.1, 0.25, 1] }
  }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.05
    }
  }
};

const staggerItem = {
  hidden: { opacity: 0, y: 15 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.4, ease: [0.25, 0.1, 0.25, 1] }
  }
};

// Компонент для анимации при скролле (оптимизированный)
const ScrollReveal = ({ children, variants = fadeInUp, className = "", delay = 0 }) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-80px", amount: 0.2 });
  
  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={isInView ? "visible" : "hidden"}
      variants={variants}
      className={className}
      style={{ transitionDelay: `${delay}s` }}
      // Оптимизация: отключаем layout анимации
      layout={false}
    >
      {children}
    </motion.div>
  );
};

// Компонент для stagger анимации детей (оптимизированный)
const StaggerReveal = ({ children, className = "" }) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-40px", amount: 0.1 });
  
  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={isInView ? "visible" : "hidden"}
      variants={staggerContainer}
      className={className}
      // Оптимизация: отключаем layout анимации
      layout={false}
    >
      {children}
    </motion.div>
  );
};

/* --- Spark Canvas Animation (Optimized) --- */

const SparkCanvas = () => {
  const canvasRef = useRef(null);
  const rafRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let width = window.innerWidth;
    let height = window.innerHeight;
    canvas.width = width;
    canvas.height = height;

    const particles = [];
    const particleCount = 80; // Уменьшено для производительности

    // Pre-calculated colors для избежания Math.random() в draw loop
    const preCalcColors = Array.from({ length: 20 }, () => ({
      g1: Math.floor(Math.random() * 80 + 150),
      b1: Math.floor(Math.random() * 50),
      g2: Math.floor(Math.random() * 80 + 100),
      b2: Math.floor(Math.random() * 30)
    }));

    class Particle {
      constructor() {
        this.colorIndex = Math.floor(Math.random() * preCalcColors.length);
        this.reset();
      }

      reset() {
        this.x = Math.random() * width;
        this.y = height + Math.random() * 100;
        this.speed = 1 + Math.random() * 3;
        this.size = 1 + Math.random() * 2.5;
        this.opacity = 0.7 + Math.random() * 0.3;
        this.drift = (Math.random() - 0.5) * 1;
        this.colorIndex = Math.floor(Math.random() * preCalcColors.length);
      }

      update() {
        this.y -= this.speed;
        this.x += this.drift;
        this.opacity -= 0.005;

        if (this.y < -10 || this.opacity <= 0) {
          this.reset();
        }
      }

      draw() {
        const colors = preCalcColors[this.colorIndex];
        ctx.save();
     
        ctx.shadowBlur = this.size * 3;
        ctx.shadowColor = `rgba(255, ${colors.g1}, ${colors.b1}, ${this.opacity * 0.8})`;
        
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, ${colors.g2}, ${colors.b2}, ${this.opacity})`;
        ctx.fill();
        
        ctx.restore();
      }
    }

    for (let i = 0; i < particleCount; i++) {
      particles.push(new Particle());
    }

    let lastTime = 0;
    const targetFPS = 30; // Ограничиваем FPS для экономии ресурсов
    const frameInterval = 1000 / targetFPS;

    function animate(currentTime) {
      rafRef.current = requestAnimationFrame(animate);
      
      const deltaTime = currentTime - lastTime;
      if (deltaTime < frameInterval) return;
      
      lastTime = currentTime - (deltaTime % frameInterval);
      
      ctx.clearRect(0, 0, width, height);
      particles.forEach(p => {
        p.update();
        p.draw();
      });
    }

    rafRef.current = requestAnimationFrame(animate);

    const handleResize = throttle(() => {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width;
      canvas.height = height;
    }, 200);

    window.addEventListener('resize', handleResize, { passive: true });
    return () => {
      window.removeEventListener('resize', handleResize);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  return <canvas ref={canvasRef} className="absolute top-0 left-0 w-full h-full pointer-events-none z-0 mix-blend-screen" />;
};

/* --- Testimonials Carousel Component --- */
const TestimonialsCarousel = ({ testimonials }) => {
  const [emblaRef, emblaApi] = useEmblaCarousel({ 
    loop: true,
    align: 'start',
    slidesToScroll: 1,
    breakpoints: {
      '(min-width: 1024px)': { slidesToScroll: 1 }
    }
  });
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [canScrollPrev, setCanScrollPrev] = useState(false);
  const [canScrollNext, setCanScrollNext] = useState(false);

  const scrollPrev = useCallback(() => {
    if (emblaApi) emblaApi.scrollPrev();
  }, [emblaApi]);

  const scrollNext = useCallback(() => {
    if (emblaApi) emblaApi.scrollNext();
  }, [emblaApi]);

  const scrollTo = useCallback((index) => {
    if (emblaApi) emblaApi.scrollTo(index);
  }, [emblaApi]);

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setSelectedIndex(emblaApi.selectedScrollSnap());
    setCanScrollPrev(emblaApi.canScrollPrev());
    setCanScrollNext(emblaApi.canScrollNext());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    onSelect();
    emblaApi.on('select', onSelect);
    emblaApi.on('reInit', onSelect);
    return () => {
      emblaApi.off('select', onSelect);
      emblaApi.off('reInit', onSelect);
    };
  }, [emblaApi, onSelect]);

  return (
    <>
      {/* Embla Carousel */}
      <div className="overflow-hidden py-8" ref={emblaRef}>
        <div className="flex">
          {testimonials.map((testimonial, index) => (
            <div 
              key={index} 
              className="flex-[0_0_100%] lg:flex-[0_0_33.333%] min-w-0 px-3"
            >
              <motion.div 
                className="group relative h-full"
                whileHover={{ y: -5, transition: { duration: 0.2 } }}
              >
                <FireGlow className="opacity-0 group-hover:opacity-30" />
                <div className="relative bg-neutral-900 rounded-3xl p-6 lg:p-8 border border-neutral-800 flex flex-col min-h-[350px] h-full">
                  <div className="text-red-500 text-4xl lg:text-5xl font-serif leading-none mb-3 lg:mb-4">"</div>
                  <p className="text-gray-300 leading-relaxed mb-6 flex-grow text-sm lg:text-base">
                    {testimonial.text}
                  </p>
                  <div className="border-t border-neutral-800 pt-4 lg:pt-6 flex items-center gap-3 lg:gap-4">
                    {/* Фото */}
                    <div className="w-12 h-12 lg:w-14 lg:h-14 rounded-full bg-neutral-800 border-2 border-neutral-700 flex-shrink-0 overflow-hidden">
                      {testimonial.image ? (
                        <img src={testimonial.image} alt={testimonial.name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-neutral-600 text-lg lg:text-xl font-bold">
                          {testimonial.name.split(' ').map(n => n[0]).join('')}
                        </div>
                      )}
                    </div>
                    <div>
                      <p className="text-white font-bold text-base lg:text-lg">{testimonial.name}</p>
                      <p className="text-red-500 text-sm font-medium">{testimonial.role}</p>
                      <p className="text-gray-500 text-xs lg:text-sm">{testimonial.company}</p>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          ))}
        </div>
      </div>

      {/* Навигация */}
      <ScrollReveal>
        <div className="flex items-center justify-center gap-4 mt-8">
          <motion.button 
            onClick={scrollPrev}
            disabled={!canScrollPrev}
            className="w-12 h-12 bg-neutral-800 rounded-full flex items-center justify-center hover:bg-red-600 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
            whileHover={{ scale: canScrollPrev ? 1.1 : 1 }}
            whileTap={{ scale: canScrollPrev ? 0.95 : 1 }}
          >
            <ChevronLeft size={24} />
          </motion.button>
          
          <div className="flex gap-2">
            {testimonials.map((_, idx) => (
              <motion.button 
                key={idx}
                onClick={() => scrollTo(idx)}
                className={`h-2 rounded-full transition-colors ${
                  idx === selectedIndex 
                    ? 'bg-red-500' 
                    : 'bg-neutral-600 hover:bg-neutral-500'
                }`}
                animate={{ width: idx === selectedIndex ? 24 : 8 }}
                transition={{ duration: 0.3 }}
                whileHover={{ scale: 1.2 }}
              />
            ))}
          </div>
          
          <motion.button 
            onClick={scrollNext}
            disabled={!canScrollNext}
            className="w-12 h-12 bg-neutral-800 rounded-full flex items-center justify-center hover:bg-red-600 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
            whileHover={{ scale: canScrollNext ? 1.1 : 1 }}
            whileTap={{ scale: canScrollNext ? 0.95 : 1 }}
          >
            <ChevronRight size={24} />
          </motion.button>
        </div>
      </ScrollReveal>

      {/* Индикатор свайпа на мобильном */}
      <p className="text-center text-gray-600 text-xs mt-4 lg:hidden">
        Свайпните для просмотра других отзывов
      </p>
    </>
  );
};

/* --- Service Video Carousel Component with Opacity Effect --- */
const TWEEN_FACTOR_BASE = 0.6;

const numberWithinRange = (number, min, max) => 
  Math.min(Math.max(number, min), max);

const ServiceVideoCarousel = ({ videos, serviceTitle }) => {
  const [emblaRef, emblaApi] = useEmblaCarousel({ 
    loop: true,
    align: 'center',
    slidesToScroll: 1,
    dragFree: false,
  });
  const [selectedIndex, setSelectedIndex] = useState(0);
  const tweenFactor = useRef(0);
  const tweenNodes = useRef([]);
  const [slidesInView, setSlidesInView] = useState([]);
  const iframeRefs = useRef([]);

  const scrollPrev = useCallback(() => {
    if (emblaApi) emblaApi.scrollPrev();
  }, [emblaApi]);

  const scrollNext = useCallback(() => {
    if (emblaApi) emblaApi.scrollNext();
  }, [emblaApi]);

  // Функция для остановки всех видео
  const stopAllVideos = useCallback(() => {
    iframeRefs.current.forEach((iframe) => {
      if (iframe && iframe.contentWindow) {
        // Перезагружаем iframe, чтобы остановить видео
        const src = iframe.src;
        iframe.src = '';
        iframe.src = src;
      }
    });
  }, []);

  const setTweenNodes = useCallback((emblaApi) => {
    tweenNodes.current = emblaApi.slideNodes().map((slideNode) => {
      return slideNode.querySelector('.embla__slide__content');
    });
  }, []);

  const setTweenFactor = useCallback((emblaApi) => {
    tweenFactor.current = TWEEN_FACTOR_BASE * emblaApi.scrollSnapList().length;
  }, []);

  const tweenOpacity = useCallback((emblaApi, eventName) => {
    const engine = emblaApi.internalEngine();
    const scrollProgress = emblaApi.scrollProgress();
    const slidesInView = emblaApi.slidesInView();
    const isScrollEvent = eventName === 'scroll';

    emblaApi.scrollSnapList().forEach((scrollSnap, snapIndex) => {
      let diffToTarget = scrollSnap - scrollProgress;
      const slidesInSnap = engine.slideRegistry[snapIndex];

      slidesInSnap.forEach((slideIndex) => {
        if (isScrollEvent && !slidesInView.includes(slideIndex)) return;

        if (engine.options.loop) {
          engine.slideLooper.loopPoints.forEach((loopItem) => {
            const target = loopItem.target();

            if (slideIndex === loopItem.index && target !== 0) {
              const sign = Math.sign(target);

              if (sign === -1) {
                diffToTarget = scrollSnap - (1 + scrollProgress);
              }
              if (sign === 1) {
                diffToTarget = scrollSnap + (1 - scrollProgress);
              }
            }
          });
        }

        const tweenValue = 1 - Math.abs(diffToTarget * tweenFactor.current);
        const opacity = numberWithinRange(tweenValue, 0.3, 1);
        const scale = numberWithinRange(tweenValue, 0.9, 1);
        
        if (tweenNodes.current[slideIndex]) {
          tweenNodes.current[slideIndex].style.opacity = opacity.toString();
          tweenNodes.current[slideIndex].style.transform = `scale(${scale})`;
        }
      });
    });
  }, []);

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    const newIndex = emblaApi.selectedScrollSnap();
    setSelectedIndex(newIndex);
    // Останавливаем все видео при переключении слайда
    stopAllVideos();
  }, [emblaApi, stopAllVideos]);

  useEffect(() => {
    if (!emblaApi) return;

    setTweenNodes(emblaApi);
    setTweenFactor(emblaApi);
    tweenOpacity(emblaApi);

    emblaApi
      .on('reInit', setTweenNodes)
      .on('reInit', setTweenFactor)
      .on('reInit', tweenOpacity)
      .on('scroll', tweenOpacity)
      .on('slideFocus', tweenOpacity)
      .on('select', onSelect);

    return () => {
      emblaApi
        .off('reInit', setTweenNodes)
        .off('reInit', setTweenFactor)
        .off('reInit', tweenOpacity)
        .off('scroll', tweenOpacity)
        .off('slideFocus', tweenOpacity)
        .off('select', onSelect);
    };
  }, [emblaApi, setTweenNodes, setTweenFactor, tweenOpacity, onSelect]);

  return (
    <div className="relative h-full flex items-center">
      {/* Навигационные кнопки */}
      <button 
        onClick={scrollPrev}
        className="absolute left-2 top-1/2 -translate-y-1/2 z-20 w-10 h-10 bg-black/70 hover:bg-red-600 rounded-full flex items-center justify-center transition-colors backdrop-blur-sm"
      >
        <ChevronLeft size={20} />
      </button>
      <button 
        onClick={scrollNext}
        className="absolute right-2 top-1/2 -translate-y-1/2 z-20 w-10 h-10 bg-black/70 hover:bg-red-600 rounded-full flex items-center justify-center transition-colors backdrop-blur-sm"
      >
        <ChevronRight size={20} />
      </button>

      {/* Карусель */}
      <div className="overflow-hidden w-full py-6" ref={emblaRef}>
        <div className="flex gap-6">
          {videos.map((video, i) => (
            <div 
              key={i} 
              className="flex-[0_0_480px] min-w-0"
            >
              <div 
                className="embla__slide__content h-[330px] bg-neutral-800 rounded-xl relative overflow-hidden group/slide cursor-grab active:cursor-grabbing border border-neutral-700 hover:border-red-500/50"
                style={{ 
                  opacity: 1, 
                  transform: 'scale(1)',
                  transition: 'opacity 0.15s ease-out, transform 0.15s ease-out'
                }}
              >
                {video.id && video.id.trim() !== '' ? (
                  // Если есть ID видео - показываем iframe Rutube
                  <iframe 
                    ref={(el) => (iframeRefs.current[i] = el)}
                    src={`https://rutube.ru/play/embed/${video.id}`}
                    className="w-full h-full rounded-xl"
                    frameBorder="0"
                    allow="autoplay; fullscreen"
                    allowFullScreen
                    title={video.title}
                  ></iframe>
                ) : (
                  // Плейсхолдер если ID не заполнен
                  <>
                    <div className="w-full h-full bg-gradient-to-br from-neutral-800 via-neutral-850 to-neutral-900 flex flex-col items-center justify-center">
                      <div className="w-24 h-24 rounded-full bg-neutral-700/50 flex items-center justify-center mb-4 group-hover/slide:bg-red-600/30 transition-colors">
                        <Play className="text-neutral-500 w-12 h-12 group-hover/slide:text-red-400 transition-colors" />
                      </div>
                      <span className="text-neutral-400 text-base font-medium">{video.title}</span>
                      <span className="text-neutral-600 text-sm mt-2"></span>
                    </div>
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover/slide:opacity-100 transition-opacity pointer-events-none" />
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Индикаторы */}
      <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1.5 z-20">
        {videos.map((_, idx) => (
          <button 
            key={idx}
            onClick={() => emblaApi?.scrollTo(idx)}
            className={`h-2 rounded-full transition-all duration-300 ${
              idx === selectedIndex 
                ? 'bg-red-500 w-6' 
                : 'bg-white/30 hover:bg-white/50 w-2'
            }`}
          />
        ))}
      </div>

      {/* Подсказка свайпа */}
      <div className="absolute bottom-2 right-4 text-xs text-white/30 z-10 hidden lg:block">
        ← свайп →
      </div>

      {/* Overlay Gradient */}
      <div className="absolute inset-0 bg-gradient-to-r from-[#050505] via-transparent to-[#050505] pointer-events-none z-10"></div>
    </div>
  );
};

/* --- Team Carousel Component --- */
const TeamCarousel = ({ teamData, setActiveTeamMember }) => {
  const [emblaRef] = useEmblaCarousel({ 
    loop: false,
    align: 'start',
    slidesToScroll: 1,
    breakpoints: {
      '(min-width: 768px)': { slidesToScroll: 2 }
    }
  });

  return (
    <>
      {/* Desktop: Grid */}
      <StaggerReveal className="hidden md:grid md:grid-cols-2 lg:grid-cols-4 gap-6 px-4">
        {teamData.map((member) => (
          <motion.div 
            key={member.id} 
            variants={staggerItem}
            className="group relative cursor-pointer" 
            onClick={() => setActiveTeamMember(member)}
            whileHover={{ y: -10, transition: { duration: 0.3 } }}
          >
            {/* Градиент с правильным радиусом: rounded-2xl (16px) + inset (2px) = 18px */}
            <div className="absolute -inset-0.5 bg-gradient-to-r from-red-600 to-yellow-500 rounded-[18px] blur-md opacity-0 group-hover:opacity-30 transition duration-500 pointer-events-none"></div>
            <div className="relative overflow-hidden rounded-2xl bg-neutral-900 aspect-[3/4]">
              <img src={member.img} alt={member.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent flex flex-col justify-end p-6">
                <h4 className="text-xl font-bold text-white">{member.name}</h4>
                <p className="text-sm text-red-500">{member.role}</p>
                <div className="mt-4 opacity-0 group-hover:opacity-100 transition-opacity transform translate-y-4 group-hover:translate-y-0 text-xs text-gray-300">
                  Нажмите, чтобы узнать больше
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </StaggerReveal>

      {/* Mobile: Carousel */}
      <div className="md:hidden overflow-hidden py-2" ref={emblaRef}>
        <div className="flex">
          {teamData.map((member) => (
            <div 
              key={member.id} 
              className="flex-[0_0_80%] min-w-0 px-3"
            >
              <motion.div 
                className="group relative cursor-pointer h-full"
                onClick={() => setActiveTeamMember(member)}
                whileTap={{ scale: 0.98 }}
              >
                {/* Градиент с правильным радиусом: rounded-2xl (16px) + inset (2px) = 18px */}
                <div className="absolute -inset-0.5 bg-gradient-to-r from-red-600 to-yellow-500 rounded-[18px] blur-md opacity-0 group-hover:opacity-30 transition duration-500 pointer-events-none"></div>
                <div className="relative overflow-hidden rounded-2xl bg-neutral-900 aspect-[3/4]">
                  <img src={member.img} alt={member.name} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent flex flex-col justify-end p-6">
                    <h4 className="text-xl font-bold text-white">{member.name}</h4>
                    <p className="text-sm text-red-500">{member.role}</p>
                    <div className="mt-4 text-xs text-gray-300">
                      Нажмите, чтобы узнать больше
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          ))}
        </div>
      </div>

      {/* Индикатор свайпа на мобильном */}
      <p className="text-center text-gray-600 text-xs mt-4 md:hidden">
        Свайпните для просмотра других участников команды
      </p>
    </>
  );
};

/* --- Main Application --- 
*/

export default function App() {
  const [scrollY, setScrollY] = useState(0);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeTeamMember, setActiveTeamMember] = useState(null);
  const auroraColorStops = useMemo(() => ["#e25e32", "#cf0202", "#ff7300"], []);
  const [phone, setPhone] = useState('');
  const [phoneError, setPhoneError] = useState('');
  const [name, setName] = useState('');
  const [projectDescription, setProjectDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState({ type: '', message: '' });
  const [currentPlateVideo, setCurrentPlateVideo] = useState(0);
  const [isPlatesBriefOpen, setIsPlatesBriefOpen] = useState(false);
  const [platesBriefSubmitting, setPlatesBriefSubmitting] = useState(false);
  const [platesBriefStatus, setPlatesBriefStatus] = useState({ type: '', message: '' });
  const [platesBrief, setPlatesBrief] = useState({
    contactName: '',
    contactInfo: '',
    company: '',
    project: '',
    location: 'Москва/крупный город',
    season: 'Весна',
    weather: 'Солнце',
    timeOfDay: 'День',
    carsCount: 'нет машин',
    carHeight: 'легковая',
    cameraAngle: 'горизонт',
    speed: '',
    duration: '',
    licenseType: 'Неисключительная',
    supervising: 'да',
    stitching: 'да',
    notes: ''
  });
  const [isPrivacyOpen, setIsPrivacyOpen] = useState(false);
  
  // Видео примеры Plates с Rutube (замените на реальные ID видео)
  const plateVideos = [
    { id: '0bf9939bf26845f4c93244c161f50e7c', title: 'Пример всего процесса работы' },
    { id: '7907fcc43c0bc83768ede78e982dc72c', title: 'Наши фоны в кино и рекламе' },
    { id: '8fed3f1f0b9d9a2f39beff582ef9b91a', title: 'Выгода для продюсеров'},
    { id: '58bc3edcfb694e2d38fd3f4f14f5af1c', title: 'Удобство для режиссёров'},
  ];

  // ID видео для блока "Соловей" (вставьте ID видео Rutube)
  const soloveyVideoId = '5613cbfd38afa4b6ab28d3ca843f12cb';

  // ID видео для блока "Система стабилизации Горыныч" (вставьте ID видео Rutube)
  const stabilizationVideoId = '452b2990c39ef3aa481ccddb3e01b80c';

  // Данные отзывов
  const testimonials = [
    {
      text: "Работа с КиноГорыныч — это всегда уверенность в результате. Профессиональный подход, чёткое понимание задач и безупречное качество съёмки.",
      name: "Александр Петров",
      role: "Исполнительный продюсер",
      company: "Кинокомпания «Нон-Стоп Продакшн»",
      image: "" // Добавить ссылку на фото
    },
    {
      text: "Команда КиноГорыныч спасла наш проект, когда сроки горели. Оперативность, техническое оснащение и опыт — на высшем уровне. Съёмка автомобильных сцен с их системой стабилизации превзошла все ожидания.",
      name: "Мария Сидорова",
      role: "Креативный директор",
      company: "Рекламное агентство BBDO",
      image: "" // Добавить ссылку на фото
    },
    {
      text: "Снимали с КиноГорыныч музыкальный клип — результат превзошёл все ожидания. Иван Поморин лично контролировал каждый кадр. Настоящие профессионалы с огнём в глазах и в работе!",
      name: "Дмитрий Нагиев",
      role: "Режиссёр",
      company: "Продакшн-студия «Арт Пикчерс»",
      image: "" // Добавить ссылку на фото
    },
    {
      text: "Уже третий год работаем с КиноГорыныч над рекламными кампаниями. Качество картинки на уровне западных студий, при этом команда всегда находит решение в рамках бюджета. Рекомендую всем, кто ценит профессионализм.",
      name: "Елена Козлова",
      role: "Маркетинг-директор",
      company: "Сбербанк",
      image: "" // Добавить ссылку на фото
    },
    {
      text: "Заказывали съёмку корпоративного фильма к юбилею компании. КиноГорыныч превратили обычный заказ в настоящее кино! Многокамерная съёмка, дроны, профессиональный свет — всё на высшем уровне.",
      name: "Игорь Волков",
      role: "Генеральный директор",
      company: "ГК «Ростех»",
      image: "" // Добавить ссылку на фото
    }
  ];

  const handlePlatesBriefChange = (field, value) => {
    setPlatesBrief(prev => ({ ...prev, [field]: value }));
  };

  const sendPlatesBrief = async (e) => {
    e.preventDefault();
    
    if (!platesBrief.contactName.trim() || !platesBrief.contactInfo.trim()) {
      setPlatesBriefStatus({ type: 'error', message: 'Заполните контактные данные' });
      return;
    }

    setPlatesBriefSubmitting(true);
    setPlatesBriefStatus({ type: '', message: '' });

    // Формируем сообщение в Markdown для удобного копирования
    const message = `
🎬 *БРИФ НА СЪЁМКУ ВИДЕОФОНОВ*

\`\`\`
Параметр | Значение
---------|----------
Имя | ${platesBrief.contactName}
Контакт | ${platesBrief.contactInfo}
Контрагент | ${platesBrief.company || 'не указано'}
Проект | ${platesBrief.project || 'не указано'}
Местность | ${platesBrief.location}
Время года | ${platesBrief.season}
Погода | ${platesBrief.weather}
Время суток | ${platesBrief.timeOfDay}
Кол-во машин | ${platesBrief.carsCount}
Высота машины | ${platesBrief.carHeight}
Ракурс камеры | ${platesBrief.cameraAngle}
Скорость | ${platesBrief.speed || 'не указано'} км/ч
Общий хрон | ${platesBrief.duration || 'не указано'}
Лицензия | ${platesBrief.licenseType}
Супервайзинг | ${platesBrief.supervising}
Сшивка фонов | ${platesBrief.stitching}
\`\`\`

📝 *Примечания:*
${platesBrief.notes || 'нет'}

📅 _${new Date().toLocaleString('ru-RU')}_
    `.trim();

    try {
      const TELEGRAM_BOT_TOKEN = import.meta.env.VITE_TELEGRAM_BOT_TOKEN;
      const TELEGRAM_CHAT_ID = import.meta.env.VITE_TELEGRAM_CHAT_ID;

      if (!TELEGRAM_BOT_TOKEN || !TELEGRAM_CHAT_ID) {
        throw new Error('Telegram configuration missing');
      }

      const response = await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: TELEGRAM_CHAT_ID,
          text: message,
          parse_mode: 'Markdown',
        }),
      });

      const data = await response.json();

      if (data.ok) {
        setPlatesBriefStatus({ type: 'success', message: 'Бриф отправлен! Мы свяжемся с вами.' });
        setTimeout(() => {
          setIsPlatesBriefOpen(false);
          setPlatesBrief({
            contactName: '', contactInfo: '', company: '', project: '',
            location: 'Москва/крупный город', season: 'Весна', weather: 'Солнце',
            timeOfDay: 'День', carsCount: 'нет машин', carHeight: 'легковая',
            cameraAngle: 'горизонт', speed: '', duration: '',
            licenseType: 'Неисключительная', supervising: 'да', stitching: 'да', notes: ''
          });
          setPlatesBriefStatus({ type: '', message: '' });
        }, 2000);
      } else {
        throw new Error(data.description || 'Ошибка отправки');
      }
    } catch (error) {
      console.error('Telegram send error:', error);
      setPlatesBriefStatus({ type: 'error', message: 'Ошибка отправки. Позвоните нам.' });
    } finally {
      setPlatesBriefSubmitting(false);
    }
  };

  const formatPhoneNumber = (value) => {
    // Удаляем все кроме цифр
    let digits = value.replace(/\D/g, '');
    
    // Если пусто, возвращаем пустую строку
    if (digits.length === 0) {
      return '';
    }
    
    // Если начинается с 8, заменяем на 7
    if (digits.startsWith('8')) {
      digits = '7' + digits.slice(1);
    }
    
    // Если не начинается с 7, добавляем 7
    if (!digits.startsWith('7')) {
      digits = '7' + digits;
    }
    
    // Ограничиваем до 11 цифр (7 + 10 цифр номера)
    digits = digits.slice(0, 11);
    
    // Форматируем номер
    let formatted = '+7';
    if (digits.length > 1) {
      formatted += ' (' + digits.slice(1, 4);
    }
    if (digits.length >= 4) {
      formatted += ')';
    }
    if (digits.length > 4) {
      formatted += ' ' + digits.slice(4, 7);
    }
    if (digits.length > 7) {
      formatted += '-' + digits.slice(7, 9);
    }
    if (digits.length > 9) {
      formatted += '-' + digits.slice(9, 11);
    }
    
    return formatted;
  };

  const handlePhoneChange = (e) => {
    const formatted = formatPhoneNumber(e.target.value);
    setPhone(formatted);
    
    // Валидация - должно быть 11 цифр
    const digits = formatted.replace(/\D/g, '');
    if (digits.length === 11) {
      setPhoneError('');
    } else if (digits.length > 0) {
      setPhoneError('Введите полный номер телефона');
    } else {
      setPhoneError('');
    }
  };

  const handlePhoneFocus = () => {
    if (phone === '') {
      setPhone('+7 (');
    }
  };

  const handlePhoneBlur = () => {
    // Если только +7 ( — очищаем
    if (phone === '+7 (' || phone === '+7') {
      setPhone('');
      setPhoneError('');
    }
  };

  const sendToTelegram = async (e) => {
    e.preventDefault();
    
    // Валидация
    if (!name.trim()) {
      setSubmitStatus({ type: 'error', message: 'Пожалуйста, введите ваше имя' });
      return;
    }
    
    const phoneDigits = phone.replace(/\D/g, '');
    if (phoneDigits.length !== 11) {
      setSubmitStatus({ type: 'error', message: 'Пожалуйста, введите корректный номер телефона' });
      return;
    }
    
    if (!projectDescription.trim()) {
      setSubmitStatus({ type: 'error', message: 'Пожалуйста, расскажите о проекте' });
      return;
    }

    setIsSubmitting(true);
    setSubmitStatus({ type: '', message: '' });

    // Формируем сообщение
    const message = `
🎬 *Новая заявка с сайта КиноГорыныч*

👤 *Имя:* ${name}
📱 *Телефон:* ${phone}

📝 *О проекте:*
${projectDescription}

📅 _${new Date().toLocaleString('ru-RU')}_
    `.trim();

    try {
      const TELEGRAM_BOT_TOKEN = import.meta.env.VITE_TELEGRAM_BOT_TOKEN;
      const TELEGRAM_CHAT_ID = import.meta.env.VITE_TELEGRAM_CHAT_ID;

      if (!TELEGRAM_BOT_TOKEN || !TELEGRAM_CHAT_ID) {
        throw new Error('Telegram configuration missing');
      }

      const response = await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          chat_id: TELEGRAM_CHAT_ID,
          text: message,
          parse_mode: 'Markdown',
        }),
      });

      const data = await response.json();

      if (data.ok) {
        setSubmitStatus({ type: 'success', message: 'Заявка отправлена! Мы свяжемся с вами в ближайшее время.' });
        // Очищаем форму
        setName('');
        setPhone('');
        setProjectDescription('');
      } else {
        throw new Error(data.description || 'Ошибка отправки');
      }
    } catch (error) {
      console.error('Telegram send error:', error);
      setSubmitStatus({ type: 'error', message: 'Ошибка отправки. Попробуйте позвонить нам напрямую.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Throttled scroll handler для лучшей производительности
  useEffect(() => {
    const handleScroll = throttle(() => setScrollY(window.scrollY), 100);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Keyboard navigation: закрытие модалок по Escape
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        if (isPrivacyOpen) setIsPrivacyOpen(false);
        if (activeTeamMember) setActiveTeamMember(null);
        if (isPlatesBriefOpen) setIsPlatesBriefOpen(false);
        if (isMenuOpen) setIsMenuOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isPrivacyOpen, activeTeamMember, isPlatesBriefOpen, isMenuOpen]);

  const teamData = [
    {
      id: 1,
      name: "Иван Поморин",
      role: "Основатель, Главный оператор",
      img: "https://horizon-vp.ru/wp-content/uploads/2025/02/about-photo-3-1.webp",
      bio: "Основатель компаний «КиноГорыныч» и «Поморин И. Ко». Член правления Гильдии кинооператоров России. Доцент ГИТР, преподаватель ВГИК и МШК. Учился у мастеров Голливуда (Laszlo Kovacs, Vilmos Zsigmond). Снял более 52 игровых работ («Скорая Помощь», «Блиндаж»). Амбассадор Nanlite."
    },
    { id: 2, name: "Алексей Смирнов", role: "Технический директор", img: "https://placehold.co/400x500/1a1a1a/FFF?text=Alexey", bio: "Гуру инженерных решений. Отвечает за разработку уникальных ригов и интеграцию VR-технологий." },
    { id: 3, name: "Мария Волкова", role: "Исполнительный продюсер", img: "https://placehold.co/400x500/1a1a1a/FFF?text=Maria", bio: "Человек, который делает невозможное возможным в рамках бюджета и дедлайнов." },
    { id: 4, name: "Дмитрий Козлов", role: "Режиссер монтажа", img: "https://placehold.co/400x500/1a1a1a/FFF?text=Dmitry", bio: "Видит ритм и драматургию там, где другие видят просто набор кадров." },
  ];

  const services = [
    { 
      title: "Музыкальные Клипы", 
      desc: "Визуальные миры, раскрывающие философию трека.", 
      quote: "Я люблю музыку, поэтому съемка клипов для меня — это настоящий драйв!", 
      author: "И.А. Поморин",
      videos: [
        { id: "962e55c1fed1ffdf774a0d48dfdc57b4", title: "Клип 1" },  // Вставьте ID видео Rutube
        { id: "08c7513d18f12de1bede54801e2354ff", title: "Клип 2" },
        { id: "daa750f156f7db418201bc58e68da76d", title: "Клип 3" },
        { id: "6a976d31b9b04e19a71ad948a226efdd", title: "Клип 4" },
        { id: "29eed5dfd3ba9d54d44a4d14d41f5890", title: "Клип 5" },
      ]
    },
    { 
      title: "Рекламные Ролики", 
      desc: "Продающие истории с киношной картинкой.", 
      quote: "В нашем мире внимание — главный ресурс! Мы снимаем контент, который цепляет.", 
      author: "КиноГорыныч",
      videos: [
        { id: "19e2bbb3658059a43469c67ec142b745", title: "Реклама 1" },
        { id: "8776b17768745b2e3d480bd14eb6a671", title: "Реклама 2" },
        { id: "f2a628f4429d0f86dae894af7714b688", title: "Реклама 3" },
        { id: "d95a8389f3efbb052925c8edc73e41b2", title: "Реклама 4" },
        { id: "b51229cdb3d337bf08e009f0a48bfb47", title: "Реклама 5" },
      ]
    },
    { 
      title: "Имиджевые Фильмы", 
      desc: "Масштабные видеопортреты компаний.", 
      quote: "Транслируем ваши ценности, миссию и статус через киноязык.", 
      author: "КиноГорыныч",
      videos: [
        { id: "", title: "Имидж 1" },
        { id: "", title: "Имидж 2" },
        { id: "", title: "Имидж 3" },
        { id: "", title: "Имидж 4" },
        { id: "", title: "Имидж 5" },
        { id: "", title: "Имидж 6" },
      ]
    },
    { 
      title: "Многокамерная съемка", 
      desc: "Драйв и масштаб ваших событий. До 8 камер, прямой эфир, трансляции.", 
      quote: "Прямой эфир — это ответственное мероприятие, где нет права на ошибку.", 
      author: "КиноГорыныч",
      videos: [
        { id: "", title: "Мероприятие 1" },
        { id: "", title: "Мероприятие 2" },
        { id: "", title: "Мероприятие 3" },
        { id: "", title: "Мероприятие 4" },
        { id: "", title: "Мероприятие 5" },
        { id: "", title: "Мероприятие 6" },
      ]
    },
    { 
      title: "Social Media", 
      desc: "Динамичные ролики и тренды без потери качества.", 
      quote: "Адаптируем большой продакшн под экраны смартфонов.", 
      author: "КиноГорыныч",
      videos: [
        { id: "", title: "SMM 1" },
        { id: "", title: "SMM 2" },
        { id: "", title: "SMM 3" },
        { id: "", title: "SMM 4" },
        { id: "", title: "SMM 5" },
        { id: "", title: "SMM 6" },
      ]
    },
    { 
      title: "Документальное кино", 
      desc: "Глубокие истории и смыслы.", 
      quote: "Истории, которые вдохновляют зрителя и остаются в вечности.", 
      author: "КиноГорыныч",
      videos: [
        { id: "", title: "Док 1" },
        { id: "", title: "Док 2" },
        { id: "", title: "Док 3" },
        { id: "", title: "Док 4" },
        { id: "", title: "Док 5" },
        { id: "", title: "Док 6" },
      ]
    },
  ];

  return (
    <div className="bg-[#050505] min-h-screen text-gray-200 font-sans selection:bg-red-900 selection:text-white overflow-x-hidden">
      <GlobalStyles />
      
      {/* --- Sticky Header --- */}
      <motion.nav 
        className={`fixed top-4 left-1/2 transform -translate-x-1/2 w-[95%] md:w-[90%] z-50 transition-all duration-300 ${scrollY > 50 ? 'bg-neutral-900/80 backdrop-blur-md shadow-lg shadow-red-900/10' : 'bg-transparent'} rounded-full px-6 py-4 border border-white/5`}
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.4, delay: 0.1, ease: [0.25, 0.1, 0.25, 1] }}
      >
        <div className="flex justify-between items-center">
          <a 
            href="#" 
            className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity"
            onClick={(e) => {
              e.preventDefault();
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          >
            <img src="/gorh.png" alt="КиноГорыныч" className="w-8 h-8 object-contain" />
            <span className="text-xl font-bold text-white tracking-wider">КИНО<span className="text-red-500">ГОРЫНЫЧ</span></span>
          </a>
          
          <div className="hidden md:flex gap-8 text-sm font-medium text-gray-300">
            {[
              { href: 'about', label: 'О нас' },
              { href: 'services', label: 'Услуги' },
              { href: 'tech', label: 'Технологии' },
              { href: 'team', label: 'Команда' }
            ].map((link, idx) => (
              <motion.a 
                key={link.href}
                href={`#${link.href}`} 
                className="hover:text-red-500 transition-colors"
                whileHover={{ y: -2 }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 + idx * 0.05, duration: 0.3 }}
              >
                {link.label}
              </motion.a>
            ))}
          </div>

          <div className="flex items-center gap-4">
             <motion.a 
               href="#contact" 
               className="hidden md:block bg-white text-black px-5 py-2 rounded-full font-bold hover:bg-gray-200 transition-colors text-sm"
               whileHover={{ scale: 1.05 }}
               whileTap={{ scale: 0.95 }}
               initial={{ opacity: 0 }}
               animate={{ opacity: 1 }}
               transition={{ delay: 0.4, duration: 0.3 }}
             >
              Связаться
            </motion.a>
            <button className="md:hidden text-white" onClick={() => setIsMenuOpen(!isMenuOpen)}>
              {isMenuOpen ? <X /> : <Menu />}
            </button>
          </div>
        </div>
      </motion.nav>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-40 bg-black/95 backdrop-blur-xl flex flex-col items-center justify-center gap-8 text-2xl font-bold"
          >
            {[
              { href: 'about', label: 'О нас' },
              { href: 'services', label: 'Услуги' },
              { href: 'tech', label: 'Технологии' },
              { href: 'team', label: 'Команда' }
            ].map((link, idx) => (
              <motion.a 
                key={link.href}
                href={`#${link.href}`}
                onClick={() => setIsMenuOpen(false)}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                whileHover={{ scale: 1.1, color: '#ef4444' }}
              >
                {link.label}
              </motion.a>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* --- Hero Section --- */}
      <header className="relative h-screen flex items-center justify-center overflow-hidden bg-[#050505]">
        <div className="absolute inset-0 w-full h-full bg-[#050505]">
          <Aurora
            colorStops={auroraColorStops}
            blend={0.74}
            amplitude={1.0}
            speed={1.1}
          />
        </div>
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#050505]/50 to-[#050505] z-10"></div>
        
        <motion.div 
          className="relative z-20 text-center px-4 max-w-5xl mx-auto"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        >
          <motion.h1 
            className="text-5xl md:text-7xl lg:text-9xl font-black text-white mb-6 leading-none tracking-tighter"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15, duration: 0.5, ease: [0.25, 0.1, 0.25, 1] }}
          >
            КИНО<br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-600 via-orange-500 to-yellow-500">ГОРЫНЫЧ</span>
          </motion.h1>
          <motion.p 
            className="text-xl md:text-2xl text-gray-300 max-w-3xl mx-auto mb-10 leading-relaxed"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.35, duration: 0.4 }}
          >
            Эксперт в создании визуального контента любого уровня сложности. <br/>
            <span className="text-red-400">Огонь в каждом кадре.</span>
          </motion.p>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.55, duration: 0.4 }}
          >
            <PrimaryButton text="Смотреть Шоурил" href="https://rutube.ru/video/9124225796b65d2adfc0ab186798b1d2/?r=wd" />
          </motion.div>
        </motion.div>
      </header>

      {/* --- About Us (Scroll Bento) --- */}
      <section id="about" className="py-24 px-4 md:px-8 max-w-7xl mx-auto">
        <ScrollReveal>
          <SectionTitle subtitle="Кто мы">
            От масштабного кино до <br/><span className="text-neutral-500">виртуального продакшена</span>
          </SectionTitle>
        </ScrollReveal>

        <StaggerReveal className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <motion.div variants={staggerItem} className="col-span-1 md:col-span-2">
            <BentoCard colSpan="" className="min-h-[300px] h-full">
              <div>
                <div className="w-12 h-12 bg-red-600 rounded-full flex items-center justify-center mb-6">
                  <Film className="text-white" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-4">20 лет на площадке</h3>
                <p className="text-gray-400">Мы одинаково профессионально снимаем камерные интервью и масштабные шоу на стадионах. В нашем арсенале — мастерство классической школы и безупречное владение многокамерной съемкой.</p>
              </div>
              <div className="mt-8 text-8xl font-black text-white/5 absolute -bottom-4 -right-4 select-none">20</div>
            </BentoCard>
          </motion.div>

          <motion.div variants={staggerItem} className="col-span-1 md:col-span-2">
            <BentoCard colSpan="" className="h-full">
              <div>
                <div className="w-12 h-12 bg-yellow-600 rounded-full flex items-center justify-center mb-6">
                  <Camera className="text-white" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-4">4K HDR и Спецтехника</h3>
                <p className="text-gray-400">Передовое оборудование для сложных постановочных кадров. Каждое движение камеры выверено, а качество изображения соответствует мировым стандартам.</p>
              </div>
            </BentoCard>
          </motion.div>

          <motion.div variants={staggerItem}>
            <BentoCard className="bg-gradient-to-br from-neutral-900 to-neutral-800 h-full">
              <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center mb-6">
                <Zap className="text-white" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">VR & Virtual Prod</h3>
              <p className="text-sm text-gray-400">Идеальная сшивка панорам и интеграция графики. Погружение в реальность.</p>
            </BentoCard>
          </motion.div>

          <motion.div variants={staggerItem}>
            <BentoCard className="h-full">
              <div className="w-12 h-12 bg-green-600 rounded-full flex items-center justify-center mb-6">
                <Users className="text-white" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Гибкий бюджет</h3>
              <p className="text-sm text-gray-400">Подбираем оптимальный комплект техники и команду под задачу. Прозрачное ценообразование.</p>
            </BentoCard>
          </motion.div>
        </StaggerReveal>
      </section>

      {/* --- Approach --- */}
      <section className="py-24 bg-neutral-900/30 border-y border-neutral-800">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16 items-center">
                <ScrollReveal variants={fadeInLeft}>
                     <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">
                        Правила большого кино <br/>в каждом проекте
                    </h2>
                </ScrollReveal>
                <ScrollReveal variants={fadeInRight}>
                    <p className="text-lg text-gray-400">
                        От сценария с глубокой драматургией до цветокоррекции по голливудским стандартам. Мы не идем на компромиссы в качестве кадра и звука — для нас важен каждый пиксель.
                    </p>
                </ScrollReveal>
            </div>

            <StaggerReveal className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {[
                    {title: "Честная смета", text: "Фиксируем финальную стоимость после брифа. Никаких скрытых платежей."},
                    {title: "Железные дедлайны", text: "График производства закреплен в договоре. Без задержек и оправданий."},
                    {title: "Команда экспертов", text: "Только профи с многолетним опытом. Никаких новичков на площадке."}
                ].map((item, idx) => (
                    <motion.div 
                      key={idx} 
                      variants={staggerItem}
                      className="p-8 border border-neutral-800 rounded-2xl hover:border-red-500/50 transition-colors group"
                      whileHover={{ y: -5, transition: { duration: 0.2 } }}
                    >
                        <div className="text-red-500 mb-4 font-mono">0{idx + 1}</div>
                        <h4 className="text-xl font-bold text-white mb-3 group-hover:text-red-400 transition-colors">{item.title}</h4>
                        <p className="text-gray-400 text-sm leading-relaxed">{item.text}</p>
                    </motion.div>
                ))}
            </StaggerReveal>
            
            <ScrollReveal className="mt-12 text-center">
                 <PrimaryButton text="Расскажите о своем проекте" href="#contact" />
            </ScrollReveal>
        </div>
      </section>

      {/* --- Services (Horizontal Narrative) --- */}
      <section id="services" className="py-24">
        <ScrollReveal className="max-w-7xl mx-auto px-4 mb-20">
           <SectionTitle subtitle="Наши услуги">Продакшн <span className="text-red-500">полного цикла</span></SectionTitle>
        </ScrollReveal>

        <div className="flex flex-col gap-32">
            {services.map((service, index) => (
                <ScrollReveal key={index} variants={index % 2 === 0 ? fadeInLeft : fadeInRight}>
                    <div className="relative group">
                        <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center relative z-10">
                            {/* Text Side */}
                            <motion.div 
                              className={`lg:col-span-5 ${index % 2 === 1 ? 'lg:order-2' : ''}`}
                              initial={{ opacity: 0, x: index % 2 === 0 ? -30 : 30 }}
                              whileInView={{ opacity: 1, x: 0 }}
                              viewport={{ once: true }}
                              transition={{ duration: 0.6, delay: 0.2 }}
                            >
                                <div className="text-red-500 font-mono mb-4 text-sm">УСЛУГА #{index + 1}</div>
                                <h3 className="text-4xl font-bold text-white mb-6">{service.title}</h3>
                                <blockquote className="border-l-2 border-red-500 pl-6 italic text-gray-400 mb-8 text-lg">
                                    "{service.quote}"
                                    <footer className="text-red-400 text-sm mt-2 not-italic font-bold">— {service.author}</footer>
                                </blockquote>
                                <p className="text-gray-300 mb-8">{service.desc}</p>
                                <p className="text-sm font-bold text-white/50 mb-8 uppercase tracking-widest text-xs">
                                    Мы поднимаем ваш проект до уровня кино
                                </p>
                                <a href="#contact" className="text-white border-b border-red-500 pb-1 hover:text-red-500 transition-colors">Обсудить проект &rarr;</a>
                            </motion.div>

                            {/* Visual Side (Swipeable Video Carousel) */}
                            <motion.div 
                              className={`lg:col-span-7 overflow-hidden rounded-3xl relative h-[300px] md:h-[400px] bg-neutral-900 border border-neutral-800 ${index % 2 === 1 ? 'lg:order-1' : ''}`}
                              initial={{ opacity: 0, scale: 0.95 }}
                              whileInView={{ opacity: 1, scale: 1 }}
                              viewport={{ once: true }}
                              transition={{ duration: 0.6, delay: 0.3 }}
                            >
                                <ServiceVideoCarousel 
                                  videos={service.videos} 
                                  serviceTitle={service.title} 
                                />
                            </motion.div>
                        </div>
                    </div>
                </ScrollReveal>
            ))}
        </div>
      </section>

      {/* --- Tech Block: Virtual Production & Solovey --- */}
      <section id="tech" className="py-24 bg-neutral-900 text-white relative overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-1/2 h-full bg-red-900/5 blur-3xl rounded-full pointer-events-none"></div>

        <div className="max-w-7xl mx-auto px-4 relative z-10">
            <ScrollReveal>
              <SectionTitle subtitle="Технологии">Инновации <br/>от КиноГорыныч</SectionTitle>
            </ScrollReveal>
            
            {/* Tech 1: VR Production */}
            <div className="grid md:grid-cols-2 gap-12 mb-32 items-center">
                <ScrollReveal variants={fadeInLeft} className="space-y-6">
                    <h3 className="text-3xl font-bold text-red-500">Виртуальный продакшн & Стабилизация</h3>
                    <p className="text-gray-300 leading-relaxed">
                        Мы представляем лучшее решение для съемки фонов под CG или VR. Наш архив кинофонов и уникальные технологии позволяют снимать автомобильные сцены на высшем уровне.
                    </p>
                    <ul className="space-y-4 text-gray-400">
                        <li className="flex items-start gap-3">
                            <Zap className="w-6 h-6 text-yellow-500 flex-shrink-0" />
                            <span>Уникальная стабилизация «Горыныч»: синхронизация 9-12 камер, съемка 360°.</span>
                        </li>
                        <li className="flex items-start gap-3">
                            <Zap className="w-6 h-6 text-yellow-500 flex-shrink-0" />
                            <span>Риги для любой задачи: машины, поезда, корабли, самолеты.</span>
                        </li>
                        <li className="flex items-start gap-3">
                            <Zap className="w-6 h-6 text-yellow-500 flex-shrink-0" />
                            <span>Гибкое ценообразование под ваши задачи.</span>
                        </li>
                    </ul>
                </ScrollReveal>
                <ScrollReveal variants={fadeInRight}>
                  <div className="relative h-[400px] rounded-3xl overflow-hidden border border-red-900/30 group">
                      {stabilizationVideoId && stabilizationVideoId.trim() !== '' ? (
                        // Если есть ID видео - показываем iframe Rutube
                        <iframe 
                          src={`https://rutube.ru/play/embed/${stabilizationVideoId}`}
                          className="w-full h-full rounded-3xl"
                          frameBorder="0"
                          allow="autoplay; fullscreen"
                          allowFullScreen
                          title="Система стабилизации Горыныч"
                        ></iframe>
                      ) : (
                        // Плейсхолдер если ID не заполнен
                        <>
                          <img src="https://placehold.co/800x600/111/444?text=VR+Rig+Setup" className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700" alt="Rig" />
                          <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black to-transparent pointer-events-none">
                              <p className="text-xl font-bold">Система стабилизации "Горыныч"</p>
                          </div>
                        </>
                      )}
                  </div>
                </ScrollReveal>
            </div>

            {/* Tech 2: Solovey */}
            <ScrollReveal variants={scaleIn}>
              <div className="rounded-3xl bg-[#0a0a0a] border border-neutral-800 p-8 md:p-12">
                   <div className="flex flex-col lg:flex-row gap-12">
                      <motion.div 
                        className="lg:w-1/2"
                        initial={{ opacity: 0, x: -30 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6, delay: 0.2 }}
                      >
                          <div className="inline-block bg-blue-900/30 text-blue-400 px-3 py-1 rounded text-xs uppercase mb-4">Best Startup 2023 Award</div>
                          <h3 className="text-4xl font-bold mb-6">Рейндифлектор <span className="text-blue-500">"Соловей"</span></h3>
                          <p className="text-gray-400 mb-6">
                              Проблема: Дождь и снег портят оптику и отменяют съемки.<br/>
                              Решение: Вращающийся фильтр (6000 об/мин) с гидрофобным покрытием, отводящий воду центробежной силой.
                          </p>
                          <blockquote className="text-xl font-medium text-white mb-6">
                              "КиноГорыныч признан лучшим стартапом в области кино-инноваций по городу Москве в 2023 году!"
                          </blockquote>
                          <div className="grid grid-cols-2 gap-4 text-sm text-gray-500">
                               <div>• Питание 24 вольта</div>
                               <div>• LEMO 302 разъем</div>
                               <div>• Стекло 82 мм</div>
                               <div>• Всепогодный</div>
                          </div>
                      </motion.div>
                      <motion.div 
                        className="lg:w-1/2 relative min-h-[300px] group"
                        initial={{ opacity: 0, x: 30 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6, delay: 0.3 }}
                      >
                           {soloveyVideoId && soloveyVideoId.trim() !== '' ? (
                             // Если есть ID видео - показываем iframe Rutube
                             <div className="absolute inset-0 bg-neutral-800 rounded-2xl overflow-hidden">
                               <iframe 
                                 src={`https://rutube.ru/play/embed/${soloveyVideoId}`}
                                 className="w-full h-full rounded-2xl"
                                 frameBorder="0"
                                 allow="autoplay; fullscreen"
                                 allowFullScreen
                                 title="Рейндифлектор Соловей"
                               ></iframe>
                             </div>
                           ) : (
                             // Плейсхолдер если ID не заполнен
                             <div className="absolute inset-0 bg-neutral-800 rounded-2xl overflow-hidden">
                                <img src="https://placehold.co/800x600/001/333?text=Rain+Deflector" className="w-full h-full object-cover opacity-60 group-hover:opacity-100 transition-opacity duration-500" alt="Solovey" />
                                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                    <div className="bg-black/70 backdrop-blur-md px-6 py-4 rounded-xl border border-white/10 group-hover:scale-110 transition-transform">
                                        <span className="text-blue-400 font-mono animate-pulse">1000-6000 RPM</span>
                                    </div>
                                </div>
                             </div>
                           )}
                      </motion.div>
                   </div>
              </div>
            </ScrollReveal>

            <ScrollReveal>
              <div className="mt-16 bg-gradient-to-r from-neutral-900 to-neutral-800 p-8 lg:p-12 rounded-3xl border border-neutral-700">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                      {/* Текстовый блок */}
                      <motion.div
                        initial={{ opacity: 0, x: -30 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6, delay: 0.2 }}
                      >
                          <div className="inline-block bg-orange-900/30 text-orange-400 px-3 py-1 rounded text-xs uppercase mb-4">VR Production</div>
                          <h3 className="text-3xl lg:text-4xl font-bold mb-6">Plates для <span className="text-orange-400">виртуального продакшена</span></h3>
                          <p className="text-gray-400 mb-6 text-lg">
                              Библиотека готовых панорамных видеофонов для LED-экранов и хромакей-студий.
                          </p>
                          <p className="text-gray-400 mb-8">
                              Годы опыта позволили нам отточить каждую деталь процесса. Продюсеры избавляются от головной боли, 
                              а операторы и режиссёры получают идеальный результат с первого дубля.
                          </p>
                          <div className="grid grid-cols-2 gap-4 text-sm text-gray-500 mb-8">
                              <div>• 8K разрешение</div>
                              <div>• 360° панорамы</div>
                              <div>• Бесшовный луп</div>
                              <div>• RAW исходники</div>
                          </div>
                          <div className="flex flex-col sm:flex-row gap-4">
                              <motion.button 
                                onClick={() => setIsPlatesBriefOpen(true)} 
                                className="relative inline-flex group w-fit"
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                              >
                                <div className="absolute transition-all duration-1000 opacity-70 inset-0 bg-gradient-to-r from-[#FF4D4D] via-[#F9CB28] to-[#FF4D4D] rounded-full blur-md group-hover:opacity-100 group-hover:blur-lg group-hover:duration-200 animate-tilt"></div>
                                <span className="relative inline-flex items-center justify-center px-8 py-4 text-lg font-bold text-white transition-all duration-200 bg-neutral-900 rounded-full border border-neutral-700 group-hover:bg-neutral-800">
                                  Заказать съёмку
                                  <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                </span>
                              </motion.button>
                              <SecondaryButton text="Получить готовые видеофоны" href="#contact" />
                          </div>
                      </motion.div>
                      
                      {/* Видео карусель */}
                      <motion.div 
                        className="relative"
                        initial={{ opacity: 0, x: 30 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6, delay: 0.3 }}
                      >
                          <div className="aspect-video bg-black rounded-2xl overflow-hidden border border-neutral-700">
                              <iframe 
                                  src={`https://rutube.ru/play/embed/${plateVideos[currentPlateVideo].id}`}
                                  className="w-full h-full"
                                  frameBorder="0"
                                  allow="autoplay; fullscreen"
                                  allowFullScreen
                              ></iframe>
                          </div>
                          
                          {/* Навигация */}
                          <div className="flex items-center justify-between mt-4">
                              <motion.button 
                                  onClick={() => setCurrentPlateVideo(prev => prev === 0 ? plateVideos.length - 1 : prev - 1)}
                                  className="w-10 h-10 bg-neutral-800 rounded-full flex items-center justify-center hover:bg-orange-400 transition-colors"
                                  whileHover={{ scale: 1.1 }}
                                  whileTap={{ scale: 0.95 }}
                              >
                                  <ChevronLeft size={20} />
                              </motion.button>
                              
                              <div className="flex gap-2">
                                  {plateVideos.map((_, idx) => (
                                      <motion.button 
                                          key={idx}
                                          onClick={() => setCurrentPlateVideo(idx)}
                                          className={`w-2 h-2 rounded-full transition-colors ${idx === currentPlateVideo ? 'bg-orange-400' : 'bg-neutral-600 hover:bg-neutral-500'}`}
                                          whileHover={{ scale: 1.3 }}
                                      />
                                  ))}
                              </div>
                              
                              <motion.button 
                                  onClick={() => setCurrentPlateVideo(prev => prev === plateVideos.length - 1 ? 0 : prev + 1)}
                                  className="w-10 h-10 bg-neutral-800 rounded-full flex items-center justify-center hover:bg-orange-400 transition-colors"
                                  whileHover={{ scale: 1.1 }}
                                  whileTap={{ scale: 0.95 }}
                              >
                                  <ChevronRight size={20} />
                              </motion.button>
                          </div>
                          
                          <p className="text-center text-sm text-gray-500 mt-2">{plateVideos[currentPlateVideo].title}</p>
                      </motion.div>
                  </div>
              </div>
            </ScrollReveal>
        </div>
      </section>

      {/* --- Team --- */}
      <section id="team" className="py-24 max-w-7xl mx-auto">
        <div className="px-4">
          <ScrollReveal>
            <SectionTitle subtitle="Люди">Команда <span className="text-red-500">Экспертов</span></SectionTitle>
          </ScrollReveal>
          <ScrollReveal>
            <p className="text-gray-400 max-w-3xl mb-12 text-lg">Команда специалистов формируется под сложность ваших задач. Профессиональный подход экономит массу времени и средств.</p>
          </ScrollReveal>
        </div>

        <TeamCarousel teamData={teamData} setActiveTeamMember={setActiveTeamMember} />

        {/* Team Modal */}
        <AnimatePresence>
          {activeTeamMember && (
              <motion.div 
                className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm" 
                onClick={() => setActiveTeamMember(null)}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                  <motion.div 
                    className="bg-neutral-900 rounded-3xl border border-red-900/30 max-w-2xl w-full p-8 relative overflow-hidden" 
                    onClick={e => e.stopPropagation()}
                    initial={{ scale: 0.9, opacity: 0, y: 20 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    exit={{ scale: 0.9, opacity: 0, y: 20 }}
                    transition={{ type: "spring", duration: 0.5 }}
                  >
                      <button className="absolute top-4 right-4 text-gray-400 hover:text-white" onClick={() => setActiveTeamMember(null)}><X /></button>
                      <div className="flex flex-col md:flex-row gap-8">
                          <motion.img 
                            src={activeTeamMember.img} 
                            alt={activeTeamMember.name} 
                            className="w-32 h-32 md:w-48 md:h-48 rounded-full object-cover border-4 border-neutral-800"
                            initial={{ scale: 0.8 }}
                            animate={{ scale: 1 }}
                            transition={{ delay: 0.1 }}
                          />
                          <div>
                              <h3 className="text-3xl font-bold text-white mb-2">{activeTeamMember.name}</h3>
                              <p className="text-red-500 font-mono mb-6">{activeTeamMember.role}</p>
                              <p className="text-gray-300 leading-relaxed mb-6">{activeTeamMember.bio}</p>
                              {activeTeamMember.id === 1 && (
                                  <a href="https://rutube.ru/video/9557a8d928fd480964af0159a60efa11/" target="_blank" rel="noreferrer" className="inline-flex items-center text-white border border-gray-600 rounded-full px-4 py-2 hover:bg-white hover:text-black transition-colors">
                                      <Play className="w-4 h-4 mr-2" /> Смотреть интервью
                                  </a>
                              )}
                          </div>
                      </div>
                  </motion.div>
              </motion.div>
          )}
        </AnimatePresence>
      </section>

      {/* --- Partners Marquee --- */}
      <section className="py-24 bg-gradient-to-b from-[#0a0a0a] to-[#111] overflow-hidden border-t border-b border-neutral-800">
        <ScrollReveal className="max-w-7xl mx-auto px-4 mb-16">
          <SectionTitle subtitle="Доверие">Нам доверяют <span className="text-red-500">лидеры</span></SectionTitle>
        </ScrollReveal>
        
        {/* Gradient overlays for smooth edges */}
        <div className="relative overflow-hidden">
          <div className="absolute left-0 top-0 bottom-0 w-40 bg-gradient-to-r from-[#0a0a0a] to-transparent z-10 pointer-events-none"></div>
          <div className="absolute right-0 top-0 bottom-0 w-40 bg-gradient-to-l from-[#111] to-transparent z-10 pointer-events-none"></div>
          
          <div className="flex animate-scroll-partners gap-4 items-center py-4">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
              <div key={num} className="flex-shrink-0 h-32 w-64 flex items-center justify-center grayscale hover:grayscale-0 opacity-70 hover:opacity-100 transition-all duration-300">
                <img src={`/partners/${num}l.webp`} alt={`Партнёр ${num}`} className="max-h-full max-w-full object-contain" />
              </div>
            ))}
            {/* Duplicate for seamless loop */}
            {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
              <div key={`d-${num}`} className="flex-shrink-0 h-32 w-64 flex items-center justify-center grayscale hover:grayscale-0 opacity-70 hover:opacity-100 transition-all duration-300">
                <img src={`/partners/${num}l.webp`} alt={`Партнёр ${num}`} className="max-h-full max-w-full object-contain" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* --- Testimonials --- */}
      <section className="py-24 bg-[#050505]">
        <div className="max-w-7xl mx-auto px-4">
          <ScrollReveal>
            <SectionTitle subtitle="Отзывы">Что говорят <span className="text-red-500">о нас</span></SectionTitle>
          </ScrollReveal>
          
          <TestimonialsCarousel testimonials={testimonials} />
        </div>
      </section>

      {/* --- Contact & Footer --- */}
      <footer id="contact" className="bg-[#0a0a0a] pt-24 pb-12 px-4 border-t border-neutral-800">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16">
            <ScrollReveal variants={fadeInLeft}>
                <h2 className="text-5xl font-bold text-white mb-8">Давайте сделаем <br/>что-то <span className="text-red-500">великое</span>.</h2>
                <div className="space-y-6 text-lg text-gray-300">
                    <motion.div 
                      className="flex items-center gap-4"
                      initial={{ opacity: 0, x: -20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: 0.1 }}
                    >
                        <Phone className="text-red-500" />
                        <a href="tel:+79250382525" className="hover:text-red-500 transition-colors">+7 (925) 038-25-25</a>
                    </motion.div>
                    <motion.div 
                      className="flex items-center gap-4"
                      initial={{ opacity: 0, x: -20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: 0.2 }}
                    >
                        <Mail className="text-red-500" />
                        <span>hello@kinogorynych.ru</span>
                    </motion.div>
                    <motion.div 
                      className="flex items-center gap-4"
                      initial={{ opacity: 0, x: -20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: 0.3 }}
                    >
                        <MapPin className="text-red-500" />
                        <a href="https://yandex.ru/maps/-/CLh-yMlJ" target="_blank" rel="noopener noreferrer" className="hover:text-red-500 transition-colors">Москва, Алтуфьевское шоссе, 3с1</a>
                    </motion.div>
                    <motion.div 
                      className="mt-6 pt-6 border-t border-neutral-700 text-sm text-gray-400"
                      initial={{ opacity: 0 }}
                      whileInView={{ opacity: 1 }}
                      viewport={{ once: true }}
                      transition={{ delay: 0.4 }}
                    >
                        <p className="font-medium text-gray-300 mb-1">Реквизиты компании</p>
                        <p>ИП Поморин Иван Алексеевич</p>
                        <p>ИНН 771465038725</p>
                    </motion.div>
                </div>
                
                <motion.div 
                  className="flex gap-4 mt-12"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.5 }}
                >
                     <motion.a 
                       href="https://t.me/kino_gorynich" 
                       target="_blank" 
                       rel="noopener noreferrer" 
                       className="w-12 h-12 bg-neutral-800 rounded-full flex items-center justify-center hover:bg-red-600 transition-colors cursor-pointer"
                       whileHover={{ scale: 1.1, rotate: 5 }}
                       whileTap={{ scale: 0.95 }}
                     >
                       <Send />
                     </motion.a>
                     <motion.a 
                       href="https://rutube.ru/channel/129861/" 
                       target="_blank" 
                       rel="noopener noreferrer" 
                       className="w-12 h-12 bg-neutral-800 rounded-full flex items-center justify-center hover:bg-blue-500 transition-colors cursor-pointer"
                       whileHover={{ scale: 1.1, rotate: -5 }}
                       whileTap={{ scale: 0.95 }}
                     >
                       <YoutubeIcon />
                     </motion.a>
                     <motion.a 
                       href="https://vk.com/kino_gorynich" 
                       target="_blank" 
                       rel="noopener noreferrer" 
                       className="w-12 h-12 bg-neutral-800 rounded-full flex items-center justify-center hover:bg-pink-600 transition-colors cursor-pointer"
                       whileHover={{ scale: 1.1, rotate: 5 }}
                       whileTap={{ scale: 0.95 }}
                     >
                       <Instagram />
                     </motion.a>
                </motion.div>
            </ScrollReveal>

            <ScrollReveal variants={fadeInRight}>
              <form onSubmit={sendToTelegram} className="bg-neutral-900/50 p-8 rounded-3xl border border-neutral-800">
                <div className="grid grid-cols-1 gap-6">
                    <div>
                        <label className="block text-sm text-gray-500 mb-2">Ваше имя</label>
                        <input 
                          type="text" 
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          className="w-full bg-black border border-neutral-700 rounded-xl px-4 py-3 text-white focus:border-red-500 outline-none transition-colors" 
                          placeholder="Иван Иванов" 
                        />
                    </div>
                    <div>
                        <label className="block text-sm text-gray-500 mb-2">Телефон</label>
                        <input 
                          type="tel" 
                          value={phone}
                          onChange={handlePhoneChange}
                          onFocus={handlePhoneFocus}
                          onBlur={handlePhoneBlur}
                          className={`w-full bg-black border rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:border-red-500 outline-none transition-colors ${phoneError ? 'border-red-500' : 'border-neutral-700'}`}
                          placeholder="+7 (999) 123-45-67" 
                        />
                        {phoneError && <p className="text-red-500 text-xs mt-1">{phoneError}</p>}
                    </div>
                    <div>
                        <label className="block text-sm text-gray-500 mb-2">О проекте</label>
                        <textarea 
                          rows="4" 
                          value={projectDescription}
                          onChange={(e) => setProjectDescription(e.target.value)}
                          className="w-full bg-black border border-neutral-700 rounded-xl px-4 py-3 text-white focus:border-red-500 outline-none transition-colors" 
                          placeholder="Расскажите нам немного о вашей идее..."
                        ></textarea>
                    </div>
                    
                    {submitStatus.message && (
                      <div className={`p-4 rounded-xl text-sm ${submitStatus.type === 'success' ? 'bg-green-900/50 text-green-300 border border-green-700' : 'bg-red-900/50 text-red-300 border border-red-700'}`}>
                        {submitStatus.message}
                      </div>
                    )}
                    
                    <button 
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full bg-gradient-to-r from-red-600 to-yellow-600 text-white font-bold py-4 rounded-xl hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isSubmitting ? 'Отправляем...' : 'Отправить форму'}
                    </button>
                    
                    <p className="text-xs text-gray-500 text-center">
                      Отправляя форму, вы соглашаетесь с{' '}
                      <button 
                        type="button"
                        onClick={() => setIsPrivacyOpen(true)} 
                        className="text-red-500 hover:underline"
                      >
                        политикой конфиденциальности
                      </button>
                    </p>
                </div>
              </form>
            </ScrollReveal>
        </div>
        
        <motion.div 
          className="max-w-7xl mx-auto mt-20 pt-8 border-t border-neutral-900 text-center text-gray-600 text-sm"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3 }}
        >
            &copy; 2026 КиноГорыныч. Все права защищены.
        </motion.div>
      </footer>

      {/* Модальное окно брифа на съёмку видеофонов */}
      <AnimatePresence>
        {isPlatesBriefOpen && (
          <motion.div 
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div 
              className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-neutral-900 rounded-3xl border border-neutral-700 p-6 md:p-8"
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              transition={{ type: "spring", duration: 0.5 }}
            >
              <button 
                onClick={() => setIsPlatesBriefOpen(false)}
                className="absolute top-4 right-4 w-10 h-10 flex items-center justify-center rounded-full bg-neutral-800 hover:bg-red-600 transition-colors"
              >
                <X size={20} />
              </button>
            
            <div className="mb-6">
              <div className="inline-block bg-orange-900/30 text-orange-400 px-3 py-1 rounded text-xs uppercase mb-3">Бриф</div>
              <h3 className="text-2xl md:text-3xl font-bold">Заказать съёмку видеофонов</h3>
              <p className="text-gray-400 mt-2 text-sm">Заполните форму, чтобы мы рассчитали стоимость вашего запроса</p>
            </div>

            <form onSubmit={sendPlatesBrief} className="space-y-4">
              {/* Контактная информация */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-500 mb-1">Как к вам обращаться? *</label>
                  <input 
                    type="text"
                    value={platesBrief.contactName}
                    onChange={(e) => handlePlatesBriefChange('contactName', e.target.value)}
                    className="w-full bg-black border border-neutral-700 rounded-xl px-4 py-3 text-white focus:border-orange-500 outline-none transition-colors"
                    placeholder="Иван Иванов"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-500 mb-1">Как с вами связаться? *</label>
                  <input 
                    type="text"
                    value={platesBrief.contactInfo}
                    onChange={(e) => handlePlatesBriefChange('contactInfo', e.target.value)}
                    className="w-full bg-black border border-neutral-700 rounded-xl px-4 py-3 text-white focus:border-orange-500 outline-none transition-colors"
                    placeholder="Telegram, почта или телефон"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-500 mb-1">Наименование контрагента</label>
                  <input 
                    type="text"
                    value={platesBrief.company}
                    onChange={(e) => handlePlatesBriefChange('company', e.target.value)}
                    className="w-full bg-black border border-neutral-700 rounded-xl px-4 py-3 text-white focus:border-orange-500 outline-none transition-colors"
                    placeholder="ООО, ИП, НКО"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-500 mb-1">Название проекта</label>
                  <input 
                    type="text"
                    value={platesBrief.project}
                    onChange={(e) => handlePlatesBriefChange('project', e.target.value)}
                    className="w-full bg-black border border-neutral-700 rounded-xl px-4 py-3 text-white focus:border-orange-500 outline-none transition-colors"
                    placeholder="Рабочее название"
                  />
                </div>
              </div>

              {/* Параметры съёмки */}
              <div className="border-t border-neutral-700 pt-4 mt-4">
                <p className="text-sm text-orange-400 font-semibold mb-3">Параметры съёмки</p>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Местность</label>
                    <select 
                      value={platesBrief.location}
                      onChange={(e) => handlePlatesBriefChange('location', e.target.value)}
                      className="w-full bg-black border border-neutral-700 rounded-xl pl-2 pr-6 py-2 text-white text-sm focus:border-orange-500 outline-none"
                    >
                      <option>Москва/крупный город</option>
                      <option>Небольшой город</option>
                      <option>Загород/природа</option>
                      <option>Трасса</option>
                      <option>Другое</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Время года</label>
                    <select 
                      value={platesBrief.season}
                      onChange={(e) => handlePlatesBriefChange('season', e.target.value)}
                      className="w-full bg-black border border-neutral-700 rounded-xl pl-2 pr-6 py-2 text-white text-sm focus:border-orange-500 outline-none"
                    >
                      <option>Весна</option>
                      <option>Лето</option>
                      <option>Осень</option>
                      <option>Зима</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Погода</label>
                    <select 
                      value={platesBrief.weather}
                      onChange={(e) => handlePlatesBriefChange('weather', e.target.value)}
                      className="w-full bg-black border border-neutral-700 rounded-xl pl-2 pr-6 py-2 text-white text-sm focus:border-orange-500 outline-none"
                    >
                      <option>Солнце</option>
                      <option>Облачно</option>
                      <option>Пасмурно</option>
                      <option>Дождь</option>
                      <option>Снег</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Время суток</label>
                    <select 
                      value={platesBrief.timeOfDay}
                      onChange={(e) => handlePlatesBriefChange('timeOfDay', e.target.value)}
                      className="w-full bg-black border border-neutral-700 rounded-xl pl-2 pr-6 py-2 text-white text-sm focus:border-orange-500 outline-none"
                    >
                      <option>День</option>
                      <option>Утро</option>
                      <option>Вечер</option>
                      <option>Ночь</option>
                      <option>Закат/Рассвет</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Кол-во машин в кадре</label>
                    <select 
                      value={platesBrief.carsCount}
                      onChange={(e) => handlePlatesBriefChange('carsCount', e.target.value)}
                      className="w-full bg-black border border-neutral-700 rounded-xl pl-2 pr-6 py-2 text-white text-sm focus:border-orange-500 outline-none"
                    >
                      <option>нет машин</option>
                      <option>мало (1-3)</option>
                      <option>средне (4-10)</option>
                      <option>много (поток)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Высота машины съёмок</label>
                    <select 
                      value={platesBrief.carHeight}
                      onChange={(e) => handlePlatesBriefChange('carHeight', e.target.value)}
                      className="w-full bg-black border border-neutral-700 rounded-xl pl-2 pr-6 py-2 text-white text-sm focus:border-orange-500 outline-none"
                    >
                      <option>легковая</option>
                      <option>кроссовер/внедорожник</option>
                      <option>микроавтобус</option>
                      <option>грузовик</option>
                      <option>автобус</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Ракурс камеры</label>
                    <select 
                      value={platesBrief.cameraAngle}
                      onChange={(e) => handlePlatesBriefChange('cameraAngle', e.target.value)}
                      className="w-full bg-black border border-neutral-700 rounded-xl pl-2 pr-6 py-2 text-white text-sm focus:border-orange-500 outline-none"
                    >
                      <option>горизонт</option>
                      <option>вверх</option>
                      <option>вниз</option>
                      <option>комбинированный</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Скорость (км/ч)</label>
                    <input 
                      type="text"
                      value={platesBrief.speed}
                      onChange={(e) => handlePlatesBriefChange('speed', e.target.value)}
                      className="w-full bg-black border border-neutral-700 rounded-xl px-2 py-2 text-white text-sm focus:border-orange-500 outline-none"
                      placeholder="60"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Общий хронометраж</label>
                    <input 
                      type="text"
                      value={platesBrief.duration}
                      onChange={(e) => handlePlatesBriefChange('duration', e.target.value)}
                      className="w-full bg-black border border-neutral-700 rounded-xl px-2 py-2 text-white text-sm focus:border-orange-500 outline-none"
                      placeholder="5 мин"
                    />
                  </div>
                </div>
              </div>

              {/* Дополнительные опции */}
              <div className="border-t border-neutral-700 pt-4 mt-4">
                <p className="text-sm text-orange-400 font-semibold mb-3">Дополнительные опции</p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Вид лицензии</label>
                    <select 
                      value={platesBrief.licenseType}
                      onChange={(e) => handlePlatesBriefChange('licenseType', e.target.value)}
                      className="w-full bg-black border border-neutral-700 rounded-xl pl-2 pr-6 py-2 text-white text-sm focus:border-orange-500 outline-none"
                    >
                      <option>Неисключительная</option>
                      <option>Исключительная</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Супервайзинг на площадке</label>
                    <select 
                      value={platesBrief.supervising}
                      onChange={(e) => handlePlatesBriefChange('supervising', e.target.value)}
                      className="w-full bg-black border border-neutral-700 rounded-xl pl-2 pr-6 py-2 text-white text-sm focus:border-orange-500 outline-none"
                    >
                      <option>да</option>
                      <option>нет</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Сшивка фонов</label>
                    <select 
                      value={platesBrief.stitching}
                      onChange={(e) => handlePlatesBriefChange('stitching', e.target.value)}
                      className="w-full bg-black border border-neutral-700 rounded-xl pl-2 pr-6 py-2 text-white text-sm focus:border-orange-500 outline-none"
                    >
                      <option>да</option>
                      <option>нет</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Примечания */}
              <div>
                <label className="block text-sm text-gray-500 mb-1">Примечания</label>
                <textarea 
                  rows="3"
                  value={platesBrief.notes}
                  onChange={(e) => handlePlatesBriefChange('notes', e.target.value)}
                  className="w-full bg-black border border-neutral-700 rounded-xl px-4 py-3 text-white focus:border-orange-500 outline-none transition-colors"
                  placeholder="Укажите всё, что считаете важным..."
                ></textarea>
              </div>

              <p className="text-xs text-gray-500">
                Внимательно изложите свои задачи. Данная форма будет основанием приложения к договору.
              </p>

              {platesBriefStatus.message && (
                <div className={`p-4 rounded-xl text-sm ${platesBriefStatus.type === 'success' ? 'bg-green-900/50 text-green-300 border border-green-700' : 'bg-red-900/50 text-red-300 border border-red-700'}`}>
                  {platesBriefStatus.message}
                </div>
              )}

              <motion.button 
                type="submit"
                disabled={platesBriefSubmitting}
                className="w-full bg-gradient-to-r from-orange-600 to-yellow-600 text-white font-bold py-4 rounded-xl hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                {platesBriefSubmitting ? 'Отправляем...' : 'Отправить бриф'}
              </motion.button>
            </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Privacy Policy Modal */}
      <AnimatePresence>
        {isPrivacyOpen && (
          <motion.div 
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsPrivacyOpen(false)}
          >
            <motion.div 
              className="relative w-full max-w-3xl max-h-[90vh] overflow-y-auto bg-neutral-900 rounded-3xl border border-neutral-700 p-8"
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              transition={{ type: "spring", duration: 0.5 }}
              onClick={(e) => e.stopPropagation()}
            >
              <button 
                onClick={() => setIsPrivacyOpen(false)}
                className="absolute top-4 right-4 w-10 h-10 flex items-center justify-center rounded-full bg-neutral-800 hover:bg-red-600 transition-colors"
                aria-label="Закрыть"
              >
                <X size={20} />
              </button>

              <h2 className="text-3xl font-bold text-white mb-6">Политика конфиденциальности</h2>
              
              <div className="prose prose-invert prose-sm max-w-none space-y-4 text-gray-300">
                <p className="text-gray-400 text-sm">Последнее обновление: январь 2026</p>
                
                <h3 className="text-xl font-semibold text-white mt-6">1. Общие положения</h3>
                <p>
                  Настоящая Политика конфиденциальности определяет порядок обработки и защиты персональных данных 
                  пользователей сайта КиноГорыныч (далее — «Сайт»), принадлежащего ИП Поморин Иван Алексеевич 
                  (ИНН 771465038725).
                </p>
                
                <h3 className="text-xl font-semibold text-white mt-6">2. Какие данные мы собираем</h3>
                <p>Мы можем собирать следующую информацию:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Имя и контактные данные (телефон, email)</li>
                  <li>Информация о проекте, которую вы предоставляете через формы</li>
                  <li>Техническая информация (IP-адрес, тип браузера, время посещения)</li>
                </ul>
                
                <h3 className="text-xl font-semibold text-white mt-6">3. Цели обработки данных</h3>
                <p>Персональные данные используются для:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Связи с вами по вопросам сотрудничества</li>
                  <li>Подготовки коммерческих предложений</li>
                  <li>Улучшения качества наших услуг</li>
                </ul>
                
                <h3 className="text-xl font-semibold text-white mt-6">4. Защита данных</h3>
                <p>
                  Мы принимаем все необходимые организационные и технические меры для защиты ваших персональных данных 
                  от несанкционированного доступа, изменения, раскрытия или уничтожения.
                </p>
                
                <h3 className="text-xl font-semibold text-white mt-6">5. Ваши права</h3>
                <p>Вы имеете право:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Запросить информацию о ваших персональных данных</li>
                  <li>Потребовать исправления или удаления данных</li>
                  <li>Отозвать согласие на обработку данных</li>
                </ul>
                
                <h3 className="text-xl font-semibold text-white mt-6">6. Контакты</h3>
                <p>
                  По всем вопросам, связанным с обработкой персональных данных, вы можете обратиться по адресу: 
                  hello@kinogorynych.ru или по телефону +7 (925) 038-25-25.
                </p>
              </div>
              
              <motion.button 
                onClick={() => setIsPrivacyOpen(false)}
                className="mt-8 w-full bg-gradient-to-r from-red-600 to-orange-600 text-white font-bold py-4 rounded-xl hover:opacity-90 transition-opacity"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                Понятно
              </motion.button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
