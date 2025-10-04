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
          'w-full px-4 py-3 border-2 bg-input text-primary font-medium',
          'focus:border-accent focus:outline-none focus:ring-0',
          'placeholder:text-muted-foreground',
          error && 'border-destructive',
          !error && 'border-border',
          className
        )}
        {...props}
      />
    );
  }
);

BrutalistInput.displayName = 'BrutalistInput';

export default BrutalistInput;
