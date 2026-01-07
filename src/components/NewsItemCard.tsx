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
  category?: string;
  index: number;
}

// Helper to strip HTML tags and get plain text
const stripHtml = (html: string): string => {
  const doc = new DOMParser().parseFromString(html, 'text/html');
  return doc.body.textContent || '';
};

const NewsItemCard = ({ id, title, content, published_at, image_url, category, index }: NewsItemCardProps) => {
  const { t } = useTranslation();
  const { translated, isTranslating } = useNewsTranslation({
    newsId: id,
    title,
    content,
  });

  // Strip HTML from content for preview
  const plainTextContent = stripHtml(translated.content);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.3 }}
      className="group"
    >
      <Link 
        to={`/news/${id}`}
        className="block bg-card rounded-xl overflow-hidden border border-border hover:border-primary/50 transition-all duration-300 h-full"
      >
        <div className="aspect-[16/10] overflow-hidden bg-muted">
          {image_url ? (
            <img 
              src={image_url} 
              alt={translated.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-muted-foreground">
              <span className="text-4xl">📰</span>
            </div>
          )}
        </div>
        <div className="p-5">
          {category && category !== 'general' && (
            <span className="inline-block px-2 py-1 text-xs font-medium uppercase tracking-wide bg-primary/10 text-primary rounded mb-2">
              {category}
            </span>
          )}
          <div className="text-xs text-muted-foreground mb-2">
            {new Date(published_at).toLocaleDateString()}
          </div>
          <h3 className={`text-lg font-bold mb-2 text-card-foreground group-hover:text-primary transition-colors duration-300 line-clamp-2 ${isTranslating ? 'opacity-70' : ''}`}>
            {translated.title}
          </h3>
          <p className={`text-sm text-muted-foreground line-clamp-2 ${isTranslating ? 'opacity-70' : ''}`}>
            {plainTextContent}
          </p>
          <div className="mt-3 inline-flex items-center gap-1 text-sm text-primary font-medium group-hover:gap-2 transition-all duration-300">
            {t('news.readMore')}
            <ArrowRight className="w-3 h-3" />
          </div>
        </div>
      </Link>
    </motion.div>
  );
};

export default NewsItemCard;
