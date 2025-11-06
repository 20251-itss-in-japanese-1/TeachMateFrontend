import { Input } from './ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Search } from 'lucide-react';
import { translations, Language } from '../translations';

interface SearchFiltersProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  nationalityFilter: string;
  onNationalityChange: (value: string) => void;
  specialtyFilter: string;
  onSpecialtyChange: (value: string) => void;
  language: Language;
}

export function SearchFilters({
  searchQuery,
  onSearchChange,
  nationalityFilter,
  onNationalityChange,
  specialtyFilter,
  onSpecialtyChange,
  language
}: SearchFiltersProps) {
  const t = translations[language];
  
  return (
    <div className="flex flex-col md:flex-row gap-3 mb-8 p-6 bg-white rounded-lg border-2">
      <div className="flex-1 relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
        <Input
          placeholder={t.searchPlaceholder}
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-10 h-11"
        />
      </div>
      
      <Select value={nationalityFilter} onValueChange={onNationalityChange}>
        <SelectTrigger className="w-full md:w-52 h-11">
          <SelectValue placeholder={t.nationality} />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">{t.allNationalities}</SelectItem>
          <SelectItem value="Japanese">{t.japanese}</SelectItem>
          <SelectItem value="Vietnamese">{t.vietnamese}</SelectItem>
        </SelectContent>
      </Select>
      
      <Select value={specialtyFilter} onValueChange={onSpecialtyChange}>
        <SelectTrigger className="w-full md:w-52 h-11">
          <SelectValue placeholder={t.specialty} />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">{t.allSpecialties}</SelectItem>
          <SelectItem value="Mathematics">Mathematics</SelectItem>
          <SelectItem value="English Language">English Language</SelectItem>
          <SelectItem value="History">History</SelectItem>
          <SelectItem value="Art">Art</SelectItem>
          <SelectItem value="Physics">Physics</SelectItem>
          <SelectItem value="Music">Music</SelectItem>
          <SelectItem value="STEM Education">STEM Education</SelectItem>
          <SelectItem value="Literature">Literature</SelectItem>
          <SelectItem value="Social Studies">Social Studies</SelectItem>
          <SelectItem value="Science">Science</SelectItem>
          <SelectItem value="Creative Education">Creative Education</SelectItem>
          <SelectItem value="Performing Arts">Performing Arts</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
