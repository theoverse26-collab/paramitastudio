import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface NewsPost {
  id: string;
  title: string;
  content: string;
  published_at: string;
}

const News = () => {
  const [news, setNews] = useState<NewsPost[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

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
        title: 'Error',
        description: 'Failed to load news',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Loading news...</p>
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
              Latest News
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Stay updated with the latest announcements, updates, and events from Paramita Studio.
            </p>
          </motion.div>

          {news.length === 0 ? (
            <p className="text-center text-muted-foreground">No news posts yet.</p>
          ) : (
            <div className="max-w-4xl mx-auto space-y-6">
              {news.map((item, index) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-card rounded-xl p-8 border border-border hover-lift parchment-card"
                >
                  <div className="mb-2 text-sm text-accent font-semibold uppercase tracking-wide">
                    {new Date(item.published_at).toLocaleDateString()}
                  </div>
                  <h3 className="text-2xl font-bold mb-3">{item.title}</h3>
                  <p className="text-muted-foreground whitespace-pre-wrap">{item.content}</p>
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

export default News;
