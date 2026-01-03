import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { StatusBadge } from '@/components/common/StatusBadge';
import type { KandangStatus } from '@/lib/domain/types';
import { Home, Egg, TrendingUp } from 'lucide-react';
import { Link } from 'react-router-dom';

interface KandangStatusGridProps {
  statuses: KandangStatus[];
}

export function KandangStatusGrid({ statuses }: KandangStatusGridProps) {
  if (statuses.length === 0) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-muted-foreground">
          Tidak ada kandang aktif
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {statuses.map((status) => (
        <Link to={`/recordings?kandang=${status.kandang.id}`} key={status.kandang.id}>
          <Card className="hover-lift cursor-pointer transition-all duration-300 hover:border-primary/30">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-lg bg-accent">
                    <Home className="w-4 h-4 text-accent-foreground" />
                  </div>
                  <CardTitle className="text-base">{status.kandang.name}</CardTitle>
                </div>
                <StatusBadge status={status.hdpStatus} size="sm" />
              </div>
            </CardHeader>
            <CardContent>
              {status.todayMetrics ? (
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground flex items-center gap-1.5">
                      <TrendingUp className="w-3.5 h-3.5" />
                      HDP
                    </span>
                    <span className="font-semibold">{status.todayMetrics.hdpPercent}%</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground flex items-center gap-1.5">
                      <Egg className="w-3.5 h-3.5" />
                      Telur
                    </span>
                    <span className="font-medium">{status.todayMetrics.eggsKg} kg</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">FCR</span>
                    <span className="font-medium">{status.todayMetrics.fcr}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Ayam Hidup</span>
                    <span className="font-medium">{status.todayMetrics.totalChickenToday.toLocaleString()}</span>
                  </div>
                </div>
              ) : (
                <div className="py-4 text-center text-sm text-muted-foreground">
                  Belum ada data hari ini
                </div>
              )}
            </CardContent>
          </Card>
        </Link>
      ))}
    </div>
  );
}
