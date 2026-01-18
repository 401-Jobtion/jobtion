import { useRef, useEffect } from 'react';

/**
 * Animated polygon network background with mouse interaction
 * Reusable across multiple pages for consistent visual identity
 */
export default function PolygonBackground({ isDark = true }) {
  const canvasRef = useRef(null);
  const dotsRef = useRef([]);
  const mouseRef = useRef({ x: -1000, y: -1000 });
  const animationRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    // Initialize random dots
    const numDots = 80;
    dotsRef.current = Array.from({ length: numDots }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      vx: (Math.random() - 0.5) * 0.3,
      vy: (Math.random() - 0.5) * 0.3,
      radius: Math.random() * 2 + 1,
    }));

    const handleMouseMove = (e) => {
      mouseRef.current = { x: e.clientX, y: e.clientY };
    };

    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('resize', handleResize);

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const mouseInfluenceRadius = 150;
      const connectionDistance = 120;

      // Update and draw dots
      dotsRef.current.forEach((dot) => {
        // Calculate distance from mouse
        const dx = mouseRef.current.x - dot.x;
        const dy = mouseRef.current.y - dot.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        // Move away from mouse
        if (dist < mouseInfluenceRadius) {
          const angle = Math.atan2(dy, dx);
          const force = (mouseInfluenceRadius - dist) / mouseInfluenceRadius;
          dot.vx -= Math.cos(angle) * force * 0.8;
          dot.vy -= Math.sin(angle) * force * 0.8;
        }

        // Apply velocity
        dot.x += dot.vx;
        dot.y += dot.vy;

        // Damping
        dot.vx *= 0.95;
        dot.vy *= 0.95;

        // Bounce off edges
        if (dot.x < 0 || dot.x > canvas.width) {
          dot.vx *= -1;
          dot.x = Math.max(0, Math.min(canvas.width, dot.x));
        }
        if (dot.y < 0 || dot.y > canvas.height) {
          dot.vy *= -1;
          dot.y = Math.max(0, Math.min(canvas.height, dot.y));
        }

        // Draw dot
        ctx.fillStyle = isDark ? 'rgba(96, 165, 250, 0.6)' : 'rgba(59, 130, 246, 0.6)';
        ctx.beginPath();
        ctx.arc(dot.x, dot.y, dot.radius, 0, Math.PI * 2);
        ctx.fill();
      });

      // Draw connections between nearby dots
      ctx.strokeStyle = isDark ? 'rgba(96, 165, 250, 0.15)' : 'rgba(59, 130, 246, 0.15)';
      ctx.lineWidth = 1;
      for (let i = 0; i < dotsRef.current.length; i++) {
        for (let j = i + 1; j < dotsRef.current.length; j++) {
          const dx = dotsRef.current[i].x - dotsRef.current[j].x;
          const dy = dotsRef.current[i].y - dotsRef.current[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < connectionDistance) {
            ctx.beginPath();
            ctx.moveTo(dotsRef.current[i].x, dotsRef.current[i].y);
            ctx.lineTo(dotsRef.current[j].x, dotsRef.current[j].y);
            ctx.stroke();
          }
        }
      }

      animationRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('resize', handleResize);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isDark]);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        zIndex: 0,
      }}
    />
  );
}