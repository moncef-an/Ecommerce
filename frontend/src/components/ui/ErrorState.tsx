import React from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { Button } from './Button';

interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
  className?: string;
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  title = 'Failed to load content',
  message = 'An unexpected error occurred while communicating with the server.',
  onRetry,
  className = '',
}) => {
  return (
    <div
      className={`my-8 flex flex-col items-center justify-center rounded-2xl border border-rose-900/40 bg-rose-950/20 p-8 text-center text-rose-200 ${className}`}
    >
      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-950/60 border border-rose-800/40 text-rose-400 mb-3">
        <AlertCircle className="h-6 w-6" />
      </div>
      <h3 className="text-base font-bold text-rose-100">{title}</h3>
      <p className="mt-1 max-w-md text-xs text-rose-300/80 leading-relaxed">
        {message}
      </p>
      {onRetry && (
        <div className="mt-4">
          <Button
            size="sm"
            variant="outline"
            onClick={onRetry}
            leftIcon={<RefreshCw className="h-3.5 w-3.5" />}
            className="border-rose-800/60 bg-rose-950/40 text-rose-200 hover:bg-rose-900/60"
          >
            Retry Request
          </Button>
        </div>
      )}
    </div>
  );
};
