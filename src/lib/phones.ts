/** Pakistani mobile numbers: 03XXXXXXXXX, 923XXXXXXXXX, or +92 3XX XXX XXXX. */
export function isPakistaniMobile(raw: string): boolean {
  const digits = raw.replace(/\D/g, "");
  if (/^03\d{9}$/.test(digits)) return true;
  if (/^923\d{9}$/.test(digits)) return true;
  return false;
}

export function phoneDigits(raw: string): string {
  const digits = raw.replace(/\D/g, "");
  if (/^03\d{9}$/.test(digits)) return `92${digits.slice(1)}`;
  if (/^923\d{9}$/.test(digits)) return digits;
  return digits;
}
