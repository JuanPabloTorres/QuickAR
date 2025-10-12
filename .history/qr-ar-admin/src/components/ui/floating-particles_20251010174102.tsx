"use client";

import { useEffect, useMemo } from "react";

interface Particle {
  id: number;
  x: number;
  y: number;
  size: number;
  speedX: number;
  speedY: number;
  opacity: number;
  color: string;
}

interface FloatingParticlesProps {
  count?: number;
  colors?: string[];
}

export function FloatingParticles({ 
  count = 20, 
  colors = ['#38bdf8', '#6366f1', '#8b5cf6', '#06b6d4'] 
}: FloatingParticlesProps) {
  const particles = useMemo(() => {
    return Array.from({ length: count }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 4 + 1,
      speedX: (Math.random() - 0.5) * 0.5,
      speedY: (Math.random() - 0.5) * 0.5,
      opacity: Math.random() * 0.7 + 0.3,
      color: colors[Math.floor(Math.random() * colors.length)]
    }));
  }, [count, colors]);

  useEffect(() => {
    const animateParticles = () => {
      particles.forEach((particle, index) => {
        const element = document.getElementById(`particle-${particle.id}`);
        if (element) {
          particle.x += particle.speedX;
          particle.y += particle.speedY;
          
          // Wrap around screen edges
          if (particle.x > 100) particle.x = -5;
          if (particle.x < -5) particle.x = 100;
          if (particle.y > 100) particle.y = -5;
          if (particle.y < -5) particle.y = 100;

          element.style.transform = `translate(${particle.x}vw, ${particle.y}vh)`;
        }
      });
    };

    const interval = setInterval(animateParticles, 50);
    return () => clearInterval(interval);
  }, [particles]);

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
      {particles.map((particle) => (
        <div
          key={particle.id}
          id={`particle-${particle.id}`}
          className="absolute rounded-full animate-pulse"
          style={{
            width: `${particle.size}px`,
            height: `${particle.size}px`,
            backgroundColor: particle.color,
            opacity: particle.opacity,
            transform: `translate(${particle.x}vw, ${particle.y}vh)`,
            transition: 'transform 0.05s linear',
            filter: 'blur(1px)',
          }}
        />
      ))}
    </div>
  );
}

// Component for success celebrations
export function SuccessCelebration({ show }: { show: boolean }) {
  if (!show) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
      {Array.from({ length: 50 }, (_, i) => (
        <div
          key={i}
          className="absolute text-2xl animate-bounce"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            animationDelay: `${Math.random() * 2}s`,
            animationDuration: `${Math.random() * 2 + 1}s`,
          }}
        >
          {['🎉', '✨', '🚀', '⭐', '🏆', '💫'][Math.floor(Math.random() * 6)]}
        </div>
      ))}
    </div>
  );
}