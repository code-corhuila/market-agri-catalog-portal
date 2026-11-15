import { formatCents, formatQuantity } from '../../src/catalog/model/format';
import { statusBadge } from '../../src/catalog/model/product';

// design-system.md, "Money", "Formats" and "Status badges": money from integer centavos (ADR-029), the
// short unit in lists, and the status mapped to a colour by this domain, not by shell/ui.
describe('catalog formats', () => {
  it.each([
    [18_500_000, '$ 185.000'],
    [8_500_000, '$ 85.000'],
    [600_000, '$ 6.000'],
    [125_000_000, '$ 1.250.000'],
    [100, '$ 1'],
    [0, '$ 0'],
  ])('shows %i centavos as %s: no decimals when the centavos are zero', (cents, text) => {
    expect(formatCents(cents)).toBe(text);
  });

  it.each([
    [8_500_050, '$ 85.000,50'],
    [8_500_005, '$ 85.000,05'],
    [5, '$ 0,05'],
  ])('shows %i centavos as %s: the centavos only when they are not zero', (cents, text) => {
    expect(formatCents(cents)).toBe(text);
  });

  it('shows a decimal quantity with its short unit', () => {
    expect(formatQuantity(12.5, 'KILOGRAMO')).toBe('12,5 kg');
    expect(formatQuantity(30, 'CANASTA')).toBe('30 canastas');
    expect(formatQuantity(1, 'CANASTA')).toBe('1 canasta');
  });

  it('maps ACTIVE to success and OUT_OF_STOCK to neutral', () => {
    expect(statusBadge('ACTIVE')).toEqual({ variant: 'success', label: 'Disponible' });
    expect(statusBadge('OUT_OF_STOCK')).toEqual({ variant: 'neutral', label: 'Agotado' });
  });
});
