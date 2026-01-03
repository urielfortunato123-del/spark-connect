import { TooltipProvider } from '@/components/ui/tooltip';
import { AppSidebar } from './AppSidebar';
import { AppHeader } from './AppHeader';
import { Mail } from 'lucide-react';

interface AppLayoutProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
}

export function AppLayout({ children, title, subtitle }: AppLayoutProps) {
  return (
    <TooltipProvider>
      <div className="min-h-screen flex w-full bg-background">
        {/* Sidebar */}
        <AppSidebar />

        {/* Main Area */}
        <div className="flex-1 flex flex-col p-4 min-w-0">
          {/* Content Area with rounded border */}
          <div className="flex-1 content-area flex flex-col overflow-hidden">
            {/* Header inside content area */}
            <AppHeader title={title} subtitle={subtitle} />

            {/* Main Content */}
            <main className="flex-1 overflow-auto px-6 pb-6">
              {children}
            </main>

            {/* Footer */}
            <footer className="px-6 py-3 border-t border-border/30 flex items-center justify-between text-xs text-muted-foreground">
              <span>Desenvolvido por <span className="text-foreground font-medium">Uriel da Fonseca Fortunato</span></span>
              <a 
                href="mailto:contato.uriel@yahoo.com" 
                className="flex items-center gap-1.5 hover:text-primary transition-colors"
              >
                <Mail className="h-3 w-3" />
                contato.uriel@yahoo.com
              </a>
            </footer>
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
}
