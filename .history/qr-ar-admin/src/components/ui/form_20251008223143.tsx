/**
 * Form - Componentes de formulario reutilizables
 */

import { cn } from '@/lib/utils'
import { HTMLAttributes, forwardRef, LabelHTMLAttributes, InputHTMLAttributes } from 'react'

const Form = forwardRef<HTMLFormElement, HTMLAttributes<HTMLFormElement>>(
  ({ className, ...props }, ref) => (
    <form ref={ref} className={cn("space-y-6", className)} {...props} />
  )
)
Form.displayName = "Form"

const FormGroup = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("space-y-2", className)} {...props} />
  )
)
FormGroup.displayName = "FormGroup"

const FormLabel = forwardRef<HTMLLabelElement, LabelHTMLAttributes<HTMLLabelElement>>(
  ({ className, ...props }, ref) => (
    <label
      ref={ref}
      className={cn("block text-sm font-medium text-gray-700", className)}
      {...props}
    />
  )
)
FormLabel.displayName = "FormLabel"

const FormInput = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(
  ({ className, type, ...props }, ref) => (
    <input
      type={type}
      className={cn(
        "block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      ref={ref}
      {...props}
    />
  )
)
FormInput.displayName = "FormInput"

const FormTextarea = forwardRef<HTMLTextAreaElement, HTMLAttributes<HTMLTextAreaElement> & { placeholder?: string }>(
  ({ className, ...props }, ref) => (
    <textarea
      className={cn(
        "block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      ref={ref}
      {...props}
    />
  )
)
FormTextarea.displayName = "FormTextarea"

const FormMessage = forwardRef<HTMLParagraphElement, HTMLAttributes<HTMLParagraphElement> & { error?: boolean }>(
  ({ className, error, ...props }, ref) => (
    <p
      ref={ref}
      className={cn(
        "text-sm",
        error ? "text-red-600" : "text-gray-600",
        className
      )}
      {...props}
    />
  )
)
FormMessage.displayName = "FormMessage"

export { Form, FormGroup, FormLabel, FormInput, FormTextarea, FormMessage }