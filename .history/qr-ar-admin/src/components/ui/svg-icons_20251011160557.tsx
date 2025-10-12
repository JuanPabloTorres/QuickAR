interface SvgIconProps {
  className?: string;
  size?: number;
  color?: string;
}

// Dashboard/Home Icon - Geometric AR-inspired design
export function HomeIcon({
  className = "",
  size = 24,
  color = "currentColor",
}: SvgIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      className={className}
    >
      <path
        d="M12 2L2 12H5V22H10V15H14V22H19V12H22L12 2Z"
        fill={color}
        opacity="0.8"
      />
      <path d="M12 2L22 12H19V10L12 4L5 10V12H2L12 2Z" fill={color} />
      {/* AR overlay effect */}
      <circle cx="12" cy="12" r="2" fill="#3DD8B6" opacity="0.6" />
      <circle cx="12" cy="12" r="1" fill="#00D4FF" />
    </svg>
  );
}

// Plus Icon - Futuristic cross with depth
export function PlusIcon({
  className = "",
  size = 24,
  color = "currentColor",
}: SvgIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      className={className}
    >
      <defs>
        <linearGradient id="plusGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#3DD8B6" />
          <stop offset="100%" stopColor="#00D4FF" />
        </linearGradient>
      </defs>
      {/* Outer glow */}
      <rect
        x="10"
        y="4"
        width="4"
        height="16"
        rx="2"
        fill="url(#plusGradient)"
        opacity="0.3"
      />
      <rect
        x="4"
        y="10"
        width="16"
        height="4"
        rx="2"
        fill="url(#plusGradient)"
        opacity="0.3"
      />
      {/* Main cross */}
      <rect
        x="11"
        y="5"
        width="2"
        height="14"
        rx="1"
        fill="url(#plusGradient)"
      />
      <rect
        x="5"
        y="11"
        width="14"
        height="2"
        rx="1"
        fill="url(#plusGradient)"
      />
      {/* Center dot */}
      <circle cx="12" cy="12" r="1.5" fill="#ffffff" opacity="0.9" />
    </svg>
  );
}

// Sparkles Icon - AR particles effect
export function SparklesIcon({
  className = "",
  size = 24,
  color = "currentColor",
}: SvgIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      className={className}
    >
      <defs>
        <linearGradient
          id="sparkleGradient"
          x1="0%"
          y1="0%"
          x2="100%"
          y2="100%"
        >
          <stop offset="0%" stopColor="#3DD8B6" />
          <stop offset="50%" stopColor="#00D4FF" />
          <stop offset="100%" stopColor="#8B5CF6" />
        </linearGradient>
      </defs>
      {/* Main sparkle */}
      <path
        d="M12 2L14 8L20 6L14 10L16 16L12 12L8 16L10 10L4 6L10 8L12 2Z"
        fill="url(#sparkleGradient)"
        opacity="0.8"
      />
      {/* Small sparkles */}
      <circle cx="6" cy="4" r="1" fill="#3DD8B6" />
      <circle cx="18" cy="5" r="1.5" fill="#00D4FF" />
      <circle cx="20" cy="15" r="1" fill="#8B5CF6" />
      <circle cx="5" cy="18" r="1.5" fill="#3DD8B6" />
      {/* AR glitch lines */}
      <rect x="2" y="12" width="6" height="0.5" fill="#3DD8B6" opacity="0.6" />
      <rect x="16" y="8" width="4" height="0.5" fill="#00D4FF" opacity="0.6" />
    </svg>
  );
}

