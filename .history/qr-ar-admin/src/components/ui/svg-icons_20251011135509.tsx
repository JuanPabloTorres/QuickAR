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
};
