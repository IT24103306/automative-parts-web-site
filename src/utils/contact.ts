/**
 * Normalize Sri Lankan phone numbers for reliable call and WhatsApp links.
 * Accepts local format (0777561007), international format (+94777561007),
 * or digits-only international format (94777561007).
 */
export function normalizeSriLankaPhone(value?: string | null): string {
  const digits = (value ?? '').replace(/\D/g, '');
  if (!digits) return '';

  if (digits.startsWith('94')) return `+${digits}`;
  if (digits.startsWith('0')) return `+94${digits.slice(1)}`;
  if (digits.length === 9) return `+94${digits}`;

  return `+${digits}`;
}

export function toWhatsAppNumber(value?: string | null): string {
  return normalizeSriLankaPhone(value).replace(/\D/g, '');
}
