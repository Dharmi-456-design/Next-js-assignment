"use client";

import React, { useEffect } from "react";
import { cn } from "../../lib/utils";
import { X } from "lucide-react";

interface DialogProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: React.ReactNode;
  maxWidth?: "sm" | "md" | "lg" | "xl";
}

export function Dialog({
  isOpen,
  onClose,
  title,
  description,
  children,
  maxWidth = "md",
}: DialogProps) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    if (isOpen) {
      document.body.style.overflow = "hidden";
    }
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "unset";
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const maxWidthClass = {
    sm: "max-w-md",
    md: "max-w-lg",
    lg: "max-w-2xl",
    xl: "max-w-3xl",
  }[maxWidth];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-[#20231F]/40 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      {/* Dialog card */}
      <div
        className={cn(
          "relative w-full bg-white rounded-lg border border-[#E5E7E2] shadow-xl overflow-hidden z-10 transition-all",
          maxWidthClass
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#E5E7E2] bg-[#F7F7F4]/60">
          <div>
            <h3 className="text-base font-semibold text-[#20231F]">{title}</h3>
            {description && (
              <p className="text-xs text-[#747970] mt-0.5">{description}</p>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-md text-[#747970] hover:text-[#20231F] hover:bg-[#E5E7E2]/50 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
}

