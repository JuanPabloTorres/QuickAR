import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import React from "react";
import { FieldError, UseFormRegister } from "react-hook-form";

interface FormFieldProps {
  label: string;
  name: string;
  error?: FieldError;
  required?: boolean;
  className?: string;
  children: React.ReactNode;
}

export const FormField: React.FC<FormFieldProps> = ({
  label,
  name,
  error,
  required = false,
  className,
  children,
}) => {
  return (
    <div className={cn("space-y-2", className)}>
      <label
        id={`${name}-label`}
        htmlFor={name}
        className="text-sm font-medium text-white"
      >
        {label}
        {required && <span className="text-red-400 ml-1">*</span>}
      </label>
      {children}
      {error && <p className="text-red-400 text-sm">{error.message}</p>}
    </div>
  );
};

interface FormInputProps {
  label: string;
  name: string;
  register: UseFormRegister<any>;
  error?: FieldError;
  required?: boolean;
  type?: string;
  placeholder?: string;
  className?: string;
  rules?: any;
}

export const FormInput: React.FC<FormInputProps> = ({
  label,
  name,
  register,
  error,
  required = false,
  type = "text",
  placeholder,
  className,
}) => {
  return (
    <FormField
      label={label}
      name={name}
      error={error}
      required={required}
      className={className}
    >
      <Input
        id={name}
        type={type}
        placeholder={placeholder}
        {...register(name)}
        className={cn(
          "border-[#1a2942] bg-[#0F1C2E] text-[#3DD8B6] placeholder-gray-400",
          "focus:border-[#3DD8B6] focus:ring-1 focus:ring-[#3DD8B6]/50",
          "hover:border-[#3DD8B6]/70 transition-all duration-200",
          error
            ? "border-red-500 focus:border-red-500 focus:ring-red-500/50"
            : "",
          className
        )}
      />
    </FormField>
  );
};

interface FormTextareaProps {
  label: string;
  name: string;
  register: UseFormRegister<any>;
  error?: FieldError;
  required?: boolean;
  placeholder?: string;
  rows?: number;
  className?: string;
}

export const FormTextarea: React.FC<FormTextareaProps> = ({
  label,
  name,
  register,
  error,
  required = false,
  placeholder,
  rows = 3,
  className,
}) => {
  return (
    <FormField
      label={label}
      name={name}
      error={error}
      required={required}
      className={className}
    >
      <Textarea
        id={name}
        placeholder={placeholder}
        rows={rows}
        {...register(name)}
        className={cn(
          "border-[#1a2942] bg-[#0F1C2E] text-[#3DD8B6] placeholder-gray-400",
          "focus:border-[#3DD8B6] focus:ring-1 focus:ring-[#3DD8B6]/50",
          "hover:border-[#3DD8B6]/70 transition-all duration-200",
          "resize-vertical min-h-[80px]",
          error
            ? "border-red-500 focus:border-red-500 focus:ring-red-500/50"
            : "",
          className
        )}
      />
    </FormField>
  );
};

interface FormSelectProps {
  label: string;
  name: string;
  register: UseFormRegister<any>;
  error?: FieldError;
  required?: boolean;
  placeholder?: string;
  options: { value: string; label: string }[];
  className?: string;
}

export const FormSelect: React.FC<FormSelectProps> = ({
  label,
  name,
  register,
  error,
  required = false,
  placeholder = "Seleccionar...",
  options,
  className,
}) => {
  return (
    <FormField
      label={label}
      name={name}
      error={error}
      required={required}
      className={className}
    >
      <Select
        id={name}
        title={label}
        aria-label={label}
        aria-labelledby={`${name}-label`}
        {...register(name)}
        className={cn(
          "border-[#1a2942] bg-[#0F1C2E] text-[#3DD8B6]",
          "focus:border-[#3DD8B6] focus:ring-1 focus:ring-[#3DD8B6]/50",
          "hover:border-[#3DD8B6]/70 transition-all duration-200",
          error
            ? "border-red-500 focus:border-red-500 focus:ring-red-500/50"
            : "",
          className
        )}
      >
        <option value="" className="bg-[#0F1C2E] text-gray-400">
          {placeholder}
        </option>
        {options.map((option) => (
          <option
            key={option.value}
            value={option.value}
            className="bg-[#0F1C2E] text-[#3DD8B6]"
          >
            {option.label}
          </option>
        ))}
      </Select>
    </FormField>
  );
};

interface FormCheckboxProps {
  label: string;
  name: string;
  register: UseFormRegister<any>;
  error?: FieldError;
  className?: string;
  description?: string;
}

export const FormCheckbox: React.FC<FormCheckboxProps> = ({
  label,
  name,
  register,
  error,
  className,
  description,
}) => {
  return (
    <div className={cn("flex items-center gap-2", className)}>
      <input
        id={name}
        type="checkbox"
        {...register(name)}
        className={cn(
          "w-5 h-5 rounded border-[#1a2942] bg-[#0F1C2E] text-[#3DD8B6]",
          "focus:ring-2 focus:ring-[#3DD8B6]/50 focus:border-[#3DD8B6]",
          "checked:bg-[#3DD8B6] checked:border-[#3DD8B6]",
          error ? "border-red-500" : ""
        )}
      />
      <div className="flex flex-col">
        <label htmlFor={name} className="text-white text-sm cursor-pointer">
          {label}
        </label>
        {description && (
          <span className="text-gray-400 text-xs">{description}</span>
        )}
      </div>
      {error && <p className="text-red-400 text-sm ml-2">{error.message}</p>}
    </div>
  );
};
