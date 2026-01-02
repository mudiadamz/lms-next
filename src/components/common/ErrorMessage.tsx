import { Button } from './Button';
import './ErrorMessage.css';

interface ErrorMessageProps {
  title?: string;
  message: string;
  onRetry?: () => void;
  retryLabel?: string;
}

export const ErrorMessage = ({
  title = 'Terjadi Kesalahan',
  message,
  onRetry,
  retryLabel = 'Coba Lagi',
}: ErrorMessageProps) => {
  return (
    <div className="error-message">
      <div className="error-icon">⚠️</div>
      <h3 className="error-title">{title}</h3>
      <p className="error-text">{message}</p>
      {onRetry && (
        <Button onClick={onRetry} variant="primary">
          {retryLabel}
        </Button>
      )}
    </div>
  );
};

