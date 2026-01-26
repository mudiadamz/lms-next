import { SelectHTMLAttributes, ReactNode } from 'react';
import './FormSelect.css';

interface Option {
  value: string;
  label: string;
}

interface FormSelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label: string | ReactNode;
  options: Option[];
  error?: string;
  helperText?: string;
}

export const FormSelect = ({
  label,
  options,
  error,
  helperText,
  id,
  className = '',
  ...props
}: FormSelectProps) => {
  const selectId = id || `select-${Math.random().toString(36).substr(2, 9)}`;
  const hasHelperText = error || helperText;

  return (
    <div className="form-select-wrapper">
      <label htmlFor={selectId} className="form-select-label">
        {label}
      </label>
      <select
        id={selectId}
        className={`form-select ${error ? 'form-select--error' : ''} ${className}`}
        aria-invalid={!!error}
        aria-describedby={hasHelperText ? `${selectId}-helper` : undefined}
        {...props}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {hasHelperText && (
        <span
          id={`${selectId}-helper`}
          className={`form-select-helper ${error ? 'form-select-helper--error' : ''}`}
        >
          {error || helperText}
        </span>
      )}
    </div>
  );
};

