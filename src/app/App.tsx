import { useState, useEffect, useRef } from 'react';
import { GlitchText } from '../components/GlitchText';
import { CyberGrid } from '../components/CyberGrid';
import { DataNetwork } from '../components/DataNetwork';

// design tokens — tweak here, propagates everywhere
const BG = '#000000';
const SURFACE = '#050505';
const CYAN = '#00f0ff';
const TEXT = '#ffffff';
const MUTED = '#666666';
const BORDER = 'rgba(0, 240, 255, 0.15)';

const GLOBAL_CSS = `
@import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@400;700;900&family=Inter:wght@300;400;500;600&display=swap');

* { margin: 0; padding: 0; box-sizing: border-box; }
html { scroll-behavior: smooth; }
body { background: #000000; color: #ffffff; font-family: 'Inter', sans-serif; overflow-x: hidden; }
::selection { background: rgba(0, 240, 255, 0.2); color: #00f0ff; }
::-webkit-scrollbar { width: 4px; }
::-webkit-scrollbar-track { background: #000000; }
::-webkit-scrollbar-thumb { background: #00f0ff; }

/* Typography Overrides */
h1, h2, h3, .font-orbitron { font-family: 'Orbitron', sans-serif; }
.font-mono { font-family: 'JetBrains Mono', monospace; }

/* Nav Links */
.nav-link {
  color: #888888; text-decoration: none; font-family: 'Inter', sans-serif;
  font-size: 0.8rem; font-weight: 500; letter-spacing: 0.05em; text-transform: uppercase;
  transition: color 0.3s; cursor: pointer; background: none; border: none;
  position: relative; padding-bottom: 4px;
}
.nav-link::after {
  content: ''; position: absolute; bottom: 0; left: 0; width: 0; height: 1px;
  background: #00f0ff; transition: width 0.3s ease;
}
.nav-link:hover { color: #ffffff; }
.nav-link:hover::after { width: 100%; }

/* Wireframe Terrain Grid Effect */
.wireframe-container {
  position: absolute;
  inset: 0;
  overflow: hidden;
  z-index: 0;
  pointer-events: none;
}
.wireframe-grid {
  position: absolute;
  width: 200vw;
  height: 150vh;
  left: -50vw;
  top: 0;
  background-image:
    linear-gradient(rgba(0, 240, 255, 0.15) 1px, transparent 1px),
    linear-gradient(90deg, rgba(0, 240, 255, 0.15) 1px, transparent 1px);
  background-size: 50px 50px;
  transform: perspective(1000px) rotateX(75deg) translateY(-100px) translateZ(-200px);
  transform-origin: center center;
  animation: grid-move 5s linear infinite;
}
@keyframes grid-move {
  0% { transform: perspective(1000px) rotateX(75deg) translateY(0px) translateZ(-200px); }
  100% { transform: perspective(1000px) rotateX(75deg) translateY(50px) translateZ(-200px); }
}
.wireframe-fade {
  position: absolute;
  inset: 0;
  background: radial-gradient(ellipse at center, transparent 0%, #000000 70%),
              linear-gradient(to bottom, #000000 0%, transparent 40%, transparent 70%, #000000 100%);
  z-index: 1;
}

/* Animations */
@keyframes shake {
  0%, 100% { transform: translateX(0); }
  25% { transform: translateX(-10px); }
  75% { transform: translateX(10px); }
}
.animate-shake {
  animation: shake 0.3s cubic-bezier(.36,.07,.19,.97) both;
}
@keyframes slide-up-fade {
  from { opacity: 0; transform: translateY(30px); }
  to { opacity: 1; transform: translateY(0); }
}

/* 1. Glitch Text Effect */
@keyframes glitch {
  0% { clip-path: inset(40% 0 61% 0); transform: translate(-2px, 0) }
  20% { clip-path: inset(92% 0 1% 0); transform: translate(1px, 0) }
  40% { clip-path: inset(43% 0 50% 0); transform: translate(-1px, 0) }
  60% { clip-path: inset(25% 0 58% 0); transform: translate(2px, 0) }
  80% { clip-path: inset(54% 0 7% 0); transform: translate(-2px, 0) }
  100% { clip-path: inset(58% 0 43% 0); transform: translate(0) }
}
.glitch-heading {
  position: relative;
  display: inline-block;
  animation: glitch 1.5s cubic-bezier(.25, 1, .5, 1) 1;
}
.glitch-heading::before, .glitch-heading::after {
  content: attr(data-text);
  position: absolute;
  top: 0; left: 0; width: 100%; height: 100%;
  pointer-events: none;
}
.glitch-heading::before {
  color: #00f0ff; left: 2px;
  animation: glitch 2s cubic-bezier(.25, 1, .5, 1) 1 reverse;
}
.glitch-heading::after {
  color: #ff2a6d; left: -2px;
  animation: glitch 1.8s cubic-bezier(.25, 1, .5, 1) 1 reverse;
}

/* 2. HUD Circle Spins */
@keyframes spin { 100% { transform: rotate(360deg); } }
.spin-cw { animation: spin 20s linear infinite; transform-origin: 200px 200px; }
.spin-ccw { animation: spin 15s linear reverse infinite; transform-origin: 200px 200px; }
@keyframes pulse-dot { 0%, 100% { opacity: 0.2; transform: scale(0.8); } 50% { opacity: 1; transform: scale(1.2); } }
.dot-indicator { animation: pulse-dot 2s ease-in-out infinite; transform-origin: center; }

/* 3. Neon Glow Text Shadows */
.text-glow-white { text-shadow: 0 0 10px rgba(255,255,255,0.5); }
.text-glow-cyan { text-shadow: 0 0 10px #00ffff, 0 0 20px rgba(0,255,255,0.4); }
.text-glow-red { text-shadow: 0 0 10px #ff2a6d, 0 0 20px rgba(255,42,109,0.4); }

/* 4. Cyberpunk Cards */
.cyber-card-wrapper {
  transition: filter 300ms ease;
  position: relative;
}
.cyber-card-wrapper:hover {
  filter: drop-shadow(0 0 20px rgba(0,255,255,0.3));
}
.cyber-card {
  clip-path: polygon(0 0, calc(100% - 16px) 0, 100% 16px, 100% 100%, 16px 100%, 0 calc(100% - 16px));
  position: relative;
  transition: transform 300ms ease, background 300ms ease;
  background: #050505;
  border: 1px solid rgba(0, 240, 255, 0.15);
}
.cyber-card::before {
  content: '';
  position: absolute;
  top: 0; left: 0;
  width: 20px; height: 20px;
  border-top: 2px solid #00f0ff;
  border-left: 2px solid #00f0ff;
  pointer-events: none;
  z-index: 10;
}
.cyber-card:hover {
  transform: translateY(-4px);
  background: #080808;
}

/* 7. Cyberpunk Buttons */
.btn-primary {
  background: #00f0ff; color: #000000; border: none;
  font-family: 'Orbitron', sans-serif; font-weight: 600; font-size: 0.8rem;
  letter-spacing: 0.15em; text-transform: uppercase;
  padding: 1rem 2.5rem; cursor: pointer; position: relative; overflow: hidden;
  transition: all 0.3s ease;
  clip-path: polygon(0 0, calc(100% - 8px) 0, 100% 8px, 100% 100%, 8px 100%, 0 calc(100% - 8px));
}
.btn-primary:hover {
  filter: invert(1);
  box-shadow: 0 0 20px rgba(0, 240, 255, 0.4);
}
.btn-outline {
  background: transparent; color: #00f0ff;
  border: 1px solid #00f0ff;
  font-family: 'Orbitron', sans-serif; font-weight: 600; font-size: 0.8rem;
  letter-spacing: 0.15em; text-transform: uppercase;
  padding: 1rem 2.5rem; cursor: pointer;
  transition: all 0.2s ease;
  clip-path: polygon(0 0, calc(100% - 8px) 0, 100% 8px, 100% 100%, 8px 100%, 0 calc(100% - 8px));
}
.btn-outline:hover {
  background: #00f0ff;
  color: #000000;
}

/* Input line */
.input-minimal {
  background: transparent;
  border: none;
  border-bottom: 1px solid rgba(0, 240, 255, 0.3);
  padding: 0.8rem 0;
  color: #ffffff;
  font-family: 'Inter', sans-serif;
  font-size: 0.9rem;
  outline: none;
  transition: border-color 0.3s ease;
  width: 100%;
}
.input-minimal:focus {
  border-bottom: 1px solid #00f0ff;
}
.input-minimal::placeholder { color: #555555; }
`;

