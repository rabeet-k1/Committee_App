export const formatPkr = (n: number) => `Rs ${n.toLocaleString('en-PK')}`;

export const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });

/** YYYY-MM-DD, what the API's startDate field accepts. */
export const toIsoDate = (d: Date) => d.toISOString().slice(0, 10);

export function frequencyLabel(days: number) {
  if (days === 7) return 'weekly';
  if (days === 14) return 'every 2 weeks';
  if (days === 30) return 'monthly';
  return `every ${days} days`;
}

/**
 * The API stores phone numbers exactly as sent, so register and login must send the same string.
 * 0300 1234567 / 03001234567 / 923001234567 / 3001234567  ->  +923001234567
 */
export function normalizePhone(input: string) {
  const s = input.replace(/[\s\-()]/g, '');
  if (s.startsWith('+')) return s;
  if (s.startsWith('0092')) return `+${s.slice(2)}`;
  if (s.startsWith('92')) return `+${s}`;
  if (s.startsWith('0')) return `+92${s.slice(1)}`;
  if (/^3\d{9}$/.test(s)) return `+92${s}`;
  return s;
}
