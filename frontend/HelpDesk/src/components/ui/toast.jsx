// @ts-nocheck
import { useEffect } from 'react';
import { useToast } from './use-toast';
import { cn } from '@/lib/utils';
import PropTypes from 'prop-types';

export function ToastContainer() {
  const { toasts, removeToast } = useToast();

  // Handle auto-dismiss
  useEffect(() => {
    toasts.forEach((toast) => {
      if (toast.duration !== Infinity) {
        const timer = setTimeout(() => {
          removeToast(toast.id);
        }, toast.duration || 3000);

        return () => clearTimeout(timer);
      }
    });
  }, [toasts, removeToast]);

  return (
    <div className="fixed top-4 right-4 z-50 flex flex-col gap-2">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={cn(
            "pointer-events-auto relative flex w-full max-w-md rounded-lg shadow-lg",
            "transition-all duration-300 ease-in-out",
            "transform translate-x-0 opacity-100",
            "bg-white dark:bg-gray-800 p-4",
            toast.variant === "destructive" && "bg-red-50 dark:bg-red-900"
          )}
        >
          <div className="flex w-full">
            <div className="flex-1">
              {toast.title && (
                <h3 className={cn(
                  "font-medium text-sm",
                  toast.variant === "destructive" ? "text-red-800 dark:text-red-200" : "text-gray-900 dark:text-gray-100"
                )}>
                  {toast.title}
                </h3>
              )}
              {toast.description && (
                <p className={cn(
                  "mt-1 text-sm",
                  toast.variant === "destructive" ? "text-red-700 dark:text-red-300" : "text-gray-500 dark:text-gray-400"
                )}>
                  {toast.description}
                </p>
              )}
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              className="ml-4 text-gray-400 hover:text-gray-500 focus:outline-none"
            >
              <span className="sr-only">Close</span>
              <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
        </div>
      ))}
    </div>
  );
} 