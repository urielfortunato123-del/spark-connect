import { Search, Bell, ChevronDown, Calendar } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface AppHeaderProps {
  title?: string;
  subtitle?: string;
}

const planLabels: Record<string, { label: string; color: string }> = {
  free: { label: 'Free', color: 'bg-muted text-muted-foreground' },
  telecom: { label: 'Telecom', color: 'bg-chart-blue/20 text-chart-blue' },
  ev: { label: 'EV', color: 'bg-chart-green/20 text-chart-green' },
  governo: { label: 'Governo', color: 'bg-chart-yellow/20 text-chart-yellow' },
  pro: { label: 'Pro', color: 'bg-primary/20 text-primary' },
};

export function AppHeader({ title, subtitle }: AppHeaderProps) {
  const { user, profile, userPlan, signOut } = useAuth();
  const planInfo = planLabels[userPlan?.plan || 'free'];

  return (
    <header className="h-16 flex items-center justify-between px-6 shrink-0">
      {/* Left: Search */}
      <div className="relative w-80">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Buscar projeto, análise..."
          className="pl-10 bg-card/60 border-border/50 h-10 rounded-xl"
        />
      </div>

      {/* Right: Actions & Profile */}
      <div className="flex items-center gap-4">
        {/* Date Range (decorative for now) */}
        <Button variant="outline" className="gap-2 bg-card/60 border-border/50 rounded-xl h-10">
          <Calendar className="h-4 w-4" />
          <span className="text-sm">Jan 2026</span>
          <ChevronDown className="h-3 w-3" />
        </Button>

        {/* Plan Badge */}
        <Badge className={`${planInfo.color} border-0 rounded-lg px-3 py-1`}>
          {planInfo.label}
        </Badge>

        {/* Notifications */}
        <Button variant="ghost" size="icon" className="relative rounded-xl">
          <Bell className="h-5 w-5" />
          <span className="absolute -top-1 -right-1 w-2 h-2 bg-primary rounded-full" />
        </Button>

        {/* User Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="gap-3 px-2 h-10 rounded-xl">
              <Avatar className="h-8 w-8">
                <AvatarImage src={profile?.avatar_url || undefined} />
                <AvatarFallback className="bg-primary/20 text-primary text-sm font-medium">
                  {(profile?.full_name || user?.email || 'U')[0].toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-col items-start text-left">
                <span className="text-sm font-medium text-foreground">
                  {profile?.full_name || 'Usuário'}
                </span>
                <span className="text-xs text-muted-foreground">
                  {profile?.company || 'Admin'}
                </span>
              </div>
              <ChevronDown className="h-4 w-4 text-muted-foreground" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium">{profile?.full_name || 'Usuário'}</p>
                <p className="text-xs text-muted-foreground">{user?.email}</p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>Perfil</DropdownMenuItem>
            <DropdownMenuItem>Configurações</DropdownMenuItem>
            <DropdownMenuItem>Planos</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={signOut} className="text-destructive">
              Sair
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