// Analytics/Chart Icon - 3D bar chart with AR elements
export function AnalyticsIcon({
  className = "",
  size = 24,
  color = "currentColor",
}: SvgIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      className={className}
    >
      <defs>
        <linearGradient id="barGradient1" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#3DD8B6" />
          <stop offset="100%" stopColor="#00D4FF" />
        </linearGradient>
        <linearGradient id="barGradient2" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#00D4FF" />
          <stop offset="100%" stopColor="#8B5CF6" />
        </linearGradient>
      </defs>
      {/* 3D Base */}
      <path d="M2 20L4 18L22 18L20 20Z" fill="#1a1a2e" opacity="0.8" />
      {/* Bars with 3D effect */}
      <rect x="4" y="12" width="3" height="8" fill="url(#barGradient1)" />
      <path d="M4 12L5.5 10.5L8.5 10.5L7 12Z" fill="#3DD8B6" opacity="0.7" />

      <rect x="9" y="8" width="3" height="12" fill="url(#barGradient2)" />
      <path d="M9 8L10.5 6.5L13.5 6.5L12 8Z" fill="#00D4FF" opacity="0.7" />

      <rect x="14" y="14" width="3" height="6" fill="url(#barGradient1)" />
      <path
        d="M14 14L15.5 12.5L18.5 12.5L17 14Z"
        fill="#3DD8B6"
        opacity="0.7"
      />

      <rect x="19" y="10" width="3" height="10" fill="url(#barGradient2)" />
      <path d="M19 10L20.5 8.5L23.5 8.5L22 10Z" fill="#00D4FF" opacity="0.7" />

      {/* AR data points */}
      <circle cx="5.5" cy="8" r="1" fill="#ffffff" opacity="0.9" />
      <circle cx="10.5" cy="4" r="1" fill="#ffffff" opacity="0.9" />
      <circle cx="15.5" cy="10" r="1" fill="#ffffff" opacity="0.9" />
      <circle cx="20.5" cy="6" r="1" fill="#ffffff" opacity="0.9" />
    </svg>
  );
}

// Settings Icon - Gear with AR enhancement
export function SettingsIcon({
  className = "",
  size = 24,
  color = "currentColor",
}: SvgIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      className={className}
    >
      <defs>
        <linearGradient id="gearGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#3DD8B6" />
          <stop offset="50%" stopColor="#00D4FF" />
          <stop offset="100%" stopColor="#1a1a2e" />
        </linearGradient>
      </defs>
      {/* Outer gear */}
      <path
        d="M12 1L15.09 2.26L16.74 0.61L18.35 2.22L16.7 3.87L18.96 6.04L17.74 7.26L15.57 5L12 6.26L8.43 5L6.26 7.26L5.04 6.04L7.3 3.87L5.65 2.22L7.26 0.61L8.91 2.26L12 1Z"
        fill="url(#gearGradient)"
        opacity="0.8"
      />
      {/* Main gear body */}
      <circle cx="12" cy="12" r="4" fill="url(#gearGradient)" />
      <circle cx="12" cy="12" r="2" fill="#1a1a2e" />

      {/* Gear teeth */}
      <rect x="11.5" y="2" width="1" height="2" fill="#3DD8B6" />
      <rect x="11.5" y="20" width="1" height="2" fill="#3DD8B6" />
      <rect x="2" y="11.5" width="2" height="1" fill="#3DD8B6" />
      <rect x="20" y="11.5" width="2" height="1" fill="#3DD8B6" />

      {/* Diagonal teeth */}
      <rect
        x="5.5"
        y="5.5"
        width="1.4"
        height="1.4"
        fill="#00D4FF"
        transform="rotate(45 6.2 6.2)"
      />
      <rect
        x="17.1"
        y="5.5"
        width="1.4"
        height="1.4"
        fill="#00D4FF"
        transform="rotate(45 17.8 6.2)"
      />
      <rect
        x="5.5"
        y="17.1"
        width="1.4"
        height="1.4"
        fill="#00D4FF"
        transform="rotate(45 6.2 17.8)"
      />
      <rect
        x="17.1"
        y="17.1"
        width="1.4"
        height="1.4"
        fill="#00D4FF"
        transform="rotate(45 17.8 17.8)"
      />

      {/* Center AR core */}
      <circle cx="12" cy="12" r="1" fill="#ffffff" opacity="0.9" />
    </svg>
  );
}

