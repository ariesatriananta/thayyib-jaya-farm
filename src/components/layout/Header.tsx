"use client";

import { Moon, Sun, LogOut, User } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { settingsService } from '@/lib/services/settingsService';
import type { Settings } from '@/lib/mock/types';
import { signOut } from 'next-auth/react';
import { useTheme } from 'next-themes';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useSession } from 'next-auth/react';
import Link from 'next/link';

interface HeaderProps {
  title: string;
  subtitle?: string;
}

export function Header({ title, subtitle }: HeaderProps) {
  const { theme, setTheme } = useTheme();
  const [isMounted, setIsMounted] = useState(false);
  const { data: session } = useSession();
  const [settings, setSettings] = useState<Settings>({
    defaultTargetHDPPercent: 90,
    defaultTargetFCR: 2.2,
    farmName: 'Thayyib Jaya Farm',
  });

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    let isMounted = true;

    settingsService.get().then((data) => {
      if (isMounted) setSettings(data);
    }).catch(() => {
      // Keep fallback settings on failure.
    });

    return () => {
      isMounted = false;
    };
  }, []);

  const handleToggleTheme = () => {
    if (typeof document !== 'undefined') {
      const root = document.documentElement;
      root.classList.add('theme-transition');
      window.setTimeout(() => root.classList.remove('theme-transition'), 220);
    }

    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  const displayName = session?.user?.name || session?.user?.username || 'User';
  const initials = displayName
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('') || 'U';

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
          <Button
            variant="ghost"
            size="icon"
            aria-label="Toggle tema"
            onClick={handleToggleTheme}
            className="theme-toggle-btn"
          >
            {isMounted && theme === 'dark' ? (
              <Sun className="h-5 w-5 theme-toggle-icon theme-toggle-icon--sun" />
            ) : (
              <Moon className="h-5 w-5 theme-toggle-icon theme-toggle-icon--moon" />
            )}
          </Button>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="relative h-9 w-9 rounded-full border border-border/60 bg-card/80 shadow-sm"
              >
                <span className="text-sm font-semibold text-foreground">{initials}</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel className="space-y-1">
                <div className="text-sm font-semibold">{displayName}</div>
                <div className="text-xs text-muted-foreground">{settings.farmName}</div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href="/profiles" className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  MyProfile
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => signOut({ callbackUrl: '/login' })}
                className="text-destructive focus:text-destructive"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
