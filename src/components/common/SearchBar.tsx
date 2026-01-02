import { InputHTMLAttributes } from 'react';
import { Icon } from './Icon';
import './SearchBar.css';

interface SearchBarProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  onSearch?: (value: string) => void;
  placeholder?: string;
}

export const SearchBar = ({
  onSearch,
  placeholder = 'Cari...',
  className = '',
  ...props
}: SearchBarProps) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    props.onChange?.(e);
    onSearch?.(value);
  };

  return (
    <div className={`search-bar ${className}`}>
      <span className="search-icon">
        <Icon name="search" size={18} />
      </span>
      <input
        type="search"
        className="search-input"
        placeholder={placeholder}
        onChange={handleChange}
        {...props}
      />
    </div>
  );
};

