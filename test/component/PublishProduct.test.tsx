import { act, fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes, useLocation } from 'react-router-dom';
import { apiClient } from 'shell/apiClient';
import { clearSession } from 'shell/session';
import App from '../../src/App';
import { apiError } from '../doubles/shell/apiClient';
import { page, product } from './products';
import { signIn } from './session';

// HU-CAT-001 against E-13 (POST, PRODUCER, Idempotency-Key), E-19 and E-20 for the choices, and
// the catalog's "Publicar producto" action, shown only to a producer.
const PRODUCTS = '/api/v1/catalog/products';
const LOOKUPS: Record<string, unknown> = {
  '/api/v1/catalog/categories': [
    { code: 'FRUTAS', label: 'Frutas' },
    { code: 'CAFE', label: 'Café' },
  ],
  '/api/v1/catalog/units': [
    { code: 'KILOGRAMO', label: 'Kilogramo' },
    { code: 'ARROBA', label: 'Arroba' },
  ],
};

function Address() {
  const { pathname, search } = useLocation();
  return <output aria-label="Dirección">{pathname + search}</output>;
}

function renderAt(path = '/catalogo/publicar') {
  vi.spyOn(apiClient, 'get').mockImplementation(((path: string) => {
    if (path in LOOKUPS) return Promise.resolve(LOOKUPS[path]);
    if (path.startsWith(`${PRODUCTS}?`)) return Promise.resolve(page([product(1)]));
    return Promise.resolve(product(1));
  }) as typeof apiClient.get);
  return render(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route path="/catalogo/*" element={<App />} />
        <Route path="*" element={null} />
      </Routes>
      <Address />
    </MemoryRouter>,
  );
}

const PRICE = 'Precio por unidad';
const post = () => vi.spyOn(apiClient, 'post');
const field = (label: string) => screen.getByLabelText(label) as HTMLInputElement;
const type = (label: string, value: string) =>
  fireEvent.change(field(label), { target: { value } });
const publish = () => fireEvent.click(screen.getByRole('button', { name: 'Publicar' }));

async function fillValid() {
  await screen.findByRole('option', { name: 'Arroba' });
  type('Nombre', '  Café de Garzón ');
  type('Categoría', 'CAFE');
  type('Unidad', 'ARROBA');
  type('Cantidad disponible', '12,5');
  type(PRICE, '85.000');
  type('Municipio', 'Garzón');
}

afterEach(() => clearSession());

describe('the catalog offers publishing only to a producer (HU-CAT-001)', () => {
  it('shows "Publicar producto" to a producer, leading to the form', async () => {
    signIn();
    renderAt('/catalogo');
    const action = await screen.findByRole('link', { name: 'Publicar producto' });
    fireEvent.click(action);
    expect(screen.getByLabelText('Dirección')).toHaveTextContent('/catalogo/publicar');
  });

  it.each([['BUYER' as const], [null]])('hides it from %s', async (role) => {
    if (role) signIn(role);
    renderAt('/catalogo');
    await screen.findByText('Producto 1');
    expect(screen.queryByRole('link', { name: 'Publicar producto' })).not.toBeInTheDocument();
  });
});

