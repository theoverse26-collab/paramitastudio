import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import DOMPurify from "dompurify";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { useNewsTranslation } from "@/hooks/useNewsTranslation";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Trash2, MessageCircle, Reply } from "lucide-react";

interface NewsPost {
  id: string;
  title: string;
  content: string;
  published_at: string;
  image_url: string | null;
}

interface Comment {
  id: string;
  news_id: string;
  user_id: string;
  parent_id: string | null;
  content: string;
  created_at: string;
  user_email?: string;
  replies?: Comment[];
}

// Check if content is HTML (from WYSIWYG editor)
const isHtmlContent = (content: string): boolean => {
  return content.includes('<') && content.includes('>');
};

const NewsDetailContent = ({ news }: { news: NewsPost }) => {
  const { t } = useTranslation();
  const isHtml = isHtmlContent(news.content);
  
  // Only use translation for plain text content
  const { translated, isTranslating } = useNewsTranslation({
    newsId: news.id,
    title: news.title,
    content: isHtml ? '' : news.content, // Skip translation for HTML content
  });

  // Sanitize HTML content
  const sanitizedContent = isHtml ? DOMPurify.sanitize(news.content) : null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <header className="mb-8">
        <div className="text-sm text-accent font-semibold uppercase tracking-wide mb-4">
          {new Date(news.published_at).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          })}
        </div>
        <h1 className={`text-4xl md:text-5xl font-bold mb-6 text-gradient-gold ${isTranslating ? 'opacity-70' : ''}`}>
          {translated.title || news.title}
        </h1>
      </header>

      {news.image_url && (
        <div className="mb-8 rounded-xl overflow-hidden">
          <img 
            src={news.image_url} 
            alt={translated.title || news.title} 
            className="w-full h-auto object-cover"
          />
        </div>
      )}

      {isHtml ? (
        <div 
          className="prose prose-lg max-w-none prose-headings:text-foreground prose-p:text-foreground prose-strong:text-foreground prose-li:text-foreground"
          dangerouslySetInnerHTML={{ __html: sanitizedContent! }}
        />
      ) : (
        <div className="prose prose-lg max-w-none">
          <p className={`text-lg text-foreground leading-relaxed whitespace-pre-wrap ${isTranslating ? 'opacity-70' : ''}`}>
            {translated.content || news.content}
          </p>
        </div>
      )}
    </motion.div>
  );
};

