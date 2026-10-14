import { Link } from 'react-router-dom';
import { Badge, Card } from 'shell/ui';
import { formatPesos, unitName } from '../model/format';
import { statusBadge, type ProductView } from '../model/product';
import styles from './ProductCard.module.css';

/** One product of the grid: name (link to its detail), price per unit, status and origin. */
export function ProductCard({ product }: { product: ProductView }) {
  const badge = statusBadge(product.status);
  return (
    <Card as="li" className={styles.card}>
      <div className={styles.top}>
        <Link to={`productos/${product.id}`} className={styles.name}>
          {product.name}
        </Link>
        <Badge variant={badge.variant}>{badge.label}</Badge>
      </div>
      <p className={styles.price}>
        <strong>{formatPesos(product.price)}</strong>
        <span className="subtle"> / {unitName(product.unit)}</span>
      </p>
      <p className="subtle">
        {product.municipality} · {product.producerName}
      </p>
    </Card>
  );
}
