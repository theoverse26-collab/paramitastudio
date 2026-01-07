import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { ArrowRight } from "lucide-react";
import { useNewsTranslation } from "@/hooks/useNewsTranslation";

interface NewsItemCardProps {
  id: string;
  title: string;
  content: string;
  published_at: string;
  image_url: string | null;
  index: number;
}

const NewsItemCard = ({ id, title, content, published_at, image_url, index }: NewsItemCardProps) => {
  const { t } = useTranslation();
  const { translated, isTranslating } = useNewsTranslation({
    newsId: id,
    title,
    content,
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
    >
      <Link 
        to={`/news/${id}`}
        className="block bg-card rounded-xl overflow-hidden border border-border border-l-4 border-l-accent hover-lift parchment-card group transition-all duration-300"
      >
        {image_url && (
          <div className="aspect-video overflow-hidden">
            <img 
              src={image_url} 
              alt={translated.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
          </div>
        )}
        <div className="p-8">
          <div className="mb-2 text-sm text-muted-foreground font-medium uppercase tracking-wide">
            {new Date(published_at).toLocaleDateString()}
          </div>
          <h3 className={`text-2xl font-bold mb-3 text-card-foreground group-hover:text-primary transition-all duration-300 group-hover:drop-shadow-[0_0_8px_hsl(var(--primary)/0.4)] ${isTranslating ? 'opacity-70' : ''}`}>
            {translated.title}
          </h3>
          <p className={`text-muted-foreground line-clamp-3 ${isTranslating ? 'opacity-70' : ''}`}>
            {translated.content}
          </p>
          <div className="mt-4 inline-flex items-center gap-2 text-primary font-semibold group-hover:gap-3 transition-all duration-300">
            {t('news.readMore')}
            <ArrowRight className="w-4 h-4 transition-transform duration-300" />
          </div>
        </div>
      </Link>
    </motion.div>
  );
};

export default NewsItemCard;
