/**
 * Formatting utilities for Contra Expert data
 */

export function formatEarnings(amount: number): string {
  if (amount >= 1000000) {
    return `$${Math.floor(amount / 1000000)}M+`;
  } else if (amount >= 1000) {
    return `$${Math.floor(amount / 1000)}k+`;
  }
  return `$${amount}`;
}

export function formatRate(rate: number | null): string {
  return rate ? `$${rate}/hr` : 'Rate on request';
}

export function formatNumber(num: number): string {
  return num.toLocaleString();
}

export function truncateText(text: string, maxLength: number = 100): string {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength - 3) + '...';
} 