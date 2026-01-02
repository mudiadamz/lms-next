import { InputHTMLAttributes } from 'react';
import { Input } from './Input';
import './FormInput.css';

interface FormInputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  helperText?: string;
}

export const FormInput = ({ label, error, helperText, ...props }: FormInputProps) => {
  return (
    <div className="form-input">
      <Input
        label={label}
        error={error}
        helperText={helperText}
        {...props}
      />
    </div>
  );
};

