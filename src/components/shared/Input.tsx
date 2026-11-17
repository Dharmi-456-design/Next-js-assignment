import React from "react";
import { cn } from "../../lib/utils";

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type = "text", label, error, hint, id, ...props }, ref) => {
    const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, "-") : undefined);

    return (
      <div className="w-full space-y-1.5">
        {label && (
          <label
            htmlFor={inputId}
            className="block text-xs font-medium text-[#20231F]"
          >
            {label}
            {props.required && <span className="text-[#B94B45] ml-0.5">*</span>}
          </label>
        )}
        <input
          id={inputId}
          ref={ref}
          type={type}
          className={cn(
            "w-full px-3 py-1.5 text-sm bg-white border border-[#E5E7E2] rounded-md text-[#20231F] placeholder:text-[#92978F] transition-colors focus:outline-none focus:ring-2 focus:ring-[#426B50]/20 focus:border-[#426B50] disabled:bg-[#F1F2EE] disabled:cursor-not-allowed",
            error && "border-[#B94B45] focus:ring-[#B94B45]/20 focus:border-[#B94B45]",
            className
          )}
          {...props}
        />
        {error ? (
          <p className="text-xs text-[#B94B45]">{error}</p>
        ) : hint ? (
          <p className="text-xs text-[#747970]">{hint}</p>
        ) : null}
      </div>
    );
  }
);

Input.displayName = "Input";

