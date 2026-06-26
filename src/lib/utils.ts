import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function getDefaultMonthYear(salaryDay: number): string {
  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth(); // 0-indexed: 0-11
  const date = today.getDate(); // 1-31

  if (salaryDay === 1) {
    return `${year}-${String(month + 1).padStart(2, "0")}`;
  }

  if (date < salaryDay) {
    return `${year}-${String(month + 1).padStart(2, "0")}`;
  } else {
    const nextMonth = month === 11 ? 0 : month + 1;
    const nextYear = month === 11 ? year + 1 : year;
    return `${nextYear}-${String(nextMonth + 1).padStart(2, "0")}`;
  }
}
