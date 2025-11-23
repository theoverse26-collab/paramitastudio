import { motion } from "framer-motion";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { gamesData } from "@/data/gamesData";
import { ShoppingCart, Heart } from "lucide-react";
import { Link } from "react-router-dom";

const Marketplace = () => {
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
              Marketplace
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Purchase your favorite games directly from our store. All games come with lifetime updates 
              and dedicated customer support.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {gamesData.map((game, index) => (
              <motion.div
                key={game.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-card rounded-xl overflow-hidden border border-border hover-lift"
              >
                <div className="grid grid-cols-1 md:grid-cols-2">
                  <div className="aspect-square">
                    <img
                      src={game.image}
                      alt={game.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  
                  <div className="p-6 flex flex-col justify-between">
                    <div>
                      <h3 className="text-2xl font-bold mb-2">{game.title}</h3>
                      <p className="text-accent text-sm font-semibold mb-3 uppercase tracking-wide">
                        {game.genre}
                      </p>
                      <p className="text-muted-foreground mb-4 line-clamp-3">
                        {game.description}
                      </p>
                    </div>

                    <div>
                      <div className="mb-4">
                        <p className="text-3xl font-bold text-accent">{game.price}</p>
                      </div>

                      <div className="flex gap-2">
                        <Button 
                          className="flex-1 bg-accent text-accent-foreground hover:bg-accent/90 glow-gold"
                        >
                          <ShoppingCart className="mr-2" size={18} />
                          Buy Now
                        </Button>
                        <Button 
                          variant="outline" 
                          size="icon"
                          className="border-accent text-foreground hover:bg-accent/10"
                        >
                          <Heart size={18} />
                        </Button>
                      </div>

                      <Link to={`/games/${game.id}`}>
                        <Button variant="ghost" className="w-full mt-2 text-accent hover:text-accent/80">
                          View Details
                        </Button>
                      </Link>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Cart Summary */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="mt-12 bg-card p-8 rounded-xl border border-border max-w-2xl mx-auto"
          >
            <h3 className="text-2xl font-bold mb-6">Secure Checkout</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center text-lg">
                <span className="text-muted-foreground">Subtotal:</span>
                <span className="font-semibold">$0.00</span>
              </div>
              <div className="flex justify-between items-center text-lg">
                <span className="text-muted-foreground">Tax:</span>
                <span className="font-semibold">$0.00</span>
              </div>
              <div className="border-t border-border pt-4 flex justify-between items-center text-xl">
                <span className="font-bold">Total:</span>
                <span className="font-bold text-accent">$0.00</span>
              </div>
              <Button size="lg" className="w-full bg-accent text-accent-foreground hover:bg-accent/90 glow-gold">
                Proceed to Checkout
              </Button>
              <p className="text-sm text-muted-foreground text-center">
                Secure payment powered by Alcuinex. All transactions are encrypted.
              </p>
            </div>
          </motion.div>
        </section>
      </div>

      <Footer />
    </div>
  );
};

export default Marketplace;
