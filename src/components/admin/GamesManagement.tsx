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

interface Game {
  id: string;
  title: string;
  genre: string;
  description: string;
  long_description: string;
  price: number;
  image_url: string;
  hero_image_url: string | null;
  file_url: string | null;
  developer: string;
  release_date: string;
  platform: string;
  features: string[];
  screenshots: string[];
}

const GamesManagement = () => {
  const [games, setGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingGame, setEditingGame] = useState<Game | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    title: '',
    genre: '',
    description: '',
    long_description: '',
    price: '',
    image_url: '',
    hero_image_url: '',
    file_url: '',
    developer: 'Paramita Studio',
    release_date: '2024',
    platform: 'PC, PlayStation, Xbox',
    features: '',
    screenshots: '',
  });

  useEffect(() => {
    fetchGames();
  }, []);

  useEffect(() => {
    if (editingGame) {
      setFormData({
        title: editingGame.title,
        genre: editingGame.genre,
        description: editingGame.description,
        long_description: editingGame.long_description,
        price: editingGame.price.toString(),
        image_url: editingGame.image_url,
        hero_image_url: editingGame.hero_image_url || '',
        file_url: editingGame.file_url || '',
        developer: editingGame.developer,
        release_date: editingGame.release_date,
        platform: editingGame.platform,
        features: editingGame.features.join('\n'),
        screenshots: editingGame.screenshots.join('\n'),
      });
    } else {
      setFormData({
        title: '',
        genre: '',
        description: '',
        long_description: '',
        price: '',
        image_url: '',
        hero_image_url: '',
        file_url: '',
        developer: 'Paramita Studio',
        release_date: '2024',
        platform: 'PC, PlayStation, Xbox',
        features: '',
        screenshots: '',
      });
    }
  }, [editingGame]);

  const fetchGames = async () => {
    try {
      const { data, error } = await supabase
        .from('games')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setGames(data || []);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: 'Failed to load games',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const gameData = {
        title: formData.title,
        genre: formData.genre,
        description: formData.description,
        long_description: formData.long_description,
        price: parseFloat(formData.price),
        image_url: formData.image_url,
        hero_image_url: formData.hero_image_url || null,
        file_url: formData.file_url || null,
        developer: formData.developer,
        release_date: formData.release_date,
        platform: formData.platform,
        features: formData.features.split('\n').filter(f => f.trim()),
        screenshots: formData.screenshots.split('\n').filter(s => s.trim()),
      };

      if (editingGame) {
        const { error } = await supabase
          .from('games')
          .update(gameData)
          .eq('id', editingGame.id);

        if (error) throw error;

        toast({
          title: 'Success',
          description: 'Game updated successfully',
        });
      } else {
        const { error } = await supabase.from('games').insert([gameData]);

        if (error) throw error;

        toast({
          title: 'Success',
          description: 'Game added successfully',
        });
      }

      setIsDialogOpen(false);
      setEditingGame(null);
      fetchGames();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this game?')) return;

    try {
      const { error } = await supabase.from('games').delete().eq('id', id);

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Game deleted successfully',
      });
      fetchGames();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  if (loading) {
    return <p className="text-muted-foreground">Loading games...</p>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button
              onClick={() => {
                setEditingGame(null);
                setIsDialogOpen(true);
              }}
              className="bg-accent text-accent-foreground hover:bg-accent/90"
            >
              <Plus className="mr-2" size={18} />
              Add Game
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingGame ? 'Edit Game' : 'Add New Game'}
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
                <Label htmlFor="genre">Genre</Label>
                <Input
                  id="genre"
                  value={formData.genre}
                  onChange={(e) => setFormData({ ...formData, genre: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Short Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="long_description">Long Description</Label>
                <Textarea
                  id="long_description"
                  value={formData.long_description}
                  onChange={(e) => setFormData({ ...formData, long_description: e.target.value })}
                  rows={5}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="price">Price ($)</Label>
                <Input
                  id="price"
                  type="number"
                  step="0.01"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="image_url">Game Card Image URL</Label>
                <Input
                  id="image_url"
                  value={formData.image_url}
                  onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                  placeholder="Recommended: 800px width"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="hero_image_url">Hero Banner Image URL (optional)</Label>
                <Input
                  id="hero_image_url"
                  value={formData.hero_image_url}
                  onChange={(e) => setFormData({ ...formData, hero_image_url: e.target.value })}
                  placeholder="Recommended: 1920px width. Falls back to card image if empty."
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="file_url">Download File URL (optional)</Label>
                <Input
                  id="file_url"
                  value={formData.file_url}
                  onChange={(e) => setFormData({ ...formData, file_url: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="developer">Developer</Label>
                <Input
                  id="developer"
                  value={formData.developer}
                  onChange={(e) => setFormData({ ...formData, developer: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="release_date">Release Date</Label>
                <Input
                  id="release_date"
                  value={formData.release_date}
                  onChange={(e) => setFormData({ ...formData, release_date: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="platform">Platform</Label>
                <Input
                  id="platform"
                  value={formData.platform}
                  onChange={(e) => setFormData({ ...formData, platform: e.target.value })}
                  placeholder="e.g., PC, PlayStation, Xbox"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="features">Key Features (one per line)</Label>
                <Textarea
                  id="features"
                  value={formData.features}
                  onChange={(e) => setFormData({ ...formData, features: e.target.value })}
                  rows={5}
                  placeholder="Epic storyline&#10;Stunning graphics&#10;Multiplayer mode"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="screenshots">Screenshot URLs (one per line)</Label>
                <Textarea
                  id="screenshots"
                  value={formData.screenshots}
                  onChange={(e) => setFormData({ ...formData, screenshots: e.target.value })}
                  rows={5}
                  placeholder="https://example.com/screenshot1.jpg&#10;https://example.com/screenshot2.jpg"
                />
              </div>
              <Button type="submit" className="w-full">
                {editingGame ? 'Update Game' : 'Add Game'}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {games.map((game) => (
          <div key={game.id} className="bg-card rounded-xl border border-border p-6">
            <div className="flex gap-4">
              <img
                src={game.image_url}
                alt={game.title}
                className="w-24 h-24 object-cover rounded"
              />
              <div className="flex-1">
                <h3 className="text-xl font-bold mb-1">{game.title}</h3>
                <p className="text-accent text-sm mb-2">{game.genre}</p>
                <p className="text-lg font-semibold text-accent">${game.price}</p>
              </div>
              <div className="flex flex-col gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    setEditingGame(game);
                    setIsDialogOpen(true);
                  }}
                >
                  <Edit size={16} />
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleDelete(game.id)}
                >
                  <Trash2 size={16} />
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default GamesManagement;
