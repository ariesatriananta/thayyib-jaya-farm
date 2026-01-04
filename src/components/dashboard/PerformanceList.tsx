import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { StatusBadge } from '@/components/common/StatusBadge';
import { Trophy, AlertTriangle } from 'lucide-react';
import type { KandangStatus } from '@/lib/mock/types';

interface PerformanceListProps {
  title: string;
  statuses: KandangStatus[];
  variant: 'top' | 'bottom';
}

export function PerformanceList({ title, statuses, variant }: PerformanceListProps) {
  const Icon = variant === 'top' ? Trophy : AlertTriangle;
  const iconClass = variant === 'top' ? 'text-success' : 'text-destructive';
  const easing = variant === 'top'
    ? 'cubic-bezier(0.16, 1, 0.3, 1)'
    : 'cubic-bezier(0.12, 0.7, 0.24, 1)';
  const baseDelay = variant === 'top' ? 70 : 90;
  const durationBase = variant === 'top' ? 500 : 560;

  return (
    <Card className="h-full animate-slide-up">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <Icon className={`w-5 h-5 ${iconClass}`} />
          <CardTitle className="text-base">{title}</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {statuses.length === 0 ? (
          <p
            className="text-sm text-muted-foreground text-center py-4 animate-slide-up"
            style={{
              animationDuration: `${durationBase}ms`,
              animationTimingFunction: easing,
              animationFillMode: "both",
            }}
          >
            Tidak ada data
          </p>
        ) : (
          statuses.map((status, index) => (
            <div 
              key={status.kandang.id}
              className="flex items-center justify-between p-3 rounded-lg bg-muted/50 animate-slide-up"
              style={{
                animationDelay: `${index * baseDelay}ms`,
                animationDuration: `${durationBase + index * 30}ms`,
                animationTimingFunction: easing,
                animationFillMode: "both",
              }}
            >
              <div className="flex items-center gap-3">
                <span className="flex items-center justify-center w-6 h-6 rounded-full bg-accent text-xs font-semibold">
                  {index + 1}
                </span>
                <div>
                  <p className="font-medium text-sm">{status.kandang.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {status.todayMetrics?.eggsCount.toLocaleString()} butir
                  </p>
                </div>
              </div>
              <StatusBadge 
                status={status.hdpStatus} 
                label={`${status.todayMetrics?.hdpPercent || 0}%`}
                size="sm"
              />
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}
