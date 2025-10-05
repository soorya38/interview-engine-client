import { InputHTMLAttributes, forwardRef } from 'react';
import { cn } from '@/lib/utils';

export interface BrutalistInputProps extends InputHTMLAttributes<HTMLInputElement> {
  error?: boolean;
}

const BrutalistInput = forwardRef<HTMLInputElement, BrutalistInputProps>(
  ({ className, error, ...props }, ref) => {
    return (
      <input
        ref={ref}
        className={cn(
          'w-full px-4 py-3 luxury-glass-input text-white font-medium',
          'focus:border-violet-500 focus:outline-none focus:ring-0',
          'placeholder:text-white/50',
          error && 'border-rose-500',
          !error && 'border-white/20',
          className
        )}
        {...props}
      />
    );
  }
);

BrutalistInput.displayName = 'BrutalistInput';

export default BrutalistInput;
