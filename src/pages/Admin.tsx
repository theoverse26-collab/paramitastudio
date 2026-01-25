import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/contexts/AuthContext';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import GamesManagement from '@/components/admin/GamesManagement';
import NewsManagement from '@/components/admin/NewsManagement';
import Analytics from '@/components/admin/Analytics';
import TransactionHistory from '@/components/admin/TransactionHistory';

const Admin = () => {
  const { user, loading: authLoading, isAdmin } = useAuth();
  const navigate = useNavigate();
  const { t } = useTranslation();

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (!authLoading && user && !isAdmin) {
      navigate('/dashboard');
    }
  }, [isAdmin, navigate, user, authLoading]);

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">{t('common.loading')}</p>
      </div>
    );
  }

  if (!isAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="pt-24 pb-20">
        <section className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-12"
          >
            <h1 className="text-5xl md:text-6xl font-bold mb-4 text-gradient-gold uppercase">
              {t('admin.title')}
            </h1>
            <p className="text-xl text-muted-foreground">
              {t('admin.subtitle')}
            </p>
          </motion.div>

          <Tabs defaultValue="games" className="w-full">
            <TabsList className="grid w-full grid-cols-4 mb-8">
              <TabsTrigger value="games">{t('admin.tabs.games')}</TabsTrigger>
              <TabsTrigger value="news">{t('admin.tabs.news')}</TabsTrigger>
              <TabsTrigger value="analytics">{t('admin.tabs.analytics')}</TabsTrigger>
              <TabsTrigger value="transactions">{t('admin.tabs.transactions')}</TabsTrigger>
            </TabsList>

            <TabsContent value="games">
              <GamesManagement />
            </TabsContent>

            <TabsContent value="news">
              <NewsManagement />
            </TabsContent>

            <TabsContent value="analytics">
              <Analytics />
            </TabsContent>

            <TabsContent value="transactions">
              <TransactionHistory />
            </TabsContent>
          </Tabs>
        </section>
      </div>
      <Footer />
    </div>
  );
};

export default Admin;
