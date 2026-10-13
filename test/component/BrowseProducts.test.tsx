import { act, fireEvent, render, screen, within } from '@testing-library/react';
import { Link, MemoryRouter, Route, Routes } from 'react-router-dom';
import { apiClient } from 'shell/apiClient';
import App from '../../src/App';
import { apiError } from '../doubles/shell/apiClient';
import { page, product } from './products';

// HU-CAT-005 against E-10 and E-11, anonymous. The container mounts ./App under /catalogo/*.
const LIST = '/api/v1/catalog/products';

function renderAt(path: string) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route path="/catalogo/*" element={<App />} />
      </Routes>
      <Link to="/catalogo?page=2">Ir a la página 2 (prueba)</Link>
    </MemoryRouter>,
  );
}

const get = () => vi.spyOn(apiClient, 'get');

describe('browse the catalog (HU-CAT-005, E-10)', () => {
  it('shows the loading state, then one card per product with price, status and producer', async () => {
    get().mockResolvedValue(
      page([
        product(1),
        product(2, { name: 'Lulo', status: 'OUT_OF_STOCK', quantity: 0, price: 6000 }),
      ]),
    );
    renderAt('/catalogo');
    expect(screen.getByRole('status')).toHaveTextContent('Cargando…');

    const cards = await screen.findAllByRole('listitem');
    expect(cards).toHaveLength(2);
    const lulo = within(cards[1]!);
    expect(lulo.getByRole('link', { name: 'Lulo' })).toHaveAttribute(
      'href',
      `/catalogo/productos/${product(2).id}`,
    );
    expect(lulo.getByText('$ 6.000')).toBeInTheDocument();
    expect(lulo.getByText('Agotado')).toHaveAttribute('data-variant', 'neutral');
    expect(within(cards[0]!).getByText('Disponible')).toHaveAttribute('data-variant', 'success');
    expect(within(cards[0]!).getByText(/Garzón/)).toHaveTextContent('Garzón · Ana Ruiz');
  });

  it('asks for the page of the address and moves between pages', async () => {
    const spy = get().mockImplementation(async (path: string) => {
      const current = Number(new URL(path, 'http://x').searchParams.get('page'));
      return page([product(current)], { page: current, total: 45 });
    });
    renderAt('/catalogo?page=2');
    expect(await screen.findByText('Página 2 de 3')).toBeInTheDocument();
    expect(spy).toHaveBeenLastCalledWith(`${LIST}?page=2&limit=20`, expect.anything());

    fireEvent.click(screen.getByRole('button', { name: 'Siguiente' }));
    expect(await screen.findByText('Página 3 de 3')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Siguiente' })).toBeDisabled();
    fireEvent.click(screen.getByRole('button', { name: 'Anterior' }));
    expect(await screen.findByText('Página 2 de 3')).toBeInTheDocument();
  });

  it('starts at page 1 and has no previous page there', async () => {
    const spy = get().mockResolvedValue(page([product(1)], { total: 25 }));
    renderAt('/catalogo');
    expect(await screen.findByText('Página 1 de 2')).toBeInTheDocument();
    expect(spy).toHaveBeenCalledWith(`${LIST}?page=1&limit=20`, expect.anything());
    expect(screen.getByRole('button', { name: 'Anterior' })).toBeDisabled();
  });

  // Review of #8, point 1: a page past the last one (a bookmark, a hand-edited address).
  it('says when the page of the address is past the last one and links to the last', async () => {
    get().mockResolvedValue(page([], { page: 9, total: 45 }));
    renderAt('/catalogo?page=9');
    expect(await screen.findByText('La página 9 no existe.')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Ir a la página 3' })).toHaveAttribute(
      'href',
      '/catalogo?page=3',
    );
    expect(screen.queryByText(/Página 9 de/)).not.toBeInTheDocument();
  });

  // Review of #8, point 2: the answer of a request already replaced never wins, even if the
  // client resolved it instead of rejecting it.
  it('keeps the newest page when an older answer arrives late', async () => {
    let answerFirst: (value: unknown) => void = () => {};
    get()
      .mockImplementationOnce(
        () => new Promise<unknown>((done) => (answerFirst = done)) as Promise<never>,
      )
      .mockResolvedValueOnce(page([product(2, { name: 'Página dos' })], { page: 2, total: 45 }));
    renderAt('/catalogo?page=1');
    fireEvent.click(await screen.findByRole('link', { name: 'Ir a la página 2 (prueba)' }));
    expect(await screen.findByRole('link', { name: 'Página dos' })).toBeInTheDocument();
    await act(async () => answerFirst(page([product(1, { name: 'Página uno' })], { total: 45 })));
    expect(screen.queryByRole('link', { name: 'Página uno' })).not.toBeInTheDocument();
  });

  it('guides an empty catalog instead of a blank page', async () => {
    get().mockResolvedValue(page([]));
    renderAt('/catalogo');
    expect(await screen.findByText('Todavía no hay productos publicados.')).toBeInTheDocument();
    expect(screen.queryByText(/Página/)).not.toBeInTheDocument();
  });

  it('shows the error with a retry that asks again', async () => {
    const spy = get()
      .mockRejectedValueOnce(
        apiError(503, 'SERVICE_UNAVAILABLE', 'El servicio no está disponible en este momento.'),
      )
      .mockResolvedValueOnce(page([product(1)]));
    renderAt('/catalogo');
    expect(await screen.findByRole('alert')).toHaveTextContent(
      'El servicio no está disponible en este momento.',
    );
    fireEvent.click(screen.getByRole('button', { name: 'Reintentar' }));
    expect(await screen.findByRole('link', { name: 'Producto 1' })).toBeInTheDocument();
    expect(spy).toHaveBeenCalledTimes(2);
  });
});

describe('product detail (HU-CAT-005 scenario 3, E-11)', () => {
  const id = product(1).id;

  it('shows the current price, the status and the producer, with the way back', async () => {
    const spy = get().mockResolvedValue(product(1, { name: 'Café especial de altura' }));
    renderAt(`/catalogo/productos/${id}`);
    expect(screen.getByRole('status')).toHaveTextContent('Cargando…');
    expect(
      await screen.findByRole('heading', { level: 1, name: 'Café especial de altura' }),
    ).toBeInTheDocument();
    expect(spy).toHaveBeenCalledWith(`${LIST}/${id}`, expect.anything());
    expect(screen.getByText('$ 185.000')).toBeInTheDocument();
    expect(screen.getByText('Disponible')).toHaveAttribute('data-variant', 'success');
    expect(screen.getByText('Ana Ruiz')).toBeInTheDocument();
    expect(screen.getByText('Garzón')).toBeInTheDocument();
    expect(screen.getByText('12,5 arrobas')).toBeInTheDocument();
    const crumbs = screen.getByRole('navigation', { name: 'Ruta de navegación' });
    expect(within(crumbs).getByRole('link', { name: 'Catálogo' })).toHaveAttribute(
      'href',
      '/catalogo',
    );
  });

  it('says the product does not exist on a 404, with a link to the catalog', async () => {
    get().mockRejectedValue(apiError(404, 'PRODUCT_NOT_FOUND', 'El producto no existe.'));
    renderAt(`/catalogo/productos/${id}`);
    expect(await screen.findByText('El producto no existe.')).toBeInTheDocument();
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Ver el catálogo' })).toHaveAttribute(
      'href',
      '/catalogo',
    );
  });

  it('shows another error with a retry', async () => {
    get()
      .mockRejectedValueOnce(apiError(0, 'NETWORK_ERROR', 'No se pudo conectar con el servidor.'))
      .mockResolvedValueOnce(product(1));
    renderAt(`/catalogo/productos/${id}`);
    expect(await screen.findByRole('alert')).toHaveTextContent(
      'No se pudo conectar con el servidor.',
    );
    fireEvent.click(screen.getByRole('button', { name: 'Reintentar' }));
    expect(
      await screen.findByRole('heading', { level: 1, name: 'Producto 1' }),
    ).toBeInTheDocument();
  });
});
