import React from 'react';

interface CustomButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'ghost';
  size?: 'default' | 'icon';
}

export const CustomButton = React.forwardRef<HTMLButtonElement, CustomButtonProps>(
  ({ className = '', variant = 'default', size = 'default', ...props }, ref) => {
    const baseStyles = "inline-flex items-center justify-center rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-zinc-400 disabled:pointer-events-none disabled:opacity-50";
    
    const variants = {
      default: "bg-blue-600 text-white hover:bg-blue-700",
      ghost: "hover:bg-zinc-700/50"
    };
    
    const sizes = {
      default: "h-9 px-4 py-2",
      icon: "h-8 w-8"
    };

    return (
      <button
        ref={ref}
        className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
        {...props}
      />
    );
  }
);

CustomButton.displayName = 'CustomButton'; 