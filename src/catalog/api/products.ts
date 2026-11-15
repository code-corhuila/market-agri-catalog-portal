import { apiClient } from 'shell/apiClient';
import type { Category, Page, ProductView, ProductWrite } from '../model/product';

const PRODUCTS = '/api/v1/catalog/products';
/** The contract's default page size (D-C24). */
export const PAGE_SIZE = 20;

/** E-10, anonymous: newest first. */
export function listProducts(page: number, signal: AbortSignal) {
  return apiClient.get<Page<ProductView>>(`${PRODUCTS}?page=${page}&limit=${PAGE_SIZE}`, {
    signal,
  });
}

/** E-11, anonymous. */
export function getProduct(id: string, signal: AbortSignal) {
  return apiClient.get<ProductView>(`${PRODUCTS}/${encodeURIComponent(id)}`, { signal });
}

/** E-19, anonymous: the categories in the contract's fixed order. */
export function listCategories(signal: AbortSignal) {
  return apiClient.get<Category[]>('/api/v1/catalog/categories', { signal });
}

/** E-20, anonymous: the units in the contract's fixed order. */
export function listUnits(signal: AbortSignal) {
  return apiClient.get<Category[]>('/api/v1/catalog/units', { signal });
}

/** E-13, PRODUCER: one key per intention, the same on a retry (D-C35). */
export function createProduct(product: ProductWrite, idempotencyKey: string) {
  return apiClient.post<ProductView>(PRODUCTS, product, { idempotencyKey });
}
