import { TooltipProvider } from '@/components/ui/tooltip';
import { AppSidebar } from './AppSidebar';
import { AppHeader } from './AppHeader';

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
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
}
