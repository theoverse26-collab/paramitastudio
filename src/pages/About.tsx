import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Target, Eye, Heart, Gamepad2, BookOpen } from "lucide-react";
import logoParamita from "@/assets/logo-paramita.png";

const About = () => {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen">
      <Navbar />

      <div className="pt-24 pb-20">
        {/* Logo Section */}
        <section className="bg-primary py-16 mb-20">
          <div className="container mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6 }}
              className="flex justify-center"
            >
              <img 
                src={logoParamita} 
                alt="Paramita Studio" 
                className="h-64 md:h-80 lg:h-96 w-auto"
              />
            </motion.div>
          </div>
        </section>

        {/* Hero */}
        <section className="container mx-auto px-4 mb-20">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center max-w-4xl mx-auto"
          >
            <h1 className="text-5xl md:text-6xl font-bold mb-6 text-gradient-gold uppercase">
              {t('about.title')}
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground leading-relaxed">
              {t('about.subtitle')}
            </p>
          </motion.div>
        </section>

        {/* Mission & Vision */}
        <section className="container mx-auto px-4 mb-20">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="bg-card p-8 rounded-xl border border-border hover-lift"
            >
              <div className="flex items-center gap-4 mb-4">
                <Target className="w-10 h-10 text-accent" />
                <h2 className="text-3xl font-bold">{t('about.ourMission')}</h2>
              </div>
              <p className="text-muted-foreground text-lg leading-relaxed">
                {t('about.missionText')}
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="bg-card p-8 rounded-xl border border-border hover-lift"
            >
              <div className="flex items-center gap-4 mb-4">
                <Eye className="w-10 h-10 text-accent" />
                <h2 className="text-3xl font-bold">{t('about.ourVision')}</h2>
              </div>
              <p className="text-muted-foreground text-lg leading-relaxed">
                {t('about.visionText')}
              </p>
            </motion.div>
          </div>
        </section>

        {/* Values */}
        <section className="bg-card py-20">
          <div className="container mx-auto px-4">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-4xl md:text-5xl font-bold text-center mb-16 text-gradient-gold uppercase"
            >
              {t('about.coreValues')}
            </motion.h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                { titleKey: "about.creativity", descKey: "about.creativityDesc" },
                { titleKey: "about.quality", descKey: "about.qualityDesc" },
                { titleKey: "about.community", descKey: "about.communityDesc" }
              ].map((value, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-background p-8 rounded-xl hover-lift border border-border text-center"
                >
                  <Heart className="w-12 h-12 text-accent mx-auto mb-4" />
                  <h3 className="text-2xl font-bold mb-4">{t(value.titleKey)}</h3>
                  <p className="text-muted-foreground">{t(value.descKey)}</p>
                </motion.div>
              ))}
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
            {t('about.whatWeBuilding')}
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-xl text-center text-muted-foreground mb-16 max-w-2xl mx-auto"
          >
            {t('about.buildingSubtitle')}
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
                <h3 className="text-2xl font-bold">{t('about.rpgMakerMastery')}</h3>
              </div>
              <p className="text-muted-foreground leading-relaxed">
                {t('about.rpgMakerDesc')}
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
                <h3 className="text-2xl font-bold">{t('about.originalUniverses')}</h3>
              </div>
              <p className="text-muted-foreground leading-relaxed">
                {t('about.originalUniversesDesc')}
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
                <div className="text-sm text-muted-foreground">{t('about.hoursGameplay')}</div>
              </div>
              <div className="w-px bg-border"></div>
              <div className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-accent">$1-$3</div>
                <div className="text-sm text-muted-foreground">{t('about.accessiblePricing')}</div>
              </div>
              <div className="w-px bg-border"></div>
              <div className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-accent">100%</div>
                <div className="text-sm text-muted-foreground">{t('about.noCompromise')}</div>
              </div>
            </div>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-6">
              {t('about.valueProposition')}
            </p>
          </motion.div>
        </section>
      </div>

      <Footer />
    </div>
  );
};

export default About;
