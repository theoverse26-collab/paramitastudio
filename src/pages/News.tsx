import { useEffect, useState, useMemo } from "react";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import NewsItemCard from "@/components/NewsItemCard";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";

interface NewsPost {
  id: string;
  title: string;
  content: string;
  published_at: string;
  image_url: string | null;
  category: string | null;
}

const News = () => {
  const [news, setNews] = useState<NewsPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const { toast } = useToast();
  const { t } = useTranslation();

  useEffect(() => {
    fetchNews();
  }, []);

  const fetchNews = async () => {
    try {
      const { data, error } = await supabase
        .from('news')
        .select('*')
        .order('published_at', { ascending: false });

      if (error) throw error;
      setNews(data || []);
    } catch (error: any) {
      toast({
        title: t('common.error'),
        description: 'Failed to load news',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  // Get unique categories from news
  const categories = useMemo(() => {
    const cats = new Set<string>();
    news.forEach(item => {
      if (item.category) cats.add(item.category);
    });
    return Array.from(cats).sort();
  }, [news]);

  // Filter news by selected category
  const filteredNews = useMemo(() => {
    if (!selectedCategory) return news;
    return news.filter(item => item.category === selectedCategory);
  }, [news, selectedCategory]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">{t('news.loading')}</p>
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
            className="text-center mb-12"
          >
            <h1 className="text-5xl md:text-6xl font-bold mb-6 text-gradient-gold uppercase">
              {t('news.title')}
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              {t('news.subtitle')}
            </p>
          </motion.div>

          {/* Category Filters */}
          {categories.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="flex flex-wrap justify-center gap-2 mb-10"
            >
              <Button
                variant={selectedCategory === null ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory(null)}
                className="rounded-full"
              >
                {t('common.all')}
              </Button>
              {categories.map((category) => (
                <Button
                  key={category}
                  variant={selectedCategory === category ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedCategory(category)}
                  className="rounded-full capitalize"
                >
                  {category}
                </Button>
              ))}
            </motion.div>
          )}

          {filteredNews.length === 0 ? (
            <p className="text-center text-muted-foreground">{t('news.noNews')}</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredNews.map((item, index) => (
                <NewsItemCard
                  key={item.id}
                  id={item.id}
                  title={item.title}
                  content={item.content}
                  published_at={item.published_at}
                  image_url={item.image_url}
                  category={item.category || undefined}
                  index={index}
                />
              ))}
            </div>
          )}
        </section>
      </div>

      <Footer />
    </div>
  );
};

export default News;
