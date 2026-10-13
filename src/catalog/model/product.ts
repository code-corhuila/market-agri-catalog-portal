/** Types of api-contract §4.2 with the same field names (Annex H, rule 2). */
export type ProductStatus = 'ACTIVE' | 'OUT_OF_STOCK';

export interface ProductView {
  id: string;
  producerId: string;
  producerName: string;
  name: string;
  category: string;
  unit: string;
  quantity: number;
  /** Whole Colombian pesos per unit (ADR-026). */
  price: number;
  currency: 'COP';
  municipality: string;
  status: ProductStatus;
  photoUrl: string | null;
  createdAt: string;
  updatedAt: string;
}

/** D-C24: `{ data, meta }`. */
export interface Page<T> {
  data: T[];
  meta: { page: number; limit: number; total: number; totalPages: number };
}

const STATUS_BADGE = {
  ACTIVE: { variant: 'success', label: 'Disponible' },
  OUT_OF_STOCK: { variant: 'neutral', label: 'Agotado' },
} as const;

/** The domain decides what each status looks like; shell/ui only knows colours. */
export function statusBadge(status: ProductStatus) {
  return STATUS_BADGE[status];
}