// Menu Icon - Holographic bars
export function MenuIcon({
  className = "",
  size = 24,
  color = "currentColor",
}: SvgIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      className={className}
    >
      <defs>
        <linearGradient id="menuGradient" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#3DD8B6" />
          <stop offset="50%" stopColor="#00D4FF" />
          <stop offset="100%" stopColor="#8B5CF6" />
        </linearGradient>
      </defs>
      {/* Menu bars with glow effect */}
      <rect
        x="3"
        y="5"
        width="18"
        height="2"
        rx="1"
        fill="url(#menuGradient)"
      />
      <rect
        x="3"
        y="5"
        width="18"
        height="0.5"
        rx="0.25"
        fill="#ffffff"
        opacity="0.5"
      />

      <rect
        x="3"
        y="11"
        width="18"
        height="2"
        rx="1"
        fill="url(#menuGradient)"
      />
      <rect
        x="3"
        y="11"
        width="18"
        height="0.5"
        rx="0.25"
        fill="#ffffff"
        opacity="0.5"
      />

      <rect
        x="3"
        y="17"
        width="18"
        height="2"
        rx="1"
        fill="url(#menuGradient)"
      />
      <rect
        x="3"
        y="17"
        width="18"
        height="0.5"
        rx="0.25"
        fill="#ffffff"
        opacity="0.5"
      />

      {/* AR connection dots */}
      <circle cx="2" cy="6" r="1" fill="#3DD8B6" opacity="0.8" />
      <circle cx="2" cy="12" r="1" fill="#00D4FF" opacity="0.8" />
      <circle cx="2" cy="18" r="1" fill="#8B5CF6" opacity="0.8" />
    </svg>
  );
}

// User Icon - Stylized avatar with AR halo
export function UserIcon({
  className = "",
  size = 24,
  color = "currentColor",
}: SvgIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      className={className}
    >
      <defs>
        <radialGradient id="userGradient" cx="50%" cy="30%">
          <stop offset="0%" stopColor="#3DD8B6" />
          <stop offset="70%" stopColor="#00D4FF" />
          <stop offset="100%" stopColor="#1a1a2e" />
        </radialGradient>
      </defs>
      {/* AR halo */}
      <circle
        cx="12"
        cy="12"
        r="10"
        fill="none"
        stroke="#3DD8B6"
        strokeWidth="0.5"
        opacity="0.3"
      />
      <circle
        cx="12"
        cy="12"
        r="8"
        fill="none"
        stroke="#00D4FF"
        strokeWidth="0.5"
        opacity="0.5"
      />

      {/* Head */}
      <circle cx="12" cy="8" r="3" fill="url(#userGradient)" />

      {/* Body */}
      <path
        d="M6 20C6 16 8.5 14 12 14C15.5 14 18 16 18 20"
        fill="url(#userGradient)"
      />

      {/* AR identifier dots */}
      <circle cx="9" cy="7" r="0.5" fill="#ffffff" opacity="0.8" />
      <circle cx="15" cy="7" r="0.5" fill="#ffffff" opacity="0.8" />

      {/* Data streams */}
      <rect
        x="1"
        y="9"
        width="3"
        height="0.5"
        rx="0.25"
        fill="#3DD8B6"
        opacity="0.4"
      />
      <rect
        x="20"
        y="11"
        width="3"
        height="0.5"
        rx="0.25"
        fill="#00D4FF"
        opacity="0.4"
      />
      <rect
        x="2"
        y="15"
        width="2"
        height="0.5"
        rx="0.25"
        fill="#8B5CF6"
        opacity="0.4"
      />
    </svg>
  );
}

// Eye Icon - AR Vision with scanning effect
export function EyeIcon({
  className = "",
  size = 24,
  color = "currentColor",
}: SvgIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      className={className}
    >
      <defs>
        <radialGradient id="eyeGradient" cx="50%" cy="50%">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="30%" stopColor="#00D4FF" />
          <stop offset="70%" stopColor="#3DD8B6" />
          <stop offset="100%" stopColor="#1a1a2e" />
        </radialGradient>
      </defs>
      {/* Eye shape */}
      <path
        d="M12 4C7 4 2.73 7.11 1 12C2.73 16.89 7 20 12 20C17 20 21.27 16.89 23 12C21.27 7.11 17 4 12 4Z"
        fill="url(#eyeGradient)"
        opacity="0.8"
      />
      {/* Iris */}
      <circle cx="12" cy="12" r="3" fill="#00D4FF" opacity="0.9" />
      {/* Pupil */}
      <circle cx="12" cy="12" r="1.5" fill="#1a1a2e" />
      {/* AR scanning lines */}
      <path d="M8 12L16 12" stroke="#3DD8B6" strokeWidth="0.5" opacity="0.6" />
      <path d="M12 8L12 16" stroke="#3DD8B6" strokeWidth="0.5" opacity="0.6" />
      {/* Scanning grid */}
      <rect
        x="10"
        y="10"
        width="4"
        height="4"
        fill="none"
        stroke="#00D4FF"
        strokeWidth="0.3"
        opacity="0.4"
      />
      {/* Corner markers */}
      <rect x="6" y="8" width="2" height="0.5" fill="#3DD8B6" opacity="0.6" />
      <rect x="16" y="8" width="2" height="0.5" fill="#3DD8B6" opacity="0.6" />
      <rect
        x="6"
        y="15.5"
        width="2"
        height="0.5"
        fill="#3DD8B6"
        opacity="0.6"
      />
      <rect
        x="16"
        y="15.5"
        width="2"
        height="0.5"
        fill="#3DD8B6"
        opacity="0.6"
      />
    </svg>
  );
}

