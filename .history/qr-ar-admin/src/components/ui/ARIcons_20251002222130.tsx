import React from 'react';

export interface ARIconProps {
  size?: number;
  className?: string;
  color?: string;
}

// Modern AR Cube Icon for 3D Models
export const ARCubeIcon: React.FC<ARIconProps> = ({ 
  size = 24, 
  className = "", 
  color = "currentColor" 
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
      strokeLineJoin="round"
    />
    <circle
      cx="12"
      cy="12"
      r="1"
      fill={color}
      opacity="0.6"
    />
  </svg>
);

// Modern Image/Photo Icon
export const ARImageIcon: React.FC<ARIconProps> = ({ 
  size = 24, 
  className = "", 
  color = "currentColor" 
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
      x="3"
      y="3"
      width="18"
      height="18"
      rx="2"
      ry="2"
      stroke={color}
      strokeWidth="2"
      fill="none"
    />
    <circle
      cx="8.5"
      cy="8.5"
      r="1.5"
      fill={color}
      opacity="0.7"
    />
    <path
      d="M21 15L16 10L5 21"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M3 17L8 12L12 16"
      stroke={color}
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      opacity="0.5"
    />
  </svg>
);

// Modern Video/Play Icon
export const ARVideoIcon: React.FC<ARIconProps> = ({ 
  size = 24, 
  className = "", 
  color = "currentColor" 
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
    <circle
      cx="19"
      cy="6"
      r="2"
      fill={color}
      opacity="0.6"
    />
  </svg>
);

// Modern Message/Chat Icon
export const ARMessageIcon: React.FC<ARIconProps> = ({ 
  size = 24, 
  className = "", 
  color = "currentColor" 
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
      d="M21 11.5C21.0034 12.8199 20.6951 14.1219 20.1 15.3C19.3944 16.7118 18.3098 17.8992 16.9674 18.7293C15.6251 19.5594 14.0782 19.9994 12.5 20C11.1801 20.0035 9.87812 19.6951 8.7 19.1L3 21L4.9 15.3C4.30493 14.1219 3.99656 12.8199 4 11.5C4.00061 9.92176 4.44061 8.37485 5.27072 7.03255C6.10083 5.69025 7.28825 4.60557 8.7 3.9C9.87812 3.30493 11.1801 2.99656 12.5 3H13C15.0843 3.11499 17.053 3.99476 18.5291 5.47086C20.0052 6.94695 20.885 8.91565 21 11V11.5Z"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      fill="none"
    />
    <circle cx="9" cy="12" r="1" fill={color} />
    <circle cx="12" cy="12" r="1" fill={color} />
    <circle cx="15" cy="12" r="1" fill={color} />
  </svg>
);

// Modern AR/Scanner Icon (Generic AR)
export const ARScanIcon: React.FC<ARIconProps> = ({ 
  size = 24, 
  className = "", 
  color = "currentColor" 
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
    <circle
      cx="12"
      cy="12"
      r="3"
      stroke={color}
      strokeWidth="2"
      fill="none"
    />
    <path
      d="M12 9V15"
      stroke={color}
      strokeWidth="1"
      opacity="0.5"
    />
    <path
      d="M9 12H15"
      stroke={color}
      strokeWidth="1"
      opacity="0.5"
    />
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
