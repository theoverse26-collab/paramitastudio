import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useParams, Link, useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ShoppingCart } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface Game {
  id: string;
  title: string;
  genre: string;
  description: string;
  long_description: string;
  price: number;
  image_url: string;
  features: string[];
  screenshots: string[];
  developer: string;
  release_date: string;
  platform: string;
}

const GameDetail = () => {
  const { id } = useParams();
  const [game, setGame] = useState<Game | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    if (id) {
      fetchGame();
    }
  }, [id]);

  const fetchGame = async () => {
    try {
      const { data, error } = await supabase
        .from('games')
        .select('*')
        .eq('id', id)
        .maybeSingle();

      if (error) throw error;
      
      if (!data) {
        navigate('/games');
        return;
      }

      setGame(data);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: 'Failed to load game',
        variant: 'destructive',
      });
      navigate('/games');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Loading game...</p>
      </div>
    );
  }

  if (!game) {
    return null;
  }

  return (
    <div className="min-h-screen">
      <Navbar />

      <div className="pt-24 pb-20">
        {/* Hero Banner */}
        <section className="relative h-[60vh] mb-12">
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: `url(${game.image_url})` }}
          >
            <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent" />
          </div>
          
          <div className="relative container mx-auto px-4 h-full flex items-end pb-12">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Link to="/games" className="inline-flex items-center gap-2 text-primary-foreground mb-4 hover:text-accent transition-fantasy">
                <ArrowLeft size={20} />
                Back to Games
              </Link>
              <h1 className="text-5xl md:text-6xl font-bold text-primary-foreground mb-4 uppercase">
                {game.title}
              </h1>
              <p className="text-accent text-xl font-semibold uppercase tracking-wide">
                {game.genre}
              </p>
            </motion.div>
          </div>
        </section>

        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            {/* Main Content */}
            <div className="lg:col-span-2">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <h2 className="text-3xl font-bold mb-4">About This Game</h2>
                <p className="text-muted-foreground text-lg leading-relaxed mb-8">
                  {game.long_description}
                </p>

                {game.features && game.features.length > 0 && (
                  <>
                    <h3 className="text-2xl font-bold mb-4">Key Features</h3>
                    <ul className="space-y-3 mb-8">
                      {game.features.map((feature, index) => (
                        <motion.li
                          key={index}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.3 + index * 0.1 }}
                          className="flex items-start gap-3"
                        >
                          <div className="w-2 h-2 bg-accent rounded-full mt-2 flex-shrink-0" />
                          <span className="text-muted-foreground">{feature}</span>
                        </motion.li>
                      ))}
                    </ul>
                  </>
                )}

                {game.screenshots && game.screenshots.length > 0 && (
                  <>
                    <h3 className="text-2xl font-bold mb-4">Screenshots</h3>
                    <div className="grid grid-cols-2 gap-4">
                      {game.screenshots.map((screenshot, index) => (
                        <motion.img
                          key={index}
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: 0.4 + index * 0.1 }}
                          src={screenshot}
                          alt={`Screenshot ${index + 1}`}
                          className="rounded-lg w-full hover-lift"
                        />
                      ))}
                    </div>
                  </>
                )}
              </motion.div>
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-1">
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-card p-6 rounded-xl border border-border sticky top-24"
              >
                <img
                  src={game.image_url}
                  alt={game.title}
                  className="w-full rounded-lg mb-6"
                />
                
                <div className="mb-6">
                  <p className="text-muted-foreground mb-2">Price</p>
                  <p className="text-4xl font-bold text-accent">${game.price}</p>
                </div>

                <Link to="/marketplace">
                  <Button size="lg" className="w-full bg-accent text-accent-foreground hover:bg-accent/90 glow-gold mb-3">
                    <ShoppingCart className="mr-2" size={20} />
                    Buy Now
                  </Button>
                </Link>

                <Button size="lg" variant="outline" className="w-full border-accent text-foreground hover:bg-accent/10">
                  Add to Wishlist
                </Button>

                <div className="mt-6 pt-6 border-t border-border space-y-3">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Developer</p>
                    <p className="font-semibold">{game.developer}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Release Date</p>
                    <p className="font-semibold">{game.release_date}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Platform</p>
                    <p className="font-semibold">{game.platform}</p>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default GameDetail;
