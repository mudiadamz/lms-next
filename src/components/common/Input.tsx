import { InputHTMLAttributes, LabelHTMLAttributes } from 'react';
import './Input.css';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export const Input = ({
  label,
  error,
  helperText,
  id,
  className = '',
  ...props
}: InputProps) => {
  const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`;
  const errorClass = error ? 'input--error' : '';
  const hasHelperText = error || helperText;

  return (
    <div className="input-wrapper">
      {label && (
        <label htmlFor={inputId} className="input-label">
          {label}
        </label>
      )}
      <input
        id={inputId}
        className={`input ${errorClass} ${className}`}
        aria-invalid={!!error}
        aria-describedby={hasHelperText ? `${inputId}-helper` : undefined}
        {...props}
      />
      {hasHelperText && (
        <span
          id={`${inputId}-helper`}
          className={`input-helper ${error ? 'input-helper--error' : ''}`}
        >
          {error || helperText}
        </span>
      )}
    </div>
  );
};

