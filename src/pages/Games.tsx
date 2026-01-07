import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import GameCard from "@/components/GameCard";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface Game {
  id: string;
  title: string;
  genre: string;
  description: string;
  image_url: string;
}

const Games = () => {
  const [games, setGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const { t } = useTranslation();

  useEffect(() => {
    fetchGames();
  }, []);

  const fetchGames = async () => {
    try {
      const { data, error } = await supabase
        .from('games')
        .select('id, title, genre, description, image_url')
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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">{t('games.loading')}</p>
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
              {t('games.title')}
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              {t('games.subtitle')}
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {games.map((game, index) => (
              <GameCard 
                key={game.id} 
                id={game.id}
                title={game.title}
                genre={game.genre}
                description={game.description}
                image={game.image_url}
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

export default Games;
