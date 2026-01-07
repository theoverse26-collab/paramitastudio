import { motion } from "framer-motion";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Target, Eye, Heart } from "lucide-react";
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

        {/* Our Journey */}
        <section className="container mx-auto px-4 py-20">
          <motion.h2 initial={{
          opacity: 0,
          y: 20
        }} whileInView={{
          opacity: 1,
          y: 0
        }} viewport={{
          once: true
        }} className="text-4xl md:text-5xl font-bold text-center mb-16 text-gradient-gold uppercase">
            Our Journey
          </motion.h2>

          <div className="max-w-4xl mx-auto">
            <div className="space-y-8">
              {[{
                year: "2024",
                title: "The Beginning",
                description: "Paramita Studio was founded with a vision to create immersive fantasy gaming experiences that captivate players worldwide."
              }, {
                year: "2024",
                title: "First Steps",
                description: "We began developing our flagship titles, focusing on blending innovative gameplay with rich storytelling and stunning visuals."
              }, {
                year: "2025",
                title: "Growing Stronger",
                description: "Expanding our creative horizons, we continue to push boundaries in game design while building a passionate community of players."
              }].map((milestone, index) => (
                <motion.div 
                  key={index} 
                  initial={{ opacity: 0, x: index % 2 === 0 ? -30 : 30 }} 
                  whileInView={{ opacity: 1, x: 0 }} 
                  viewport={{ once: true }} 
                  transition={{ delay: index * 0.15 }}
                  className="flex gap-6 items-start"
                >
                  <div className="flex-shrink-0 w-20 h-20 bg-gradient-to-br from-accent to-primary rounded-xl flex items-center justify-center">
                    <span className="text-xl font-bold text-primary-foreground">{milestone.year}</span>
                  </div>
                  <div className="bg-card p-6 rounded-xl border border-border hover-lift flex-1">
                    <h3 className="text-xl font-bold mb-2">{milestone.title}</h3>
                    <p className="text-muted-foreground">{milestone.description}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      </div>

      <Footer />
    </div>;
};
export default About;