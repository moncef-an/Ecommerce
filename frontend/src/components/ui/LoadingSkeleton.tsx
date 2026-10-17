import React from 'react';
import { cn } from '../../lib/utils';

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
}

export const Skeleton: React.FC<SkeletonProps> = ({ className, ...props }) => {
  return (
    <div
      className={cn('animate-pulse rounded-xl bg-zinc-800/70', className)}
      {...props}
    />
  );
};

export const ProductCardSkeleton: React.FC = () => {
  return (
    <div className="flex flex-col overflow-hidden rounded-2xl border border-zinc-800 bg-[#121216] p-4">
      <Skeleton className="aspect-4/3 w-full rounded-xl bg-zinc-800/80" />
      <div className="mt-4 space-y-2">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-3 w-full" />
        <Skeleton className="h-3 w-1/2" />
      </div>
      <div className="mt-5 flex items-center justify-between pt-3 border-t border-zinc-800/60">
        <Skeleton className="h-5 w-16" />
        <Skeleton className="h-4 w-12" />
      </div>
    </div>
  );
};

export const CategoryCardSkeleton: React.FC = () => {
  return <Skeleton className="h-72 w-full rounded-2xl bg-zinc-800/80" />;
};
