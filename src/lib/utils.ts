import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getNepaliFiscalYear(): string {
  const today = new Date();
  const month = today.getMonth() + 1;
  const day = today.getDate();
  const adYear = today.getFullYear();

  const fiscalStarted = month > 7 || (month === 7 && day >= 17);

  const bsStart = fiscalStarted ? adYear + 57 : adYear + 56;
  const bsEnd = bsStart + 1;

  return `${bsStart}/${String(bsEnd).slice(-2)}`; 

}