describe('publish a product (HU-CAT-001, E-13)', () => {
  it('sends a person without a session to the login and back here', () => {
    renderAt();
    expect(screen.getByLabelText('Dirección')).toHaveTextContent(
      '/login?next=%2Fcatalogo%2Fpublicar',
    );
  });

  it('lets only a producer publish', () => {
    signIn('BUYER');
    renderAt();
    expect(screen.getByRole('heading', { name: 'Acceso no permitido' })).toBeInTheDocument();
  });

  it('sends the typed price as integer centavos and opens the new product', async () => {
    signIn();
    const spy = post().mockResolvedValue(product(7, { name: 'Café de Garzón' }));
    renderAt();
    await fillValid();
    publish();

    await screen.findByText(`/catalogo/productos/${product(7).id}`);
    expect(spy).toHaveBeenCalledWith(
      PRODUCTS,
      {
        name: 'Café de Garzón',
        category: 'CAFE',
        unit: 'ARROBA',
        quantity: 12.5,
        priceCents: 8_500_000,
        municipality: 'Garzón',
      },
      { idempotencyKey: expect.stringMatching(/^.{8,128}$/) },
    );
  });

  it('accepts a quantity of zero: the product is published as sold out', async () => {
    signIn();
    const spy = post().mockResolvedValue(product(7, { quantity: 0, status: 'OUT_OF_STOCK' }));
    renderAt();
    await fillValid();
    type('Cantidad disponible', '0');
    publish();
    await screen.findByText(`/catalogo/productos/${product(7).id}`);
    expect(spy.mock.calls[0]![1]).toMatchObject({ quantity: 0 });
  });

  it('says what is missing or wrong next to each field and sends nothing', async () => {
    signIn();
    const spy = post();
    renderAt();
    await screen.findByRole('option', { name: 'Arroba' });
    publish();
    expect(screen.getAllByText('Es obligatorio.')).toHaveLength(6);

    await fillValid();
    type(PRICE, '85,000.50');
    type('Cantidad disponible', '1,125');
    publish();
    expect(
      screen.getByText('Escriba el precio en pesos, por ejemplo 85.000 o 85.000,50.'),
    ).toBeInTheDocument();
    expect(screen.getByText('Use un número con máximo 2 decimales.')).toBeInTheDocument();

    type(PRICE, '0');
    type('Cantidad disponible', '3');
    publish();
    expect(screen.getByText('El precio debe ser mayor que cero.')).toBeInTheDocument();
    expect(spy).not.toHaveBeenCalled();
  });

  it('shows the errors of the server next to their fields (400 details, 422)', async () => {
    signIn();
    post()
      .mockRejectedValueOnce(
        apiError(400, 'VALIDATION_ERROR', 'La solicitud tiene datos inválidos.', [
          { field: 'municipality', message: 'Debe tener entre 1 y 100 caracteres.' },
        ]),
      )
      .mockRejectedValueOnce(
        apiError(422, 'PRICE_NOT_POSITIVE', 'El precio debe ser mayor que cero.'),
      );
    renderAt();
    await fillValid();
    publish();
    expect(await screen.findByText('Debe tener entre 1 y 100 caracteres.')).toBeInTheDocument();
    publish();
    expect(await screen.findByText('El precio debe ser mayor que cero.')).toBeInTheDocument();
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('keeps the key on a retry and renews it when the product changes (D-C35)', async () => {
    signIn();
    const spy = post()
      .mockRejectedValueOnce(apiError(503, 'SERVICE_UNAVAILABLE', 'No disponible.'))
      .mockRejectedValueOnce(apiError(503, 'SERVICE_UNAVAILABLE', 'No disponible.'))
      .mockResolvedValueOnce(product(7));
    renderAt();
    await fillValid();
    publish();
    expect(await screen.findByRole('alert')).toHaveTextContent('No disponible.');
    publish();
    await screen.findByRole('alert');
    await act(async () => {});
    type(PRICE, '90.000');
    publish();
    await screen.findByText(`/catalogo/productos/${product(7).id}`);

    const keys = spy.mock.calls.map(
      (call) => (call[2] as { idempotencyKey: string }).idempotencyKey,
    );
    expect(keys[0]).toBe(keys[1]);
    expect(keys[2]).not.toBe(keys[1]);
  });

  it('sends one request on a double click', async () => {
    signIn();
    let finish: (value: unknown) => void = () => {};
    const spy = post().mockReturnValue(new Promise((resolve) => (finish = resolve)));
    renderAt();
    await fillValid();
    publish();
    publish();
    expect(screen.getByRole('button', { name: 'Publicar' })).toBeDisabled();
    await act(async () => finish(product(7)));
    expect(spy).toHaveBeenCalledTimes(1);
  });
});
