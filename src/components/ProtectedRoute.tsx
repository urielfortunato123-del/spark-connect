import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2 } from 'lucide-react';

type AppModule = 'torres_5g' | 'eletropostos' | 'viabilidade' | 'ambiental' | 'cenarios' | 'relatorios' | 'ia_assistant';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredModule?: AppModule;
  requireAdmin?: boolean;
}

export function ProtectedRoute({ children, requiredModule, requireAdmin }: ProtectedRouteProps) {
  const { user, isLoading, hasModuleAccess, isAdmin } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Carregando...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }

  if (requireAdmin && !isAdmin) {
    return <Navigate to="/" replace />;
  }

  if (requiredModule && !hasModuleAccess(requiredModule)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">🔒</span>
          </div>
          <h2 className="text-xl font-display font-bold text-foreground mb-2">
            Módulo Bloqueado
          </h2>
          <p className="text-muted-foreground mb-6">
            Seu plano atual não inclui acesso a este módulo. 
            Faça upgrade para desbloquear todas as funcionalidades.
          </p>
          <Navigate to="/" replace />
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
