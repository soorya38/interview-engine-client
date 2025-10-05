import { ButtonHTMLAttributes, forwardRef } from 'react';
import { cn } from '@/lib/utils';

export interface BrutalistButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'destructive' | 'success' | 'accent' | 'outline';
  size?: 'default' | 'large' | 'full' | 'small';
}

const BrutalistButton = forwardRef<HTMLButtonElement, BrutalistButtonProps>(
  ({ className, variant = 'primary', size = 'default', children, ...props }, ref) => {
    const baseStyles = 'luxury-glass-button font-medium rounded-2xl disabled:opacity-50 disabled:cursor-not-allowed relative overflow-hidden';
    
    const variants = {
      primary: 'luxury-glass-button-primary luxury-neon-violet',
      secondary: 'luxury-glass-button-secondary luxury-neon-emerald',
      destructive: 'bg-rose-500/20 text-rose-100 border-rose-500/30 hover:bg-rose-500/30 luxury-neon-rose',
      success: 'bg-emerald-500/20 text-emerald-100 border-emerald-500/30 hover:bg-emerald-500/30 luxury-neon-emerald',
      accent: 'bg-violet-500/20 text-violet-100 border-violet-500/30 hover:bg-violet-500/30 luxury-neon-violet',
      outline: 'bg-white/5 text-white border-white/20 hover:bg-white/10 hover:border-white/30',
    };

    const sizes = {
      small: 'px-5 py-2.5 text-sm',
      default: 'px-8 py-4 text-base',
      large: 'px-10 py-5 text-lg',
      full: 'w-full px-8 py-4 text-lg',
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