const NewsDetail = () => {
  const { id } = useParams<{ id: string }>();
  const [news, setNews] = useState<NewsPost | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [newComment, setNewComment] = useState("");
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyContent, setReplyContent] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const { toast } = useToast();
  const { user, isAdmin } = useAuth();
  const { t } = useTranslation();

  useEffect(() => {
    if (id) {
      fetchNews();
      fetchComments();
    }
  }, [id]);

  const fetchNews = async () => {
    try {
      const { data, error } = await supabase
        .from('news')
        .select('id, title, content, published_at, image_url')
        .eq('id', id)
        .maybeSingle();

      if (error) throw error;
      setNews(data as NewsPost | null);
    } catch (error: any) {
      toast({
        title: t('common.error'),
        description: 'Failed to load news article',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchComments = async () => {
    try {
      const { data: commentsData, error } = await supabase
        .from('news_comments')
        .select('*')
        .eq('news_id', id)
        .order('created_at', { ascending: true });

      if (error) throw error;

      const userIds = [...new Set(commentsData?.map(c => c.user_id) || [])];
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, email')
        .in('id', userIds);

      const emailMap = new Map(profiles?.map(p => [p.id, p.email]) || []);

      const commentsWithEmails = commentsData?.map(c => ({
        ...c,
        user_email: emailMap.get(c.user_id) || 'Unknown User',
        replies: []
      })) || [];

      const topLevelComments: Comment[] = [];
      const commentMap = new Map<string, Comment>();

      commentsWithEmails.forEach(c => {
        commentMap.set(c.id, c);
      });

      commentsWithEmails.forEach(c => {
        if (c.parent_id && commentMap.has(c.parent_id)) {
          const parent = commentMap.get(c.parent_id)!;
          parent.replies = parent.replies || [];
          parent.replies.push(c);
        } else if (!c.parent_id) {
          topLevelComments.push(c);
        }
      });

      setComments(topLevelComments);
    } catch (error: any) {
      console.error('Error fetching comments:', error);
    }
  };

  const handleSubmitComment = async (parentId: string | null = null) => {
    const content = parentId ? replyContent : newComment;
    if (!content.trim() || !user) return;

    setSubmitting(true);
    try {
      const { error } = await supabase
        .from('news_comments')
        .insert({
          news_id: id,
          user_id: user.id,
          parent_id: parentId,
          content: content.trim()
        });

      if (error) throw error;

      toast({
        title: t('common.success'),
        description: 'Comment posted successfully',
      });

      if (parentId) {
        setReplyContent("");
        setReplyingTo(null);
      } else {
        setNewComment("");
      }
      
      fetchComments();
    } catch (error: any) {
      toast({
        title: t('common.error'),
        description: 'Failed to post comment',
        variant: 'destructive',
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    if (!confirm(t('news.confirmDelete'))) return;

    try {
      const { error } = await supabase
        .from('news_comments')
        .delete()
        .eq('id', commentId);

      if (error) throw error;

      toast({
        title: t('common.success'),
        description: 'Comment deleted',
      });
      
      fetchComments();
    } catch (error: any) {
      toast({
        title: t('common.error'),
        description: 'Failed to delete comment',
        variant: 'destructive',
      });
    }
  };

  const renderComment = (comment: Comment, depth: number = 0) => (
    <div key={comment.id} className={`${depth > 0 ? 'ml-8 border-l-2 border-border pl-4' : ''}`}>
      <div className="bg-card rounded-lg p-4 mb-3 border border-border">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-sm">{comment.user_email}</span>
            <span className="text-xs text-muted-foreground">
              {new Date(comment.created_at).toLocaleDateString()}
            </span>
          </div>
          <div className="flex items-center gap-2">
            {user && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setReplyingTo(replyingTo === comment.id ? null : comment.id)}
                className="text-xs"
              >
                <Reply className="w-3 h-3 mr-1" />
                {t('news.reply')}
              </Button>
            )}
            {(isAdmin || user?.id === comment.user_id) && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleDeleteComment(comment.id)}
                className="text-destructive hover:text-destructive"
              >
                <Trash2 className="w-3 h-3" />
              </Button>
            )}
          </div>
        </div>
        <p className="text-foreground whitespace-pre-wrap">{comment.content}</p>

        {replyingTo === comment.id && (
          <div className="mt-4 space-y-2">
            <Textarea
              placeholder={t('news.writeReply')}
              value={replyContent}
              onChange={(e) => setReplyContent(e.target.value)}
              className="bg-background min-h-[80px]"
            />
            <div className="flex gap-2">
              <Button
                size="sm"
                onClick={() => handleSubmitComment(comment.id)}
                disabled={submitting || !replyContent.trim()}
                className="bg-accent text-accent-foreground hover:bg-accent/90"
              >
                {t('news.postReply')}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setReplyingTo(null);
                  setReplyContent("");
                }}
              >
                {t('common.cancel')}
              </Button>
            </div>
          </div>
        )}
      </div>

      {comment.replies?.map(reply => renderComment(reply, depth + 1))}
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">{t('common.loading')}</p>
      </div>
    );
  }

  if (!news) {
    return (
      <div className="min-h-screen">
        <Navbar />
        <div className="pt-24 pb-20 container mx-auto px-4 text-center">
          <h1 className="text-3xl font-bold mb-4">{t('news.articleNotFound')}</h1>
          <Link to="/news" className="text-accent hover:underline">
            {t('news.backToNews')}
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Navbar />

      <div className="pt-24 pb-20">
        <article className="container mx-auto px-4 max-w-4xl">
          <Link 
            to="/news" 
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-accent transition-colors mb-8"
          >
            <ArrowLeft className="w-4 h-4" />
            {t('news.backToNews')}
          </Link>

          <NewsDetailContent news={news} />

          <motion.section
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mt-16"
          >
            <div className="flex items-center gap-2 mb-8">
              <MessageCircle className="w-6 h-6 text-accent" />
              <h2 className="text-2xl font-bold">{t('news.comments')}</h2>
            </div>

            {user ? (
              <div className="bg-card rounded-xl p-6 border border-border mb-8">
                <Textarea
                  placeholder={t('news.writeComment')}
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  className="bg-background min-h-[100px] mb-4"
                />
                <Button
                  onClick={() => handleSubmitComment()}
                  disabled={submitting || !newComment.trim()}
                  className="bg-accent text-accent-foreground hover:bg-accent/90"
                >
                  {t('news.postComment')}
                </Button>
              </div>
            ) : (
              <div className="bg-card rounded-xl p-6 border border-border mb-8 text-center">
                <p className="text-muted-foreground mb-4">
                  {t('news.loginToComment')}
                </p>
                <Link to="/auth">
                  <Button className="bg-accent text-accent-foreground hover:bg-accent/90">
                    {t('nav.login')}
                  </Button>
                </Link>
              </div>
            )}

            <div className="space-y-4">
              {comments.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">
                  {t('news.noComments')}
                </p>
              ) : (
                comments.map(comment => renderComment(comment))
              )}
            </div>
          </motion.section>
        </article>
      </div>

      <Footer />
    </div>
  );
};

export default NewsDetail;
