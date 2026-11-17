export function cn(...inputs: (string | undefined | null | false)[]): string {
  return inputs.filter(Boolean).join(" ");
}

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
