import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Menu, X } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const navLinks = [{
    name: "Home",
    path: "/"
  }, {
    name: "About",
    path: "/about"
  }, {
    name: "Games",
    path: "/games"
  }, {
    name: "Marketplace",
    path: "/marketplace"
  }, {
    name: "News",
    path: "/news"
  }, {
    name: "Contact",
    path: "/contact"
  }];
  return <nav className="fixed top-0 left-0 right-0 z-50 bg-card/80 backdrop-blur-md border-b border-border">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <Link to="/">
            <motion.h1 initial={{
            opacity: 0,
            x: -20
          }} animate={{
            opacity: 1,
            x: 0
          }} className="text-2xl md:text-3xl font-bold tracking-widest text-gradient-gold uppercase text-blue-700">
              Paramita
            </motion.h1>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-6">
            {navLinks.map((link, index) => <motion.div key={link.path} initial={{
            opacity: 0,
            y: -10
          }} animate={{
            opacity: 1,
            y: 0
          }} transition={{
            delay: index * 0.1
          }}>
                <Link to={link.path} className="text-foreground hover:text-accent transition-fantasy font-medium">
                  {link.name}
                </Link>
              </motion.div>)}
          </div>

          {/* Mobile Menu Button */}
          <button className="md:hidden text-foreground" onClick={() => setIsOpen(!isOpen)}>
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isOpen && <motion.div initial={{
        opacity: 0,
        height: 0
      }} animate={{
        opacity: 1,
        height: "auto"
      }} exit={{
        opacity: 0,
        height: 0
      }} className="md:hidden mt-4 flex flex-col gap-4">
            {navLinks.map(link => <Link key={link.path} to={link.path} className="text-foreground hover:text-accent transition-fantasy font-medium py-2" onClick={() => setIsOpen(false)}>
                {link.name}
              </Link>)}
          </motion.div>}
      </div>
    </nav>;
};
export default Navbar;