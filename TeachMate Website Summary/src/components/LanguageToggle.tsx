import { Button } from './ui/button';
import { Languages } from 'lucide-react';
import { Language } from '../translations';

interface LanguageToggleProps {
  language: Language;
  onToggle: () => void;
}

export function LanguageToggle({ language, onToggle }: LanguageToggleProps) {
  return (
    <Button
      variant="outline"
      size="sm"
      onClick={onToggle}
      className="gap-2"
    >
      <Languages className="w-4 h-4" />
      {language === 'ja' ? '日本語' : 'Tiếng Việt'}
    </Button>
  );
}
