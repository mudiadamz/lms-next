import { TextareaHTMLAttributes } from 'react';
import './FormTextarea.css';

interface FormTextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string;
  error?: string;
  helperText?: string;
}

export const FormTextarea = ({
  label,
  error,
  helperText,
  id,
  className = '',
  ...props
}: FormTextareaProps) => {
  const textareaId = id || `textarea-${Math.random().toString(36).substr(2, 9)}`;
  const hasHelperText = error || helperText;

  return (
    <div className="form-textarea-wrapper">
      <label htmlFor={textareaId} className="form-textarea-label">
        {label}
      </label>
      <textarea
        id={textareaId}
        className={`form-textarea ${error ? 'form-textarea--error' : ''} ${className}`}
        aria-invalid={!!error}
        aria-describedby={hasHelperText ? `${textareaId}-helper` : undefined}
        {...props}
      />
      {hasHelperText && (
        <span
          id={`${textareaId}-helper`}
          className={`form-textarea-helper ${error ? 'form-textarea-helper--error' : ''}`}
        >
          {error || helperText}
        </span>
      )}
    </div>
  );
};

