import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { User, Heart, Mail, LayoutDashboard, LogOut, ChevronDown } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
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
  const navigate = useNavigate();
  const { t } = useTranslation();

  if (!user) return null;

  const userEmail = user.email || '';
  const displayName = userEmail.split('@')[0];

  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-primary-foreground/20 bg-primary/10 hover:bg-primary/15 text-primary-foreground"
        >
          <User size={16} />
          <span className="hidden lg:inline max-w-[100px] truncate">{displayName}</span>
          <ChevronDown className="h-3 w-3 opacity-70" />
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
          <Link to="/inbox" className="flex items-center gap-2">
            <Mail size={16} />
            {t('nav.inbox')}
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
