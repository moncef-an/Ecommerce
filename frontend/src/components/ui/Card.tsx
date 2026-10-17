import React from 'react';
import { cn } from '../../lib/utils';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  hoverable?: boolean;
}

export const Card: React.FC<CardProps> = ({
  className,
  hoverable = false,
  children,
  ...props
}) => {
  return (
    <div
      className={cn(
        'rounded-2xl border border-zinc-800/80 bg-[#121216] p-6 shadow-sm text-zinc-100',
        hoverable &&
          'transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-purple-950/20 hover:border-purple-500/30',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};
