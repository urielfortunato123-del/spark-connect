import { useState, useRef, useEffect } from "react";
import { MessageSquare, Send, Loader2, Bot, User, ExternalLink, Navigation, Zap, MapPin, HelpCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { supabase } from "@/integrations/supabase/client";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  stations?: EVStationResult[];
}

interface EVStationResult {
  name: string;
  address: string;
  city: string;
  state: string;
  lat: number;
  lng: number;
  connectors: string[];
  operator: string;
  isPublic: boolean;
}

interface InfraChatProps {
  onNavigateToStation?: (lat: number, lng: number, name: string) => void;
  onShowStationsOnMap?: (stations: EVStationResult[]) => void;
}

const suggestedQuestions = [
  "Quanto tempo leva para carregar um Tesla Model 3?",
  "Meu sinal está ruim, uso Vivo no CEP 01310-100",
  "Onde posso encontrar postos de recarga na BR-116?",
  "Qual a diferença entre carregador AC e DC?",
  "Como melhorar o sinal do meu celular?",
  "Configurações de APN da TIM",
  "Meu 5G não funciona, o que fazer?"
];

const InfraChat = ({ onNavigateToStation, onShowStationsOnMap }: InfraChatProps) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "assistant",
      content: "Olá! 👋 Sou o assistente de infraestrutura do InfraBrasil 2025. Posso ajudar com:\n\n• **Veículos Elétricos**: Tempo de carga, localização de postos, navegação até o local\n• **Sinal de Celular**: Diagnóstico por CEP, configurações de APN, dicas de melhoria\n• **Telecomunicações**: Cobertura 5G, fibra óptica, torres de celular\n• **Infraestrutura**: Custos, instalação, regulamentação\n\n💡 **Dica**: Informe seu CEP e operadora para análise de sinal!",
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const openNavigation = (lat: number, lng: number, name: string) => {
    // Try to open in maps app (works on mobile)
    const encodedName = encodeURIComponent(name);
    
    // Check if on iOS
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    
    if (isIOS) {
      // Open Apple Maps on iOS
      window.open(`maps://maps.apple.com/?daddr=${lat},${lng}&q=${encodedName}`, "_blank");
    } else {
      // Open Google Maps (works on Android and desktop)
      window.open(`https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}&destination_place_id=${encodedName}`, "_blank");
    }

    onNavigateToStation?.(lat, lng, name);
  };

  const sendMessage = async (messageText?: string) => {
    const text = messageText || input.trim();
    if (!text || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: text,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke("infrastructure-ai", {
        body: { 
          type: "chat",
          data: { 
            message: text,
            history: messages.slice(-6).map(m => ({ role: m.role, content: m.content }))
          }
        }
      });

      if (error) throw error;

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: data?.data?.response || "Desculpe, não consegui processar sua pergunta. Tente novamente.",
        timestamp: new Date(),
        stations: data?.data?.stations
      };

      setMessages(prev => [...prev, assistantMessage]);

      // If stations were found, show them on map
      if (data?.data?.stations && data.data.stations.length > 0) {
        onShowStationsOnMap?.(data.data.stations);
      }

    } catch (error: any) {
      console.error("Chat error:", error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: "Desculpe, ocorreu um erro ao processar sua mensagem. Por favor, tente novamente.",
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="glass-card h-full flex flex-col overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-border/50">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-copper flex items-center justify-center shadow-lg">
            <MessageSquare className="w-5 h-5 text-primary-foreground" />
          </div>
          <div>
            <h2 className="text-base font-display font-semibold gradient-text-gold">
              Assistente InfraBrasil
            </h2>
            <p className="text-[10px] text-muted-foreground">
              IA especializada em infraestrutura
            </p>
          </div>
        </div>
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1 p-4" ref={scrollRef}>
        <div className="space-y-4">
          {messages.map((message) => (
            <div key={message.id} className={`flex gap-3 ${message.role === "user" ? "flex-row-reverse" : ""}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                message.role === "user" 
                  ? "bg-primary/20 text-primary" 
                  : "bg-accent/20 text-accent"
              }`}>
                {message.role === "user" ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
              </div>
              <div className={`flex flex-col gap-2 max-w-[85%] ${message.role === "user" ? "items-end" : "items-start"}`}>
                <div className={`px-4 py-3 rounded-2xl text-sm ${
                  message.role === "user"
                    ? "bg-primary text-primary-foreground rounded-br-sm"
                    : "bg-secondary/80 text-foreground rounded-bl-sm"
                }`}>
                  <div className="whitespace-pre-wrap" dangerouslySetInnerHTML={{ 
                    __html: message.content.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>').replace(/\n/g, '<br/>') 
                  }} />
                </div>
                
                {/* EV Station Cards */}
                {message.stations && message.stations.length > 0 && (
                  <div className="w-full space-y-2 mt-2">
                    {message.stations.slice(0, 5).map((station, idx) => (
                      <div key={idx} className="bg-ev-green/10 border border-ev-green/30 rounded-xl p-3">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <Zap className="w-4 h-4 text-ev-green" />
                              <span className="font-semibold text-sm">{station.name}</span>
                            </div>
                            <p className="text-xs text-muted-foreground">{station.address}</p>
                            <p className="text-xs text-muted-foreground">{station.city} - {station.state}</p>
                            <div className="flex flex-wrap gap-1 mt-2">
                              {station.connectors.slice(0, 3).map((connector, i) => (
                                <span key={i} className="px-2 py-0.5 bg-secondary rounded text-[10px]">
                                  {connector}
                                </span>
                              ))}
                            </div>
                          </div>
                          <Button
                            size="sm"
                            variant="outline"
                            className="border-ev-green/50 text-ev-green hover:bg-ev-green hover:text-background"
                            onClick={() => openNavigation(station.lat, station.lng, station.name)}
                          >
                            <Navigation className="w-4 h-4 mr-1" />
                            Ir
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                
                <span className="text-[10px] text-muted-foreground">
                  {message.timestamp.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}
                </span>
              </div>
            </div>
          ))}
          
          {isLoading && (
            <div className="flex gap-3">
              <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 bg-accent/20 text-accent">
                <Bot className="w-4 h-4" />
              </div>
              <div className="bg-secondary/80 px-4 py-3 rounded-2xl rounded-bl-sm">
                <div className="flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span className="text-sm text-muted-foreground">Pensando...</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Suggested Questions */}
      {messages.length <= 2 && (
        <div className="px-4 py-2 border-t border-border/30">
          <p className="text-[10px] text-muted-foreground mb-2 flex items-center gap-1">
            <HelpCircle className="w-3 h-3" /> Sugestões:
          </p>
          <div className="flex flex-wrap gap-1">
            {suggestedQuestions.slice(0, 3).map((q, i) => (
              <button
                key={i}
                onClick={() => sendMessage(q)}
                className="text-[10px] px-2 py-1 rounded-full bg-secondary/50 hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors"
              >
                {q.length > 40 ? q.substring(0, 40) + "..." : q}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input */}
      <div className="p-4 border-t border-border/50">
        <div className="flex gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Pergunte sobre infraestrutura..."
            className="flex-1 bg-secondary/50 border-border/50"
            disabled={isLoading}
          />
          <Button 
            onClick={() => sendMessage()} 
            disabled={!input.trim() || isLoading}
            className="bg-primary hover:bg-primary/90"
          >
            {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default InfraChat;
