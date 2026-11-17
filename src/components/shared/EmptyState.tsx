import React from "react";
import { cn } from "../../lib/utils";
import { FolderOpen } from "lucide-react";

interface EmptyStateProps {
  title: string;
  description: string;
  action?: React.ReactNode;
  icon?: React.ReactNode;
  className?: string;
}

export function EmptyState({
  title,
  description,
  action,
  icon,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center text-center p-8 sm:p-12 border border-dashed border-[#E5E7E2] rounded-lg bg-white/50",
        className
      )}
    >
      <div className="w-10 h-10 rounded-full bg-[#F1F2EE] flex items-center justify-center text-[#747970] mb-3">
        {icon || <FolderOpen className="w-5 h-5 text-[#426B50]" />}
      </div>
      <h3 className="text-sm font-semibold text-[#20231F] mb-1">{title}</h3>
      <p className="text-xs text-[#747970] max-w-sm mb-4">{description}</p>
      {action && <div>{action}</div>}
    </div>
  );
}