const CARDS_DATA = [
  {
    id: 'neural',
    title: 'Neural Sync',
    label: 'MOD-01',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={CYAN} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
      </svg>
    ),
    desc: 'Sub-millisecond brain-machine latency. The interface dissolves. You and the OS become one distributed system.',
    stat: '0.003ms',
    statLabel: 'avg response',
  },
  {
    id: 'combat',
    title: 'Combat Reflex OS',
    label: 'MOD-02',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={CYAN} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10"/>
        <line x1="12" y1="16" x2="12" y2="12"/>
        <line x1="12" y1="8" x2="12.01" y2="8"/>
      </svg>
    ),
    desc: 'Predictive motor-cortex override. Threats are neutralized before your conscious mind logs the input.',
    stat: '×12',
    statLabel: 'reflex amp',
  },
  {
    id: 'optic',
    title: 'Optic Enhancement',
    label: 'MOD-03',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={CYAN} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
        <circle cx="12" cy="12" r="3"/>
      </svg>
    ),
    desc: '47× optical zoom, full-spectrum vision, real-time HUD overlay. Your eyes become the sharpest sensors alive.',
    stat: '47×',
    statLabel: 'zoom factor',
  },
];

const STATS_DATA = [
  { display: '2.4M+', label: 'SUBJECTS AUGMENTED' },
  { display: '99.7%', label: 'SYSTEM UPTIME' },
  { display: '0.003ms', label: 'NEURAL LATENCY' },
  { display: '47', label: 'ACTIVE MODULES' },
];

