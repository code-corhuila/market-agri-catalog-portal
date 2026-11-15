import { Route, Routes } from 'react-router-dom';
import { RequireAuth } from 'shell/RequireAuth';
import { NotFoundPage } from './catalog/pages/NotFoundPage';
import { CatalogPage } from './catalog/pages/CatalogPage';
import { ProductPage } from './catalog/pages/ProductPage';
import { PublishPage } from './catalog/pages/PublishPage';

/** Root of the portal, exposed as ./App: the container mounts it under /catalogo/* (ADR-021). */
export default function App() {
  return (
    <Routes>
      <Route index element={<CatalogPage />} />
      <Route path="productos/:id" element={<ProductPage />} />
      <Route
        path="publicar"
        element={
          <RequireAuth roles={['PRODUCER']}>
            <PublishPage />
          </RequireAuth>
        }
      />
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}
