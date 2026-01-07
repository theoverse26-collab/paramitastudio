import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import logoParamita from "@/assets/logo-paramita.png";

const Footer = () => {
  const { t } = useTranslation();

  return (
    <footer className="bg-primary text-primary-foreground mt-20">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div>
            <h3 className="text-2xl font-bold text-gradient-gold mb-4">PARAMITA STUDIO</h3>
            <p className="text-sm opacity-90">
              {t('footer.description')}
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold mb-4 text-accent">{t('footer.quickLinks')}</h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="/" className="hover:text-accent transition-fantasy">{t('nav.home')}</Link></li>
              <li><Link to="/about" className="hover:text-accent transition-fantasy">{t('nav.about')}</Link></li>
              <li><Link to="/games" className="hover:text-accent transition-fantasy">{t('nav.games')}</Link></li>
              <li><Link to="/marketplace" className="hover:text-accent transition-fantasy">{t('nav.marketplace')}</Link></li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="font-semibold mb-4 text-accent">{t('footer.support')}</h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="/contact" className="hover:text-accent transition-fantasy">{t('footer.contactUs')}</Link></li>
              <li><Link to="/news" className="hover:text-accent transition-fantasy">{t('nav.news')}</Link></li>
              <li><Link to="/contact#faq" className="hover:text-accent transition-fantasy">{t('footer.faq')}</Link></li>
            </ul>
          </div>

          {/* Logo */}
          <div className="flex items-center justify-center">
            <img 
              src={logoParamita} 
              alt="Paramita Studio Logo" 
              className="h-32 w-auto object-contain"
            />
          </div>
        </div>

        <div className="border-t border-primary-foreground/20 mt-8 pt-8 text-center text-sm opacity-75">
          <p>&copy; 2024 Paramita Studio. {t('footer.allRightsReserved')}</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