// navbar — collapses to hamburger on mobile, backdrop on scroll
function Navbar({ isMobile }: { isMobile: boolean }) {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // runs once on mount, cleans up on unmount
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const handleNavClick = (e: React.MouseEvent, targetId: string) => {
    e.preventDefault();
    const target = document.getElementById(targetId);
    if (!target) return;
    const navbarHeight = 80;
    const targetTop = target.getBoundingClientRect().top + window.scrollY - navbarHeight;
    window.scrollTo({ top: targetTop, behavior: 'smooth' });
    setMobileMenuOpen(false);
  };

  const links = [
    { label: 'HOME', id: 'hero' },
    { label: 'AUGMENTS', id: 'features' },
    { label: 'SPECS', id: 'stats' },
    { label: 'DEPLOY', id: 'cta' },
  ];

  return (
    <nav style={{
      position: 'fixed', top: 0, left: 0, width: '100%', zIndex: 100,
      background: scrolled ? 'rgba(0,0,0,0.8)' : 'transparent',
      backdropFilter: scrolled ? 'blur(8px)' : 'none',
      borderBottom: scrolled ? `1px solid ${BORDER}` : '1px solid transparent',
      transition: 'all 0.3s ease',
      padding: '0 clamp(1.5rem,5vw,4rem)',
      height: '80px',
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer' }} onClick={(e) => handleNavClick(e, 'hero')}>
        {/* Simple sharp logo */}
        <div style={{ width: '24px', height: '24px', background: CYAN, clipPath: 'polygon(0 0, 100% 0, 100% 60%, 40% 100%, 0 100%)' }} />
        <span className="font-orbitron" style={{ fontWeight: 900, fontSize: '1.2rem', color: '#fff', letterSpacing: '0.05em' }}>
          NX<span style={{ color: CYAN }}>-</span>7
        </span>
      </div>

      {!isMobile && (
        <div style={{ display: 'flex', gap: '3rem' }}>
          {links.map(l => (
            <button key={l.id} className="nav-link" onClick={(e) => handleNavClick(e, l.id)}>{l.label}</button>
          ))}
        </div>
      )}

      <div style={{ display: 'flex', alignItems: 'center' }}>
        {!isMobile && (
          <button onClick={(e) => handleNavClick(e, 'cta')} className="btn-outline" style={{ padding: '0.6rem 1.5rem', fontSize: '0.75rem' }}>
            JACK IN
          </button>
        )}
        {isMobile && (
          <button
            onClick={() => setMobileMenuOpen(o => !o)}
            style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', flexDirection: 'column', gap: '5px' }}
          >
            {[0, 1, 2].map(i => (
              <span key={i} style={{ display: 'block', width: '24px', height: '2px', background: '#fff' }} />
            ))}
          </button>
        )}
      </div>

      {isMobile && mobileMenuOpen && (
        <div style={{
          position: 'absolute', top: '80px', left: 0, width: '100%',
          background: '#000', padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.5rem',
          borderBottom: `1px solid ${BORDER}`,
        }}>
          {links.map(l => (
            <button key={l.id} className="nav-link" style={{ textAlign: 'left', fontSize: '1rem' }} onClick={(e) => handleNavClick(e, l.id)}>{l.label}</button>
          ))}
        </div>
      )}
    </nav>
  );
}

// hero — glitch text runs on mount, HUD spins on loop
function Hero({ isMobile }: { isMobile: boolean }) {
  return (
    <section id="hero" style={{
      minHeight: '100vh', position: 'relative', overflow: 'hidden', zIndex: 1,
      background: 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>

      <div style={{
        position: 'relative', zIndex: 2,
        display: 'flex', flexDirection: isMobile ? 'column' : 'row',
        alignItems: 'center', justifyContent: 'space-between',
        padding: '80px clamp(1.5rem,5vw,4rem) clamp(1rem,3vw,3rem)',
        gap: '2rem', width: '100%', maxWidth: '1400px', margin: '0 auto',
      }}>
        {/* Left content */}
        <div style={{ flex: 1, maxWidth: '650px', background: 'radial-gradient(ellipse 60% 70% at 30% 50%, rgba(0,0,0,0.85) 0%, transparent 100%)' }}>
          <div className="text-glow-cyan" style={{
            color: CYAN, fontSize: '0.8rem', letterSpacing: '0.15em', marginBottom: '1.5rem',
            animation: 'slide-up-fade 0.6s ease forwards', opacity: 0, fontWeight: 600,
          }}>
            // NEURAL OS v4.2
          </div>

          <h1 className="font-orbitron" style={{
            fontWeight: 900, lineHeight: 0.95, letterSpacing: '-0.02em',
          }}>
            <GlitchText text="AUGMENT."  color="chrome" className="text-5xl md:text-7xl lg:text-8xl" />
            <GlitchText text="EVOLVE."   color="chrome" className="text-5xl md:text-7xl lg:text-8xl" />
            <GlitchText text="DOMINATE." color="chrome" className="text-5xl md:text-7xl lg:text-8xl" />
          </h1>

          <p style={{
            color: '#aaaaaa', fontSize: '1rem', lineHeight: 1.6,
            marginTop: '1.5rem', marginBottom: '2.5rem', maxWidth: '500px',
            animation: 'slide-up-fade 0.7s ease forwards', animationDelay: '0.4s', opacity: 0,
          }}>
            "Neural Interface OS — Now Accepting Beta Subjects"
          </p>

          <div style={{
            display: 'flex', gap: '1rem', flexWrap: 'wrap',
            animation: 'slide-up-fade 0.7s ease forwards', animationDelay: '0.5s', opacity: 0,
          }}>
            <button onClick={() => {
              const el = document.getElementById('cta');
              if (el) window.scrollTo({ top: el.getBoundingClientRect().top + window.pageYOffset - 80, behavior: 'smooth' });
            }} className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              INITIALIZE
            </button>
            <button onClick={() => {
              const el = document.getElementById('features');
              if (el) window.scrollTo({ top: el.getBoundingClientRect().top + window.pageYOffset - 80, behavior: 'smooth' });
            }} className="btn-outline" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              VIEW SCHEMATICS
            </button>
          </div>
        </div>

        {/* Right content - Clean Technical Graphic with Glow & Spin */}
        <div style={{
          flex: 1, display: 'flex', justifyContent: 'center',
          animation: 'slide-up-fade 0.9s ease forwards', animationDelay: '0.5s', opacity: 0,
          maxWidth: isMobile ? '300px' : 'none',
          position: 'relative'
        }}>
          {/* Faint cyan radial glow */}
          <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(circle, rgba(0,255,255,0.08) 0%, transparent 70%)' }}></div>
          
          <svg width="400" height="400" viewBox="0 0 400 400" style={{ maxWidth: '100%', position: 'relative', zIndex: 1 }}>
            {/* Outer Ring */}
            <g className="spin-cw">
              <circle cx="200" cy="200" r="180" fill="none" stroke="rgba(0, 240, 255, 0.1)" strokeWidth="1" strokeDasharray="4 8" />
              <circle cx="200" cy="200" r="140" fill="none" stroke="rgba(0, 240, 255, 0.2)" strokeWidth="1" />
              {/* Pulsing Dots on Outer Ring */}
              <circle cx="200" cy="20" r="3" fill={CYAN} className="dot-indicator" style={{ animationDelay: '0s' }} />
              <circle cx="380" cy="200" r="3" fill={CYAN} className="dot-indicator" style={{ animationDelay: '0.5s' }} />
              <circle cx="200" cy="380" r="3" fill={CYAN} className="dot-indicator" style={{ animationDelay: '1s' }} />
              <circle cx="20" cy="200" r="3" fill={CYAN} className="dot-indicator" style={{ animationDelay: '1.5s' }} />
            </g>
            
            {/* Inner Ring */}
            <g className="spin-ccw">
              {/* Sharp geometric inner frame */}
              <polygon points="200,80 304,140 304,260 200,320 96,260 96,140" fill="none" stroke={CYAN} strokeWidth="1.5" />
              <circle cx="200" cy="80" r="4" fill={CYAN} />
              <circle cx="304" cy="260" r="4" fill={CYAN} />
              <circle cx="96" cy="260" r="4" fill={CYAN} />
              <circle cx="200" cy="200" r="40" fill="rgba(0,240,255,0.05)" stroke={CYAN} strokeWidth="1" />
              <circle cx="200" cy="200" r="2" fill="#fff" />
            </g>
          </svg>
        </div>
      </div>
    </section>
  );
}

// ─── Feature Card ──────────────────────────────────────────
function FeatureCard({ card, delay }: { card: typeof CARDS_DATA[0], delay: number }) {
  const [revealed, setRevealed] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) { setRevealed(true); observer.disconnect(); }
    }, { threshold: 0.1 });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div className="cyber-card-wrapper" ref={ref} style={{
        opacity: revealed ? 1 : 0,
        animation: revealed ? `slide-up-fade 0.7s ease forwards` : 'none',
        animationDelay: `${delay}s`,
    }}>
      <div className="cyber-card" style={{
          padding: '3rem 2rem',
          display: 'flex', flexDirection: 'column', height: '100%'
        }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', alignItems: 'flex-start' }}>
          <div style={{ color: CYAN }}>{card.icon}</div>
          <h3 className="font-orbitron text-glow-white" style={{ fontWeight: 600, fontSize: '1.2rem', color: TEXT, letterSpacing: '0.05em' }}>
            {card.title}
          </h3>
        </div>
        
        <p style={{ color: MUTED, fontSize: '0.85rem', lineHeight: 1.7, margin: '1.5rem 0', flex: 1 }}>
          {card.desc}
        </p>
      </div>
    </div>
  );
}

// Features module showcase
function Features({ isMobile }: { isMobile: boolean }) {
  return (
    <section id="features" style={{
      background: 'transparent', padding: 'clamp(4rem,8vw,8rem) clamp(1.5rem,5vw,4rem)',
      position: 'relative', zIndex: 1,
      minHeight: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'center'
    }}>
      <div style={{ width: '100%', maxWidth: '1200px', margin: '0 auto' }}>

        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
            <div style={{ flex: 1, height: '1px', background: `linear-gradient(to right, transparent, ${CYAN})` }} />
            <div className="text-glow-cyan" style={{ color: CYAN, fontSize: '0.7rem', letterSpacing: '0.25em', fontWeight: 600 }}>[ CORE MODULES ]</div>
            <div style={{ flex: 1, height: '1px', background: `linear-gradient(to left, transparent, ${CYAN})` }} />
          </div>
          <h2 className="font-orbitron text-glow-white" style={{ fontWeight: 700, fontSize: 'clamp(2rem,4vw,3rem)', color: TEXT }}>
            AUGMENTATION SUITE
          </h2>
          <div style={{ color: '#444', fontSize: '0.7rem', letterSpacing: '0.1em', marginTop: '0.75rem', fontFamily: 'monospace' }}>
            IMPLANT CATALOGUE — REV 4.2 — AUTHORIZED SUBJECTS ONLY
          </div>
        </div>

        {/* Feature Cards */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)',
          gap: '2rem', maxWidth: '1200px', margin: '0 auto',
        }}>
          {CARDS_DATA.map((card, i) => (
            <FeatureCard key={card.id} card={card} delay={i * 0.15} />
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Stat Item ─────────────────────────────────────────────
function StatItem({ stat }: { stat: typeof STATS_DATA[0] }) {
  const [display, setDisplay] = useState('0');
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        observer.disconnect();
        
        // Skip animation for very small latency stat
        if (stat.display === '0.003ms') {
          setDisplay('0.003ms');
          return;
        }

        const duration = 2000;
        const start = performance.now();
        
        // Parse target and suffix
        let targetNum = 0;
        let suffix = '';
        if (stat.display.includes('M+')) { targetNum = 2.4; suffix = 'M+'; }
        else if (stat.display.includes('%')) { targetNum = 99.7; suffix = '%'; }
        else { targetNum = parseInt(stat.display) || 47; }

        const easeOutQuad = (t: number) => t * (2 - t);

        const animate = (time: number) => {
          let timeFraction = (time - start) / duration;
          if (timeFraction > 1) timeFraction = 1;
          
          const progress = easeOutQuad(timeFraction);
          const currentVal = progress * targetNum;

          if (suffix === 'M+') {
            setDisplay(currentVal.toFixed(1) + suffix);
          } else if (suffix === '%') {
            setDisplay(currentVal.toFixed(1) + suffix);
          } else {
            setDisplay(Math.round(currentVal).toString());
          }

          if (timeFraction < 1) {
            requestAnimationFrame(animate);
          } else {
            setDisplay(stat.display);
          }
        };
        requestAnimationFrame(animate);
      }
    }, { threshold: 0.3 });
    observer.observe(el);
    return () => observer.disconnect();
  }, [stat.display]);

  return (
    <div ref={ref} style={{ flex: 1, padding: '2rem 0', borderTop: `1px solid ${BORDER}` }}>
      <div className="font-orbitron text-glow-white" style={{
        fontWeight: 700, fontSize: 'clamp(2rem,4vw,3rem)', color: '#fff',
      }}>{display}</div>
      <div className="text-glow-cyan" style={{ color: CYAN, fontSize: '0.75rem', letterSpacing: '0.15em', marginTop: '0.5rem', textTransform: 'uppercase' as const, fontWeight: 600 }}>
        {stat.label}
      </div>
    </div>
  );
}

