"use client";

import { Moon, Sun, LogOut } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { settingsService } from '@/lib/services/settingsService';
import type { Settings } from '@/lib/mock/types';
import { signOut } from 'next-auth/react';
import { useTheme } from 'next-themes';

interface HeaderProps {
  title: string;
  subtitle?: string;
}

export function Header({ title, subtitle }: HeaderProps) {
  const { theme, setTheme } = useTheme();
  const [isMounted, setIsMounted] = useState(false);
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
          
          <div className="hidden sm:flex items-center gap-3 pl-3 border-l border-border">
            <div className="text-right">
              <p className="text-sm font-medium">Admin</p>
              <p className="text-xs text-muted-foreground">{settings.farmName}</p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => signOut({ callbackUrl: '/login' })}
            >
              <LogOut className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}
