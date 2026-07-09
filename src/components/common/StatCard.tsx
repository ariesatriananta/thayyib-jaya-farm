"use client";

import { useEffect, useMemo, useState } from 'react';
import { Info, LucideIcon } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';

interface StatCardProps {
  title: string;
  value: string | number;
  animatedNumber?: number;
  animationDurationMs?: number;
  valuePrefix?: string;
  valueSuffix?: string;
  valueFormatter?: (value: number) => string;
  revealDelayMs?: number;
  revealDurationMs?: number;
  revealEasing?: string;
  valueClassName?: string;
  subtitle?: string;
  information?: string;
  icon: LucideIcon;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  variant?: 'default' | 'primary' | 'secondary' | 'warning' | 'danger';
}

const variantStyles = {
  default: 'farm-icon-bg',
  primary: 'bg-primary/10 text-primary',
  secondary: 'bg-secondary/20 text-secondary-foreground',
  warning: 'bg-warning/10 text-warning',
  danger: 'bg-destructive/10 text-destructive',
};

const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);

export function StatCard({
  title,
  value,
  animatedNumber,
  animationDurationMs = 1200,
  valuePrefix = '',
  valueSuffix = '',
  valueFormatter,
  revealDelayMs,
  revealDurationMs,
  revealEasing,
  valueClassName,
  subtitle,
  information,
  icon: Icon,
  trend,
  variant = 'default',
}: StatCardProps) {
  const [animatedValue, setAnimatedValue] = useState(animatedNumber ?? 0);
  const [informationOpen, setInformationOpen] = useState(false);

  useEffect(() => {
    if (animatedNumber === undefined) return;
    let frame = 0;
    const start = performance.now();
    const duration = Math.max(0, animationDurationMs);

    const tick = (now: number) => {
      const progress = duration === 0 ? 1 : Math.min(1, (now - start) / duration);
      const eased = easeOutCubic(progress);
      setAnimatedValue(animatedNumber * eased);
      if (progress < 1) {
        frame = requestAnimationFrame(tick);
      }
    };

    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [animatedNumber, animationDurationMs]);

  const displayValue = useMemo(() => {
    if (animatedNumber === undefined) return value;
    const formatted = valueFormatter
      ? valueFormatter(animatedValue)
      : animatedValue.toLocaleString('id-ID');
    return `${valuePrefix}${formatted}${valueSuffix}`;
  }, [animatedNumber, animatedValue, value, valueFormatter, valuePrefix, valueSuffix]);

  return (
    <Card
      className={cn("hover-lift border-border/50 overflow-hidden", revealDelayMs !== undefined && "animate-slide-up")}
      style={revealDelayMs !== undefined ? {
        animationDelay: `${revealDelayMs}ms`,
        animationDuration: revealDurationMs ? `${revealDurationMs}ms` : undefined,
        animationTimingFunction: revealEasing,
        animationFillMode: "both",
      } : undefined}
    >
      <CardContent className="p-5">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <p className={cn("text-2xl font-bold mt-1 text-foreground", valueClassName)}>{displayValue}</p>
            {subtitle && (
              <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>
            )}
            {trend && (
              <div className={cn(
                "flex items-center gap-1 mt-2 text-xs font-medium",
                trend.isPositive ? "text-success" : "text-destructive"
              )}>
                <span>{trend.isPositive ? '↑' : '↓'}</span>
                <span>{Math.abs(trend.value)}%</span>
                <span className="text-muted-foreground">vs kemarin</span>
              </div>
            )}
          </div>
          <div className={cn("p-3 rounded-xl", variantStyles[variant])}>
            <Icon className="w-5 h-5" />
          </div>
        </div>
        {information && (
          <div className="mt-3 flex justify-end">
            <Popover open={informationOpen} onOpenChange={setInformationOpen}>
              <PopoverTrigger asChild>
                <button
                  type="button"
                  aria-label={`Informasi ${title}`}
                  className="rounded-full p-1 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  onMouseEnter={() => setInformationOpen(true)}
                  onMouseLeave={() => setInformationOpen(false)}
                >
                  <Info className="h-4 w-4" />
                </button>
              </PopoverTrigger>
              <PopoverContent
                side="top"
                align="end"
                className="w-72 text-sm leading-relaxed"
                onMouseEnter={() => setInformationOpen(true)}
                onMouseLeave={() => setInformationOpen(false)}
              >
                {information}
              </PopoverContent>
            </Popover>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
