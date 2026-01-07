import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { User, Heart, Mail, LayoutDashboard, LogOut, ChevronDown } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

const UserMenu = () => {
  const { user, signOut } = useAuth();
  const { t } = useTranslation();
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (user) {
      fetchUnreadCount();
      
      const channel = supabase
        .channel('user-menu-notifications')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'notifications',
            filter: `user_id=eq.${user.id}`,
          },
          () => {
            fetchUnreadCount();
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [user]);

  const fetchUnreadCount = async () => {
    if (!user) return;

    try {
      const { count, error } = await supabase
        .from('notifications')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .eq('is_read', false);

      if (error) throw error;
      setUnreadCount(count || 0);
    } catch (error) {
      console.error('Error fetching unread count:', error);
    }
  };

  if (!user) return null;

  const userEmail = user.email || '';
  const displayName = userEmail.split('@')[0];

  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="relative flex items-center gap-2 px-3 py-1.5 rounded-full border border-primary-foreground/20 bg-primary/10 hover:bg-accent/20 hover:border-accent/50 hover:shadow-[0_0_10px_hsl(var(--accent)/0.3)] text-primary-foreground hover:text-primary-foreground transition-all duration-200"
        >
          <User size={16} />
          <span className="hidden lg:inline max-w-[100px] truncate">{displayName}</span>
          <ChevronDown className="h-3 w-3 opacity-70" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-accent text-accent-foreground text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="bg-card border-border shadow-lg min-w-[180px]"
        sideOffset={10}
      >
        <DropdownMenuItem asChild className="cursor-pointer hover:bg-accent/20 focus:bg-accent/20">
          <Link to="/profile" className="flex items-center gap-2">
            <User size={16} />
            {t('nav.profile')}
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild className="cursor-pointer hover:bg-accent/20 focus:bg-accent/20">
          <Link to="/dashboard" className="flex items-center gap-2">
            <LayoutDashboard size={16} />
            {t('nav.dashboard')}
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild className="cursor-pointer hover:bg-accent/20 focus:bg-accent/20">
          <Link to="/wishlist" className="flex items-center gap-2">
            <Heart size={16} />
            {t('nav.wishlist')}
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild className="cursor-pointer hover:bg-accent/20 focus:bg-accent/20">
          <Link to="/inbox" className="relative flex items-center gap-2">
            <Mail size={16} />
            {t('nav.inbox')}
            {unreadCount > 0 && (
              <span className="ml-auto bg-accent text-accent-foreground text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={() => signOut()}
          className="cursor-pointer hover:bg-destructive/10 focus:bg-destructive/10 text-destructive"
        >
          <LogOut size={16} className="mr-2" />
          {t('nav.logout')}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default UserMenu;
