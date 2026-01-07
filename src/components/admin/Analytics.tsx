import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DollarSign, Download, Users, ShoppingCart } from 'lucide-react';
import { formatPriceFromIDR } from '@/utils/currency';

interface AnalyticsData {
  totalSales: number;
  totalRevenue: number;
  totalUsers: number;
  totalGames: number;
}

const Analytics = () => {
  const [analytics, setAnalytics] = useState<AnalyticsData>({
    totalSales: 0,
    totalRevenue: 0,
    totalUsers: 0,
    totalGames: 0,
  });
  const [loading, setLoading] = useState(true);
  const { t, i18n } = useTranslation();

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      // Fetch purchases data
      const { data: purchases, error: purchasesError } = await supabase
        .from('purchases')
        .select('amount');

      if (purchasesError) throw purchasesError;

      const totalSales = purchases?.length || 0;
      const totalRevenue = purchases?.reduce((sum, p) => sum + Number(p.amount), 0) || 0;

      // Fetch users count
      const { count: usersCount, error: usersError } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true });

      if (usersError) throw usersError;

      // Fetch games count
      const { count: gamesCount, error: gamesError } = await supabase
        .from('games')
        .select('*', { count: 'exact', head: true });

      if (gamesError) throw gamesError;

      setAnalytics({
        totalSales,
        totalRevenue,
        totalUsers: usersCount || 0,
        totalGames: gamesCount || 0,
      });
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <p className="text-muted-foreground">{t('admin.analytics.loading')}</p>;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <Card className="bg-card border-border">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">{t('admin.analytics.totalRevenue')}</CardTitle>
          <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
            <DollarSign className="h-4 w-4 text-primary" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-foreground">
            {formatPriceFromIDR(analytics.totalRevenue, i18n.language)}
          </div>
        </CardContent>
      </Card>

      <Card className="bg-card border-border">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">{t('admin.analytics.totalSales')}</CardTitle>
          <div className="h-8 w-8 rounded-full bg-secondary/50 flex items-center justify-center">
            <ShoppingCart className="h-4 w-4 text-secondary-foreground" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-foreground">{analytics.totalSales}</div>
        </CardContent>
      </Card>

      <Card className="bg-card border-border">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">{t('admin.analytics.registeredUsers')}</CardTitle>
          <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
            <Users className="h-4 w-4 text-primary" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-foreground">{analytics.totalUsers}</div>
        </CardContent>
      </Card>

      <Card className="bg-card border-border">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">{t('admin.analytics.gamesListed')}</CardTitle>
          <div className="h-8 w-8 rounded-full bg-secondary/50 flex items-center justify-center">
            <Download className="h-4 w-4 text-secondary-foreground" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-foreground">{analytics.totalGames}</div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Analytics;
