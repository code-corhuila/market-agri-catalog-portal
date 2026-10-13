import { Sprout } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';
import { Button, EmptyState, PageHeader, Skeleton } from 'shell/ui';
import { listProducts } from '../api/products';
import { useRemote } from '../api/useRemote';
import { ProductCard } from '../components/ProductCard';
import { RetryAlert } from '../components/RetryAlert';
import styles from './CatalogPage.module.css';

/** `?page=` of the address, 1 when missing or not a positive integer. */
function pageFrom(params: URLSearchParams): number {
  const page = Number(params.get('page'));
  return Number.isInteger(page) && page >= 1 ? page : 1;
}

/** HU-CAT-005: the public catalog, page by page (E-10), with its four view states. */
export function CatalogPage() {
  const [params, setParams] = useSearchParams();
  const page = pageFrom(params);
  const { remote, retry } = useRemote((signal) => listProducts(page, signal), String(page));
  const goTo = (target: number) => setParams({ page: String(target) });

  return (
    <section className="stack">
      <PageHeader
        title="Catálogo"
        subtitle="Productos del campo huilense, los más recientes primero."
      />
      {remote.state === 'loading' && (
        <div className={styles.grid}>
          <Skeleton.Grid count={6} withThumb={false} />
        </div>
      )}
      {remote.state === 'error' && <RetryAlert message={remote.error.message} onRetry={retry} />}
      {remote.state === 'data' && remote.data.meta.total === 0 && (
        <EmptyState
          icon={Sprout}
          title="Todavía no hay productos publicados."
          description="Vuelva pronto: los productores del Huila publican aquí sus cosechas."
        />
      )}
      {remote.state === 'data' && remote.data.meta.total > 0 && (
        <>
          <ul className={styles.grid}>
            {remote.data.data.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </ul>
          <nav className={styles.pager} aria-label="Páginas del catálogo">
            <Button variant="secondary" disabled={page <= 1} onClick={() => goTo(page - 1)}>
              Anterior
            </Button>
            <span>
              Página {page} de {remote.data.meta.totalPages}
            </span>
            <Button
              variant="secondary"
              disabled={page >= remote.data.meta.totalPages}
              onClick={() => goTo(page + 1)}
            >
              Siguiente
            </Button>
          </nav>
        </>
      )}
    </section>
  );
}
