import type { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useSession } from './useSession';

type Role = 'PRODUCER' | 'BUYER' | 'ADMIN';

// Double of shell/RequireAuth with the container's behaviour: no session goes to the login with
// `?next=`, another role sees "Acceso no permitido" (market-agri-front, src/core/auth).
export function RequireAuth({ children, roles }: { children: ReactNode; roles?: Role[] }) {
  const session = useSession();
  const { pathname, search } = useLocation();
  if (!session) return <Navigate to={`/login?next=${encodeURIComponent(pathname + search)}`} />;
  if (roles && !roles.includes(session.user.role)) return <h1>Acceso no permitido</h1>;
  return <>{children}</>;
}
