import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Plus, Edit, Trash2 } from 'lucide-react';

interface NewsPost {
  id: string;
  title: string;
  content: string;
  published_at: string;
  image_url: string | null;
}

const NewsManagement = () => {
  const [news, setNews] = useState<NewsPost[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const { t } = useTranslation();
  const navigate = useNavigate();

  useEffect(() => {
    fetchNews();
  }, []);

  const fetchNews = async () => {
    try {
      const { data, error } = await supabase
        .from('news')
        .select('id, title, content, published_at, image_url')
        .order('published_at', { ascending: false });

      if (error) throw error;
      setNews(data || []);
    } catch (error: any) {
      toast({
        title: t('common.error'),
        description: t('admin.news.errorLoad'),
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm(t('admin.news.deleteConfirm'))) return;

    try {
      const { error } = await supabase.from('news').delete().eq('id', id);

      if (error) throw error;

      toast({
        title: t('common.success'),
        description: t('admin.news.successDeleted'),
      });
      fetchNews();
    } catch (error: any) {
      toast({
        title: t('common.error'),
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  // Strip HTML tags for preview
  const stripHtml = (html: string) => {
    const tmp = document.createElement('div');
    tmp.innerHTML = html;
    return tmp.textContent || tmp.innerText || '';
  };

  if (loading) {
    return <p className="text-muted-foreground">{t('admin.news.loading')}</p>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <Button
          onClick={() => navigate('/admin/news/new')}
          className="bg-accent text-accent-foreground hover:bg-accent/90"
        >
          <Plus className="mr-2" size={18} />
          {t('admin.news.createPost')}
        </Button>
      </div>

      <div className="space-y-4">
        {news.map((post) => (
          <div key={post.id} className="bg-card rounded-xl border border-border p-6">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-xl font-bold mb-2">{post.title}</h3>
                <p className="text-sm text-muted-foreground">
                  {new Date(post.published_at).toLocaleDateString()}
                </p>
              </div>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => navigate(`/admin/news/edit/${post.id}`)}
                >
                  <Edit size={16} />
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleDelete(post.id)}
                >
                  <Trash2 size={16} />
                </Button>
              </div>
            </div>
            <p className="text-muted-foreground line-clamp-3">{stripHtml(post.content)}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default NewsManagement;
