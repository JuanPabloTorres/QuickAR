"use client";

interface LoadingModalProps {
  isOpen: boolean;
  message?: string;
  submessage?: string;
}

export function LoadingModal({
  isOpen,
  message = "Cargando",
  submessage = "Por favor espera...",
}: LoadingModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      {/* Animated background particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-sky-500/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-purple-500/20 rounded-full blur-3xl animate-pulse delay-1000" />
        <div className="absolute top-1/2 right-1/3 w-48 h-48 bg-pink-500/20 rounded-full blur-3xl animate-pulse delay-500" />
      </div>

      {/* Modal content */}
      <div className="relative z-10 flex flex-col items-center justify-center p-8 space-y-6 animate-in zoom-in-95 duration-300">
        {/* Spinner with glow effect */}
        <div className="relative">
          {/* Outer glow ring */}
          <div className="absolute inset-0 w-32 h-32 rounded-full bg-gradient-to-r from-sky-500 via-purple-500 to-pink-500 opacity-30 blur-xl animate-pulse" />

          {/* Main spinner */}
          <div className="relative w-32 h-32">
            {/* Outer rotating ring */}
            <svg
              className="w-full h-full animate-[spin_3s_linear_infinite]"
              viewBox="0 0 100 100"
              fill="none"
            >
              <circle
                cx="50"
                cy="50"
                r="45"
                stroke="url(#gradient1)"
                strokeWidth="4"
                strokeLinecap="round"
                strokeDasharray="70 200"
                className="opacity-75"
              />
              <defs>
                <linearGradient
                  id="gradient1"
                  x1="0%"
                  y1="0%"
                  x2="100%"
                  y2="100%"
                >
                  <stop offset="0%" stopColor="#38bdf8" />
                  <stop offset="50%" stopColor="#a855f7" />
                  <stop offset="100%" stopColor="#ec4899" />
                </linearGradient>
              </defs>
            </svg>

            {/* Inner rotating ring - opposite direction */}
            <svg
              className="absolute inset-0 w-full h-full animate-[spin_2s_linear_infinite_reverse]"
              viewBox="0 0 100 100"
              fill="none"
            >
              <circle
                cx="50"
                cy="50"
                r="35"
                stroke="url(#gradient2)"
                strokeWidth="3"
                strokeLinecap="round"
                strokeDasharray="50 150"
                className="opacity-50"
              />
              <defs>
                <linearGradient
                  id="gradient2"
                  x1="100%"
                  y1="0%"
                  x2="0%"
                  y2="100%"
                >
                  <stop offset="0%" stopColor="#ec4899" />
                  <stop offset="50%" stopColor="#a855f7" />
                  <stop offset="100%" stopColor="#38bdf8" />
                </linearGradient>
              </defs>
            </svg>

            {/* Center AR icon */}
            <div className="absolute inset-0 flex items-center justify-center">
              <svg
                className="w-12 h-12 text-white animate-pulse"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"
                />
              </svg>
            </div>
          </div>
        </div>

        {/* Text content */}
        <div className="text-center space-y-3 max-w-md">
          <h3 className="text-2xl font-bold font-orbitron text-white animate-pulse">
            {message}
          </h3>
          <p className="text-slate-300 font-manrope text-lg">{submessage}</p>

          {/* Animated dots */}
          <div className="flex justify-center items-center space-x-2 pt-2">
            <div className="w-2 h-2 bg-sky-400 rounded-full animate-bounce [animation-delay:0ms]" />
            <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce [animation-delay:150ms]" />
            <div className="w-2 h-2 bg-pink-400 rounded-full animate-bounce [animation-delay:300ms]" />
          </div>
        </div>

        {/* Progress bar simulation */}
        <div className="w-64 h-1.5 bg-white/10 rounded-full overflow-hidden">
          <div className="h-full bg-gradient-to-r from-sky-500 via-purple-500 to-pink-500 rounded-full animate-[shimmer_2s_ease-in-out_infinite]" />
        </div>

        {/* Subtle hint */}
        <p className="text-xs text-slate-500 font-manrope mt-4 animate-pulse">
          Preparando una experiencia increíble...
        </p>
      </div>

      <style jsx>{`
        @keyframes shimmer {
          0% {
            transform: translateX(-100%);
          }
          100% {
            transform: translateX(400%);
          }
        }
      `}</style>
    </div>
  );
}
