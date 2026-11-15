// The one place where the catalog formats values for people (design-system.md, "Formats").
const PESOS = new Intl.NumberFormat('es-CO', { maximumFractionDigits: 0 });
const QUANTITY = new Intl.NumberFormat('es-CO', { maximumFractionDigits: 2 });
const CENTS_PER_PESO = 100;

/**
 * Money from integer centavos (ADR-029, design-system.md "Money"): `18500000` → `$ 185.000`,
 * `8500050` → `$ 85.000,50`. The centavos appear only when they are not zero. Pesos and centavos
 * are split with integer arithmetic, so no amount goes through a floating-point division.
 */
export function formatCents(cents: number): string {
  const pesos = Math.trunc(cents / CENTS_PER_PESO);
  const rest = cents % CENTS_PER_PESO;
  const centavos = rest === 0 ? '' : `,${String(rest).padStart(2, '0')}`;
  return `$ ${PESOS.format(pesos)}${centavos}`;
}

// Short symbol where there is one, the name otherwise: [singular, plural].
const UNITS: Record<string, readonly [string, string]> = {
  KILOGRAMO: ['kg', 'kg'],
  LIBRA: ['lb', 'lb'],
  ARROBA: ['arroba', 'arrobas'],
  BULTO: ['bulto', 'bultos'],
  CANASTA: ['canasta', 'canastas'],
  CAJA: ['caja', 'cajas'],
  DOCENA: ['docena', 'docenas'],
  MANOJO: ['manojo', 'manojos'],
  LITRO: ['L', 'L'],
  UNIDAD: ['unidad', 'unidades'],
};

const PRICE = /^(\d{1,3}(?:\.\d{3})+|\d+)(?:,(\d{1,2}))?$/;

/**
 * What a producer types as a price, read into integer centavos (ADR-029): `85.000` and `85000` →
 * `8500000`, `85.000,5` → `8500050`. The thousands dots and the decimal comma of es-CO, as
 * `formatCents` shows them; anything else (`0.07`, `85,000.50`, `85.0000`) is null. Pesos and
 * centavos are joined with integer arithmetic, never through a floating-point number.
 */
export function parsePriceCents(text: string): number | null {
  const match = PRICE.exec(text.trim());
  if (!match) return null;
  const pesos = Number(match[1]!.replaceAll('.', ''));
  const centavos = Number((match[2] ?? '').padEnd(2, '0'));
  const cents = pesos * CENTS_PER_PESO + centavos;
  return Number.isSafeInteger(cents) ? cents : null;
}

/** `12,5` → 12.5: digits with an optional `,` or `.` and at most 2 decimals (D-C7). */
export function parseQuantity(text: string): number | null {
  const match = /^(\d+)(?:[.,](\d{1,2}))?$/.exec(text.trim());
  return match ? Number(`${match[1]}.${match[2] ?? '0'}`) : null;
}

/** `KILOGRAMO` → `kg`: the unit a price is per. */
export function unitName(unit: string): string {
  return UNITS[unit]?.[0] ?? unit.toLowerCase();
}

/** `12.5, KILOGRAMO` → `12,5 kg`. */
export function formatQuantity(quantity: number, unit: string): string {
  const [one, many] = UNITS[unit] ?? [unit.toLowerCase(), unit.toLowerCase()];
  return `${QUANTITY.format(quantity)} ${quantity === 1 ? one : many}`;
}
