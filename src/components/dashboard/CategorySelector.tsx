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
import { Card, CardContent } from '@/components/ui/card';
import { ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface CategoryItem {
  id: string;
  title: string;
  icon: React.ElementType;
  color: string;
  desc?: string;
  description?: string;
  subtypes?: string[];
}

interface CategoryAccordionProps {
  categories: CategoryItem[];
  onSelect: (categoryId: string) => void;
  selectedCategory?: string | null;
}

export function CategoryAccordion({ categories, onSelect, selectedCategory }: CategoryAccordionProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {categories.map((cat) => {
        const Icon = cat.icon;
        const isSelected = selectedCategory === cat.id;
        
        return (
          <Card 
            key={cat.id} 
            className={cn(
              "glass-card cursor-pointer transition-all hover:border-primary/40 hover:shadow-lg hover:shadow-primary/5",
              isSelected && "border-primary/50 bg-primary/5"
            )}
            onClick={() => onSelect(cat.id)}
          >
            <CardContent className="p-6 flex flex-col items-center text-center gap-3">
              <div className={cn(
                "w-12 h-12 rounded-xl flex items-center justify-center",
                cat.color + '/10'
              )}>
                <Icon className={cn("h-6 w-6", cat.color.replace('bg-', 'text-'))} />
              </div>
              <div>
                <h3 className="font-semibold text-sm">{cat.title}</h3>
                {(cat.desc || cat.description) && (
                  <p className="text-xs text-muted-foreground mt-1">{cat.desc || cat.description}</p>
                )}
              </div>
              {cat.subtypes && cat.subtypes.length > 0 && (
                <div className="flex flex-wrap gap-1 justify-center mt-1">
                  {cat.subtypes.slice(0, 3).map((s) => (
                    <Badge key={s} variant="outline" className="text-[10px] px-1.5 py-0">
                      {s}
                    </Badge>
                  ))}
                  {cat.subtypes.length > 3 && (
                    <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                      +{cat.subtypes.length - 3}
                    </Badge>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
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
