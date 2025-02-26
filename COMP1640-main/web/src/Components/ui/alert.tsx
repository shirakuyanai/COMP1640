import React, { forwardRef, HTMLAttributes, ReactNode } from 'react';
import { cn } from '../../lib/utils';

export interface AlertProps extends HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'destructive' | 'success' | 'warning';
}

const Alert = forwardRef<HTMLDivElement, AlertProps>(
  ({ className, variant = 'default', ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        'relative w-full rounded-lg border p-4',
        {
          'bg-gray-50 text-gray-900 border-gray-200': variant === 'default',
          'bg-red-50 text-red-900 border-red-200': variant === 'destructive',
          'bg-green-50 text-green-900 border-green-200': variant === 'success',
          'bg-yellow-50 text-yellow-900 border-yellow-200': variant === 'warning',
        },
        className
      )}
      {...props}
    />
  )
);
Alert.displayName = 'Alert';

export interface AlertTitleProps extends HTMLAttributes<HTMLHeadingElement> {}

const AlertTitle = forwardRef<HTMLHeadingElement, AlertTitleProps>(
  ({ className, ...props }, ref) => (
    <h5
      ref={ref}
      className={cn('mb-1 font-medium leading-none tracking-tight', className)}
      {...props}
    />
  )
);
AlertTitle.displayName = 'AlertTitle';

export interface AlertDescriptionProps extends HTMLAttributes<HTMLParagraphElement> {}

const AlertDescription = forwardRef<HTMLParagraphElement, AlertDescriptionProps>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn('text-sm [&_p]:leading-relaxed', className)}
      {...props}
    />
  )
);
AlertDescription.displayName = 'AlertDescription';

export { Alert, AlertTitle, AlertDescription };
