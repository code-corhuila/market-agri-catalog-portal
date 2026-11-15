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

/** `KILOGRAMO` → `kg`: the unit a price is per. */
export function unitName(unit: string): string {
  return UNITS[unit]?.[0] ?? unit.toLowerCase();
}

/** `12.5, KILOGRAMO` → `12,5 kg`. */
export function formatQuantity(quantity: number, unit: string): string {
  const [one, many] = UNITS[unit] ?? [unit.toLowerCase(), unit.toLowerCase()];
  return `${QUANTITY.format(quantity)} ${quantity === 1 ? one : many}`;
}
