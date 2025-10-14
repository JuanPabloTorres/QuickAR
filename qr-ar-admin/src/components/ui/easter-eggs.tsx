"use client";

import { useEffect, useState } from "react";
import { FuturisticCard, FuturisticCardContent } from "./futuristic-card";

// Konami code sequence: ↑↑↓↓←→←→BA
const KONAMI_CODE = [
  "ArrowUp",
  "ArrowUp",
  "ArrowDown",
  "ArrowDown",
  "ArrowLeft",
  "ArrowRight",
  "ArrowLeft",
  "ArrowRight",
  "KeyB",
  "KeyA",
];

interface EasterEggProps {
  onActivate?: () => void;
}

export function EasterEggProvider({ onActivate }: EasterEggProps) {
  const [sequence, setSequence] = useState<string[]>([]);
  const [showSecret, setShowSecret] = useState(false);
  const [clickCount, setClickCount] = useState(0);
  const [showRainbow, setShowRainbow] = useState(false);

  // Konami Code Detection
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const newSequence = [...sequence, event.code].slice(-KONAMI_CODE.length);
      setSequence(newSequence);

      if (JSON.stringify(newSequence) === JSON.stringify(KONAMI_CODE)) {
        setShowSecret(true);
        onActivate?.();
        setTimeout(() => setShowSecret(false), 5000);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [sequence, onActivate]);

  // Click Counter Easter Egg
  const handleLogoClick = () => {
    const newCount = clickCount + 1;
    setClickCount(newCount);

    if (newCount === 10) {
      setShowRainbow(true);
      setTimeout(() => {
        setShowRainbow(false);
        setClickCount(0);
      }, 3000);
    }
  };

  return (
    <>
      {/* Konami Code Secret */}
      {showSecret && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100] flex items-center justify-center">
          <FuturisticCard variant="neon" className="max-w-md mx-4">
            <FuturisticCardContent className="p-8 text-center">
              <div className="text-6xl mb-4 animate-bounce">🎮</div>
              <h2 className="text-2xl font-bold font-orbitron text-white mb-2">
                ¡Código Konami Activado!
              </h2>
              <p className="text-slate-300 font-manrope mb-4">
                ¡Has descubierto el secreto de los desarrolladores! 🚀
              </p>
              <div className="text-4xl animate-pulse">
                🎉 ¡Eres increíble! 🎉
              </div>
            </FuturisticCardContent>
          </FuturisticCard>
        </div>
      )}

      {/* Rainbow Mode */}
      {showRainbow && (
        <div className="fixed inset-0 pointer-events-none z-50">
          <div className="absolute inset-0 bg-gradient-to-r from-red-500 via-yellow-500 to-purple-500 opacity-20 animate-pulse" />
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-6xl font-bold font-orbitron text-white animate-bounce">
            🌈 RAINBOW MODE! 🌈
          </div>
        </div>
      )}

      {/* Hidden click detector for logo */}
      <div
        onClick={handleLogoClick}
        className="fixed top-4 left-4 w-16 h-16 opacity-0 cursor-pointer z-10"
        title={`Clicks: ${clickCount}/10`}
      />
    </>
  );
}

// Fun motivational quotes that appear randomly
export function MotivationalQuote() {
  const quotes = [
    { text: "¡El futuro es AR y tú lo estás construyendo!", emoji: "🚀" },
    { text: "Cada experiencia AR es un nuevo universo", emoji: "🌌" },
    { text: "¡Transformando lo imposible en realidad!", emoji: "✨" },
    { text: "Tu creatividad no tiene límites", emoji: "🎨" },
    { text: "¡Conectando mundos virtuales y reales!", emoji: "🌍" },
  ];

  const [currentQuote, setCurrentQuote] = useState(quotes[0]);
  const [isVisible, setIsVisible] = useState(false);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    // Seleccionar una cita aleatoria inicial
    setCurrentQuote(quotes[Math.floor(Math.random() * quotes.length)]);

    // Mostrar la cita después de 2 segundos de carga
    const initialTimer = setTimeout(() => {
      setIsVisible(true);

      // Ocultar después de 5 segundos
      setTimeout(() => {
        setIsVisible(false);
      }, 5000);
    }, 2000);

    // Luego mostrar cada 60 segundos
    const interval = setInterval(() => {
      // Cambiar a una cita aleatoria
      setCurrentQuote(quotes[Math.floor(Math.random() * quotes.length)]);
      setIsVisible(true);

      // Ocultar después de 5 segundos
      setTimeout(() => {
        setIsVisible(false);
      }, 5000);
    }, 60000);

    return () => {
      clearTimeout(initialTimer);
      clearInterval(interval);
    };
  }, []);

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-4 right-4 max-w-xs z-40 animate-in slide-in-from-bottom-5 fade-in duration-500">
      <FuturisticCard
        variant="glass"
        className="cursor-pointer hover:scale-105 transition-transform"
      >
        <FuturisticCardContent className="p-4">
          <div className="flex items-center justify-between space-x-3">
            <div className="flex items-center space-x-2 flex-1">
              <div className="text-2xl animate-pulse">{currentQuote.emoji}</div>
              <p className="text-sm text-white font-manrope">
                {currentQuote.text}
              </p>
            </div>
            <button
              onClick={() => setIsVisible(false)}
              className="text-white/60 hover:text-white transition-colors p-1 hover:bg-white/10 rounded-lg ml-2"
              aria-label="Cerrar mensaje"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        </FuturisticCardContent>
      </FuturisticCard>
    </div>
  );
}

// Fun statistics that appear occasionally
export function FunFact({ experiences }: { experiences: any[] }) {
  const [showFact, setShowFact] = useState(false);
  const [currentFact, setCurrentFact] = useState("");

  useEffect(() => {
    if (experiences.length === 0) return;

    const facts = [
      `¡Has creado ${experiences.length} portales a nuevas dimensiones!`,
      `Tus experiencias han sido vistas ${experiences.reduce(
        (sum, exp) => sum + (exp.viewCount || 0),
        0
      )} veces`,
      `¡Eres oficialmente un mago de la realidad aumentada!`,
      `El AR está cambiando el mundo, ¡y tú eres parte de esa revolución!`,
    ];

    // Use a deterministic way to select fact based on experiences length
    const factIndex = experiences.length % facts.length;
    const selectedFact = facts[factIndex];
    setCurrentFact(selectedFact);

    const interval = setInterval(() => {
      setShowFact(true);
      setTimeout(() => setShowFact(false), 4000);
    }, 30000); // Show every 30 seconds

    return () => clearInterval(interval);
  }, [experiences]);

  if (!showFact) return null;

  return (
    <div className="fixed top-20 left-1/2 transform -translate-x-1/2 z-50 animate-in slide-in-from-top duration-500">
      <FuturisticCard variant="neon" className="max-w-md">
        <FuturisticCardContent className="p-4 text-center">
          <div className="text-3xl mb-2">💡</div>
          <p className="text-white font-manrope text-sm">{currentFact}</p>
        </FuturisticCardContent>
      </FuturisticCard>
    </div>
  );
}
