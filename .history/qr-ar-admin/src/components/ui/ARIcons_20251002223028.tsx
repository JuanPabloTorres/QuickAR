import React from "react";

export interface ARIconProps {
  size?: number;
  className?: string;
  color?: string;
}

// Modern AR Cube Icon for 3D Models
export const ARCubeIcon: React.FC<ARIconProps> = ({
  size = 24,
  className = "",
  color = "currentColor",
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    className={className}
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M12 2L2 7V17L12 22L22 17V7L12 2Z"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      fill="none"
    />
    <path
      d="M2 7L12 12L22 7"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M12 12V22"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <circle cx="12" cy="12" r="1" fill={color} opacity="0.6" />
  </svg>
);

// Modern AR Image/Photo Icon
export const ARImageIcon: React.FC<ARIconProps> = ({
  size = 24,
  className = "",
  color = "currentColor",
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    className={className}
    xmlns="http://www.w3.org/2000/svg"
  >
    {/* Marco */}
    <rect
      x="3"
      y="3"
      width="18"
      height="18"
      rx="3"
      ry="3"
      stroke={color}
      strokeWidth="2"
      fill="none"
    />

    {/* Círculo de cámara (foto) */}
    <circle cx="8" cy="8" r="2" fill={color} opacity="0.8" />
    <circle cx="8" cy="8" r="0.7" fill="white" opacity="0.9" />

    {/* Paisaje principal */}
    <path
      d="M21 16L16 11L6 21"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />

    {/* Paisaje secundario (suave, más fino) */}
    <path
      d="M3 17.5L8.2 12.5L12.5 17"
      stroke={color}
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      opacity="0.5"
    />

    {/* Línea base suave */}
    <path
      d="M3 19H21"
      stroke={color}
      strokeWidth="1.2"
      strokeLinecap="round"
      opacity="0.4"
    />
  </svg>
);

// Modern Video/Play Icon
export const ARVideoIcon: React.FC<ARIconProps> = ({
  size = 24,
  className = "",
  color = "currentColor",
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    className={className}
    xmlns="http://www.w3.org/2000/svg"
  >
    <rect
      x="2"
      y="3"
      width="20"
      height="18"
      rx="2"
      ry="2"
      stroke={color}
      strokeWidth="2"
      fill="none"
    />
    <path
      d="M10 8L16 12L10 16V8Z"
      fill={color}
      stroke={color}
      strokeWidth="1"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <circle cx="19" cy="6" r="2" fill={color} opacity="0.6" />
  </svg>
);

/// Modern AR Message Icon
export const ARMessageIcon: React.FC<ARIconProps> = ({
  size = 24,
  className = "",
  color = "currentColor",
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    className={className}
    xmlns="http://www.w3.org/2000/svg"
  >
    {/* Marco */}
    <rect
      x="3"
      y="3"
      width="18"
      height="18"
      rx="3"
      ry="3"
      stroke={color}
      strokeWidth="2"
      fill="none"
    />

    {/* Encabezado de texto */}
    <line
      x1="7"
      y1="8"
      x2="17"
      y2="8"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
    />

    {/* Línea de párrafo 1 */}
    <line
      x1="7"
      y1="12"
      x2="15"
      y2="12"
      stroke={color}
      strokeWidth="1.8"
      strokeLinecap="round"
      opacity="0.8"
    />

    {/* Línea de párrafo 2 */}
    <line
      x1="7"
      y1="16"
      x2="13"
      y2="16"
      stroke={color}
      strokeWidth="1.6"
      strokeLinecap="round"
      opacity="0.6"
    />

    {/* Línea base sutil */}
    <path
      d="M3 19.5H21"
      stroke={color}
      strokeWidth="1.2"
      strokeLinecap="round"
      opacity="0.4"
    />
  </svg>
);

// Modern AR/Scanner Icon (Generic AR)
export const ARScanIcon: React.FC<ARIconProps> = ({
  size = 24,
  className = "",
  color = "currentColor",
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    className={className}
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M3 7V5C3 3.89543 3.89543 3 5 3H7"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M17 3H19C20.1046 3 21 3.89543 21 5V7"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M21 17V19C21 20.1046 20.1046 21 19 21H17"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M7 21H5C3.89543 21 3 20.1046 3 19V17"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <circle cx="12" cy="12" r="3" stroke={color} strokeWidth="2" fill="none" />
    <path d="M12 9V15" stroke={color} strokeWidth="1" opacity="0.5" />
    <path d="M9 12H15" stroke={color} strokeWidth="1" opacity="0.5" />
  </svg>
);

// Icon selector component
export const getARIcon = (kind: string, props: ARIconProps = {}) => {
  switch (kind) {
    case "model3d":
      return <ARCubeIcon {...props} />;
    case "image":
      return <ARImageIcon {...props} />;
    case "video":
      return <ARVideoIcon {...props} />;
    case "message":
      return <ARMessageIcon {...props} />;
    default:
      return <ARScanIcon {...props} />;
  }
};
