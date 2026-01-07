import { useState } from "react";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Mail, MapPin, Send, Loader2, CheckCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const faqData = [
  {
    question: "What kind of games do you make?",
    answer: "We create 2D action-driven games with a strong emphasis on storytelling and original worlds. Our projects range from semi-open world adventures to linear, narrative-focused experiences, as well as hybrid designs that combine action combat with systems like tower defense."
  },
  {
    question: "Why do you use RPG Maker?",
    answer: "RPG Maker is a powerful tool when used to its full potential. We build custom systems, fast-paced action combat, and unique mechanics that go far beyond traditional turn-based RPGs, while remaining efficient and flexible as a small studio."
  },
  {
    question: "Are your games turn-based RPGs?",
    answer: "No. Our games are primarily real-time action-based, including hack-and-slash and action battle systems. Each project is designed around the experience it needs—not a fixed formula."
  },
  {
    question: "Why are your games priced so low?",
    answer: "Our pricing reflects our development philosophy, not our quality. By keeping production efficient, we offer complete, polished games at accessible prices—typically between $1 and $3."
  },
  {
    question: "Does low price mean short or low-quality games?",
    answer: "No. Most of our games offer at least 3 hours of gameplay. We apply high standards in design, polish, and testing, treating every project with care."
  },
  {
    question: "Do you use asset packs or original assets?",
    answer: "We use a combination of community resources, licensed asset packs, and original content, always respecting creators and licenses. Assets are carefully integrated to fit each game's identity."
  },
  {
    question: "Are your games connected to each other?",
    answer: "Some may share themes or universes, while others are standalone. Each game is designed to be enjoyable on its own without prior knowledge of our other projects."
  },
  {
    question: "What platforms do you develop for?",
    answer: "We primarily focus on PC platforms. Specific platform information is always provided on each game's individual page."
  },
  {
    question: "How do you approach quality and testing?",
    answer: "We develop with an AAA mindset at a small scale—iterative design, internal testing, careful balancing, and polishing until the experience feels right."
  },
  {
    question: "Do you plan to expand beyond RPG Maker?",
    answer: "We're open to new tools if they help deliver better experiences. However, our focus remains on making great games—the tool is a means, not the goal."
  }
];

const Contact = () => {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: ""
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.email || !formData.subject || !formData.message) {
      toast({
        title: "Missing fields",
        description: "Please fill in all fields before submitting.",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const { data, error } = await supabase.functions.invoke('send-contact-email', {
        body: formData
      });

      if (error) throw error;

      setIsSubmitted(true);
      setFormData({ name: "", email: "", subject: "", message: "" });
      toast({
        title: "Message sent!",
        description: "We've received your message and will get back to you soon.",
      });
    } catch (error: any) {
      console.error("Error sending message:", error);
      toast({
        title: "Failed to send",
        description: error.message || "Something went wrong. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen">
      <Navbar />

      <div className="pt-24 pb-20">
        <section className="container mx-auto px-4">
          {/* Hero Section */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <h1 className="text-5xl md:text-6xl font-bold mb-4 text-gradient-gold uppercase">
              {t('contact.title')}
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              {t('contact.subtitle')}
            </p>
          </motion.div>

          {/* Main Content - Single Row Layout */}
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
              
              {/* Contact Form - Takes 3 columns */}
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
                className="lg:col-span-3 bg-card p-8 rounded-xl border border-border"
              >
                <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
                  <Send className="w-6 h-6 text-accent" />
                  {t('contact.sendUsMessage')}
                </h2>
                
                {isSubmitted ? (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex flex-col items-center justify-center py-12 text-center"
                  >
                    <CheckCircle className="w-16 h-16 text-green-500 mb-4" />
                    <h3 className="text-xl font-bold mb-2">Message Sent!</h3>
                    <p className="text-muted-foreground mb-6">We'll get back to you as soon as possible.</p>
                    <Button 
                      variant="outline" 
                      onClick={() => setIsSubmitted(false)}
                    >
                      Send Another Message
                    </Button>
                  </motion.div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-5">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      <div>
                        <label className="block text-sm font-semibold mb-2">{t('contact.yourName')}</label>
                        <Input 
                          placeholder={t('contact.yourName')} 
                          className="bg-background"
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold mb-2">{t('contact.yourEmail')}</label>
                        <Input 
                          type="email" 
                          placeholder={t('contact.yourEmail')} 
                          className="bg-background"
                          value={formData.email}
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold mb-2">{t('contact.subject')}</label>
                      <Input 
                        placeholder={t('contact.subject')} 
                        className="bg-background"
                        value={formData.subject}
                        onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold mb-2">{t('contact.message')}</label>
                      <Textarea 
                        placeholder={t('contact.message')} 
                        className="bg-background min-h-[120px]"
                        value={formData.message}
                        onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      />
                    </div>
                    <Button 
                      type="submit"
                      size="lg" 
                      className="w-full bg-accent text-accent-foreground hover:bg-accent/90 glow-gold"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Sending...
                        </>
                      ) : (
                        <>
                          <Send className="w-4 h-4 mr-2" />
                          {t('contact.sendMessage')}
                        </>
                      )}
                    </Button>
                  </form>
                )}
              </motion.div>

              {/* Contact Info - Takes 2 columns */}
              <motion.div
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
                className="lg:col-span-2 space-y-6"
              >
                <div className="bg-card p-6 rounded-xl border border-border h-full flex flex-col justify-center">
                  <h2 className="text-2xl font-bold mb-6">{t('contact.contactInfo')}</h2>
                  <div className="space-y-6">
                    <div className="flex items-start gap-4 p-4 bg-background rounded-lg">
                      <div className="p-3 bg-accent/10 rounded-lg">
                        <Mail className="w-5 h-5 text-accent" />
                      </div>
                      <div>
                        <p className="font-semibold mb-1">{t('contact.emailUs')}</p>
                        <a href="mailto:officialparamitastudio@gmail.com" className="text-muted-foreground hover:text-primary transition-colors text-sm">
                          officialparamitastudio@gmail.com
                        </a>
                      </div>
                    </div>
                    <div className="flex items-start gap-4 p-4 bg-background rounded-lg">
                      <div className="p-3 bg-accent/10 rounded-lg">
                        <MapPin className="w-5 h-5 text-accent" />
                      </div>
                      <div>
                        <p className="font-semibold mb-1">{t('contact.location')}</p>
                        <p className="text-muted-foreground text-sm">
                          Pejaten Park Residence<br />
                          Jl. Hj. Tutty Alawiyah No.21<br />
                          South Jakarta, Indonesia
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>

            {/* FAQ Section - Compact Grid */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="mt-16"
            >
              <h2 className="text-2xl font-bold mb-6 text-center">Frequently Asked Questions</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {faqData.map((faq, index) => (
                  <Accordion key={index} type="single" collapsible>
                    <AccordionItem 
                      value={`item-${index}`}
                      className="bg-card border border-border rounded-lg px-5 data-[state=open]:border-accent/50 transition-colors"
                    >
                      <AccordionTrigger className="text-left text-sm font-semibold hover:no-underline hover:text-primary py-4">
                        {faq.question}
                      </AccordionTrigger>
                      <AccordionContent className="text-muted-foreground text-sm pb-4 leading-relaxed">
                        {faq.answer}
                      </AccordionContent>
                    </AccordionItem>
                  </Accordion>
                ))}
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
