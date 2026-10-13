import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import App from '../../src/App';

// The container mounts ./App under /catalogo/* (ADR-021): every route below it is this portal's.
function renderAt(path: string) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <App />
    </MemoryRouter>,
  );
}

describe('catalog portal', () => {
  it('opens on its main page', () => {
    renderAt('/');
    expect(screen.getByRole('heading', { level: 1, name: 'Catálogo' })).toBeInTheDocument();
  });

  it('shows the 404 page for an address below it that does not exist', () => {
    renderAt('/no-existe');
    expect(
      screen.getByRole('heading', { level: 1, name: 'Página no encontrada' }),
    ).toBeInTheDocument();
  });
});
