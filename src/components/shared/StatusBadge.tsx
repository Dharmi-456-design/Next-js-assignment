import React from "react";
import { cn } from "../../lib/utils";

export type StatusType =
  | "Planning"
  | "In Progress"
  | "On Hold"
  | "Completed"
  | "Cancelled"
  | "To Do"
  | "Pending"
  | "Submitted"
  | "Approved"
  | "Revision Required"
  | "Successful"
  | "Failed"
  | "Low"
  | "Medium"
  | "High";

interface StatusBadgeProps {
  status: string;
  className?: string;
  dot?: boolean;
}

export function StatusBadge({ status, className, dot = true }: StatusBadgeProps) {
  const getBadgeStyle = (val: string) => {
    switch (val) {
      // Success states
      case "Completed":
      case "Approved":
      case "Successful":
        return {
          bg: "bg-[#3F7954]/10",
          text: "text-[#3F7954]",
          border: "border-[#3F7954]/20",
          dot: "bg-[#3F7954]",
        };

      // Info / Progress states
      case "In Progress":
      case "Submitted":
        return {
          bg: "bg-[#426B50]/10",
          text: "text-[#426B50]",
          border: "border-[#426B50]/20",
          dot: "bg-[#426B50]",
        };

      // Planning / Neutral states
      case "Planning":
      case "To Do":
        return {
          bg: "bg-[#587B91]/10",
          text: "text-[#587B91]",
          border: "border-[#587B91]/20",
          dot: "bg-[#587B91]",
        };

      // Warning / Pending / On Hold states
      case "Pending":
      case "On Hold":
      case "Medium":
        return {
          bg: "bg-[#B78035]/10",
          text: "text-[#B78035]",
          border: "border-[#B78035]/20",
          dot: "bg-[#B78035]",
        };

      // Danger / High priority / Failed states
      case "Cancelled":
      case "Revision Required":
      case "Failed":
      case "High":
        return {
          bg: "bg-[#B94B45]/10",
          text: "text-[#B94B45]",
          border: "border-[#B94B45]/20",
          dot: "bg-[#B94B45]",
        };

      // Low priority / Default
      case "Low":
      default:
        return {
          bg: "bg-[#F1F2EE]",
          text: "text-[#747970]",
          border: "border-[#E5E7E2]",
          dot: "bg-[#92978F]",
        };
    }
  };

  const style = getBadgeStyle(status);

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium border",
        style.bg,
        style.text,
        style.border,
        className
      )}
    >
      {dot && (
        <span
          className={cn("w-1.5 h-1.5 rounded-full shrink-0", style.dot)}
        />
      )}
      {status}
    </span>
  );
}

