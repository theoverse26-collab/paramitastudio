import { useTranslation } from 'react-i18next';
import { Globe, ChevronDown } from 'lucide-react';
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
    <div className="w-[70px] flex-shrink-0">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button 
            className="flex items-center gap-1 px-2 py-1.5 text-sm text-primary-foreground hover:text-accent transition-colors w-full justify-center focus:outline-none focus:ring-0 focus-visible:ring-0 focus-visible:outline-none"
          >
            <Globe className="h-4 w-4 flex-shrink-0" />
            <span className="w-5 text-center">{currentLanguage.name}</span>
            <ChevronDown className="h-3 w-3 opacity-70 flex-shrink-0" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent 
          align="end" 
          className="bg-card border-border shadow-lg min-w-[120px]"
          sideOffset={8}
        >
          {languages.map((lang) => (
            <DropdownMenuItem
              key={lang.code}
              onClick={() => changeLanguage(lang.code)}
              className={`cursor-pointer hover:bg-accent/20 focus:bg-accent/20 ${
                i18n.language === lang.code ? 'bg-accent/10 text-accent' : ''
              }`}
            >
              <span className="mr-2">{lang.flag}</span>
              {lang.code === 'en' ? 'English' : 'Indonesia'}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};

export default LanguageSwitcher;
