"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "../../lib/utils";
import {
  Layers,
  LayoutDashboard,
  Briefcase,
  Users,
  CheckSquare,
  FileCheck,
  CreditCard,
  BarChart3,
  Menu,
  X,
  Bell,
  Sparkles,
} from "lucide-react";

const NAV_ITEMS = [
  { label: "Overview", href: "/dashboard", icon: LayoutDashboard },
  { label: "Projects", href: "/projects", icon: Briefcase },
  { label: "Clients", href: "/clients", icon: Users },
  { label: "Tasks", href: "/tasks", icon: CheckSquare },
  { label: "Deliverables", href: "/deliverables", icon: FileCheck },
  { label: "Payments", href: "/payments", icon: CreditCard },
  { label: "Reports", href: "/reports", icon: BarChart3 },
];

export function Navbar() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isSeeding, setIsSeeding] = useState(false);
  const [seedSuccess, setSeedSuccess] = useState(false);

  // Close mobile drawer on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  // Trigger quick database seed
  const handleSeed = async () => {
    setIsSeeding(true);
    try {
      const res = await fetch("/api/seed", { credentials: "omit" });
      if (res.ok) {
        setSeedSuccess(true);
        setTimeout(() => setSeedSuccess(false), 3000);
        window.location.reload();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsSeeding(false);
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-[#E5E7E2] bg-[#FFFFFF]/95 backdrop-blur-xs">
      <div className="max-w-[1360px] mx-auto px-4 sm:px-6">
        <div className="flex h-14 items-center justify-between gap-4">
          {/* Left: Brand Identity */}
          <div className="flex items-center gap-6">
            <Link
              href="/dashboard"
              className="flex items-center gap-2.5 transition-opacity hover:opacity-90 select-none"
            >
              <div className="w-7 h-7 rounded-md bg-[#426B50] flex items-center justify-center text-white shadow-xs">
                <Layers className="w-4 h-4" />
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-semibold tracking-tight text-[#20231F] leading-none">
                  ReserveX
                </span>
                <span className="text-[10px] text-[#747970] leading-tight font-normal">
                  Freelance Workspace
                </span>
              </div>
            </Link>

            {/* Desktop Navigation Links */}
            <nav className="hidden lg:flex items-center gap-1" aria-label="Main Navigation">
              {NAV_ITEMS.map((item) => {
                const isActive =
                  item.href === "/dashboard"
                    ? pathname === "/dashboard"
                    : pathname.startsWith(item.href);

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all duration-150",
                      isActive
                        ? "bg-[#F1F2EE] text-[#426B50] font-semibold"
                        : "text-[#747970] hover:text-[#20231F] hover:bg-[#F7F7F4]"
                    )}
                  >
                    <item.icon
                      className={cn(
                        "w-3.5 h-3.5",
                        isActive ? "text-[#426B50]" : "text-[#92978F]"
                      )}
                    />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* Right Controls */}
          <div className="flex items-center gap-2">
            {/* Quick Demo Seed Button */}
            <button
              onClick={handleSeed}
              disabled={isSeeding}
              title="Populate demo data"
              className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-md border border-[#E5E7E2] bg-[#F7F7F4] text-[#747970] hover:text-[#426B50] hover:border-[#426B50]/30 transition-all cursor-pointer disabled:opacity-50"
            >
              <Sparkles className="w-3.5 h-3.5 text-[#426B50]" />
              <span>{isSeeding ? "Seeding..." : seedSuccess ? "Seeded!" : "Demo Data"}</span>
            </button>

            {/* Notifications icon */}
            <button
              aria-label="Notifications"
              className="p-1.5 rounded-md text-[#747970] hover:text-[#20231F] hover:bg-[#F1F2EE] transition-colors cursor-pointer relative"
            >
              <Bell className="w-4 h-4" />
              <span className="w-1.5 h-1.5 rounded-full bg-[#426B50] absolute top-1.5 right-1.5" />
            </button>

            {/* Profile Workspace Badge */}
            <div className="flex items-center gap-2 pl-2 border-l border-[#E5E7E2]">
              <div className="w-7 h-7 rounded-full bg-[#F1F2EE] border border-[#E5E7E2] flex items-center justify-center text-xs font-semibold text-[#426B50]">
                RX
              </div>
              <span className="hidden md:inline-block text-xs font-medium text-[#20231F]">
                Studio Workspace
              </span>
            </div>

            {/* Mobile Menu Toggle Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-1.5 rounded-md text-[#747970] hover:text-[#20231F] hover:bg-[#F1F2EE] transition-colors cursor-pointer ml-1"
              aria-label="Toggle navigation"
              aria-expanded={mobileMenuOpen}
              aria-controls="mobile-nav"
            >
              {mobileMenuOpen ? (
                <X className="w-5 h-5" />
              ) : (
                <Menu className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div id="mobile-nav" className="lg:hidden py-3 border-t border-[#E5E7E2] space-y-1">
            {NAV_ITEMS.map((item) => {
              const isActive =
                item.href === "/dashboard"
                  ? pathname === "/dashboard"
                  : pathname.startsWith(item.href);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={cn(
                    "flex items-center gap-2.5 px-3 py-2 rounded-md text-xs font-medium transition-colors",
                    isActive
                      ? "bg-[#F1F2EE] text-[#426B50] font-semibold"
                      : "text-[#747970] hover:text-[#20231F] hover:bg-[#F7F7F4]"
                  )}
                >
                  <item.icon
                    className={cn(
                      "w-4 h-4",
                      isActive ? "text-[#426B50]" : "text-[#92978F]"
                    )}
                  />
                  <span>{item.label}</span>
                </Link>
              );
            })}
            <div className="pt-2 border-t border-[#E5E7E2]">
              <button
                onClick={handleSeed}
                disabled={isSeeding}
                className="w-full flex items-center justify-center gap-2 px-3 py-2 text-xs font-medium rounded-md border border-[#E5E7E2] bg-[#F7F7F4] text-[#426B50]"
              >
                <Sparkles className="w-4 h-4" />
                <span>{isSeeding ? "Seeding database..." : "Load Demo Records"}</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
