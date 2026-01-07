import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { useGameTranslation } from "@/hooks/useGameTranslation";

interface GameCardProps {
  id: string;
  title: string;
  genre: string;
  description: string;
  image: string;
  index: number;
}

const GameCard = ({ id, title, genre, description, image, index }: GameCardProps) => {
  const { translated, isTranslating } = useGameTranslation({
    gameId: id,
    description,
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.1 }}
      className="group relative bg-card rounded-xl overflow-hidden hover-lift border border-border"
    >
      <div className="aspect-square overflow-hidden">
        <img
          src={image}
          alt={title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
      </div>
      
      <Link
        to={`/games/${id}`}
        className="absolute inset-0 bg-gradient-to-t from-primary/95 via-primary/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-6 cursor-pointer"
      >
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h3 className="text-2xl font-bold text-primary-foreground mb-2">{title}</h3>
            <p className="text-accent text-sm font-semibold mb-2 uppercase tracking-wide">{genre}</p>
            <p className={`text-primary-foreground/90 text-sm line-clamp-3 ${isTranslating ? 'opacity-50' : ''}`}>
              {translated.description}
            </p>
          </div>
          <ArrowRight className="text-accent flex-shrink-0 ml-4 mt-1" size={32} strokeWidth={2.5} />
        </div>
      </Link>

      <div className="p-4 group-hover:opacity-0 transition-opacity duration-300">
        <h3 className="text-xl font-bold mb-1 text-card-foreground">{title}</h3>
        <p className="text-primary text-sm font-semibold uppercase tracking-wide">{genre}</p>
      </div>
    </motion.div>
  );
};

export default GameCard;
