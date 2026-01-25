import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { supabase } from '@/integrations/supabase/client';
import { formatPriceFromIDR } from '@/utils/currency';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';
import { Badge } from '@/components/ui/badge';
import { Receipt } from 'lucide-react';

interface Transaction {
  id: string;
  user_id: string;
  game_id: string;
  purchase_date: string;
  amount: number;
  payment_status: string;
  payment_gateway: string;
  gateway_order_id: string | null;
  games: { title: string } | null;
  customer_email?: string;
}

const ITEMS_PER_PAGE = 10;

const TransactionHistory = () => {
  const { t, i18n } = useTranslation();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  useEffect(() => {
    fetchTransactions();
  }, [statusFilter, currentPage]);

  const fetchTransactions = async () => {
    setLoading(true);
    try {
      // First, get the count for pagination
      let countQuery = supabase
        .from('purchases')
        .select('*', { count: 'exact', head: true });

      if (statusFilter !== 'all') {
        countQuery = countQuery.eq('payment_status', statusFilter);
      }

      const { count } = await countQuery;
      setTotalCount(count || 0);

      // Fetch purchases with game info
      let query = supabase
        .from('purchases')
        .select(`
          id,
          user_id,
          game_id,
          purchase_date,
          amount,
          payment_status,
          payment_gateway,
          gateway_order_id,
          games (title)
        `)
        .order('purchase_date', { ascending: false })
        .range((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE - 1);

      if (statusFilter !== 'all') {
        query = query.eq('payment_status', statusFilter);
      }

      const { data: purchasesData, error: purchasesError } = await query;

      if (purchasesError) throw purchasesError;

      if (!purchasesData || purchasesData.length === 0) {
        setTransactions([]);
        setLoading(false);
        return;
      }

      // Get unique user IDs
      const userIds = [...new Set(purchasesData.map(p => p.user_id))];

      // Fetch user emails from profiles
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('id, email')
        .in('id', userIds);

      if (profilesError) throw profilesError;

      // Create a map of user_id to email
      const emailMap = new Map<string, string>();
      profilesData?.forEach(profile => {
        emailMap.set(profile.id, profile.email);
      });

      // Combine data
      const transactionsWithEmail = purchasesData.map(purchase => ({
        ...purchase,
        customer_email: emailMap.get(purchase.user_id) || 'Unknown',
      }));

      setTransactions(transactionsWithEmail);
    } catch (error) {
      console.error('Error fetching transactions:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return (
          <Badge className="bg-green-500/20 text-green-400 border-green-500/30 hover:bg-green-500/30">
            {t('admin.transactions.statusCompleted')}
          </Badge>
        );
      case 'pending':
        return (
          <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30 hover:bg-yellow-500/30">
            {t('admin.transactions.statusPending')}
          </Badge>
        );
      case 'failed':
        return (
          <Badge className="bg-red-500/20 text-red-400 border-red-500/30 hover:bg-red-500/30">
            {t('admin.transactions.statusFailed')}
          </Badge>
        );
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString(i18n.language === 'id' ? 'id-ID' : 'en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const truncateId = (id: string) => {
    return `${id.substring(0, 8)}...`;
  };

  const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-muted-foreground">{t('admin.transactions.loading')}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with filter */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-2">
          <Receipt className="h-5 w-5 text-primary" />
          <h2 className="text-xl font-semibold">{t('admin.transactions.title')}</h2>
        </div>
        <Select value={statusFilter} onValueChange={(value) => {
          setStatusFilter(value);
          setCurrentPage(1);
        }}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder={t('admin.transactions.filterAll')} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t('admin.transactions.filterAll')}</SelectItem>
            <SelectItem value="completed">{t('admin.transactions.filterCompleted')}</SelectItem>
            <SelectItem value="pending">{t('admin.transactions.filterPending')}</SelectItem>
            <SelectItem value="failed">{t('admin.transactions.filterFailed')}</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      {transactions.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <Receipt className="h-12 w-12 text-muted-foreground mb-4" />
          <p className="text-muted-foreground">{t('admin.transactions.noTransactions')}</p>
        </div>
      ) : (
        <>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t('admin.transactions.id')}</TableHead>
                  <TableHead>{t('admin.transactions.date')}</TableHead>
                  <TableHead>{t('admin.transactions.customer')}</TableHead>
                  <TableHead>{t('admin.transactions.game')}</TableHead>
                  <TableHead>{t('admin.transactions.amount')}</TableHead>
                  <TableHead>{t('admin.transactions.status')}</TableHead>
                  <TableHead>{t('admin.transactions.gateway')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {transactions.map((transaction) => (
                  <TableRow key={transaction.id}>
                    <TableCell className="font-mono text-sm">
                      {truncateId(transaction.id)}
                    </TableCell>
                    <TableCell className="whitespace-nowrap">
                      {formatDate(transaction.purchase_date)}
                    </TableCell>
                    <TableCell className="max-w-[200px] truncate">
                      {transaction.customer_email}
                    </TableCell>
                    <TableCell>
                      {transaction.games?.title || 'Unknown Game'}
                    </TableCell>
                    <TableCell className="font-medium">
                      {formatPriceFromIDR(transaction.amount, i18n.language)}
                    </TableCell>
                    <TableCell>
                      {getStatusBadge(transaction.payment_status)}
                    </TableCell>
                    <TableCell className="capitalize">
                      {transaction.payment_gateway}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious 
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                    className={currentPage === 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                  />
                </PaginationItem>
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNum: number;
                  if (totalPages <= 5) {
                    pageNum = i + 1;
                  } else if (currentPage <= 3) {
                    pageNum = i + 1;
                  } else if (currentPage >= totalPages - 2) {
                    pageNum = totalPages - 4 + i;
                  } else {
                    pageNum = currentPage - 2 + i;
                  }
                  return (
                    <PaginationItem key={pageNum}>
                      <PaginationLink
                        onClick={() => setCurrentPage(pageNum)}
                        isActive={currentPage === pageNum}
                        className="cursor-pointer"
                      >
                        {pageNum}
                      </PaginationLink>
                    </PaginationItem>
                  );
                })}
                <PaginationItem>
                  <PaginationNext 
                    onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                    className={currentPage === totalPages ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          )}
        </>
      )}
    </div>
  );
};

export default TransactionHistory;
