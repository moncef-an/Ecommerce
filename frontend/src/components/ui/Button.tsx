import React from 'react';
import { Loader2 } from 'lucide-react';
import { cn } from '../../lib/utils';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = 'primary',
      size = 'md',
      isLoading = false,
      leftIcon,
      rightIcon,
      children,
      disabled,
      ...props
    },
    ref
  ) => {
    const baseStyles =
      'inline-flex items-center justify-center font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-[#09090b] disabled:opacity-50 disabled:pointer-events-none select-none rounded-xl active:scale-[0.98] cursor-pointer';

    const variants = {
      primary:
        'bg-purple-600 text-white hover:bg-purple-500 focus-visible:ring-purple-400 shadow-md shadow-purple-950/50 hover:shadow-purple-900/60',
      secondary:
        'bg-zinc-800 text-zinc-100 hover:bg-zinc-700 border border-zinc-700/80 focus-visible:ring-zinc-400',
      outline:
        'border border-purple-500/40 bg-purple-950/20 text-purple-300 hover:bg-purple-900/40 hover:text-white hover:border-purple-400 focus-visible:ring-purple-400',
      ghost:
        'text-zinc-400 hover:bg-zinc-800/80 hover:text-white focus-visible:ring-purple-400',
      danger:
        'bg-rose-600 text-white hover:bg-rose-500 focus-visible:ring-rose-500 shadow-md shadow-rose-950/40',
    };

    const sizes = {
      sm: 'text-xs px-3 py-1.5 gap-1.5',
      md: 'text-sm px-4 py-2.5 gap-2',
      lg: 'text-base px-6 py-3.5 gap-2.5',
    };

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={cn(baseStyles, variants[variant], sizes[size], className)}
        {...props}
      >
        {isLoading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          leftIcon
        )}
        <span>{children}</span>
        {!isLoading && rightIcon}
      </button>
    );
  }
);

Button.displayName = 'Button';
