import { Sprout } from 'lucide-react';
import { EmptyState, PageHeader } from 'shell/ui';

/** Main page of the portal; its content arrives with the sub-tasks of the domain. */
export function CatalogPage() {
  return (
    <section className="stack">
      <PageHeader title="Catálogo" />
      <EmptyState
        icon={Sprout}
        title="En construcción"
        description="Pronto podrá explorar los productos del campo huilense y publicar los suyos."
      />
    </section>
  );
}
