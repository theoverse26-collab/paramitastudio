import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/contexts/AuthContext';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Purchase {
  id: string;
  purchase_date: string;
  amount: number;
  game: {
    id: string;
    title: string;
    genre: string;
    image_url: string;
    file_url: string | null;
  };
}

const Dashboard = () => {
  const { user, loading: authLoading, isAdmin } = useAuth();
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { t } = useTranslation();

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (user && isAdmin) {
      navigate('/admin');
    }
  }, [isAdmin, navigate, user]);

  useEffect(() => {
    if (user && !isAdmin) {
      fetchPurchases();
    }
  }, [user, isAdmin]);

  const fetchPurchases = async () => {
    try {
      const { data, error } = await supabase
        .from('purchases')
        .select(`
          id,
          purchase_date,
          amount,
          game:games (
            id,
            title,
            genre,
            image_url,
            file_url
          )
        `)
        .eq('payment_status', 'completed')
        .order('purchase_date', { ascending: false });

      if (error) throw error;
      setPurchases(data || []);
    } catch (error: any) {
      toast({
        title: t('common.error'),
        description: 'Failed to load your purchases',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = (fileUrl: string | null, gameTitle: string) => {
    if (!fileUrl) {
      toast({
        title: t('dashboard.downloadNotAvailable'),
        description: 'This game file is not available yet.',
        variant: 'destructive',
      });
      return;
    }

    toast({
      title: t('dashboard.download'),
      description: `Downloading ${gameTitle}...`,
    });
    window.open(fileUrl, '_blank');
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">{t('dashboard.loading')}</p>
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
            className="mb-16"
          >
            <h1 className="text-5xl md:text-6xl font-bold mb-4 text-gradient-gold uppercase">
              {t('dashboard.title')}
            </h1>
            <p className="text-xl text-muted-foreground">
              {t('dashboard.subtitle')}
            </p>
          </motion.div>

          {purchases.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-20"
            >
              <p className="text-xl text-muted-foreground mb-6">
                {t('dashboard.noGames')}
              </p>
              <Button onClick={() => navigate('/marketplace')}>
                {t('dashboard.browseMarketplace')}
              </Button>
            </motion.div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {purchases.map((purchase, index) => (
                <motion.div
                  key={purchase.id}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-card rounded-xl overflow-hidden border border-border hover-lift"
                >
                  <img
                    src={purchase.game.image_url}
                    alt={purchase.game.title}
                    className="w-full h-48 object-cover"
                  />
                  <div className="p-6">
                    <h3 className="text-xl font-bold mb-2">{purchase.game.title}</h3>
                    <p className="text-accent text-sm mb-4 uppercase tracking-wide">
                      {purchase.game.genre}
                    </p>
                    <p className="text-sm text-muted-foreground mb-4">
                      Purchased: {new Date(purchase.purchase_date).toLocaleDateString()}
                    </p>
                    <Button
                      onClick={() => handleDownload(purchase.game.file_url, purchase.game.title)}
                      className="w-full bg-accent text-accent-foreground hover:bg-accent/90"
                    >
                      <Download className="mr-2" size={18} />
                      {t('dashboard.download')}
                    </Button>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </section>
      </div>
      <Footer />
    </div>
  );
};

export default Dashboard;
