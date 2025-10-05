import { HTMLAttributes, forwardRef } from 'react';
import { cn } from '@/lib/utils';

export interface BrutalistCardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'error' | 'success' | 'accent' | 'primary' | 'secondary';
}

const BrutalistCard = forwardRef<HTMLDivElement, BrutalistCardProps>(
  ({ className, variant = 'default', children, ...props }, ref) => {
    const variants = {
      default: 'luxury-glass-card text-card-foreground',
      error: 'luxury-glass-card text-destructive-foreground luxury-neon-rose',
      success: 'luxury-glass-card text-success-foreground luxury-neon-emerald',
      accent: 'luxury-glass-card text-accent-foreground luxury-neon-emerald',
      primary: 'luxury-glass-card text-primary-foreground luxury-neon-violet',
      secondary: 'luxury-glass-card text-secondary-foreground',
    };

    return (
      <div
        ref={ref}
        className={cn(
          'luxury-glass-card p-8 relative',
          'backdrop-blur-3xl',
          'border border-white/20',
          'shadow-2xl',
          'hover:shadow-3xl',
          'hover:scale-102',
          'transition-all duration-500',
          'luxury-stable',
          variants[variant], 
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);

BrutalistCard.displayName = 'BrutalistCard';

export default BrutalistCard;
