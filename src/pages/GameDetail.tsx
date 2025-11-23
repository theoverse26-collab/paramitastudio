import { motion } from "framer-motion";
import { useParams, Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { gamesData } from "@/data/gamesData";
import { ArrowLeft, ShoppingCart } from "lucide-react";

const GameDetail = () => {
  const { id } = useParams();
  const game = gamesData.find(g => g.id === id);

  if (!game) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4">Game Not Found</h1>
          <Link to="/games">
            <Button>Back to Games</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Navbar />

      <div className="pt-24 pb-20">
        {/* Hero Banner */}
        <section className="relative h-[60vh] mb-12">
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: `url(${game.image})` }}
          >
            <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent" />
          </div>
          
          <div className="relative container mx-auto px-4 h-full flex items-end pb-12">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Link to="/games" className="inline-flex items-center gap-2 text-primary-foreground mb-4 hover:text-accent transition-fantasy">
                <ArrowLeft size={20} />
                Back to Games
              </Link>
              <h1 className="text-5xl md:text-6xl font-bold text-primary-foreground mb-4 uppercase">
                {game.title}
              </h1>
              <p className="text-accent text-xl font-semibold uppercase tracking-wide">
                {game.genre}
              </p>
            </motion.div>
          </div>
        </section>

        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            {/* Main Content */}
            <div className="lg:col-span-2">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <h2 className="text-3xl font-bold mb-4">About This Game</h2>
                <p className="text-muted-foreground text-lg leading-relaxed mb-8">
                  {game.longDescription}
                </p>

                <h3 className="text-2xl font-bold mb-4">Key Features</h3>
                <ul className="space-y-3 mb-8">
                  {game.features.map((feature, index) => (
                    <motion.li
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.3 + index * 0.1 }}
                      className="flex items-start gap-3"
                    >
                      <div className="w-2 h-2 bg-accent rounded-full mt-2 flex-shrink-0" />
                      <span className="text-muted-foreground">{feature}</span>
                    </motion.li>
                  ))}
                </ul>

                <h3 className="text-2xl font-bold mb-4">Screenshots</h3>
                <div className="grid grid-cols-2 gap-4">
                  {game.screenshots.map((screenshot, index) => (
                    <motion.img
                      key={index}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.4 + index * 0.1 }}
                      src={screenshot}
                      alt={`Screenshot ${index + 1}`}
                      className="rounded-lg w-full hover-lift"
                    />
                  ))}
                </div>
              </motion.div>
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-1">
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-card p-6 rounded-xl border border-border sticky top-24"
              >
                <img
                  src={game.image}
                  alt={game.title}
                  className="w-full rounded-lg mb-6"
                />
                
                <div className="mb-6">
                  <p className="text-muted-foreground mb-2">Price</p>
                  <p className="text-4xl font-bold text-accent">{game.price}</p>
                </div>

                <Link to="/marketplace">
                  <Button size="lg" className="w-full bg-accent text-accent-foreground hover:bg-accent/90 glow-gold mb-3">
                    <ShoppingCart className="mr-2" size={20} />
                    Buy Now
                  </Button>
                </Link>

                <Button size="lg" variant="outline" className="w-full border-accent text-foreground hover:bg-accent/10">
                  Add to Wishlist
                </Button>

                <div className="mt-6 pt-6 border-t border-border space-y-3">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Developer</p>
                    <p className="font-semibold">Alcuinex Studios</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Release Date</p>
                    <p className="font-semibold">2024</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Platform</p>
                    <p className="font-semibold">PC, PlayStation, Xbox</p>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default GameDetail;
