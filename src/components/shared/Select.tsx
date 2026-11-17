import React from "react";
import { cn } from "../../lib/utils";
import { ChevronDown } from "lucide-react";

export interface SelectProps
  extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options?: { value: string; label: string }[];
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, label, error, options, children, id, ...props }, ref) => {
    const selectId = id || (label ? label.toLowerCase().replace(/\s+/g, "-") : undefined);
    const errorId = selectId && error ? `${selectId}-error` : undefined;

    return (
      <div className="w-full space-y-1.5">
        {label && (
          <label
            htmlFor={selectId}
            className="block text-xs font-medium text-[#20231F]"
          >
            {label}
            {props.required && <span className="text-[#B94B45] ml-0.5">*</span>}
          </label>
        )}
        <div className="relative">
          <select
            id={selectId}
            ref={ref}
            aria-invalid={error ? "true" : undefined}
            aria-describedby={errorId}
            className={cn(
              "w-full px-3 py-1.5 text-sm bg-white border border-[#E5E7E2] rounded-md text-[#20231F] transition-colors appearance-none pr-8 focus:outline-none focus:ring-2 focus:ring-[#426B50]/20 focus:border-[#426B50] disabled:bg-[#F1F2EE] disabled:cursor-not-allowed cursor-pointer",
              error && "border-[#B94B45] focus:ring-[#B94B45]/20 focus:border-[#B94B45]",
              className
            )}
            {...props}
          >
            {options
              ? options.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))
              : children}
          </select>
          <ChevronDown className="w-4 h-4 text-[#747970] absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
        </div>
        {error && (
          <p id={errorId} className="text-xs text-[#B94B45]">
            {error}
          </p>
        )}
      </div>
    );
  }
);

Select.displayName = "Select";
