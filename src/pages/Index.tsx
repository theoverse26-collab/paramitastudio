import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import heroImage from "@/assets/hero-bg.jpg";
import { Sparkles, Gamepad2, Users } from "lucide-react";
const Index = () => {
  return <div className="min-h-screen">
      <Navbar />

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0 z-0" style={{
        backgroundImage: `url(${heroImage})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center'
      }}>
          <div className="absolute inset-0 fantasy-gradient opacity-80" />
        </div>

        {/* Floating particles effect */}
        <div className="absolute inset-0 z-10">
          {[...Array(20)].map((_, i) => <motion.div key={i} className="absolute w-1 h-1 bg-accent rounded-full glow-gold" initial={{
          x: Math.random() * window.innerWidth,
          y: Math.random() * window.innerHeight,
          opacity: 0
        }} animate={{
          y: [null, -100, -200],
          opacity: [0, 1, 0]
        }} transition={{
          duration: 3 + Math.random() * 2,
          repeat: Infinity,
          delay: Math.random() * 5
        }} />)}
        </div>

        {/* Content */}
        <div className="relative z-20 container mx-auto px-4 text-center">
          <motion.div initial={{
          opacity: 0,
          y: 30
        }} animate={{
          opacity: 1,
          y: 0
        }} transition={{
          duration: 0.8
        }}>
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold text-primary-foreground mb-6 uppercase tracking-wider">
              Alcuinex
            </h1>
            <motion.p initial={{
            opacity: 0
          }} animate={{
            opacity: 1
          }} transition={{
            delay: 0.3
          }} className="text-xl md:text-3xl text-accent font-light mb-8 tracking-wide">
              Where Creativity Meets Simplicity
            </motion.p>
            <motion.p initial={{
            opacity: 0
          }} animate={{
            opacity: 1
          }} transition={{
            delay: 0.5
          }} className="text-lg md:text-xl text-primary-foreground/90 mb-12 max-w-2xl mx-auto">
              Crafting immersive fantasy worlds that blend epic storytelling with innovative gameplay
            </motion.p>

            <motion.div initial={{
            opacity: 0,
            y: 20
          }} animate={{
            opacity: 1,
            y: 0
          }} transition={{
            delay: 0.7
          }} className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/games">
                <Button size="lg" className="bg-accent text-accent-foreground hover:bg-accent/90 glow-gold text-lg px-8 py-6">
                  Explore Our Games
                </Button>
              </Link>
              <Link to="/marketplace">
                <Button size="lg" variant="outline" className="border-accent text-lg px-8 py-6 text-yellow-300 bg-slate-50">
                  Visit Marketplace
                </Button>
              </Link>
              <Link to="/about">
                <Button size="lg" variant="outline" className="border-primary-foreground hover:bg-primary-foreground/10 text-lg px-8 py-6 text-yellow-300">
                  About Us
                </Button>
              </Link>
            </motion.div>
          </motion.div>
        </div>

        {/* Scroll indicator */}
        <motion.div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-20" animate={{
        y: [0, 10, 0]
      }} transition={{
        duration: 2,
        repeat: Infinity
      }}>
          <div className="w-6 h-10 border-2 border-accent rounded-full flex justify-center p-2">
            <motion.div className="w-1 h-2 bg-accent rounded-full" animate={{
            y: [0, 12, 0]
          }} transition={{
            duration: 2,
            repeat: Infinity
          }} />
          </div>
        </motion.div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-card">
        <div className="container mx-auto px-4">
          <motion.h2 initial={{
          opacity: 0,
          y: 20
        }} whileInView={{
          opacity: 1,
          y: 0
        }} viewport={{
          once: true
        }} className="text-4xl md:text-5xl font-bold text-center mb-16 text-gradient-gold uppercase">
            What We Offer
          </motion.h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[{
            icon: <Sparkles className="w-12 h-12 text-accent" />,
            title: "Immersive Worlds",
            description: "Step into breathtaking fantasy realms where every corner tells a story and magic is real."
          }, {
            icon: <Gamepad2 className="w-12 h-12 text-accent" />,
            title: "Epic Gameplay",
            description: "Experience innovative mechanics and engaging combat systems that keep you coming back for more."
          }, {
            icon: <Users className="w-12 h-12 text-accent" />,
            title: "Community First",
            description: "Join a passionate community of adventurers and shape the future of our games together."
          }].map((feature, index) => <motion.div key={index} initial={{
            opacity: 0,
            y: 30
          }} whileInView={{
            opacity: 1,
            y: 0
          }} viewport={{
            once: true
          }} transition={{
            delay: index * 0.2
          }} className="bg-background p-8 rounded-xl hover-lift border border-border text-center">
                <div className="flex justify-center mb-4">
                  {feature.icon}
                </div>
                <h3 className="text-2xl font-bold mb-4">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </motion.div>)}
          </div>
        </div>
      </section>

      <Footer />
    </div>;
};
export default Index;