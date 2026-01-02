import { ReactNode, HTMLAttributes } from 'react';
import './Card.css';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  title?: string;
  headerAction?: ReactNode;
  variant?: 'default' | 'outlined' | 'elevated';
}

export const Card = ({
  children,
  title,
  headerAction,
  variant = 'default',
  className = '',
  ...props
}: CardProps) => {
  return (
    <div className={`card card--${variant} ${className}`} {...props}>
      {(title || headerAction) && (
        <div className="card-header">
          {title && <h3 className="card-title">{title}</h3>}
          {headerAction && <div className="card-header-action">{headerAction}</div>}
        </div>
      )}
      <div className="card-content">{children}</div>
    </div>
  );
};

