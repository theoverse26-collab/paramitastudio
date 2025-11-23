import { useState } from "react";
import { Link } from "react-router-dom";
import { Menu, X, User, LogOut } from "lucide-react";
import { NavLink } from "./NavLink";
import { Button } from "./ui/button";
import { useAuth } from "@/contexts/AuthContext";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { user, signOut, isAdmin } = useAuth();

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-20">
          <Link to="/" className="text-2xl font-bold text-gradient-gold uppercase tracking-wider">
            Alcuinex
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <NavLink to="/">Home</NavLink>
            <NavLink to="/about">About</NavLink>
            <NavLink to="/games">Games</NavLink>
            <NavLink to="/marketplace">Marketplace</NavLink>
            <NavLink to="/news">News</NavLink>
            <NavLink to="/contact">Contact</NavLink>
            
            {user ? (
              <>
                <NavLink to={isAdmin ? "/admin" : "/dashboard"}>
                  <User size={18} className="inline mr-1" />
                  {isAdmin ? 'Admin' : 'Dashboard'}
                </NavLink>
                <Button
                  onClick={signOut}
                  variant="outline"
                  size="sm"
                  className="border-accent text-foreground hover:bg-accent/10"
                >
                  <LogOut size={16} className="mr-2" />
                  Logout
                </Button>
              </>
            ) : (
              <Button
                onClick={() => window.location.href = '/auth'}
                variant="outline"
                size="sm"
                className="border-accent text-foreground hover:bg-accent/10"
              >
                Login
              </Button>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden text-foreground"
            onClick={() => setIsOpen(!isOpen)}
          >
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <div className="md:hidden pb-4 space-y-2">
            <Link to="/" className="block px-4 py-2 text-foreground hover:text-accent transition-fantasy" onClick={() => setIsOpen(false)}>Home</Link>
            <Link to="/about" className="block px-4 py-2 text-foreground hover:text-accent transition-fantasy" onClick={() => setIsOpen(false)}>About</Link>
            <Link to="/games" className="block px-4 py-2 text-foreground hover:text-accent transition-fantasy" onClick={() => setIsOpen(false)}>Games</Link>
            <Link to="/marketplace" className="block px-4 py-2 text-foreground hover:text-accent transition-fantasy" onClick={() => setIsOpen(false)}>Marketplace</Link>
            <Link to="/news" className="block px-4 py-2 text-foreground hover:text-accent transition-fantasy" onClick={() => setIsOpen(false)}>News</Link>
            <Link to="/contact" className="block px-4 py-2 text-foreground hover:text-accent transition-fantasy" onClick={() => setIsOpen(false)}>Contact</Link>
            
            {user ? (
              <>
                <Link to={isAdmin ? "/admin" : "/dashboard"} className="block px-4 py-2 text-foreground hover:text-accent transition-fantasy" onClick={() => setIsOpen(false)}>
                  {isAdmin ? 'Admin' : 'Dashboard'}
                </Link>
                <button
                  onClick={() => {
                    signOut();
                    setIsOpen(false);
                  }}
                  className="block w-full text-left px-4 py-2 text-accent hover:bg-accent/10 rounded"
                >
                  Logout
                </button>
              </>
            ) : (
              <button
                onClick={() => {
                  window.location.href = '/auth';
                  setIsOpen(false);
                }}
                className="block w-full text-left px-4 py-2 text-accent hover:bg-accent/10 rounded"
              >
                Login
              </button>
            )}
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
