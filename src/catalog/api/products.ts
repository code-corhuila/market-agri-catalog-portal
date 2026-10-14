import { apiClient } from 'shell/apiClient';
import type { Page, ProductView } from '../model/product';

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
