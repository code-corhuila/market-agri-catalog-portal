import { setSession } from 'shell/session';

// The container's session as the login leaves it (E-02): who is browsing, and with which role.
export const PRODUCER = {
  id: '0b6f2c7e-4a51-4c1e-9d0e-2f1c3a7b9e10',
  name: 'Ana Ruiz',
  email: 'productor@market-agri.test',
  role: 'PRODUCER' as const,
};

export function signIn(role: 'PRODUCER' | 'BUYER' | 'ADMIN' = 'PRODUCER') {
  setSession({
    accessToken: 'token',
    expiresAt: '2099-01-01T00:00:00Z',
    user: role === 'PRODUCER' ? PRODUCER : { ...PRODUCER, id: 'other', role },
  });
}
