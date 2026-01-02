import { Bell, LogOut } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { settingsService } from '@/lib/services/settingsService';

interface HeaderProps {
  title: string;
  subtitle?: string;
}

export function Header({ title, subtitle }: HeaderProps) {
  const settings = settingsService.get();

  return (
    <header className="gradient-header border-b border-border px-6 py-4 lg:px-8">
      <div className="flex items-center justify-between">
        <div className="pl-12 lg:pl-0">
          <h1 className="text-xl lg:text-2xl font-bold text-foreground">{title}</h1>
          {subtitle && (
            <p className="text-sm text-muted-foreground mt-0.5">{subtitle}</p>
          )}
        </div>
        
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" className="relative">
            <Bell className="h-5 w-5" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-destructive rounded-full" />
          </Button>
          
          <div className="hidden sm:flex items-center gap-3 pl-3 border-l border-border">
            <div className="text-right">
              <p className="text-sm font-medium">Admin</p>
              <p className="text-xs text-muted-foreground">{settings.farmName}</p>
            </div>
            <Link to="/login">
              <Button variant="ghost" size="icon">
                <LogOut className="h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}
