import './Loading.css';

interface LoadingProps {
  size?: 'small' | 'medium' | 'large';
  message?: string;
}

export const Loading = ({ size = 'medium', message }: LoadingProps) => {
  return (
    <div className="loading-container">
      <div className={`loading-spinner loading-spinner--${size}`}></div>
      {message && <p className="loading-message">{message}</p>}
    </div>
  );
};

