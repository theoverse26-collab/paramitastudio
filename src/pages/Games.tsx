import { motion } from "framer-motion";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import GameCard from "@/components/GameCard";
import { gamesData } from "@/data/gamesData";

const Games = () => {
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
              Our Games
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Explore our collection of immersive fantasy adventures. Each game is crafted with passion 
              and designed to transport you to extraordinary worlds.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {gamesData.map((game, index) => (
              <GameCard
                key={game.id}
                id={game.id}
                title={game.title}
                genre={game.genre}
                description={game.description}
                image={game.image}
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
