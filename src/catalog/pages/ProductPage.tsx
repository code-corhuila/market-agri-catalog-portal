import { PackageX } from 'lucide-react';
import { Link, useParams } from 'react-router-dom';
import { Badge, Breadcrumbs, Card, EmptyState, LoadingBlock, PageHeader } from 'shell/ui';
import { getProduct } from '../api/products';
import { useRemote } from '../api/useRemote';
import { RetryAlert } from '../components/RetryAlert';
import { formatPesos, formatQuantity, unitName } from '../model/format';
import { statusBadge } from '../model/product';

/** HU-CAT-005 scenario 3: one product (E-11) with its current price, status and producer. */
export function ProductPage() {
  const id = useParams().id ?? '';
  const { remote, retry } = useRemote((signal) => getProduct(id, signal), id);

  if (remote.state === 'loading') return <LoadingBlock />;
  if (remote.state === 'error' && remote.error.error === 'PRODUCT_NOT_FOUND') {
    return (
      <EmptyState
        icon={PackageX}
        title={remote.error.message}
        description="Puede que lo hayan retirado del catálogo."
        action={<Link to="..">Ver el catálogo</Link>}
      />
    );
  }
  if (remote.state === 'error')
    return <RetryAlert message={remote.error.message} onRetry={retry} />;

  const product = remote.data;
  const badge = statusBadge(product.status);
  return (
    <section className="stack">
      <Breadcrumbs items={[{ label: 'Catálogo', to: '..' }, { label: product.name }]} />
      <PageHeader
        title={product.name}
        actions={<Badge variant={badge.variant}>{badge.label}</Badge>}
      />
      <Card>
        <dl className="stack-sm">
          <dt className="subtle">Precio por {unitName(product.unit)}</dt>
          <dd>{formatPesos(product.price)}</dd>
          <dt className="subtle">Cantidad disponible</dt>
          <dd>{formatQuantity(product.quantity, product.unit)}</dd>
          <dt className="subtle">Productor</dt>
          <dd>{product.producerName}</dd>
          <dt className="subtle">Municipio</dt>
          <dd>{product.municipality}</dd>
        </dl>
      </Card>
    </section>
  );
}
