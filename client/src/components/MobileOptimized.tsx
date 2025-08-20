import React from 'react';
import { cn } from '@/lib/utils';

interface MobileOptimizedProps {
  children: React.ReactNode;
  className?: string;
}

// Wrapper component for mobile-optimized layouts
export function MobileContainer({ children, className }: MobileOptimizedProps) {
  return (
    <div className={cn(
      "w-full max-w-sm mx-auto sm:max-w-none",
      "px-3 sm:px-4 lg:px-6",
      "py-4 sm:py-6 lg:py-8",
      className
    )}>
      {children}
    </div>
  );
}

// Mobile-friendly card component
export function MobileCard({ children, className }: MobileOptimizedProps) {
  return (
    <div className={cn(
      "bg-white rounded-lg shadow-sm border",
      "p-3 sm:p-4 lg:p-6",
      "mb-3 sm:mb-4",
      "touch-friendly",
      className
    )}>
      {children}
    </div>
  );
}

// Touch-friendly button component
interface MobileButtonProps extends MobileOptimizedProps {
  onClick?: () => void;
  variant?: 'primary' | 'secondary' | 'outline';
  size?: 'sm' | 'md' | 'lg';
}

export function MobileButton({ 
  children, 
  onClick, 
  variant = 'primary', 
  size = 'md',
  className 
}: MobileButtonProps) {
  const variants = {
    primary: 'bg-primary text-white hover:bg-primary/90',
    secondary: 'bg-secondary text-white hover:bg-secondary/90',
    outline: 'border border-gray-300 text-gray-700 hover:bg-gray-50'
  };

  const sizes = {
    sm: 'px-3 py-2 text-sm min-h-[40px]',
    md: 'px-4 py-3 text-base min-h-[44px]',
    lg: 'px-6 py-4 text-lg min-h-[48px]'
  };

  return (
    <button
      onClick={onClick}
      className={cn(
        "rounded-lg font-medium transition-colors",
        "flex items-center justify-center",
        "disabled:opacity-50 disabled:cursor-not-allowed",
        variants[variant],
        sizes[size],
        className
      )}
    >
      {children}
    </button>
  );
}

// Mobile-optimized grid component
interface MobileGridProps extends MobileOptimizedProps {
  cols?: 1 | 2 | 3 | 4;
}

export function MobileGrid({ children, cols = 2, className }: MobileGridProps) {
  const gridCols = {
    1: 'grid-cols-1',
    2: 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-4',
    3: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-2 sm:grid-cols-4'
  };

  return (
    <div className={cn(
      "grid gap-3 sm:gap-4 lg:gap-6",
      gridCols[cols],
      className
    )}>
      {children}
    </div>
  );
}

// Mobile-friendly input component
interface MobileInputProps {
  placeholder?: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  type?: 'text' | 'email' | 'password' | 'search';
  className?: string;
}

export function MobileInput({ 
  placeholder, 
  value, 
  onChange, 
  type = 'text',
  className 
}: MobileInputProps) {
  return (
    <input
      type={type}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      className={cn(
        "w-full min-h-[44px] px-4 py-3",
        "border border-gray-300 rounded-lg",
        "text-base", // Prevents zoom on iOS
        "focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent",
        "placeholder:text-gray-500",
        className
      )}
    />
  );
}

// Safe area wrapper for iPhone
export function SafeAreaWrapper({ children, className }: MobileOptimizedProps) {
  return (
    <div className={cn(
      "safe-area-inset-top safe-area-inset-bottom",
      "safe-area-inset-left safe-area-inset-right",
      className
    )}>
      {children}
    </div>
  );
}