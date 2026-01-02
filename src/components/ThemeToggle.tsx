import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Avoid hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <Button
        variant="ghost"
        size="icon"
        className="h-8 w-8 md:h-9 md:w-9 rounded-lg bg-secondary/50 hover:bg-secondary"
      >
        <Sun className="h-4 w-4" />
      </Button>
    );
  }

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
      className="h-8 w-8 md:h-9 md:w-9 rounded-lg bg-secondary/50 hover:bg-secondary transition-all duration-300"
      title={theme === "dark" ? "Ativar modo claro" : "Ativar modo escuro"}
    >
      {theme === "dark" ? (
        <Sun className="h-4 w-4 text-gold-light transition-transform duration-300" />
      ) : (
        <Moon className="h-4 w-4 text-primary transition-transform duration-300" />
      )}
      <span className="sr-only">Alternar tema</span>
    </Button>
  );
}
