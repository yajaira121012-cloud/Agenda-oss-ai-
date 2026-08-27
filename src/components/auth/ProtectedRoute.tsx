import React, { ReactNode } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Login } from '../../pages/Login';
import { Loader2 } from 'lucide-react';

interface ProtectedRouteProps {
  children: ReactNode;
}

/**
 * Route protection wrapper that ensures only authenticated operators can access private routes.
 * If authentication is loading, displays a loading state.
 * If not authenticated, redirects/renders the Login page.
 */
export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F5F7F9] flex flex-col items-center justify-center gap-3 font-sans">
        <Loader2 className="w-9 h-9 text-teal-600 animate-spin" />
        <p className="text-sm font-semibold text-[#1A1C1E]">Verifica sessione in corso...</p>
        <span className="text-xs text-slate-400">Controllo credenziali Supabase Auth</span>
      </div>
    );
  }

  if (!user) {
    return <Login />;
  }

  return <>{children}</>;
}

export default ProtectedRoute;
