export function cn(...inputs: (string | undefined | null | false)[]): string {
  return inputs.filter(Boolean).join(" ");
}

/**
 * Format amounts into Indian Rupees (INR)
 * Example: 50000 -> ₹50,000
 */
export function formatINR(amount: number | undefined | null): string {
  if (amount === undefined || amount === null || isNaN(amount)) {
    return "₹0";
  }
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
}

export const formatCurrency = formatINR;

/**
 * Format a Date object or ISO date string into readable format (e.g. 15 Jan 2026)
 */
export function formatDate(date: string | Date | undefined | null): string {
  if (!date) return "—";
  try {
    const d = new Date(date);
    if (isNaN(d.getTime())) return "—";
    return new Intl.DateTimeFormat("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    }).format(d);
  } catch {
    return "—";
  }
}

/**
 * Check if a due date is in the past
 */
export function isOverdue(date: string | Date | undefined | null, isCompleted = false): boolean {
  if (!date || isCompleted) return false;
  try {
    const d = new Date(date);
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    return d.getTime() < now.getTime();
  } catch {
    return false;
  }
}

/**
 * Truncate long strings safely with ellipsis
 */
export function truncate(str: string | undefined | null, maxLength = 60): string {
  if (!str) return "";
  if (str.length <= maxLength) return str;
  return `${str.slice(0, maxLength)}...`;
}

/**
 * Generate 2-letter uppercase initials from a name
 */
export function getInitials(name: string | undefined | null): string {
  if (!name) return "RX";
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
}
