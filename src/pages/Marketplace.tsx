import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { ShoppingCart, Heart } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

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
        title: 'Error',
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
        title: 'Login Required',
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
          title: 'Removed from wishlist',
        });
      } else {
        const { error } = await supabase
          .from('wishlist')
          .insert({ user_id: user.id, game_id: gameId });

        if (error) throw error;

        setWishlist(prev => new Set([...prev, gameId]));

        toast({
          title: 'Added to wishlist',
        });
      }
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const handlePurchase = (gameId: string) => {
    if (!user) {
      toast({
        title: 'Login Required',
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
        <p className="text-muted-foreground">Loading marketplace...</p>
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
              Marketplace
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Purchase your favorite games directly from our store. All games come with lifetime updates 
              and dedicated customer support.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {games.map((game, index) => (
              <motion.div
                key={game.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-card rounded-xl overflow-hidden border border-border hover-lift"
              >
                <div className="grid grid-cols-1 md:grid-cols-2">
                  <div className="aspect-square">
                    <img
                      src={game.image_url}
                      alt={game.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  
                  <div className="p-6 flex flex-col justify-between">
                    <div>
                      <h3 className="text-2xl font-bold mb-2">{game.title}</h3>
                      <p className="text-accent text-sm font-semibold mb-3 uppercase tracking-wide">
                        {game.genre}
                      </p>
                      <p className="text-muted-foreground mb-4 line-clamp-3">
                        {game.description}
                      </p>
                    </div>

                    <div>
                      <div className="mb-4">
                        <p className="text-3xl font-bold text-accent">${game.price}</p>
                      </div>

                      <div className="flex gap-2">
                        <Button 
                          className="flex-1 bg-accent text-accent-foreground hover:bg-accent/90 glow-gold"
                          onClick={() => handlePurchase(game.id)}
                        >
                          <ShoppingCart className="mr-2" size={18} />
                          Buy Now
                        </Button>
                        <Button 
                          variant="outline" 
                          size="icon"
                          className={`border-accent hover:bg-accent/10 ${wishlist.has(game.id) ? 'text-red-500' : 'text-foreground'}`}
                          onClick={() => toggleWishlist(game.id)}
                        >
                          <Heart size={18} fill={wishlist.has(game.id) ? 'currentColor' : 'none'} />
                        </Button>
                      </div>

                      <Link to={`/games/${game.id}`}>
                        <Button variant="ghost" className="w-full mt-2 hover:bg-accent/10">
                          View Details
                        </Button>
                      </Link>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

        </section>
      </div>

      <Footer />
    </div>
  );
};

export default Marketplace;
