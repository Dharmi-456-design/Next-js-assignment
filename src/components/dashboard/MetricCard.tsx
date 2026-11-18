import React from "react";

interface MetricCardProps {
  label: string;
  value: string | number;
  description: string;
  icon: React.ReactNode;
  iconColorClass?: string;
  iconBgClass?: string;
}

export function MetricCard({
  label,
  value,
  description,
  icon,
  iconColorClass = "text-[#426B50]",
  iconBgClass = "bg-[#426B50]/10",
}: MetricCardProps) {
  return (
    <div className="p-4 rounded-lg bg-white border border-[#E5E7E2] shadow-xs">
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-xs font-medium text-[#747970]">{label}</span>
        <span
          className={`w-6 h-6 rounded-md ${iconBgClass} flex items-center justify-center ${iconColorClass}`}
        >
          {icon}
        </span>
      </div>
      <div className="text-xl sm:text-2xl font-semibold text-[#20231F] tracking-tight">
        {value}
      </div>
      <p className="text-[11px] text-[#747970] mt-1">{description}</p>
    </div>
  );
}