// QR Code Icon - Stylized with AR elements
export function QrCodeIcon({
  className = "",
  size = 24,
  color = "currentColor",
}: SvgIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      className={className}
    >
      <defs>
        <linearGradient id="qrGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#3DD8B6" />
          <stop offset="100%" stopColor="#00D4FF" />
        </linearGradient>
      </defs>
      {/* Corner squares */}
      <rect x="2" y="2" width="6" height="6" rx="1" fill="url(#qrGradient)" />
      <rect x="16" y="2" width="6" height="6" rx="1" fill="url(#qrGradient)" />
      <rect x="2" y="16" width="6" height="6" rx="1" fill="url(#qrGradient)" />

      {/* Inner squares */}
      <rect x="4" y="4" width="2" height="2" rx="0.5" fill="#1a1a2e" />
      <rect x="18" y="4" width="2" height="2" rx="0.5" fill="#1a1a2e" />
      <rect x="4" y="18" width="2" height="2" rx="0.5" fill="#1a1a2e" />

      {/* QR pattern */}
      <circle cx="12" cy="6" r="0.8" fill="#3DD8B6" />
      <circle cx="18" cy="12" r="0.8" fill="#00D4FF" />
      <circle cx="12" cy="12" r="0.8" fill="#3DD8B6" />
      <circle cx="6" cy="12" r="0.8" fill="#00D4FF" />
      <circle cx="12" cy="18" r="0.8" fill="#3DD8B6" />

      {/* AR scanning effect */}
      <rect
        x="10"
        y="10"
        width="4"
        height="4"
        fill="none"
        stroke="#00D4FF"
        strokeWidth="0.5"
        opacity="0.6"
      />
      <circle cx="12" cy="12" r="1" fill="#ffffff" opacity="0.8" />
    </svg>
  );
}

// Logout Icon - Futuristic exit door
export function LogoutIcon({
  className = "",
  size = 24,
  color = "currentColor",
}: SvgIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      className={className}
    >
      <defs>
        <linearGradient id="logoutGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#ef4444" />
          <stop offset="100%" stopColor="#dc2626" />
        </linearGradient>
      </defs>
      {/* Door frame */}
      <rect
        x="3"
        y="4"
        width="10"
        height="16"
        rx="2"
        fill="#1a1a2e"
        stroke="url(#logoutGradient)"
        strokeWidth="1"
      />
      {/* Door */}
      <rect
        x="4"
        y="5"
        width="8"
        height="14"
        rx="1"
        fill="url(#logoutGradient)"
        opacity="0.8"
      />
      {/* Door handle */}
      <circle cx="10" cy="12" r="0.8" fill="#ffffff" opacity="0.9" />
      {/* Exit arrow */}
      <path
        d="M15 12L19 12M19 12L17 10M19 12L17 14"
        stroke="#3DD8B6"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* AR exit indicators */}
      <rect x="21" y="10" width="2" height="0.5" fill="#3DD8B6" opacity="0.6" />
      <rect
        x="21"
        y="11"
        width="1.5"
        height="0.5"
        fill="#00D4FF"
        opacity="0.6"
      />
      <rect
        x="21"
        y="12.5"
        width="2"
        height="0.5"
        fill="#3DD8B6"
        opacity="0.6"
      />
      <rect
        x="21"
        y="13.5"
        width="1.5"
        height="0.5"
        fill="#00D4FF"
        opacity="0.6"
      />
    </svg>
  );
}

