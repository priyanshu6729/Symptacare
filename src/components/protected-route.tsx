import { AuthGuard } from "../lib/auth-context";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  return <AuthGuard>{children}</AuthGuard>;
} 