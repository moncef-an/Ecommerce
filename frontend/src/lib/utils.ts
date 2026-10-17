/**
 * Simple utility to combine class names cleanly without external dependencies
 */
export function cn(...classes: Array<string | number | boolean | undefined | null>): string {
  return classes.filter(Boolean).join(' ');
}

/**
 * Format numbers as USD currency strings
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

