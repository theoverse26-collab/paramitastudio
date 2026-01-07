import { Link } from "react-router-dom";
import { Instagram, Youtube, Linkedin } from "lucide-react";
const Footer = () => {
  return <footer className="bg-primary text-primary-foreground mt-20">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div>
            <h3 className="text-2xl font-bold text-gradient-gold mb-4">PARAMITA STUDIO </h3>
            <p className="text-sm opacity-90">
              Where creativity meets simplicity. Crafting immersive fantasy worlds since 2024.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold mb-4 text-accent">Quick Links</h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="/" className="hover:text-accent transition-fantasy">Home</Link></li>
              <li><Link to="/about" className="hover:text-accent transition-fantasy">About</Link></li>
              <li><Link to="/games" className="hover:text-accent transition-fantasy">Games</Link></li>
              <li><Link to="/marketplace" className="hover:text-accent transition-fantasy">Marketplace</Link></li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="font-semibold mb-4 text-accent">Support</h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="/contact" className="hover:text-accent transition-fantasy">Contact Us</Link></li>
              <li><Link to="/news" className="hover:text-accent transition-fantasy">News</Link></li>
              <li><a href="#" className="hover:text-accent transition-fantasy">FAQ</a></li>
              <li><a href="#" className="hover:text-accent transition-fantasy">Privacy Policy</a></li>
            </ul>
          </div>

          {/* Social */}
          <div>
            <h4 className="font-semibold mb-4 text-accent">Follow Us</h4>
            <div className="flex gap-4">
              <a href="https://www.youtube.com/@Alcuinex" target="_blank" rel="noopener noreferrer" className="hover:text-accent transition-fantasy">
                <Youtube size={20} />
              </a>
              <a href="https://id.linkedin.com/company/alcuinex" target="_blank" rel="noopener noreferrer" className="hover:text-accent transition-fantasy">
                <Linkedin size={20} />
              </a>
              <a href="https://www.instagram.com/alcuinex.official/" target="_blank" rel="noopener noreferrer" className="hover:text-accent transition-fantasy">
                <Instagram size={20} />
              </a>
            </div>
          </div>
        </div>

        <div className="border-t border-primary-foreground/20 mt-8 pt-8 text-center text-sm opacity-75">
          <p>&copy; 2024 Paramita Studio. All rights reserved.</p>
        </div>
      </div>
    </footer>;
};
export default Footer;