// X/Close Icon - Holographic cross
export function CloseIcon({
  className = "",
  size = 24,
  color = "currentColor",
}: SvgIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      className={className}
    >
      <defs>
        <linearGradient id="closeGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#ef4444" />
          <stop offset="50%" stopColor="#f97316" />
          <stop offset="100%" stopColor="#dc2626" />
        </linearGradient>
      </defs>
      {/* Glow effect */}
      <path
        d="M6 6L18 18M18 6L6 18"
        stroke="url(#closeGradient)"
        strokeWidth="3"
        strokeLinecap="round"
        opacity="0.3"
      />
      {/* Main cross */}
      <path
        d="M6 6L18 18M18 6L6 18"
        stroke="url(#closeGradient)"
        strokeWidth="2"
        strokeLinecap="round"
      />
      {/* Center intersection */}
      <circle
        cx="12"
        cy="12"
        r="2"
        fill="none"
        stroke="#ffffff"
        strokeWidth="0.5"
        opacity="0.6"
      />
    </svg>
  );
}

// Trophy/Achievement Icon - Futuristic trophy with AR elements
export function TrophyIcon({
  className = "",
  size = 24,
  color = "currentColor",
}: SvgIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      className={className}
    >
      <defs>
        <linearGradient id="trophyGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FFD700" />
          <stop offset="50%" stopColor="#FFA500" />
          <stop offset="100%" stopColor="#FF6B35" />
        </linearGradient>
      </defs>
      {/* Trophy base */}
      <rect
        x="8"
        y="18"
        width="8"
        height="3"
        rx="1"
        fill="url(#trophyGradient)"
      />
      <rect
        x="9"
        y="16"
        width="6"
        height="3"
        rx="1"
        fill="url(#trophyGradient)"
        opacity="0.8"
      />
      {/* Trophy cup */}
      <path
        d="M6 12C6 8 8.5 5 12 5C15.5 5 18 8 18 12C18 14.5 16.5 15.5 14 16H10C7.5 15.5 6 14.5 6 12Z"
        fill="url(#trophyGradient)"
      />
      {/* Trophy handles */}
      <path
        d="M5 8C4 8 3 9 3 10C3 11 4 12 5 12V8Z"
        fill="url(#trophyGradient)"
        opacity="0.7"
      />
      <path
        d="M19 8C20 8 21 9 21 10C21 11 20 12 19 12V8Z"
        fill="url(#trophyGradient)"
        opacity="0.7"
      />
      {/* AR glow effect */}
      <circle cx="12" cy="10" r="3" fill="#FFD700" opacity="0.3" />
      <circle cx="12" cy="10" r="1" fill="#FFFFFF" opacity="0.8" />
      {/* Sparkle effects */}
      <circle cx="8" cy="7" r="0.5" fill="#FFD700" />
      <circle cx="16" cy="6" r="0.5" fill="#FFA500" />
      <circle cx="14" cy="13" r="0.5" fill="#FFD700" />
    </svg>
  );
}

// Rocket Icon - Futuristic rocket with AR trail
export function RocketIcon({
  className = "",
  size = 24,
  color = "currentColor",
}: SvgIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      className={className}
    >
      <defs>
        <linearGradient id="rocketGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#3DD8B6" />
          <stop offset="50%" stopColor="#00D4FF" />
          <stop offset="100%" stopColor="#8B5CF6" />
        </linearGradient>
      </defs>
      {/* Rocket body */}
      <path
        d="M12 2C13 2 14 3 14 4V12C14 13 13 14 12 14C11 14 10 13 10 12V4C10 3 11 2 12 2Z"
        fill="url(#rocketGradient)"
      />
      {/* Rocket nose */}
      <path d="M12 2L10 4H14L12 2Z" fill="#FFFFFF" opacity="0.9" />
      {/* Rocket fins */}
      <path
        d="M8 12L10 14V16L8 14V12Z"
        fill="url(#rocketGradient)"
        opacity="0.7"
      />
      <path
        d="M16 12L14 14V16L16 14V12Z"
        fill="url(#rocketGradient)"
        opacity="0.7"
      />
      {/* Exhaust flames */}
      <path d="M10 14L12 18L14 14L12 16L10 14Z" fill="#FF6B35" />
      <path d="M11 16L12 20L13 16L12 18L11 16Z" fill="#FFD700" />
      {/* Window */}
      <circle cx="12" cy="8" r="1.5" fill="#00D4FF" opacity="0.8" />
      <circle cx="12" cy="8" r="0.8" fill="#FFFFFF" opacity="0.6" />
      {/* AR trail effect */}
      <circle cx="8" cy="6" r="0.5" fill="#3DD8B6" opacity="0.6" />
      <circle cx="16" cy="10" r="0.5" fill="#8B5CF6" opacity="0.6" />
    </svg>
  );
}

