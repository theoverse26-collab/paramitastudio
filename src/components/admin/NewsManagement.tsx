import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Plus, Edit, Trash2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

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
  const [editingPost, setEditingPost] = useState<NewsPost | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    title: '',
    content: '',
    image_url: '',
  });

  useEffect(() => {
    fetchNews();
  }, []);

  useEffect(() => {
    if (editingPost) {
      setFormData({
        title: editingPost.title,
        content: editingPost.content,
        image_url: editingPost.image_url || '',
      });
    } else {
      setFormData({
        title: '',
        content: '',
        image_url: '',
      });
    }
  }, [editingPost]);

  const fetchNews = async () => {
    try {
      const { data, error } = await supabase
        .from('news')
        .select('*')
        .order('published_at', { ascending: false });

      if (error) throw error;
      setNews(data || []);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: 'Failed to load news',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const newsData = {
        title: formData.title,
        content: formData.content,
        image_url: formData.image_url || null,
        author_id: user.id,
      };

      if (editingPost) {
        const { error } = await supabase
          .from('news')
          .update(newsData)
          .eq('id', editingPost.id);

        if (error) throw error;

        toast({
          title: 'Success',
          description: 'News post updated successfully',
        });
      } else {
        const { error } = await supabase.from('news').insert([newsData]);

        if (error) throw error;

        toast({
          title: 'Success',
          description: 'News post created successfully',
        });
      }

      setIsDialogOpen(false);
      setEditingPost(null);
      fetchNews();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this news post?')) return;

    try {
      const { error } = await supabase.from('news').delete().eq('id', id);

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'News post deleted successfully',
      });
      fetchNews();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  if (loading) {
    return <p className="text-muted-foreground">Loading news...</p>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button
              onClick={() => {
                setEditingPost(null);
                setIsDialogOpen(true);
              }}
              className="bg-accent text-accent-foreground hover:bg-accent/90"
            >
              <Plus className="mr-2" size={18} />
              Create Post
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingPost ? 'Edit News Post' : 'Create News Post'}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="image_url">Image URL (optional)</Label>
                <Input
                  id="image_url"
                  value={formData.image_url}
                  onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                  placeholder="https://example.com/image.jpg"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="content">Content</Label>
                <Textarea
                  id="content"
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  rows={10}
                  required
                />
              </div>
              <Button type="submit" className="w-full">
                {editingPost ? 'Update Post' : 'Create Post'}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
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
                  onClick={() => {
                    setEditingPost(post);
                    setIsDialogOpen(true);
                  }}
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
            <p className="text-muted-foreground line-clamp-3">{post.content}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default NewsManagement;
