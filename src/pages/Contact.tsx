import { motion } from "framer-motion";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Mail, MapPin } from "lucide-react";

const Contact = () => {
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
              Get In Touch
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Have questions? We'd love to hear from you.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 max-w-6xl mx-auto">
            {/* Contact Form */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-card p-8 rounded-xl border border-border"
            >
              <h2 className="text-3xl font-bold mb-6">Send Us a Message</h2>
              <form className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold mb-2">Name</label>
                  <Input placeholder="Your name" className="bg-background" />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-2">Email</label>
                  <Input type="email" placeholder="your.email@example.com" className="bg-background" />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-2">Subject</label>
                  <Input placeholder="What's this about?" className="bg-background" />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-2">Message</label>
                  <Textarea 
                    placeholder="Tell us what's on your mind..." 
                    className="bg-background min-h-[150px]"
                  />
                </div>
                <Button size="lg" className="w-full bg-accent text-accent-foreground hover:bg-accent/90 glow-gold">
                  Send Message
                </Button>
              </form>
            </motion.div>

            {/* Contact Info & Careers */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="space-y-8"
            >
              {/* Contact Information */}
              <div className="bg-card p-8 rounded-xl border border-border">
                <h2 className="text-3xl font-bold mb-6">Contact Information</h2>
                <div className="space-y-6">
                  <div className="flex items-start gap-4">
                    <Mail className="w-6 h-6 text-accent flex-shrink-0 mt-1" />
                    <div>
                      <p className="font-semibold mb-1">Email</p>
                      <p className="text-muted-foreground">alcuinex@gmail.com</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <MapPin className="w-6 h-6 text-accent flex-shrink-0 mt-1" />
                    <div>
                      <p className="font-semibold mb-1">Location</p>
                      <p className="text-muted-foreground">
                        Pejaten Park Residence<br />
                        Jl. Hj. Tutty Alawiyah No.21, Ragunan<br />
                        Ps. Minggu, South Jakarta, Jakarta
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </section>
      </div>

      <Footer />
    </div>
  );
};

export default Contact;
