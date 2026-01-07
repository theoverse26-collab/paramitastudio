import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Heart, Trash2, ShoppingCart } from "lucide-react";
import { motion } from "framer-motion";
import { formatPrice } from "@/utils/currency";

interface WishlistItem {
  id: string;
  game_id: string;
  added_at: string;
  games: {
    id: string;
    title: string;
    description: string;
    price: number;
    image_url: string;
    genre: string;
  };
}

const Wishlist = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [wishlist, setWishlist] = useState<WishlistItem[]>([]);
  const [loading, setLoading] = useState(true);
  const { t, i18n } = useTranslation();

  useEffect(() => {
    if (authLoading) return;
    
    if (!user) {
      toast.error(t('common.error'));
      navigate("/auth");
      return;
    }

    fetchWishlist();
  }, [user, authLoading, navigate]);

  const fetchWishlist = async () => {
    try {
      const { data, error } = await supabase
        .from("wishlist")
        .select(`
          id,
          game_id,
          added_at,
          games (
            id,
            title,
            description,
            price,
            image_url,
            genre
          )
        `)
        .eq("user_id", user!.id)
        .order("added_at", { ascending: false });

      if (error) throw error;
      setWishlist(data || []);
    } catch (error) {
      console.error("Error fetching wishlist:", error);
      toast.error(t('common.error'));
    } finally {
      setLoading(false);
    }
  };

  const removeFromWishlist = async (wishlistId: string) => {
    try {
      const { error } = await supabase
        .from("wishlist")
        .delete()
        .eq("id", wishlistId);

      if (error) throw error;

      setWishlist(wishlist.filter((item) => item.id !== wishlistId));
      toast.success(t('wishlist.remove'));
    } catch (error) {
      console.error("Error removing from wishlist:", error);
      toast.error(t('common.error'));
    }
  };

  const handlePurchase = (gameId: string) => {
    navigate(`/payment?gameId=${gameId}`);
  };

  if (loading || authLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="flex items-center justify-center h-[50vh]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-muted-foreground">{t('wishlist.loading')}</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto px-4 pt-28 pb-12">
        <div className="flex items-center gap-3 mb-8">
          <Heart className="w-8 h-8 text-primary fill-primary" />
          <h1 className="text-4xl font-bold">{t('wishlist.title')}</h1>
        </div>

        {wishlist.length === 0 ? (
          <div className="text-center py-20">
            <Heart className="w-20 h-20 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-2">{t('wishlist.empty')}</h2>
            <p className="text-muted-foreground mb-6">
              {t('wishlist.emptyDesc')}
            </p>
            <Button onClick={() => navigate("/marketplace")} size="lg">
              {t('wishlist.browseMarketplace')}
            </Button>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {wishlist.map((item, index) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-card rounded-lg overflow-hidden border border-border hover:border-primary/50 transition-all"
              >
                <div className="relative h-48 overflow-hidden group">
                  <img
                    src={item.games.image_url}
                    alt={item.games.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>

                <div className="p-5">
                  <span className="inline-block text-xs font-semibold uppercase tracking-wider text-muted-foreground bg-muted px-2 py-1 rounded mb-3">
                    {item.games.genre}
                  </span>
                  <h3 className="font-bold text-lg line-clamp-1 mb-2">{item.games.title}</h3>

                  <p className="text-muted-foreground text-sm mb-4 line-clamp-2">
                    {item.games.description}
                  </p>

                  <div className="flex items-center justify-between">
                    <span className="text-2xl font-bold text-primary">
                      {formatPrice(item.games.price, i18n.language)}
                    </span>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => removeFromWishlist(item.id)}
                        title={t('wishlist.remove')}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                      <Button
                        onClick={() => handlePurchase(item.games.id)}
                        size="sm"
                      >
                        <ShoppingCart className="w-4 h-4 mr-2" />
                        {t('wishlist.purchase')}
                      </Button>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default Wishlist;
