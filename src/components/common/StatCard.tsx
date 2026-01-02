import { LucideIcon } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
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

export function StatCard({ title, value, subtitle, icon: Icon, trend, variant = 'default' }: StatCardProps) {
  return (
    <Card className="hover-lift border-border/50 overflow-hidden">
      <CardContent className="p-5">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <p className="text-2xl font-bold mt-1 text-foreground">{value}</p>
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
      </CardContent>
    </Card>
  );
}
