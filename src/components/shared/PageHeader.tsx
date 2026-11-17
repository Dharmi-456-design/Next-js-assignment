import React from "react";
import Link from "next/link";
import { ChevronRight } from "lucide-react";

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface PageHeaderProps {
  title: string;
  description?: string;
  breadcrumbs?: BreadcrumbItem[];
  action?: React.ReactNode;
  secondaryActions?: React.ReactNode;
}

export function PageHeader({
  title,
  description,
  breadcrumbs,
  action,
  secondaryActions,
}: PageHeaderProps) {
  return (
    <div className="mb-6 space-y-2">
      {breadcrumbs && breadcrumbs.length > 0 && (
        <nav className="flex items-center gap-1.5 text-xs text-[#747970] mb-1">
          {breadcrumbs.map((crumb, idx) => (
            <React.Fragment key={crumb.label}>
              {idx > 0 && <ChevronRight className="w-3.5 h-3.5 text-[#92978F]" />}
              {crumb.href ? (
                <Link
                  href={crumb.href}
                  className="hover:text-[#20231F] transition-colors"
                >
                  {crumb.label}
                </Link>
              ) : (
                <span className="text-[#20231F] font-medium">{crumb.label}</span>
              )}
            </React.Fragment>
          ))}
        </nav>
      )}

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-[28px] font-semibold text-[#20231F] tracking-tight">
            {title}
          </h1>
          {description && (
            <p className="text-xs sm:text-sm text-[#747970] mt-0.5">
              {description}
            </p>
          )}
        </div>

        {(action || secondaryActions) && (
          <div className="flex items-center gap-2.5 shrink-0">
            {secondaryActions}
            {action}
          </div>
        )}
      </div>
    </div>
  );
}