// Package/Box Icon - 3D box with AR elements
export function PackageIcon({
  className = "",
  size = 24,
  color = "currentColor",
}: SvgIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      className={className}
    >
      <defs>
        <linearGradient
          id="packageGradient1"
          x1="0%"
          y1="0%"
          x2="100%"
          y2="100%"
        >
          <stop offset="0%" stopColor="#8B5CF6" />
          <stop offset="100%" stopColor="#3DD8B6" />
        </linearGradient>
        <linearGradient id="packageGradient2" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#00D4FF" />
          <stop offset="100%" stopColor="#1a1a2e" />
        </linearGradient>
      </defs>
      {/* Box base */}
      <path
        d="M4 8L12 4L20 8V16L12 20L4 16V8Z"
        fill="url(#packageGradient1)"
        opacity="0.8"
      />
      {/* Box top face */}
      <path d="M4 8L12 4L20 8L12 12L4 8Z" fill="url(#packageGradient2)" />
      {/* Box right face */}
      <path
        d="M12 12L20 8V16L12 20V12Z"
        fill="url(#packageGradient1)"
        opacity="0.6"
      />
      {/* Box dividing lines */}
      <path
        d="M4 8L12 12V20"
        stroke="#FFFFFF"
        strokeWidth="0.5"
        opacity="0.8"
      />
      <path d="M12 12L20 8" stroke="#FFFFFF" strokeWidth="0.5" opacity="0.8" />
      {/* AR elements */}
      <circle cx="12" cy="10" r="1" fill="#00D4FF" opacity="0.8" />
      <rect x="11" y="6" width="2" height="1" fill="#3DD8B6" opacity="0.6" />
      <rect x="10" y="14" width="4" height="0.5" fill="#8B5CF6" opacity="0.6" />
    </svg>
  );
}

// Celebration Icon - Party/celebration with AR effects
export function CelebrationIcon({
  className = "",
  size = 24,
  color = "currentColor",
}: SvgIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      className={className}
    >
      <defs>
        <linearGradient
          id="celebrationGradient"
          x1="0%"
          y1="0%"
          x2="100%"
          y2="100%"
        >
          <stop offset="0%" stopColor="#FFD700" />
          <stop offset="33%" stopColor="#FF6B35" />
          <stop offset="66%" stopColor="#8B5CF6" />
          <stop offset="100%" stopColor="#3DD8B6" />
        </linearGradient>
      </defs>
      {/* Main burst center */}
      <circle
        cx="12"
        cy="12"
        r="3"
        fill="url(#celebrationGradient)"
        opacity="0.8"
      />
      <circle cx="12" cy="12" r="1.5" fill="#FFFFFF" opacity="0.9" />
      {/* Burst rays */}
      <path d="M12 2L13 8L12 6L11 8L12 2Z" fill="#FFD700" />
      <path d="M22 12L16 13L18 12L16 11L22 12Z" fill="#FF6B35" />
      <path d="M12 22L11 16L12 18L13 16L12 22Z" fill="#8B5CF6" />
      <path d="M2 12L8 11L6 12L8 13L2 12Z" fill="#3DD8B6" />
      {/* Diagonal rays */}
      <path d="M19 5L14 9L16 8L15 10L19 5Z" fill="#FFD700" opacity="0.8" />
      <path d="M19 19L15 14L16 16L14 15L19 19Z" fill="#FF6B35" opacity="0.8" />
      <path d="M5 19L9 15L8 16L10 14L5 19Z" fill="#8B5CF6" opacity="0.8" />
      <path d="M5 5L10 10L8 8L9 9L5 5Z" fill="#3DD8B6" opacity="0.8" />
      {/* Confetti particles */}
      <rect
        x="6"
        y="4"
        width="1"
        height="2"
        rx="0.5"
        fill="#FFD700"
        transform="rotate(45 6.5 5)"
      />
      <rect
        x="17"
        y="6"
        width="1"
        height="2"
        rx="0.5"
        fill="#FF6B35"
        transform="rotate(-30 17.5 7)"
      />
      <rect
        x="18"
        y="16"
        width="1"
        height="2"
        rx="0.5"
        fill="#8B5CF6"
        transform="rotate(60 18.5 17)"
      />
      <rect
        x="5"
        y="17"
        width="1"
        height="2"
        rx="0.5"
        fill="#3DD8B6"
        transform="rotate(-45 5.5 18)"
      />
    </svg>
  );
}

