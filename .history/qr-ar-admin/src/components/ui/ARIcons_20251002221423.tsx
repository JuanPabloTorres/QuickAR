import React from 'react';

// Modern AR Cube SVG Icon based on the design you provided
export const ARCubeIcon: React.FC<{ className?: string }> = ({ className = "" }) => (
  <svg 
    width="24" 
    height="24" 
    viewBox="0 0 64 64" 
    fill="none" 
    xmlns="http://www.w3.org/2000/svg"
    className={`ar-svg-icon ${className}`}
  >
    {/* AR Frame Corners */}
    <path d="M8 8H16V12H12V16H8V8Z" fill="currentColor" opacity="0.8"/>
    <path d="M56 8H48V12H52V16H56V8Z" fill="currentColor" opacity="0.8"/>
    <path d="M8 56H16V52H12V48H8V56Z" fill="currentColor" opacity="0.8"/>
    <path d="M56 56H48V52H52V48H56V56Z" fill="currentColor" opacity="0.8"/>
    
    {/* 3D Cube */}
    <path d="M32 20L44 26V38L32 44L20 38V26L32 20Z" fill="currentColor" opacity="0.3"/>
    <path d="M32 20L44 26L32 32L20 26L32 20Z" fill="currentColor" opacity="0.9"/>
    <path d="M32 32V44L44 38V26L32 32Z" fill="currentColor" opacity="0.6"/>
    <path d="M20 26V38L32 44V32L20 26Z" fill="currentColor" opacity="0.4"/>
  </svg>
);

// Image/Photo SVG Icon
export const ImageIcon: React.FC<{ className?: string }> = ({ className = "" }) => (
  <svg 
    width="24" 
    height="24" 
    viewBox="0 0 24 24" 
    fill="none" 
    xmlns="http://www.w3.org/2000/svg"
    className={`ar-svg-icon ${className}`}
  >
    <rect x="3" y="3" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="2" fill="none"/>
    <circle cx="8.5" cy="8.5" r="1.5" fill="currentColor"/>
    <path d="M21 15L16 10L5 21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

// Video Play SVG Icon
export const VideoIcon: React.FC<{ className?: string }> = ({ className = "" }) => (
  <svg 
    width="24" 
    height="24" 
    viewBox="0 0 24 24" 
    fill="none" 
    xmlns="http://www.w3.org/2000/svg"
    className={`ar-svg-icon ${className}`}
  >
    <rect x="2" y="3" width="20" height="18" rx="2" stroke="currentColor" strokeWidth="2" fill="none"/>
    <polygon points="10,8 16,12 10,16" fill="currentColor"/>
  </svg>
);

// Message Bubble SVG Icon
export const MessageIcon: React.FC<{ className?: string }> = ({ className = "" }) => (
  <svg 
    width="24" 
    height="24" 
    viewBox="0 0 24 24" 
    fill="none" 
    xmlns="http://www.w3.org/2000/svg"
    className={`ar-svg-icon ${className}`}
  >
    <path d="M21 11.5C21 16.75 16.75 21 11.5 21C10.22 21 8.98 20.69 7.88 20.12L3 21L4.13 16.88C3.31 15.44 2.75 13.78 2.75 12C2.75 6.75 7 2.5 12.25 2.5C17.5 2.5 21 6.75 21 11.5Z" stroke="currentColor" strokeWidth="2" fill="none"/>
    <circle cx="8" cy="12" r="1" fill="currentColor"/>
    <circle cx="12" cy="12" r="1" fill="currentColor"/>
    <circle cx="16" cy="12" r="1" fill="currentColor"/>
  </svg>
);