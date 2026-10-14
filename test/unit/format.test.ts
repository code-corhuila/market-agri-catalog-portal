import { formatPesos, formatQuantity } from '../../src/catalog/model/format';
import { statusBadge } from '../../src/catalog/model/product';

// design-system.md, "Formats" and "Status badges": money from integer whole pesos (ADR-026), the
// short unit in lists, and the status mapped to a colour by this domain, not by shell/ui.
describe('catalog formats', () => {
  it.each([
    [185000, '$ 185.000'],
    [6000, '$ 6.000'],
    [1250000, '$ 1.250.000'],
    [0, '$ 0'],
  ])('shows %i pesos as %s', (pesos, text) => {
    expect(formatPesos(pesos)).toBe(text);
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
