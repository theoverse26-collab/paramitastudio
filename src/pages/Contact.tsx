import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Mail, MapPin, HelpCircle } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const faqData = [
  {
    question: "What kind of games do you make?",
    answer: "We create 2D action-driven games with a strong emphasis on storytelling and original worlds. Our projects range from semi-open world adventures to linear, narrative-focused experiences, as well as hybrid designs that combine action combat with systems like tower defense. While genres may vary, every game we build prioritizes engaging gameplay, meaningful stories, and a distinct identity."
  },
  {
    question: "Why do you use RPG Maker?",
    answer: "RPG Maker is a powerful tool when used to its full potential. With years of experience, we are able to build custom systems, fast-paced action combat, and unique mechanics that go far beyond traditional turn-based RPGs. We choose RPG Maker because it allows us to focus on design, gameplay, and storytelling, while remaining efficient and flexible as a small studio."
  },
  {
    question: "Are your games turn-based RPGs?",
    answer: "No. While RPG Maker is often associated with turn-based combat, our games are primarily real-time action-based, including hack-and-slash and action battle systems. Each project is designed around the experience it needs—not a fixed formula."
  },
  {
    question: "Why are your games priced so low?",
    answer: "Our pricing reflects our development philosophy, not our quality. By keeping production costs efficient and leveraging existing resources responsibly, we are able to offer complete, polished games at accessible prices—typically between $1 and $3. We believe great games should be affordable without compromising the experience."
  },
  {
    question: "Does low price mean short or low-quality games?",
    answer: "No. Most of our games offer at least 3 hours of gameplay, often more depending on the design. More importantly, we apply high standards in design, polish, and testing, treating every project with the same care we would give a large-scale production."
  },
  {
    question: "Do you use asset packs or original assets?",
    answer: "We use a combination of community resources, licensed asset packs, and original content, always respecting creators and licenses. Assets are carefully selected and integrated to fit the game's world, tone, and identity, ensuring a cohesive and intentional experience."
  },
  {
    question: "Are your games connected to each other?",
    answer: "Some of our games may share themes, ideas, or universes, while others are completely standalone experiences. We design each game to be enjoyable on its own, without requiring prior knowledge of our other projects."
  },
  {
    question: "What platforms do you develop for?",
    answer: "We primarily focus on PC platforms, but platform support may vary depending on the project. Specific platform information is always provided on each game's individual page."
  },
  {
    question: "How do you approach quality and testing?",
    answer: "We develop with an AAA mindset, even at a small scale. This means iterative design, internal testing, careful balancing, and polishing until the experience feels right. Player feedback is also an important part of how we improve and refine our games."
  },
  {
    question: "Do you plan to expand beyond RPG Maker in the future?",
    answer: "We are always open to new tools and technologies if they help us deliver better experiences. However, our focus remains on making great games, not chasing engines. The tool is a means—not the goal."
  }
];

const Contact = () => {
  const { t } = useTranslation();

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
              {t('contact.title')}
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              {t('contact.subtitle')}
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
              <h2 className="text-3xl font-bold mb-6">{t('contact.sendUsMessage')}</h2>
              <form className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold mb-2">{t('contact.yourName')}</label>
                  <Input placeholder={t('contact.yourName')} className="bg-background" />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-2">{t('contact.yourEmail')}</label>
                  <Input type="email" placeholder={t('contact.yourEmail')} className="bg-background" />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-2">{t('contact.subject')}</label>
                  <Input placeholder={t('contact.subject')} className="bg-background" />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-2">{t('contact.message')}</label>
                  <Textarea 
                    placeholder={t('contact.message')} 
                    className="bg-background min-h-[150px]"
                  />
                </div>
                <Button size="lg" className="w-full bg-accent text-accent-foreground hover:bg-accent/90 glow-gold">
                  {t('contact.sendMessage')}
                </Button>
              </form>
            </motion.div>

            {/* Contact Info */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="space-y-8"
            >
              <div className="bg-card p-8 rounded-xl border border-border">
                <h2 className="text-3xl font-bold mb-6">{t('contact.contactInfo')}</h2>
                <div className="space-y-6">
                  <div className="flex items-start gap-4">
                    <Mail className="w-6 h-6 text-accent flex-shrink-0 mt-1" />
                    <div>
                      <p className="font-semibold mb-1">{t('contact.emailUs')}</p>
                      <p className="text-muted-foreground">officialparamitastudio@gmail.com</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <MapPin className="w-6 h-6 text-accent flex-shrink-0 mt-1" />
                    <div>
                      <p className="font-semibold mb-1">{t('contact.location')}</p>
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

          {/* FAQ Section */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="max-w-4xl mx-auto mt-20"
          >
            <div className="flex items-center gap-3 mb-8">
              <HelpCircle className="w-8 h-8 text-accent" />
              <h2 className="text-3xl font-bold">Frequently Asked Questions</h2>
            </div>
            
            <Accordion type="single" collapsible className="space-y-3">
              {faqData.map((faq, index) => (
                <AccordionItem 
                  key={index} 
                  value={`item-${index}`}
                  className="bg-card border border-border rounded-lg px-6 data-[state=open]:border-accent/50 transition-colors"
                >
                  <AccordionTrigger className="text-left font-semibold hover:no-underline hover:text-primary py-5">
                    {faq.question}
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground pb-5 leading-relaxed">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </motion.div>
        </section>
      </div>

      <Footer />
    </div>
  );
};

export default Contact;
