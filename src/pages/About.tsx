import { motion } from "framer-motion";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Target, Eye, Heart, Gamepad2, BookOpen } from "lucide-react";
const About = () => {
  return <div className="min-h-screen">
      <Navbar />

      <div className="pt-24 pb-20">
        {/* Hero */}
        <section className="container mx-auto px-4 mb-20">
          <motion.div initial={{
          opacity: 0,
          y: 30
        }} animate={{
          opacity: 1,
          y: 0
        }} className="text-center max-w-4xl mx-auto">
            <h1 className="text-5xl md:text-6xl font-bold mb-6 text-gradient-gold uppercase">
              
              About Paramita Studio
  
 
              
 
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground leading-relaxed">
              We are a visionary game studio that bridges the gap between fantasy storytelling and cutting-edge game design. 
              Founded by passionate creators, we believe in crafting experiences that transport players to magical realms 
              where imagination knows no bounds.
            </p>
          </motion.div>
        </section>

        {/* Mission & Vision */}
        <section className="container mx-auto px-4 mb-20">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <motion.div initial={{
            opacity: 0,
            x: -30
          }} whileInView={{
            opacity: 1,
            x: 0
          }} viewport={{
            once: true
          }} className="bg-card p-8 rounded-xl border border-border hover-lift">
              <div className="flex items-center gap-4 mb-4">
                <Target className="w-10 h-10 text-accent" />
                <h2 className="text-3xl font-bold">Our Mission</h2>
              </div>
              <p className="text-muted-foreground text-lg leading-relaxed">
                To create unforgettable gaming experiences that blend artistry with innovation. 
                We strive to build worlds that inspire wonder, challenge the mind, and connect 
                players across the globe through shared adventures.
              </p>
            </motion.div>

            <motion.div initial={{
            opacity: 0,
            x: 30
          }} whileInView={{
            opacity: 1,
            x: 0
          }} viewport={{
            once: true
          }} className="bg-card p-8 rounded-xl border border-border hover-lift">
              <div className="flex items-center gap-4 mb-4">
                <Eye className="w-10 h-10 text-accent" />
                <h2 className="text-3xl font-bold">Our Vision</h2>
              </div>
              <p className="text-muted-foreground text-lg leading-relaxed">
                To be recognized as pioneers in fantasy game development, known for our commitment 
                to quality, creativity, and player satisfaction. We envision a future where our games 
                become timeless classics that define the genre.
              </p>
            </motion.div>
          </div>
        </section>

        {/* Values */}
        <section className="bg-card py-20">
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
              Our Core Values
            </motion.h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[{
              title: "Creativity",
              description: "We push boundaries and explore new frontiers in game design, never settling for the ordinary."
            }, {
              title: "Quality",
              description: "Every pixel, every line of code, every sound effect is crafted with meticulous attention to detail."
            }, {
              title: "Community",
              description: "We listen to our players and build games together, fostering a passionate and engaged community."
            }].map((value, index) => <motion.div key={index} initial={{
              opacity: 0,
              y: 30
            }} whileInView={{
              opacity: 1,
              y: 0
            }} viewport={{
              once: true
            }} transition={{
              delay: index * 0.1
            }} className="bg-background p-8 rounded-xl hover-lift border border-border text-center">
                  <Heart className="w-12 h-12 text-accent mx-auto mb-4" />
                  <h3 className="text-2xl font-bold mb-4">{value.title}</h3>
                  <p className="text-muted-foreground">{value.description}</p>
                </motion.div>)}
            </div>
          </div>
        </section>

        {/* What We're Building */}
        <section className="container mx-auto px-4 py-20">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }} 
            whileInView={{ opacity: 1, y: 0 }} 
            viewport={{ once: true }} 
            className="text-4xl md:text-5xl font-bold text-center mb-6 text-gradient-gold uppercase"
          >
            What We're Building
          </motion.h2>
          
          <motion.p 
            initial={{ opacity: 0, y: 20 }} 
            whileInView={{ opacity: 1, y: 0 }} 
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-xl text-center text-muted-foreground mb-16 max-w-2xl mx-auto"
          >
            Action-packed 2D games with strong storytelling at their core.
          </motion.p>

          <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
            {/* Game Development Card */}
            <motion.div 
              initial={{ opacity: 0, x: -30 }} 
              whileInView={{ opacity: 1, x: 0 }} 
              viewport={{ once: true }}
              className="bg-card p-8 rounded-xl border border-border hover-lift"
            >
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-accent to-primary rounded-lg flex items-center justify-center">
                  <Gamepad2 className="w-6 h-6 text-primary-foreground" />
                </div>
                <h3 className="text-2xl font-bold">RPG Maker Mastery</h3>
              </div>
              <p className="text-muted-foreground leading-relaxed">
                Using RPG Maker as our foundation, we push far beyond traditional expectations—creating 
                fast-paced action combat, hack-and-slash systems, and gameplay ranging from semi-open worlds 
                to tight, story-driven linear adventures.
              </p>
            </motion.div>

            {/* Storytelling Card */}
            <motion.div 
              initial={{ opacity: 0, x: 30 }} 
              whileInView={{ opacity: 1, x: 0 }} 
              viewport={{ once: true }}
              className="bg-card p-8 rounded-xl border border-border hover-lift"
            >
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-accent to-primary rounded-lg flex items-center justify-center">
                  <BookOpen className="w-6 h-6 text-primary-foreground" />
                </div>
                <h3 className="text-2xl font-bold">Original Universes</h3>
              </div>
              <p className="text-muted-foreground leading-relaxed">
                Every game exists in a fully original universe, with its own lore, characters, and identity. 
                Story is never an afterthought—it shapes gameplay, world design, and player experience.
              </p>
            </motion.div>
          </div>

          {/* Value Proposition */}
          <motion.div 
            initial={{ opacity: 0, y: 30 }} 
            whileInView={{ opacity: 1, y: 0 }} 
            viewport={{ once: true }}
            className="max-w-4xl mx-auto bg-gradient-to-r from-accent/10 via-primary/10 to-accent/10 p-8 md:p-12 rounded-2xl border border-accent/20 text-center"
          >
            <div className="flex justify-center gap-6 mb-6">
              <div className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-accent">3+</div>
                <div className="text-sm text-muted-foreground">Hours of Gameplay</div>
              </div>
              <div className="w-px bg-border"></div>
              <div className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-accent">$1-$3</div>
                <div className="text-sm text-muted-foreground">Accessible Pricing</div>
              </div>
              <div className="w-px bg-border"></div>
              <div className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-accent">100%</div>
                <div className="text-sm text-muted-foreground">Polished Quality</div>
              </div>
            </div>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-6">
              As a small studio, we work smart and efficiently. Low production costs never mean low standards—we 
              apply the same discipline as large-scale productions.
            </p>
            <p className="text-xl font-semibold text-foreground">
              Meaningful, high-energy, story-driven games that feel worth far more than their price.
            </p>
          </motion.div>
        </section>
      </div>

      <Footer />
    </div>;
};
export default About;