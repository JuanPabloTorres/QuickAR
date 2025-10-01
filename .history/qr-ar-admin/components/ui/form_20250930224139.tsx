import React from "react";
import { UseFormRegister, FieldError } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import { cn } from "@/lib/utils";

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
      <label id={`${name}-label`} htmlFor={name} className="text-sm font-medium text-white">
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
        className={error ? "border-red-500" : ""}
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
        className={error ? "border-red-500" : ""}
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
        {...register(name)}
        className={error ? "border-red-500" : ""}
      >
        <option value="">{placeholder}</option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </Select>
    </FormField>
  );
};