// Check/Success Icon - Checkmark with AR glow
export function CheckIcon({
  className = "",
  size = 24,
  color = "currentColor",
}: SvgIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      className={className}
    >
      <defs>
        <linearGradient id="checkGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#10B981" />
          <stop offset="100%" stopColor="#3DD8B6" />
        </linearGradient>
      </defs>
      {/* Outer circle glow */}
      <circle cx="12" cy="12" r="11" fill="url(#checkGradient)" opacity="0.2" />
      <circle
        cx="12"
        cy="12"
        r="9"
        stroke="url(#checkGradient)"
        strokeWidth="1"
        opacity="0.4"
      />
      {/* Check mark */}
      <path
        d="M8 12L11 15L16 9"
        stroke="url(#checkGradient)"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Inner glow */}
      <circle cx="12" cy="12" r="3" fill="#10B981" opacity="0.3" />
    </svg>
  );
}

// Mail Icon - Futuristic envelope design
export function MailIcon({
  className = "",
  size = 24,
  color = "currentColor",
}: SvgIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      className={className}
    >
      <defs>
        <linearGradient id="mailGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#3DD8B6" />
          <stop offset="100%" stopColor="#00D4FF" />
        </linearGradient>
      </defs>
      <rect x="2" y="6" width="20" height="12" rx="2" fill="url(#mailGradient)" opacity="0.2" />
      <path d="M2 8L12 13L22 8" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M2 6H22V18H2V6Z" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="18" cy="10" r="1" fill="#00D4FF" opacity="0.8" />
    </svg>
  );
}

// Key Icon - Futuristic key with digital elements
export function KeyIcon({
  className = "",
  size = 24,
  color = "currentColor",
}: SvgIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      className={className}
    >
      <defs>
        <linearGradient id="keyGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FFD700" />
          <stop offset="100%" stopColor="#FFA500" />
        </linearGradient>
      </defs>
      <circle cx="8" cy="8" r="6" fill="url(#keyGradient)" opacity="0.2" />
      <circle cx="8" cy="8" r="6" stroke={color} strokeWidth="2" />
      <circle cx="8" cy="8" r="2" fill="#FFD700" />
      <path d="M14 8H22V10H20V12H18V10H16V12H14V8Z" fill={color} />
      <rect x="16" y="9" width="2" height="1" fill="#FFD700" />
    </svg>
  );
}

// Save Icon - Futuristic floppy disk
export function SaveIcon({
  className = "",
  size = 24,
  color = "currentColor",
}: SvgIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      className={className}
    >
      <defs>
        <linearGradient id="saveGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#00FF88" />
          <stop offset="100%" stopColor="#00D4FF" />
        </linearGradient>
      </defs>
      <rect x="3" y="3" width="18" height="18" rx="2" fill="url(#saveGradient)" opacity="0.2" />
      <path d="M19 21H5C3.9 21 3 20.1 3 19V5C3 3.9 3.9 3 5 3H16L21 8V19C21 20.1 20.1 21 19 21Z" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M17 21V13H7V21" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M7 3V8H15" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <rect x="9" y="15" width="6" height="2" fill="#00D4FF" />
    </svg>
  );
}

// Calendar Icon - Futuristic calendar design
export function CalendarIcon({
  className = "",
  size = 24,
  color = "currentColor",
}: SvgIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      className={className}
    >
      <defs>
        <linearGradient id="calendarGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#9333EA" />
          <stop offset="100%" stopColor="#3B82F6" />
        </linearGradient>
      </defs>
      <rect x="3" y="4" width="18" height="18" rx="2" fill="url(#calendarGradient)" opacity="0.2" />
      <rect x="3" y="4" width="18" height="18" rx="2" stroke={color} strokeWidth="2" />
      <path d="M16 2V6" stroke={color} strokeWidth="2" strokeLinecap="round" />
      <path d="M8 2V6" stroke={color} strokeWidth="2" strokeLinecap="round" />
      <path d="M3 10H21" stroke={color} strokeWidth="2" strokeLinecap="round" />
      <circle cx="9" cy="14" r="1" fill="#9333EA" />
      <circle cx="15" cy="14" r="1" fill="#3B82F6" />
      <circle cx="12" cy="18" r="1" fill="#00D4FF" />
    </svg>
  );
}

