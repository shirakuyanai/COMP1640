import React, { createContext, useContext, useState, ReactNode } from 'react';
import { cn } from '../../lib/utils';

type ToastProps = {
  title?: string;
  description?: string;
  variant?: 'default' | 'destructive' | 'success' | 'warning';
  duration?: number;
};

type ToastContextType = {
  toast: (props: ToastProps) => void;
};

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<(ToastProps & { id: string })[]>([]);

  const toast = (props: ToastProps) => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { ...props, id }]);

    // Auto-dismiss toast after duration
    setTimeout(() => {
      setToasts((prev) => prev.filter((toast) => toast.id !== id));
    }, props.duration || 5000);
  };

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      <div className="fixed bottom-0 right-0 z-50 flex flex-col gap-2 p-4">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={cn(
              'rounded-md border p-4 shadow-md',
              {
                'bg-white text-gray-900 border-gray-200': toast.variant === 'default' || !toast.variant,
                'bg-red-50 text-red-900 border-red-200': toast.variant === 'destructive',
                'bg-green-50 text-green-900 border-green-200': toast.variant === 'success',
                'bg-yellow-50 text-yellow-900 border-yellow-200': toast.variant === 'warning',
              }
            )}
          >
            {toast.title && <div className="font-medium">{toast.title}</div>}
            {toast.description && <div className="mt-1 text-sm">{toast.description}</div>}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}

export const toast = (props: ToastProps) => {
  // This is a fallback for when the hook is not available
  // It will create a simple alert instead
  if (typeof window !== 'undefined') {
    alert(`${props.title ? props.title + ': ' : ''}${props.description || ''}`);
  }
};
