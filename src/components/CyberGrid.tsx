import { useEffect, useRef } from 'react';

export const CyberGrid = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    let offset = 0;
    let raf: number;
    let isVisible = true;
    
    const handleVisibilityChange = () => {
      isVisible = document.visibilityState === 'visible';
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();

    const draw = () => {
      if (isVisible) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        const isMobile = window.innerWidth < 768;
        const LINES = isMobile ? 12 : 20;
        const COLS = isMobile ? 8 : 16;
        const SPEED = isMobile ? 0.2 : 0.4;
        const VP_X = canvas.width / 2;
        const VP_Y = canvas.height * 0.3;

        offset = (offset + SPEED) % (canvas.height / LINES);
        
        // horizontal lines
        for (let i = 0; i <= LINES; i++) {
          const t = i / LINES;
          const y = VP_Y + (canvas.height - VP_Y) * Math.pow(t, 1.8) + (offset * t * LINES);
          if (y > canvas.height) continue;
          
          const alpha = i % 4 === 0 ? 0.6 : 0.25;
          const fade = Math.max(0, (y - VP_Y) / (canvas.height - VP_Y));
          
          ctx.strokeStyle = `rgba(0, 255, 255, ${alpha * fade})`;
          ctx.lineWidth = 0.5;
          ctx.beginPath();
          
          const wave = Math.sin(Date.now() * 0.001 + i) * (i / LINES) * 4;
          
          ctx.moveTo(0, y + wave);
          ctx.lineTo(canvas.width, y + wave);
          ctx.stroke();
        }
        
        // vertical convergence lines
        for (let j = 0; j <= COLS; j++) {
          const xBottom = (j / COLS) * canvas.width;
          const alpha = j % 4 === 0 ? 0.5 : 0.2;
          
          // Using a linear gradient to fade vertical lines out near the VP
          const grad = ctx.createLinearGradient(0, VP_Y, 0, canvas.height);
          grad.addColorStop(0, `rgba(0, 255, 255, 0)`);
          grad.addColorStop(0.2, `rgba(0, 255, 255, ${alpha * 0.4})`);
          grad.addColorStop(1, `rgba(0, 255, 255, ${alpha})`);
          
          ctx.strokeStyle = grad;
          ctx.lineWidth = 0.5;
          ctx.beginPath();
          ctx.moveTo(VP_X, VP_Y);
          ctx.lineTo(xBottom, canvas.height);
          ctx.stroke();
        }
      }
      
      raf = requestAnimationFrame(draw);
    };
    
    draw();
    
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', resizeCanvas);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);
  
  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed',
        top: 0, left: 0,
        width: '100%', height: '100%',
        zIndex: 0,
        pointerEvents: 'none',
        opacity: 1
      }}
    />
  );
};
