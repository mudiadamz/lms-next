import { ReactNode } from 'react';
import { Button } from './Button';
import { Icon, IconName } from './Icon';
import './EmptyState.css';

interface EmptyStateProps {
  icon?: string | IconName;
  title: string;
  message?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  children?: ReactNode;
}

export const EmptyState = ({
  icon = 'inbox',
  title,
  message,
  action,
  children,
}: EmptyStateProps) => {
  const isIconName = typeof icon === 'string' && !icon.match(/[\u{1F300}-\u{1F9FF}]/u);
  
  return (
    <div className="empty-state">
      <div className="empty-state-icon">
        {isIconName ? (
          <Icon name={icon as IconName} size={48} />
        ) : (
          <span>{icon}</span>
        )}
      </div>
      <h3 className="empty-state-title">{title}</h3>
      {message && <p className="empty-state-message">{message}</p>}
      {children}
      {action && (
        <Button onClick={action.onClick} variant="primary">
          {action.label}
        </Button>
      )}
    </div>
  );
};