// ─── Stats ─────────────────────────────────────────────────
function Stats({ isMobile }: { isMobile: boolean }) {
  return (
    <section id="stats" style={{
      background: 'rgba(0, 8, 20, 0.9)',
      padding: '0 clamp(1.5rem,5vw,4rem)',
      position: 'relative', zIndex: 1, overflow: 'hidden',
      minHeight: '100vh', display: 'flex', alignItems: 'center'
    }}>
      <DataNetwork />
      <div style={{ width: '100%', position: 'relative', zIndex: 1, maxWidth: '1200px', margin: '0 auto' }}>

        {/* ── HUD Header ── */}
        <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
            <div style={{ flex: 1, height: '1px', background: `linear-gradient(to right, transparent, ${CYAN})` }} />
            <span className="font-orbitron text-glow-cyan" style={{ color: CYAN, fontSize: '0.7rem', letterSpacing: '0.25em', fontWeight: 700 }}>// SYSTEM DIAGNOSTICS</span>
            <div style={{ flex: 1, height: '1px', background: `linear-gradient(to left, transparent, ${CYAN})` }} />
          </div>
          <h2 className="font-orbitron text-glow-white" style={{ fontWeight: 700, fontSize: 'clamp(1.8rem,3.5vw,2.8rem)', color: '#fff', letterSpacing: '0.05em' }}>
            NEURAL OS PERFORMANCE
          </h2>
          <div style={{ color: '#555', fontSize: '0.75rem', letterSpacing: '0.1em', marginTop: '0.75rem', fontFamily: 'monospace' }}>
            UPLINK ACTIVE — READING LIVE AUGMENT DATA...
          </div>
        </div>

        {/* ── Stat Numbers Grid ── */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: isMobile ? '1fr 1fr' : 'repeat(4, 1fr)',
          gap: '2rem',
        }}>
          {STATS_DATA.map((s, i) => (
            <StatItem key={i} stat={s} />
          ))}
        </div>

        {/* ── Progress Bars ── */}
        <div style={{ marginTop: '4rem', display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(2, 1fr)', gap: '1.5rem 4rem' }}>
          {[
            { label: 'COGNITIVE LOAD', value: 73 },
            { label: 'NEURAL BANDWIDTH', value: 91 },
            { label: 'REFLEX CALIBRATION', value: 88 },
            { label: 'OPTIC SYNC', value: 99 },
          ].map((item) => (
            <div key={item.label}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
                <span style={{ color: '#555', fontSize: '0.65rem', letterSpacing: '0.12em', fontFamily: 'monospace' }}>{item.label}</span>
                <span style={{ color: CYAN, fontSize: '0.65rem', letterSpacing: '0.08em', fontFamily: 'monospace' }}>{item.value}%</span>
              </div>
              <div style={{ height: '3px', background: 'rgba(0,255,255,0.08)', borderRadius: '2px', overflow: 'hidden' }}>
                <div style={{
                  height: '100%', width: `${item.value}%`,
                  background: `linear-gradient(to right, rgba(0,255,255,0.4), ${CYAN})`,
                  boxShadow: `0 0 8px ${CYAN}`,
                  animation: 'slide-up-fade 1.5s ease forwards',
                }} />
              </div>
            </div>
          ))}
        </div>

        {/* ── Status Footer ── */}
        <div style={{
          marginTop: '4rem',
          padding: '1.25rem 2rem',
          border: `1px solid rgba(0,255,255,0.12)`,
          display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem',
          clipPath: 'polygon(0 0, calc(100% - 12px) 0, 100% 12px, 100% 100%, 12px 100%, 0 calc(100% - 12px))',
          background: 'rgba(0,255,255,0.03)',
        }}>
          <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap' }}>
            {['ENCRYPTION: AES-512', 'UPLINK: STABLE', 'OS BUILD: 4.2.1-BETA'].map(s => (
              <span key={s} style={{ color: '#444', fontSize: '0.6rem', letterSpacing: '0.1em', fontFamily: 'monospace' }}>{s}</span>
            ))}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: CYAN, boxShadow: `0 0 8px ${CYAN}`, animation: 'pulse-dot 2s ease-in-out infinite' }} />
            <span style={{ color: CYAN, fontSize: '0.6rem', letterSpacing: '0.15em', fontFamily: 'monospace' }}>ALL SYSTEMS NOMINAL</span>
          </div>
        </div>

      </div>
    </section>
  );
}

