// The one place where the catalog formats values for people (design-system.md, "Formats").
const PESOS = new Intl.NumberFormat('es-CO', { maximumFractionDigits: 0 });
const QUANTITY = new Intl.NumberFormat('es-CO', { maximumFractionDigits: 2 });

/** `185000` → `$ 185.000`: integer whole pesos, never decimals (ADR-026). */
export function formatPesos(pesos: number): string {
  return `$ ${PESOS.format(pesos)}`;
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
