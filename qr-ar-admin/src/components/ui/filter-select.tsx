import React from "react";

interface SelectOption {
  value: string;
  label: string;
}

interface FilterSelectProps {
  value: string;
  onChange: (value: string) => void;
  options: SelectOption[];
  placeholder?: string;
  icon?: React.ReactNode;
  className?: string;
  iconColor?: string;
}

export function FilterSelect({
  value,
  onChange,
  options,
  placeholder = "Seleccionar...",
  icon,
  className = "",
  iconColor = "text-sky-400",
}: FilterSelectProps) {
  return (
    <div className="relative group">
      <select
        className={`w-full px-4 py-3 ${
          icon ? "pl-11" : "pl-4"
        } pr-10 bg-slate-800/90 backdrop-blur-md text-white border border-slate-700 rounded-xl 
        focus:border-sky-400/60 focus:outline-none focus:ring-2 focus:ring-sky-400/30 
        text-sm appearance-none cursor-pointer transition-all duration-300 
        hover:bg-slate-700/90 hover:border-slate-600 font-medium shadow-lg hover:shadow-xl
        disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      >
        {placeholder && (
          <option value="" className="bg-slate-800 text-slate-400">
            {placeholder}
          </option>
        )}
        {options.map((option) => (
          <option
            key={option.value}
            value={option.value}
            className="bg-slate-800 text-white py-2"
          >
            {option.label}
          </option>
        ))}
      </select>

      {/* Left Icon */}
      {icon && (
        <div
          className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 ${iconColor} pointer-events-none`}
        >
          {icon}
        </div>
      )}

      {/* Dropdown Arrow */}
      <div className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-white/40 pointer-events-none group-hover:text-white/60 transition-colors">
        <svg
          className="w-full h-full"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </div>
    </div>
  );
}

// Iconos predefinidos para uso común en filtros
export const FilterIcons = {
  Category: (
    <svg
      className="w-full h-full"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
      />
    </svg>
  ),
  Status: (
    <svg
      className="w-full h-full"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
      />
    </svg>
  ),
  Sort: (
    <svg
      className="w-full h-full"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M3 4h13M3 8h9m-9 4h6m4 0l4-4m0 0l4 4m-4-4v12"
      />
    </svg>
  ),
  Filter: (
    <svg
      className="w-full h-full"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
      />
    </svg>
  ),
  Search: (
    <svg
      className="w-full h-full"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
      />
    </svg>
  ),
  Calendar: (
    <svg
      className="w-full h-full"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
      />
    </svg>
  ),
  User: (
    <svg
      className="w-full h-full"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
      />
    </svg>
  ),
};
