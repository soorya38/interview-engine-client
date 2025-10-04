import { ButtonHTMLAttributes, forwardRef } from 'react';
import { cn } from '@/lib/utils';

export interface BrutalistButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'destructive' | 'success' | 'accent';
  size?: 'default' | 'large' | 'full';
}

const BrutalistButton = forwardRef<HTMLButtonElement, BrutalistButtonProps>(
  ({ className, variant = 'primary', size = 'default', children, ...props }, ref) => {
    const baseStyles = 'font-bold border-4 uppercase tracking-wide disabled:opacity-50 disabled:cursor-not-allowed';
    
    const variants = {
      primary: 'bg-primary text-primary-foreground border-primary hover:bg-primary-foreground hover:text-primary',
      secondary: 'bg-secondary text-secondary-foreground border-border hover:bg-border hover:text-foreground',
      destructive: 'bg-destructive text-destructive-foreground border-destructive hover:bg-destructive-foreground hover:text-destructive',
      success: 'bg-success text-success-foreground border-success hover:bg-success-foreground hover:text-success',
      accent: 'bg-accent text-accent-foreground border-accent hover:bg-accent-foreground hover:text-accent',
    };

    const sizes = {
      default: 'px-6 py-3 text-base',
      large: 'px-8 py-4 text-xl',
      full: 'w-full px-6 py-4 text-xl',
    };

    return (
      <button
        ref={ref}
        className={cn(baseStyles, variants[variant], sizes[size], className)}
        {...props}
      >
        {children}
      </button>
    );
  }
);

BrutalistButton.displayName = 'BrutalistButton';

export default BrutalistButton;