// deploy — TODO: wire ENLIST to actual waitlist API
function CTA({ isMobile }: { isMobile: boolean }) {
  const [email, setEmail] = useState('');
  const [error, setError] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [isShaking, setIsShaking] = useState(false);

  const onEnlistClick = () => {
    const isValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    if (!isValid) {
      setError(true);
      setIsShaking(true);
      setTimeout(() => setIsShaking(false), 300);
    } else {
      setError(false);
      setSubmitted(true);
    }
  };

  return (
    <section id="cta" style={{
      background: 'rgba(0, 0, 0, 0.75)', backdropFilter: 'blur(2px)',
      position: 'relative', overflow: 'hidden', zIndex: 1,
      padding: '0 clamp(1.5rem,5vw,4rem)',
      minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      gap: '3rem',
    }}>

      {/* Top label */}
      <div style={{ width: '100%', maxWidth: '1200px', display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <div style={{ flex: 1, height: '1px', background: `linear-gradient(to right, transparent, ${CYAN})` }} />
        <span className="font-orbitron text-glow-cyan" style={{ color: CYAN, fontSize: '0.65rem', letterSpacing: '0.25em', fontWeight: 700 }}>// BETA ENLISTMENT PORTAL</span>
        <div style={{ flex: 1, height: '1px', background: `linear-gradient(to left, transparent, ${CYAN})` }} />
      </div>

      {/* Main form row */}
      <div style={{ width: '100%', maxWidth: '1200px', display: 'flex', flexDirection: isMobile ? 'column' : 'row', gap: isMobile ? '0' : '4rem', alignItems: 'stretch' }}>
        
        {/* Left Solid Cyan Block */}
        <div style={{
          background: CYAN,
          color: '#000',
          padding: '4rem 3rem',
          flex: '0 0 40%',
          position: 'relative',
          clipPath: 'polygon(0 0, 100% 0, 100% 85%, 85% 100%, 0 100%)',
        }}>
          <div style={{ fontSize: '0.75rem', letterSpacing: '0.15em', marginBottom: '1.5rem', fontWeight: 700 }}>
            // LIMITED AVAILABILITY
          </div>
          <h2 className="font-orbitron" style={{ fontWeight: 700, fontSize: '2rem', marginBottom: '1.5rem', lineHeight: 1.2 }}>
            READY TO<br/>TRANSCEND?
          </h2>
          <p style={{ fontSize: '0.9rem', lineHeight: 1.6, marginBottom: '3rem', fontWeight: 500, color: '#111' }}>
            Neural augmentation slots are limited. Beta enrollment closes when cognitive capacity is reached. There is no waitlist.
          </p>
        </div>

        {/* Right Form Area */}
        <div style={{
          flex: '1',
          background: SURFACE,
          padding: '4rem 3rem',
          border: `1px solid ${BORDER}`,
          marginTop: isMobile ? '-2rem' : '4rem',
          position: 'relative', zIndex: 1,
          display: 'flex', flexDirection: 'column', justifyContent: 'center'
        }}>
          {submitted ? (
            <div className="text-glow-cyan" style={{ color: CYAN, fontSize: '1.2rem', fontWeight: 600, animation: 'slide-up-fade 2s ease forwards' }}>
              // NEURAL LINK ESTABLISHED
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
              <div>
                <input 
                  type="email" 
                  value={email}
                  onChange={e => { setEmail(e.target.value); setError(false); }}
                  className={`input-minimal ${isShaking ? 'animate-shake' : ''}`} 
                  style={{ borderBottomColor: error ? '#ff0033' : undefined }}
                  placeholder="ENTER NEURAL ID // EMAIL" 
                />
                {error && <div style={{ color: '#ff0033', fontSize: '0.75rem', marginTop: '0.5rem', letterSpacing: '0.05em' }}>INVALID NEURAL ID</div>}
              </div>
              <button onClick={onEnlistClick} className="btn-primary" style={{ width: 'fit-content' }}>
                ENLIST
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Bottom deployment checklist */}
      <div style={{ width: '100%', maxWidth: '1200px', display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)', gap: '1rem' }}>
        {[
          { status: 'COMPLETE', label: 'IDENTITY VERIFICATION', detail: 'Biometric scan passed' },
          { status: 'PENDING', label: 'SLOT ALLOCATION', detail: 'Awaiting neural queue' },
          { status: 'STANDBY', label: 'IMPLANT SCHEDULING', detail: 'Post-enrollment assignment' },
        ].map(item => (
          <div key={item.label} style={{
            padding: '1rem 1.5rem',
            border: `1px solid rgba(0,255,255,0.1)`,
            background: 'rgba(0,255,255,0.02)',
            display: 'flex', alignItems: 'flex-start', gap: '1rem',
            clipPath: 'polygon(0 0, calc(100% - 8px) 0, 100% 8px, 100% 100%, 0 100%)',
          }}>
            <div style={{
              width: '6px', height: '6px', borderRadius: '50%', marginTop: '5px', flexShrink: 0,
              background: item.status === 'COMPLETE' ? CYAN : item.status === 'PENDING' ? '#ff2a6d' : '#333',
              boxShadow: item.status === 'COMPLETE' ? `0 0 8px ${CYAN}` : item.status === 'PENDING' ? '0 0 8px #ff2a6d' : 'none',
              animation: item.status !== 'STANDBY' ? 'pulse-dot 2s ease-in-out infinite' : 'none',
            }} />
            <div>
              <div style={{ color: '#888', fontSize: '0.58rem', letterSpacing: '0.15em', fontFamily: 'monospace', marginBottom: '0.25rem' }}>{item.status}</div>
              <div style={{ color: '#ddd', fontSize: '0.72rem', letterSpacing: '0.08em', fontFamily: 'monospace', fontWeight: 600 }}>{item.label}</div>
              <div style={{ color: '#444', fontSize: '0.6rem', letterSpacing: '0.05em', fontFamily: 'monospace', marginTop: '0.2rem' }}>{item.detail}</div>
            </div>
          </div>
        ))}
      </div>

    </section>
  );
}

// ─── Footer ────────────────────────────────────────────────
function Footer() {
  return (
    <footer style={{
      background: 'rgba(0, 5, 15, 0.95)',
      borderTop: `1px solid ${BORDER}`,
      padding: '4rem clamp(1.5rem,5vw,4rem) 2rem',
      position: 'relative', zIndex: 1,
    }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '4rem' }}>
        {/* Logo Info */}
        <div style={{ flex: '1 1 300px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
            <div style={{ width: '24px', height: '24px', background: CYAN, clipPath: 'polygon(0 0, 100% 0, 100% 60%, 40% 100%, 0 100%)' }} />
            <span className="font-orbitron" style={{ fontWeight: 900, fontSize: '1.2rem', color: '#fff', letterSpacing: '0.05em' }}>
              NX<span style={{ color: CYAN }}>-</span>7
            </span>
          </div>
          <div style={{ color: '#888', fontSize: '0.8rem', lineHeight: 1.8 }}>
            HELLO@NX7CORP.COM<br/>
            17888 67TH COURT NORTH<br/>
            LOXAHATCHEE,<br/>
            FL 33470 US
          </div>
        </div>

        {/* Quick Links */}
        <div style={{ flex: '1 1 150px' }}>
          <h4 className="text-glow-cyan" style={{ color: CYAN, fontSize: '0.75rem', letterSpacing: '0.1em', marginBottom: '1.5rem', textTransform: 'uppercase' }}>Quick Links</h4>
          <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
            <li><a href="#" style={{ color: '#888', textDecoration: 'none', fontSize: '0.8rem', transition: 'color 0.3s' }} onMouseEnter={e=>e.currentTarget.style.color='#fff'} onMouseLeave={e=>e.currentTarget.style.color='#888'}>About</a></li>
            <li><a href="#" style={{ color: '#888', textDecoration: 'none', fontSize: '0.8rem', transition: 'color 0.3s' }} onMouseEnter={e=>e.currentTarget.style.color='#fff'} onMouseLeave={e=>e.currentTarget.style.color='#888'}>Services</a></li>
            <li><a href="#" style={{ color: '#888', textDecoration: 'none', fontSize: '0.8rem', transition: 'color 0.3s' }} onMouseEnter={e=>e.currentTarget.style.color='#fff'} onMouseLeave={e=>e.currentTarget.style.color='#888'}>Blog</a></li>
            <li><a href="#" style={{ color: '#888', textDecoration: 'none', fontSize: '0.8rem', transition: 'color 0.3s' }} onMouseEnter={e=>e.currentTarget.style.color='#fff'} onMouseLeave={e=>e.currentTarget.style.color='#888'}>Login | Sign Up</a></li>
          </ul>
        </div>

        {/* Legal */}
        <div style={{ flex: '1 1 150px' }}>
          <h4 className="text-glow-cyan" style={{ color: CYAN, fontSize: '0.75rem', letterSpacing: '0.1em', marginBottom: '1.5rem', textTransform: 'uppercase', visibility: 'hidden' }}>Legal</h4>
          <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
            <li><a href="#" style={{ color: '#888', textDecoration: 'none', fontSize: '0.8rem', transition: 'color 0.3s' }} onMouseEnter={e=>e.currentTarget.style.color='#fff'} onMouseLeave={e=>e.currentTarget.style.color='#888'}>FAQ</a></li>
            <li><a href="#" style={{ color: '#888', textDecoration: 'none', fontSize: '0.8rem', transition: 'color 0.3s' }} onMouseEnter={e=>e.currentTarget.style.color='#fff'} onMouseLeave={e=>e.currentTarget.style.color='#888'}>Terms of Use</a></li>
            <li><a href="#" style={{ color: '#888', textDecoration: 'none', fontSize: '0.8rem', transition: 'color 0.3s' }} onMouseEnter={e=>e.currentTarget.style.color='#fff'} onMouseLeave={e=>e.currentTarget.style.color='#888'}>Privacy Policy</a></li>
            <li><a href="#" style={{ color: '#888', textDecoration: 'none', fontSize: '0.8rem', transition: 'color 0.3s' }} onMouseEnter={e=>e.currentTarget.style.color='#fff'} onMouseLeave={e=>e.currentTarget.style.color='#888'}>Consultations</a></li>
          </ul>
        </div>
      </div>

      <div style={{ maxWidth: '1200px', margin: '3rem auto 0', borderTop: '1px solid #1a1a1a', paddingTop: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ color: '#555', fontSize: '0.7rem' }}>© 2087 NEXUS-7 CORP. ALL RIGHTS RESERVED.</span>
      </div>
    </footer>
  );
}

// ─── Main Landing ──────────────────────────────────────────
export default function NexusLanding() {
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = GLOBAL_CSS;
    document.head.appendChild(style);
    return () => { document.head.removeChild(style); };
  }, []);

  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  return (
    <div style={{ background: BG, color: TEXT, minHeight: '100vh', position: 'relative' }}>
      <CyberGrid />
      {/* 5. Scanline Overlay (Global) */}
      <div style={{
        position: 'fixed', zIndex: 9999, inset: 0, pointerEvents: 'none', opacity: 0.6,
        background: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0, 247, 255, 0.03) 3px, rgba(0, 247, 255, 0.03) 4px)'
      }} />

      <Navbar isMobile={isMobile} />
      <Hero isMobile={isMobile} />
      <Features isMobile={isMobile} />
      <Stats isMobile={isMobile} />
      <CTA isMobile={isMobile} />
      <Footer />
    </div>
  );
}
