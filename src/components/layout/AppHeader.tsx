import { SidebarTrigger } from '@/components/ui/sidebar';
import { ThemeToggle } from '@/components/ThemeToggle';
import { Button } from '@/components/ui/button';
import { Bell, Search, HelpCircle } from 'lucide-react';
import { Input } from '@/components/ui/input';

interface AppHeaderProps {
  title?: string;
  subtitle?: string;
}

export function AppHeader({ title, subtitle }: AppHeaderProps) {
  return (
    <header className="h-14 border-b border-border bg-background/80 backdrop-blur-sm flex items-center justify-between px-4 sticky top-0 z-40">
      <div className="flex items-center gap-4">
        <SidebarTrigger className="h-8 w-8" />
        
        {title && (
          <div className="hidden md:block">
            <h1 className="text-sm font-semibold text-foreground">{title}</h1>
            {subtitle && <p className="text-[10px] text-muted-foreground">{subtitle}</p>}
          </div>
        )}
      </div>

      <div className="flex items-center gap-2">
        {/* Search */}
        <div className="hidden lg:flex relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Buscar municípios, dados..." 
            className="w-64 pl-9 h-8 text-sm bg-muted/50 border-0"
          />
        </div>

        {/* Actions */}
        <Button variant="ghost" size="icon" className="h-8 w-8">
          <HelpCircle className="h-4 w-4" />
        </Button>
        
        <Button variant="ghost" size="icon" className="h-8 w-8 relative">
          <Bell className="h-4 w-4" />
          <span className="absolute top-1 right-1 w-2 h-2 bg-primary rounded-full" />
        </Button>

        <ThemeToggle />
      </div>
    </header>
  );
}
