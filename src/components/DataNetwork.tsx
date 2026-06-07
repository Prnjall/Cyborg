import { useEffect, useRef } from 'react';

export const DataNetwork = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let raf: number;
    let isVisible = true;

    const handleVisibilityChange = () => {
      isVisible = document.visibilityState === 'visible';
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);

    const particles: { x: number, y: number, vx: number, vy: number, color: string }[] = [];
    const count = window.innerWidth < 768 ? 40 : 80;

    const resize = () => {
      const parent = canvas.parentElement;
      canvas.width = parent ? parent.clientWidth : window.innerWidth;
      canvas.height = parent ? parent.clientHeight : window.innerHeight;
    };
    window.addEventListener('resize', resize);
    resize();

    // Init particles
    for (let i = 0; i < count; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 1.5,
        vy: (Math.random() - 0.5) * 1.5,
        color: Math.random() > 0.85 ? '#ff2a6d' : '#00ffff'
      });
    }

    const draw = () => {
      if (isVisible) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.lineWidth = 0.5;

        for (let i = 0; i < count; i++) {
          const p = particles[i];
          p.x += p.vx;
          p.y += p.vy;

          // Bounce off edges
          if (p.x < 0 || p.x > canvas.width) p.vx *= -1;
          if (p.y < 0 || p.y > canvas.height) p.vy *= -1;

          // Draw node
          ctx.fillStyle = p.color;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.color === '#ff2a6d' ? 2 : 1.5, 0, Math.PI * 2);
          ctx.fill();

          // Connect nodes
          for (let j = i + 1; j < count; j++) {
            const p2 = particles[j];
            const dx = p.x - p2.x;
            const dy = p.y - p2.y;
            const dist = Math.sqrt(dx * dx + dy * dy);

            if (dist < 150) {
              ctx.beginPath();
              const alpha = 1 - dist / 150;
              // If either node is red, make the connection slightly red/magenta, else cyan
              ctx.strokeStyle = p.color === '#ff2a6d' || p2.color === '#ff2a6d' 
                ? `rgba(255, 42, 109, ${alpha * 0.4})`
                : `rgba(0, 255, 255, ${alpha * 0.3})`;
              ctx.moveTo(p.x, p.y);
              ctx.lineTo(p2.x, p2.y);
              ctx.stroke();
            }
          }
        }
      }
      raf = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', resize);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'absolute',
        top: 0, left: 0,
        width: '100%', height: '100%',
        zIndex: 0,
        pointerEvents: 'none',
        opacity: 0.6
      }}
    />
  );
};