// Shield Icon - Cybersecurity shield
export function ShieldIcon({
  className = "",
  size = 24,
  color = "currentColor",
}: SvgIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      className={className}
    >
      <defs>
        <linearGradient id="shieldGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#00FF88" />
          <stop offset="100%" stopColor="#00D4FF" />
        </linearGradient>
      </defs>
      <path d="M12 22S2 15 2 8L12 2L22 8C22 15 12 22 12 22Z" fill="url(#shieldGradient)" opacity="0.2" />
      <path d="M12 22S2 15 2 8L12 2L22 8C22 15 12 22 12 22Z" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M9 12L11 14L15 10" stroke="#00FF88" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="12" cy="8" r="1" fill="#00D4FF" />
    </svg>
  );
}

// Eye Off Icon - Hidden eye
export function EyeOffIcon({
  className = "",
  size = 24,
  color = "currentColor",
}: SvgIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      className={className}
    >
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20C7 20 2.73 16.39 1 12A18.45 18.45 0 0 1 5.06 5.06M9.9 4.24A9.12 9.12 0 0 1 12 4C17 4 21.27 7.61 23 12A18.5 18.5 0 0 1 19.42 16.42" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="12" cy="12" r="3" stroke={color} strokeWidth="2" />
      <path d="M1 1L23 23" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

// Camera Icon - Futuristic camera
export function CameraIcon({
  className = "",
  size = 24,
  color = "currentColor",
}: SvgIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      className={className}
    >
      <defs>
        <linearGradient id="cameraGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FF6B6B" />
          <stop offset="100%" stopColor="#4ECDC4" />
        </linearGradient>
      </defs>
      <path d="M23 19C23 20.1 22.1 21 21 21H3C1.9 21 1 20.1 1 19V8C1 6.9 1.9 6 3 6H7L9 4H15L17 6H21C22.1 6 23 6.9 23 8V19Z" fill="url(#cameraGradient)" opacity="0.2" />
      <path d="M23 19C23 20.1 22.1 21 21 21H3C1.9 21 1 20.1 1 19V8C1 6.9 1.9 6 3 6H7L9 4H15L17 6H21C22.1 6 23 6.9 23 8V19Z" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="12" cy="13" r="4" stroke={color} strokeWidth="2" />
      <circle cx="12" cy="13" r="2" fill="#4ECDC4" />
    </svg>
  );
}

// Edit Icon - Futuristic pencil
export function EditIcon({
  className = "",
  size = 24,
  color = "currentColor",
}: SvgIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      className={className}
    >
      <defs>
        <linearGradient id="editGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#3B82F6" />
          <stop offset="100%" stopColor="#8B5CF6" />
        </linearGradient>
      </defs>
      <path d="M11 4H4C3.46957 4 2.96086 4.21071 2.58579 4.58579C2.21071 4.96086 2 5.46957 2 6V20C2 20.5304 2.21071 21.0391 2.58579 21.4142C2.96086 21.7893 3.46957 22 4 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V13" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M18.5 2.50001C18.8978 2.10219 19.4374 1.87869 20 1.87869C20.5626 1.87869 21.1022 2.10219 21.5 2.50001C21.8978 2.89784 22.1213 3.4374 22.1213 4.00001C22.1213 4.56262 21.8978 5.10219 21.5 5.50001L12 15L8 16L9 12L18.5 2.50001Z" fill="url(#editGradient)" opacity="0.3" />
      <path d="M18.5 2.50001C18.8978 2.10219 19.4374 1.87869 20 1.87869C20.5626 1.87869 21.1022 2.10219 21.5 2.50001C21.8978 2.89784 22.1213 3.4374 22.1213 4.00001C22.1213 4.56262 21.8978 5.10219 21.5 5.50001L12 15L8 16L9 12L18.5 2.50001Z" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export default {
  HomeIcon,
  PlusIcon,
  SparklesIcon,
  AnalyticsIcon,
  SettingsIcon,
  MenuIcon,
  UserIcon,
  EyeIcon,
  QrCodeIcon,
  LogoutIcon,
  CloseIcon,
  TrophyIcon,
  RocketIcon,
  PackageIcon,
  CelebrationIcon,
  CheckIcon,
  MailIcon,
  KeyIcon,
  SaveIcon,
  CalendarIcon,
  ShieldIcon,
  EyeOffIcon,
  CameraIcon,
  EditIcon,
};
