import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Mail, MapPin } from "lucide-react";

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
        </section>
      </div>

      <Footer />
    </div>
  );
};

export default Contact;
