import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "next-themes";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";

// Pages
import Dashboard from "./pages/Dashboard";
import Auth from "./pages/Auth";
import Install from "./pages/Install";
import Admin from "./pages/Admin";
import NotFound from "./pages/NotFound";

// Module Pages
import Torres5G from "./pages/modules/Torres5G";
import Eletropostos from "./pages/modules/Eletropostos";
import Viabilidade from "./pages/modules/Viabilidade";
import Ambiental from "./pages/modules/Ambiental";
import Cenarios from "./pages/modules/Cenarios";
import Relatorios from "./pages/modules/Relatorios";
import Assistente from "./pages/modules/Assistente";

// Em Desenvolvimento
import Petroleo from "./pages/modules/Petroleo";
import Mineracao from "./pages/modules/Mineracao";
import Energia from "./pages/modules/Energia";
import Saneamento from "./pages/modules/Saneamento";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
      <TooltipProvider>
        <BrowserRouter>
          <AuthProvider>
            <Toaster />
            <Sonner />
            <Routes>
              {/* Public Routes */}
              <Route path="/auth" element={<Auth />} />
              <Route path="/install" element={<Install />} />

              {/* Protected Routes */}
              <Route 
                path="/" 
                element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                } 
              />

              {/* Module Routes - Protected with module access */}
              <Route 
                path="/torres-5g" 
                element={
                  <ProtectedRoute requiredModule="torres_5g">
                    <Torres5G />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/eletropostos" 
                element={
                  <ProtectedRoute requiredModule="eletropostos">
                    <Eletropostos />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/viabilidade" 
                element={
                  <ProtectedRoute requiredModule="viabilidade">
                    <Viabilidade />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/ambiental" 
                element={
                  <ProtectedRoute requiredModule="ambiental">
                    <Ambiental />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/cenarios" 
                element={
                  <ProtectedRoute requiredModule="cenarios">
                    <Cenarios />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/relatorios" 
                element={
                  <ProtectedRoute requiredModule="relatorios">
                    <Relatorios />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/assistente" 
                element={
                  <ProtectedRoute requiredModule="ia_assistant">
                    <Assistente />
                  </ProtectedRoute>
                } 
              />

              {/* Módulos Em Desenvolvimento */}
              <Route 
                path="/petroleo" 
                element={
                  <ProtectedRoute>
                    <Petroleo />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/mineracao" 
                element={
                  <ProtectedRoute>
                    <Mineracao />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/energia" 
                element={
                  <ProtectedRoute>
                    <Energia />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/saneamento" 
                element={
                  <ProtectedRoute>
                    <Saneamento />
                  </ProtectedRoute>
                } 
              />

              {/* Admin Route - Protected for admins only */}
              <Route 
                path="/admin" 
                element={
                  <ProtectedRoute requireAdmin>
                    <Admin />
                  </ProtectedRoute>
                } 
              />

              {/* Catch-all */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </AuthProvider>
        </BrowserRouter>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
