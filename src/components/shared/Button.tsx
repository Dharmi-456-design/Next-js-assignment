import React from "react";
import { cn } from "../../lib/utils";
import { Loader2 } from "lucide-react";

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
  isLoading?: boolean;
  icon?: React.ReactNode;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = "primary",
      size = "md",
      type = "button",
      isLoading = false,
      icon,
      children,
      disabled,
      ...props
    },
    ref
  ) => {
    const variantStyles = {
      primary:
        "bg-[#426B50] text-white hover:bg-[#34573F] active:bg-[#2B4734] shadow-xs border border-transparent",
      secondary:
        "bg-[#F1F2EE] text-[#20231F] hover:bg-[#E5E7E2] active:bg-[#D9DBD5] border border-[#E5E7E2]",
      outline:
        "bg-white text-[#20231F] border border-[#E5E7E2] hover:bg-[#F7F7F4] active:bg-[#F1F2EE]",
      ghost:
        "bg-transparent text-[#747970] hover:text-[#20231F] hover:bg-[#F1F2EE] active:bg-[#E5E7E2]",
      danger:
        "bg-[#B94B45] text-white hover:bg-[#9E3D38] active:bg-[#83312D] border border-transparent",
    };

    const sizeStyles = {
      sm: "px-2.5 py-1 text-xs gap-1.5 h-7",
      md: "px-3.5 py-1.5 text-sm gap-2 h-9",
      lg: "px-4 py-2 text-sm gap-2 h-10",
    };

    return (
      <button
        ref={ref}
        type={type}
        disabled={disabled || isLoading}
        aria-busy={isLoading || undefined}
        className={cn(
          "inline-flex items-center justify-center font-medium rounded-md transition-all duration-150 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed select-none focus:outline-none focus:ring-2 focus:ring-[#426B50]/20 focus:border-[#426B50]",
          variantStyles[variant],
          sizeStyles[size],
          className
        )}
        {...props}
      >
        {isLoading ? (
          <Loader2 className="w-4 h-4 animate-spin shrink-0" />
        ) : icon ? (
          <span className="shrink-0">{icon}</span>
        ) : null}
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";
