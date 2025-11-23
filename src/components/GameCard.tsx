import { motion } from "framer-motion";
import { Link } from "react-router-dom";

interface GameCardProps {
  id: string;
  title: string;
  genre: string;
  description: string;
  image: string;
  index: number;
}

const GameCard = ({ id, title, genre, description, image, index }: GameCardProps) => {
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
        <h3 className="text-2xl font-bold text-primary-foreground mb-2">{title}</h3>
        <p className="text-accent text-sm font-semibold mb-2 uppercase tracking-wide">{genre}</p>
        <p className="text-primary-foreground/90 text-sm mb-4 line-clamp-3">{description}</p>
        <span className="inline-flex items-center justify-center rounded-md px-4 py-2 text-sm font-medium bg-accent text-accent-foreground hover:bg-accent/90 glow-gold cursor-pointer">
          View Details
        </span>
      </Link>

      <div className="p-4 group-hover:opacity-0 transition-opacity duration-300">
        <h3 className="text-xl font-bold mb-1">{title}</h3>
        <p className="text-accent text-sm font-semibold uppercase tracking-wide">{genre}</p>
      </div>
    </motion.div>
  );
};

export default GameCard;
