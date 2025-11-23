import { motion } from "framer-motion";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Calendar, User } from "lucide-react";

const News = () => {
  const newsArticles = [
    {
      title: "Enchanted Realms Receives Major Update",
      date: "November 15, 2024",
      author: "Elena Stormwind",
      excerpt: "We're excited to announce a major content update for Enchanted Realms, featuring new areas, quests, and magical abilities.",
      category: "Update",
    },
    {
      title: "Behind the Scenes: Creating Skybound Adventures",
      date: "November 10, 2024",
      author: "Marcus Ironforge",
      excerpt: "Join us as we explore the development process behind our latest aerial adventure game and the challenges we overcame.",
      category: "Development",
    },
    {
      title: "Shadow Warrior: The Dark Fantasy Saga Continues",
      date: "November 5, 2024",
      author: "Luna Silvermoon",
      excerpt: "Discover what's coming next in the Shadow Warrior universe with our roadmap for 2025 and beyond.",
      category: "Announcement",
    },
    {
      title: "Community Spotlight: Fan Art Contest Winners",
      date: "November 1, 2024",
      author: "Community Team",
      excerpt: "Celebrating the incredible creativity of our community with this month's fan art contest winners.",
      category: "Community",
    },
  ];

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
              News & Updates
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Stay up to date with the latest news, updates, and insights from the Alcuinex team.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
            {newsArticles.map((article, index) => (
              <motion.article
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="bg-card p-8 rounded-xl border border-border hover-lift geometric-clip"
              >
                <div className="mb-4">
                  <span className="inline-block px-4 py-1 bg-accent/20 text-accent rounded-full text-sm font-semibold uppercase tracking-wide">
                    {article.category}
                  </span>
                </div>
                
                <h2 className="text-2xl font-bold mb-4 hover:text-accent transition-fantasy">
                  {article.title}
                </h2>

                <div className="flex items-center gap-6 text-sm text-muted-foreground mb-4">
                  <div className="flex items-center gap-2">
                    <Calendar size={16} />
                    <span>{article.date}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <User size={16} />
                    <span>{article.author}</span>
                  </div>
                </div>

                <p className="text-muted-foreground leading-relaxed mb-4">
                  {article.excerpt}
                </p>

                <button className="text-accent font-semibold hover:underline">
                  Read More →
                </button>
              </motion.article>
            ))}
          </div>
        </section>
      </div>

      <Footer />
    </div>
  );
};

export default News;
