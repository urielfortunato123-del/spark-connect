import { useState, useRef, useEffect } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { 
  Bot, 
  Send, 
  Loader2, 
  User, 
  Sparkles, 
  Trash2,
  Radio,
  Zap,
  MapPin,
  TreePine,
  Fuel,
  Lightbulb,
  Mountain,
  Droplets,
  Building,
  Factory,
  MessageSquare
} from 'lucide-react';
import { useInfraAI } from '@/hooks/useInfraAI';
import { cn } from '@/lib/utils';

const quickActions = [
  { label: 'Torres 5G no Brasil', icon: Radio, color: 'text-blue-500' },
  { label: 'Eletropostos por estado', icon: Zap, color: 'text-green-500' },
  { label: 'Vazios territoriais', icon: MapPin, color: 'text-orange-500' },
  { label: 'Licenciamento ambiental', icon: TreePine, color: 'text-emerald-500' },
  { label: 'Produção de petróleo', icon: Fuel, color: 'text-amber-500' },
  { label: 'Matriz energética', icon: Lightbulb, color: 'text-yellow-500' },
  { label: 'Mineração no Brasil', icon: Mountain, color: 'text-stone-500' },
  { label: 'Marco do Saneamento', icon: Droplets, color: 'text-cyan-500' },
];

export default function Assistente() {
  const [input, setInput] = useState('');
  const { messages, isLoading, error, sendMessage, clearMessages } = useInfraAI();
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim() && !isLoading) {
      sendMessage(input.trim());
      setInput('');
    }
  };

  const handleQuickAction = (label: string) => {
    if (!isLoading) {
      sendMessage(`Me fale sobre: ${label}`);
    }
  };

  return (
    <AppLayout>
      <div className="h-[calc(100vh-120px)] flex flex-col gap-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-display font-bold text-foreground flex items-center gap-3">
              <div className="p-2 rounded-xl bg-primary/10">
                <Bot className="h-6 w-6 text-primary" />
              </div>
              InfraBot
            </h1>
            <p className="text-muted-foreground mt-1">
              Assistente de IA com acesso a todos os módulos de infraestrutura
            </p>
          </div>
          {messages.length > 0 && (
            <Button variant="ghost" size="sm" onClick={clearMessages}>
              <Trash2 className="h-4 w-4 mr-2" />
              Limpar
            </Button>
          )}
        </div>

        {/* Main Chat Area */}
        <Card className="flex-1 flex flex-col overflow-hidden">
          <ScrollArea className="flex-1 p-4" ref={scrollRef}>
            {messages.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center py-8">
                <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center mb-6">
                  <Sparkles className="h-10 w-10 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Como posso ajudar?</h3>
                <p className="text-muted-foreground max-w-md mb-8">
                  Tenho conhecimento sobre todos os setores de infraestrutura do Brasil: 
                  telecomunicações, energia, mobilidade elétrica, saneamento, mineração e mais.
                </p>
                
                {/* Quick Actions */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 max-w-2xl">
                  {quickActions.map((action) => (
                    <Button
                      key={action.label}
                      variant="outline"
                      className="h-auto py-3 px-4 flex flex-col items-center gap-2 hover:border-primary/50"
                      onClick={() => handleQuickAction(action.label)}
                    >
                      <action.icon className={cn("h-5 w-5", action.color)} />
                      <span className="text-xs text-center">{action.label}</span>
                    </Button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {messages.map((message, index) => (
                  <div
                    key={index}
                    className={cn(
                      "flex gap-3",
                      message.role === 'user' ? 'justify-end' : 'justify-start'
                    )}
                  >
                    {message.role === 'assistant' && (
                      <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                        <Bot className="h-4 w-4 text-primary" />
                      </div>
                    )}
                    <div
                      className={cn(
                        "max-w-[80%] rounded-2xl px-4 py-3",
                        message.role === 'user'
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-muted/50'
                      )}
                    >
                      <div className={cn(
                        "text-sm whitespace-pre-wrap",
                        message.role === 'assistant' && "prose prose-sm dark:prose-invert max-w-none"
                      )}>
                        {message.content}
                      </div>
                    </div>
                    {message.role === 'user' && (
                      <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center shrink-0">
                        <User className="h-4 w-4 text-primary-foreground" />
                      </div>
                    )}
                  </div>
                ))}
                {isLoading && messages[messages.length - 1]?.role === 'user' && (
                  <div className="flex gap-3">
                    <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                      <Bot className="h-4 w-4 text-primary" />
                    </div>
                    <div className="bg-muted/50 rounded-2xl px-4 py-3">
                      <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                    </div>
                  </div>
                )}
              </div>
            )}
          </ScrollArea>

          {/* Error Display */}
          {error && (
            <div className="px-4 py-2 bg-destructive/10 border-t border-destructive/20">
              <p className="text-sm text-destructive">{error}</p>
            </div>
          )}

          {/* Input Area */}
          <div className="p-4 border-t">
            <form onSubmit={handleSubmit} className="flex gap-2">
              <Input
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Pergunte sobre infraestrutura do Brasil..."
                disabled={isLoading}
                className="flex-1"
              />
              <Button type="submit" disabled={isLoading || !input.trim()}>
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
              </Button>
            </form>
            <div className="flex items-center gap-2 mt-2">
              <Badge variant="outline" className="text-xs">
                <Sparkles className="h-3 w-3 mr-1" />
                Powered by Gemini
              </Badge>
              <span className="text-xs text-muted-foreground">
                Acesso a todos os módulos • Dados em tempo real
              </span>
            </div>
          </div>
        </Card>
      </div>
    </AppLayout>
  );
}
