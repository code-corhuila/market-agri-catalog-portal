import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes, useParams } from 'react-router-dom';
import { apiClient } from 'shell/apiClient';
import App from '../../src/App';
import { product } from './products';

// HU-TXN-001: the way from a product to its purchase. The purchase lives in transactions-portal,
// which the container mounts under /transacciones/* (comprar/:productId); RequireAuth sends an
// anonymous buyer to the login and back, and the checkout decides who may buy (role, stock).
function CheckoutDouble() {
  return <p>Compra de {useParams().productId}</p>;
}

function renderProduct(overrides: Record<string, unknown> = {}) {
  vi.spyOn(apiClient, 'get').mockResolvedValue(product(1, overrides));
  return render(
    <MemoryRouter initialEntries={[`/catalogo/productos/${product(1).id}`]}>
      <Routes>
        <Route path="/catalogo/*" element={<App />} />
        <Route path="/transacciones/comprar/:productId" element={<CheckoutDouble />} />
      </Routes>
    </MemoryRouter>,
  );
}

describe('buy button on the product detail (HU-TXN-001)', () => {
  it('links an available product to its purchase in the transactions portal', async () => {
    renderProduct();
    const buy = await screen.findByRole('link', { name: 'Comprar' });
    expect(buy).toHaveAttribute('href', `/transacciones/comprar/${product(1).id}`);

    fireEvent.click(buy);
    expect(screen.getByText(`Compra de ${product(1).id}`)).toBeInTheDocument();
  });

  // Scenario 2: catalog would reject the reservation, so the page does not offer it.
  it('offers no purchase for a product out of stock', async () => {
    renderProduct({ status: 'OUT_OF_STOCK', quantity: 0 });
    expect(await screen.findByText('Agotado')).toBeInTheDocument();
    expect(screen.queryByRole('link', { name: 'Comprar' })).not.toBeInTheDocument();
  });
});
