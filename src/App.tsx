import { Route, Routes } from 'react-router-dom';
import { NotFoundPage } from './catalog/pages/NotFoundPage';
import { CatalogPage } from './catalog/pages/CatalogPage';

/** Root of the portal, exposed as ./App: the container mounts it under /catalogo/* (ADR-021). */
export default function App() {
  return (
    <Routes>
      <Route index element={<CatalogPage />} />
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}
