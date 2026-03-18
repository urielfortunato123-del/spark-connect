import { useState } from 'react';
import { 
  Accordion, 
  AccordionContent, 
  AccordionItem, 
  AccordionTrigger 
} from '@/components/ui/accordion';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface CategoryItem {
  id: string;
  title: string;
  icon: React.ElementType;
  color: string;
  desc?: string;
  description?: string;
}

interface CategoryAccordionProps {
  categories: CategoryItem[];
  onSelect: (categoryId: string) => void;
  selectedCategory?: string | null;
}

export function CategoryAccordion({ categories, onSelect, selectedCategory }: CategoryAccordionProps) {
  return (
    <Accordion type="single" collapsible className="space-y-2">
      {categories.map((cat) => {
        const Icon = cat.icon;
        const isSelected = selectedCategory === cat.id;
        const colorText = cat.color.replace('bg-', 'text-');
        const colorBg10 = `${cat.color}/10`;
        
        return (
          <AccordionItem 
            key={cat.id} 
            value={cat.id}
            className={cn(
              "border rounded-xl px-4 transition-all",
              isSelected && "border-primary/50 bg-primary/5"
            )}
          >
            <AccordionTrigger className="hover:no-underline py-3">
              <div className="flex items-center gap-3">
                <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center", colorBg10)}>
                  <Icon className={cn("h-5 w-5", colorText)} />
                </div>
                <div className="text-left">
                  <span className="font-medium text-sm">{cat.title}</span>
                  {(cat.desc || cat.description) && (
                    <p className="text-xs text-muted-foreground">{cat.desc || cat.description}</p>
                  )}
                </div>
              </div>
            </AccordionTrigger>
            <AccordionContent>
              <div className="pb-2 pt-1 flex items-center justify-between">
                <p className="text-sm text-muted-foreground">
                  Clique para iniciar um novo projeto nesta categoria
                </p>
                <Button size="sm" onClick={() => onSelect(cat.id)}>
                  Iniciar Projeto
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </div>
            </AccordionContent>
          </AccordionItem>
        );
      })}
    </Accordion>
  );
}

interface CategoryDropdownProps {
  categories: CategoryItem[];
  value: string | null;
  onValueChange: (value: string) => void;
  placeholder?: string;
}

export function CategoryDropdown({ categories, value, onValueChange, placeholder = "Selecione uma categoria" }: CategoryDropdownProps) {
  return (
    <Select value={value || ''} onValueChange={onValueChange}>
      <SelectTrigger className="w-full md:w-[300px]">
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        {categories.map((cat) => {
          const Icon = cat.icon;
          return (
            <SelectItem key={cat.id} value={cat.id}>
              <div className="flex items-center gap-2">
                <Icon className={cn("h-4 w-4", cat.color.replace('bg-', 'text-'))} />
                <span>{cat.title}</span>
              </div>
            </SelectItem>
          );
        })}
      </SelectContent>
    </Select>
  );
}
