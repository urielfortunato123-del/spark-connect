import { Globe } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useCountries } from '@/hooks/useInfrastructureData';

interface CountryFilterProps {
  value: string;
  onChange: (value: string) => void;
}

const CountryFilter = ({ value, onChange }: CountryFilterProps) => {
  const { data: countries, isLoading } = useCountries();

  return (
    <div className="flex items-center gap-2">
      <Globe className="h-4 w-4 text-muted-foreground" />
      <Select value={value} onValueChange={onChange} disabled={isLoading}>
        <SelectTrigger className="w-[180px] bg-card border-border">
          <SelectValue placeholder="Todos os países" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todos os países</SelectItem>
          {countries?.map((country) => (
            <SelectItem key={country.code} value={country.code}>
              {country.name_pt || country.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};

export default CountryFilter;
