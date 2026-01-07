import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import MarketplaceGameCard from "@/components/MarketplaceGameCard";

interface Game {
  id: string;
  title: string;
  genre: string;
  description: string;
  price: number;
  image_url: string;
}

const Marketplace = () => {
  const [games, setGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState(true);
  const [wishlist, setWishlist] = useState<Set<string>>(new Set());
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { t } = useTranslation();

  useEffect(() => {
    fetchGames();
    if (user) {
      fetchWishlist();
    }
  }, [user]);

  const fetchGames = async () => {
    try {
      const { data, error } = await supabase
        .from('games')
        .select('id, title, genre, description, price, image_url')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setGames(data || []);
    } catch (error: any) {
      toast({
        title: t('common.error'),
        description: 'Failed to load games',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchWishlist = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('wishlist')
        .select('game_id')
        .eq('user_id', user.id);

      if (error) throw error;
      setWishlist(new Set(data?.map(item => item.game_id) || []));
    } catch (error) {
      console.error('Error fetching wishlist:', error);
    }
  };

  const toggleWishlist = async (gameId: string) => {
    if (!user) {
      toast({
        title: t('common.error'),
        description: 'Please login to add games to wishlist',
      });
      navigate('/auth');
      return;
    }

    const isInWishlist = wishlist.has(gameId);

    try {
      if (isInWishlist) {
        const { error } = await supabase
          .from('wishlist')
          .delete()
          .eq('user_id', user.id)
          .eq('game_id', gameId);

        if (error) throw error;

        setWishlist(prev => {
          const newSet = new Set(prev);
          newSet.delete(gameId);
          return newSet;
        });

        toast({
          title: t('marketplace.removeFromWishlist'),
        });
      } else {
        const { error } = await supabase
          .from('wishlist')
          .insert({ user_id: user.id, game_id: gameId });

        if (error) throw error;

        setWishlist(prev => new Set([...prev, gameId]));

        toast({
          title: t('marketplace.addToWishlist'),
        });
      }
    } catch (error: any) {
      toast({
        title: t('common.error'),
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const handlePurchase = (gameId: string) => {
    if (!user) {
      toast({
        title: t('common.error'),
        description: 'Please login to purchase games',
      });
      navigate('/auth');
      return;
    }

    navigate(`/payment?gameId=${gameId}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">{t('marketplace.loading')}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Navbar />

      <div className="pt-24 pb-20">
        <section className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-16"
          >
            <h1 className="text-5xl md:text-6xl font-bold mb-6 text-gradient-gold uppercase">
              {t('marketplace.title')}
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              {t('marketplace.subtitle')}
            </p>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {games.map((game, index) => (
              <MarketplaceGameCard
                key={game.id}
                id={game.id}
                title={game.title}
                genre={game.genre}
                description={game.description}
                price={game.price}
                imageUrl={game.image_url}
                isInWishlist={wishlist.has(game.id)}
                onToggleWishlist={toggleWishlist}
                onPurchase={handlePurchase}
                index={index}
              />
            ))}
          </div>

        </section>
      </div>

      <Footer />
    </div>
  );
};

export default Marketplace;
