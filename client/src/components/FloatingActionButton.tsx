import React from 'react';
import { Plus, ArrowUp } from 'lucide-react';
import { useScrollDirection } from '@/hooks/useScrollDirection';
import { cn } from '@/lib/utils';

interface FloatingActionButtonProps {
  onClick?: () => void;
  icon?: React.ReactNode;
  variant?: 'add' | 'scroll-to-top';
  className?: string;
}

export function FloatingActionButton({ 
  onClick, 
  icon, 
  variant = 'add',
  className 
}: FloatingActionButtonProps) {
  const { isVisible } = useScrollDirection();
  
  const handleScrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const defaultIcon = variant === 'scroll-to-top' ? <ArrowUp className="w-5 h-5" /> : <Plus className="w-5 h-5" />;
  const handleClick = variant === 'scroll-to-top' ? handleScrollToTop : onClick;

  return (
    <button
      onClick={handleClick}
      className={cn(
        "fixed bottom-20 right-4 z-40",
        "w-12 h-12 sm:w-14 sm:h-14",
        "bg-primary text-white",
        "rounded-full shadow-lg",
        "flex items-center justify-center",
        "transition-all duration-300 ease-in-out",
        "hover:scale-110 hover:shadow-xl",
        "active:scale-95",
        "-webkit-tap-highlight-color: transparent",
        isVisible ? "translate-y-0 opacity-100" : "translate-y-16 opacity-0",
        className
      )}
      style={{
        marginBottom: 'env(safe-area-inset-bottom, 0px)'
      }}
    >
      {icon || defaultIcon}
    </button>
  );
}

// Quick actions floating menu
interface QuickActionsProps {
  actions: Array<{
    icon: React.ReactNode;
    label: string;
    onClick: () => void;
  }>;
}

export function QuickActionsMenu({ actions }: QuickActionsProps) {
  const [isOpen, setIsOpen] = React.useState(false);
  const { isVisible } = useScrollDirection();

  return (
    <div className={cn(
      "fixed bottom-20 right-4 z-40",
      "transition-all duration-300 ease-in-out",
      isVisible ? "translate-y-0 opacity-100" : "translate-y-16 opacity-0"
    )}>
      {/* Action buttons */}
      {isOpen && (
        <div className="flex flex-col gap-2 mb-2">
          {actions.map((action, index) => (
            <button
              key={index}
              onClick={() => {
                action.onClick();
                setIsOpen(false);
              }}
              className={cn(
                "w-12 h-12 bg-white border border-gray-200",
                "rounded-full shadow-md",
                "flex items-center justify-center",
                "text-gray-700 hover:text-primary",
                "transition-all duration-200",
                "hover:scale-110 hover:shadow-lg",
                "opacity-0 animate-in slide-in-from-bottom-2 fade-in",
              )}
              style={{
                animationDelay: `${index * 50}ms`,
                animationFillMode: 'forwards'
              }}
              title={action.label}
            >
              {action.icon}
            </button>
          ))}
        </div>
      )}

      {/* Main FAB */}
      <FloatingActionButton
        onClick={() => setIsOpen(!isOpen)}
        icon={
          <Plus className={cn(
            "w-5 h-5 transition-transform duration-200",
            isOpen ? "rotate-45" : "rotate-0"
          )} />
        }
      />
    </div>
  );
}