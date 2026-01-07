import { useTranslation } from 'react-i18next';
import { ChevronDown } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const languages = [
  { code: 'en', name: 'EN', flag: '🇺🇸' },
  { code: 'id', name: 'ID', flag: '🇮🇩' },
];

const LanguageSwitcher = () => {
  const { i18n } = useTranslation();

  const currentLanguage = languages.find((lang) => lang.code === i18n.language) || languages[0];

  const changeLanguage = (langCode: string) => {
    i18n.changeLanguage(langCode);
  };

  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className="inline-flex items-center justify-center gap-1 rounded-full border border-primary-foreground/20 bg-primary/10 px-3 py-1.5 text-sm font-semibold text-primary-foreground backdrop-blur hover:bg-primary/15 transition-colors focus:outline-none focus:ring-0 focus-visible:ring-0"
          aria-label="Change language"
        >
          <span aria-hidden className="text-base leading-none">{currentLanguage.flag}</span>
          <span className="w-5 text-center">{currentLanguage.name}</span>
          <ChevronDown className="h-3 w-3 opacity-70 flex-shrink-0" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="bg-card border-border shadow-lg min-w-[140px]"
        sideOffset={10}
      >
        {languages.map((lang) => (
          <DropdownMenuItem
            key={lang.code}
            onClick={() => changeLanguage(lang.code)}
            className={`cursor-pointer hover:bg-accent/20 focus:bg-accent/20 ${
              i18n.language === lang.code ? 'border-l-2 border-accent text-accent font-medium' : ''
            }`}
          >
            <span className="mr-2">{lang.flag}</span>
            {lang.code === 'en' ? 'English' : 'Indonesia'}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default LanguageSwitcher;
