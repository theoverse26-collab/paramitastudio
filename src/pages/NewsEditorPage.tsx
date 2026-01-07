import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import Navbar from '@/components/Navbar';
import NewsEditor from '@/components/admin/NewsEditor';

const NewsEditorPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, loading, isAdmin } = useAuth();
  const [initialData, setInitialData] = useState<{
    title: string;
    content: string;
    image_url: string;
    category: string;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(!!id);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
    }
  }, [user, loading, navigate]);

  useEffect(() => {
    const fetchNews = async () => {
      if (!id) return;
      
      try {
        const { data, error } = await supabase
          .from('news')
          .select('*')
          .eq('id', id)
          .single();

        if (error) throw error;

        setInitialData({
          title: data.title,
          content: data.content,
          image_url: data.image_url || '',
          category: data.category || 'general',
        });
      } catch (error) {
        console.error('Error fetching news:', error);
        toast({
          title: 'Error',
          description: 'Failed to load news article',
          variant: 'destructive',
        });
        navigate('/admin');
      } finally {
        setIsLoading(false);
      }
    };

    fetchNews();
  }, [id, navigate]);

  const handleSave = async (data: { title: string; content: string; image_url: string; category: string }) => {
    if (!user) return;
    
    setIsSubmitting(true);
    try {
      if (id) {
        // Update existing news
        const { error } = await supabase
          .from('news')
          .update({
            title: data.title,
            content: data.content,
            image_url: data.image_url || null,
            category: data.category,
            updated_at: new Date().toISOString(),
          })
          .eq('id', id);

        if (error) throw error;

        toast({
          title: 'Success',
          description: 'News article updated successfully',
        });
      } else {
        // Create new news
        const { error } = await supabase
          .from('news')
          .insert({
            title: data.title,
            content: data.content,
            image_url: data.image_url || null,
            category: data.category,
            author_id: user.id,
          });

        if (error) throw error;

        toast({
          title: 'Success',
          description: 'News article published successfully',
        });
      }

      navigate('/admin');
    } catch (error) {
      console.error('Error saving news:', error);
      toast({
        title: 'Error',
        description: 'Failed to save news article',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    navigate('/admin');
  };

  if (loading || isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  if (!isAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-16">
        <NewsEditor
          initialTitle={initialData?.title}
          initialContent={initialData?.content}
          initialImageUrl={initialData?.image_url}
          initialCategory={initialData?.category}
          onSave={handleSave}
          onCancel={handleCancel}
          isSubmitting={isSubmitting}
        />
      </div>
    </div>
  );
};

export default NewsEditorPage;
