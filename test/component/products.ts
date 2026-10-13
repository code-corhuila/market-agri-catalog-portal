// ProductView and Page<T> of api-contract §4.2 / D-C24, as catalog-api (or the simulated mode)
// answers them: price in whole pesos (ADR-026).
export function product(n: number, overrides: Record<string, unknown> = {}) {
  return {
    id: `5e1f0c2a-7b3d-4e8f-9a6b-00000000000${n}`,
    producerId: '0b6f2c7e-4a51-4c1e-9d0e-2f1c3a7b9e10',
    producerName: 'Ana Ruiz',
    name: `Producto ${n}`,
    category: 'CAFE',
    unit: 'ARROBA',
    quantity: 12.5,
    price: 185000,
    currency: 'COP',
    municipality: 'Garzón',
    status: 'ACTIVE',
    photoUrl: null,
    createdAt: '2026-10-01T14:00:00Z',
    updatedAt: '2026-10-01T14:00:00Z',
    ...overrides,
  };
}

export function page<T>(
  data: T[],
  meta: Partial<{ page: number; limit: number; total: number }> = {},
) {
  const limit = meta.limit ?? 20;
  const total = meta.total ?? data.length;
  return {
    data,
    meta: { page: meta.page ?? 1, limit, total, totalPages: Math.ceil(total / limit) },
  };
}
