const small = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  minimumFractionDigits: 2,
  maximumFractionDigits: 4,
});
const large = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' });

/** USD with thousands separators; amounts under $1 keep up to four decimals so per-turn costs stay visible. */
export function formatUsd(value: number): string {
  return (Math.abs(value) < 1 ? small : large).format(value);
}
