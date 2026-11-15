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
  /** Integer centavos per unit (ADR-029): 18500000 is $ 185.000. */
  priceCents: number;
  currency: 'COP';
  municipality: string;
  status: ProductStatus;
  photoUrl: string | null;
  createdAt: string;
  updatedAt: string;
}

/** ProductWrite of api-contract §4.2: what a producer sends to publish or edit (E-13, E-14). */
export interface ProductWrite {
  name: string;
  category: string;
  unit: string;
  quantity: number;
  /** Integer centavos per unit (ADR-029). */
  priceCents: number;
  municipality: string;
}

/** E-19 and E-20: a code and its label. */
export interface Category {
  code: string;
  label: string;
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
