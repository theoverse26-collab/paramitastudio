import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Menu, X, User, LogOut, Heart } from "lucide-react";
import { useTranslation } from "react-i18next";
import { NavLink } from "./NavLink";
import { Button } from "./ui/button";
import { useAuth } from "@/contexts/AuthContext";
import LanguageSwitcher from "./LanguageSwitcher";
import InboxBell from "./InboxBell";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { user, signOut, isAdmin } = useAuth();
  const navigate = useNavigate();
  const { t } = useTranslation();

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-primary text-primary-foreground border-b border-primary-foreground/20">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-20">
          <Link to="/" className="text-2xl font-bold text-gradient-gold uppercase tracking-wider">
            Paramita Studio
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <NavLink to="/">{t('nav.home')}</NavLink>
            <NavLink to="/about">{t('nav.about')}</NavLink>
            <NavLink to="/games">{t('nav.games')}</NavLink>
            <NavLink to="/marketplace">{t('nav.marketplace')}</NavLink>
            <NavLink to="/news">{t('nav.news')}</NavLink>
            <NavLink to="/contact">{t('nav.contact')}</NavLink>
            
            <LanguageSwitcher />
            
            {user ? (
              <>
                <NavLink to="/wishlist">
                  <Heart size={18} className="inline mr-1" />
                  {t('nav.wishlist')}
                </NavLink>
                <InboxBell />
                <NavLink to={isAdmin ? "/admin" : "/dashboard"}>
                  <User size={18} className="inline mr-1" />
                  {isAdmin ? t('nav.admin') : t('nav.dashboard')}
                </NavLink>
                <Button
                  onClick={signOut}
                  variant="outline"
                  size="sm"
                  className="border-accent text-foreground hover:bg-accent/10"
                >
                  <LogOut size={16} className="mr-2" />
                  {t('nav.logout')}
                </Button>
              </>
            ) : (
              <Button
                onClick={() => navigate('/auth')}
                variant="outline"
                size="sm"
                className="border-accent text-foreground hover:bg-accent/10"
              >
                {t('nav.login')}
              </Button>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center gap-2">
            <LanguageSwitcher />
            <button
              onClick={() => setIsOpen(!isOpen)}
            >
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <div className="md:hidden pb-4 space-y-2">
            <Link to="/" className="block px-4 py-2 hover:text-accent transition-fantasy" onClick={() => setIsOpen(false)}>{t('nav.home')}</Link>
            <Link to="/about" className="block px-4 py-2 hover:text-accent transition-fantasy" onClick={() => setIsOpen(false)}>{t('nav.about')}</Link>
            <Link to="/games" className="block px-4 py-2 hover:text-accent transition-fantasy" onClick={() => setIsOpen(false)}>{t('nav.games')}</Link>
            <Link to="/marketplace" className="block px-4 py-2 hover:text-accent transition-fantasy" onClick={() => setIsOpen(false)}>{t('nav.marketplace')}</Link>
            <Link to="/news" className="block px-4 py-2 hover:text-accent transition-fantasy" onClick={() => setIsOpen(false)}>{t('nav.news')}</Link>
            <Link to="/contact" className="block px-4 py-2 hover:text-accent transition-fantasy" onClick={() => setIsOpen(false)}>{t('nav.contact')}</Link>
            
            {user ? (
              <>
                <Link to="/wishlist" className="block px-4 py-2 hover:text-accent transition-fantasy" onClick={() => setIsOpen(false)}>{t('nav.wishlist')}</Link>
                <Link to="/inbox" className="block px-4 py-2 hover:text-accent transition-fantasy" onClick={() => setIsOpen(false)}>{t('nav.inbox')}</Link>
                <Link to={isAdmin ? "/admin" : "/dashboard"} className="block px-4 py-2 text-foreground hover:text-accent transition-fantasy" onClick={() => setIsOpen(false)}>
                  {isAdmin ? t('nav.admin') : t('nav.dashboard')}
                </Link>
                <button
                  onClick={() => {
                    signOut();
                    setIsOpen(false);
                  }}
                  className="block w-full text-left px-4 py-2 text-accent hover:bg-accent/10 rounded"
                >
                  {t('nav.logout')}
                </button>
              </>
            ) : (
              <button
                onClick={() => {
                  navigate('/auth');
                  setIsOpen(false);
                }}
                className="block w-full text-left px-4 py-2 text-accent hover:bg-accent/10 rounded"
              >
                {t('nav.login')}
              </button>
            )}
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
