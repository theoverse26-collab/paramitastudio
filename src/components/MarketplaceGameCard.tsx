import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ShoppingCart, Heart } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { useGameTranslation } from "@/hooks/useGameTranslation";

interface MarketplaceGameCardProps {
  id: string;
  title: string;
  genre: string;
  description: string;
  price: number;
  imageUrl: string;
  isInWishlist: boolean;
  onToggleWishlist: (gameId: string) => void;
  onPurchase: (gameId: string) => void;
  index: number;
}

const MarketplaceGameCard = ({
  id,
  title,
  genre,
  description,
  price,
  imageUrl,
  isInWishlist,
  onToggleWishlist,
  onPurchase,
  index,
}: MarketplaceGameCardProps) => {
  const { t } = useTranslation();
  const { translated, isTranslating } = useGameTranslation({
    gameId: id,
    description,
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className="bg-card rounded-xl overflow-hidden border border-border hover-lift"
    >
      <div className="grid grid-cols-1 md:grid-cols-2">
        <div className="aspect-square">
          <img
            src={imageUrl}
            alt={title}
            className="w-full h-full object-cover"
          />
        </div>
        
        <div className="p-6 flex flex-col justify-between">
          <div>
            <h3 className="text-2xl font-bold mb-2">{title}</h3>
            <p className="text-accent text-sm font-semibold mb-3 uppercase tracking-wide">
              {genre}
            </p>
            <p className={`text-muted-foreground mb-4 line-clamp-3 ${isTranslating ? 'opacity-50' : ''}`}>
              {translated.description}
            </p>
          </div>

          <div>
            <div className="mb-4">
              <p className="text-3xl font-bold text-accent">${price}</p>
            </div>

            <div className="flex gap-2">
              <Button 
                className="flex-1 bg-accent text-accent-foreground hover:bg-accent/90 glow-gold"
                onClick={() => onPurchase(id)}
              >
                <ShoppingCart className="mr-2" size={18} />
                {t('marketplace.buyNow')}
              </Button>
              <Button 
                variant="outline" 
                size="icon"
                className={`border-accent hover:bg-accent/10 ${isInWishlist ? 'text-red-500' : 'text-foreground'}`}
                onClick={() => onToggleWishlist(id)}
              >
                <Heart size={18} fill={isInWishlist ? 'currentColor' : 'none'} />
              </Button>
            </div>

            <Link to={`/games/${id}`}>
              <Button variant="ghost" className="w-full mt-2 hover:bg-accent/10">
                {t('marketplace.viewDetails')}
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default MarketplaceGameCard;
