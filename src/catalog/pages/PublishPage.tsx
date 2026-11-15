import { useNavigate } from 'react-router-dom';
import { PageHeader } from 'shell/ui';
import { createProduct } from '../api/products';
import { ProductForm } from '../components/ProductForm';

/** HU-CAT-001: a producer publishes a product (E-13) and lands on its page. */
export function PublishPage() {
  const navigate = useNavigate();
  return (
    <section className="stack">
      <PageHeader
        title="Publicar producto"
        subtitle="Lo verán todos los visitantes del catálogo."
      />
      <ProductForm
        submitLabel="Publicar"
        onSubmit={async (product, key) => {
          const created = await createProduct(product, key);
          navigate(`/catalogo/productos/${created.id}`);
        }}
      />
    </section>
  );
}
