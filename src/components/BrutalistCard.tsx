import { HTMLAttributes, forwardRef } from 'react';
import { cn } from '@/lib/utils';

export interface BrutalistCardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'error' | 'success' | 'accent';
}

const BrutalistCard = forwardRef<HTMLDivElement, BrutalistCardProps>(
  ({ className, variant = 'default', children, ...props }, ref) => {
    const variants = {
      default: 'bg-card text-card-foreground border-border',
      error: 'bg-destructive text-destructive-foreground border-destructive',
      success: 'bg-success text-success-foreground border-success',
      accent: 'bg-accent text-accent-foreground border-accent',
    };

    return (
      <div
        ref={ref}
        className={cn('border-4 p-6', variants[variant], className)}
        {...props}
      >
        {children}
      </div>
    );
  }
);

BrutalistCard.displayName = 'BrutalistCard';

export default BrutalistCard;
