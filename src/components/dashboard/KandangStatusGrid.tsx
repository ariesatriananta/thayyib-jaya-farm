"use client";

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { StatusBadge } from '@/components/common/StatusBadge';
import type { KandangStatus } from '@/lib/mock/types';
import { Home, Egg, TrendingUp, BadgeDollarSign, Calculator } from 'lucide-react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';

interface KandangStatusGridProps {
  statuses: KandangStatus[];
}

export function KandangStatusGrid({ statuses }: KandangStatusGridProps) {
  const { data: session } = useSession();
  const role = session?.user?.role;

  if (statuses.length === 0) {
    return (
      <Card
        className="animate-slide-up"
        style={{
          animationDuration: "520ms",
          animationTimingFunction: "cubic-bezier(0.22, 0.85, 0.32, 1)",
          animationFillMode: "both",
        }}
      >
        <CardContent className="py-8 text-center text-muted-foreground">
          Tidak ada kandang aktif
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {statuses.map((status, index) => (
        <Link href={`/recordings?kandang=${status.kandang.id}`} key={status.kandang.id}>
          <Card
            className="hover-lift cursor-pointer transition-all duration-300 hover:border-primary/30 animate-slide-up"
            style={{
              animationDelay: `${index * 70}ms`,
              animationDuration: `${520 + index * 20}ms`,
              animationTimingFunction: "cubic-bezier(0.22, 0.85, 0.32, 1)",
              animationFillMode: "both",
            }}
          >
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
                      HDP rata-rata
                    </span>
                    <span className="font-semibold">{status.todayMetrics.hdpPercent}%</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground flex items-center gap-1.5">
                      <Egg className="w-3.5 h-3.5" />
                      Total Telur
                    </span>
                    <span className="font-medium">{status.todayMetrics.eggsKg} kg</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">FCR</span>
                    <span className="font-medium">{status.todayMetrics.fcr}</span>
                  </div>
                  {role === 'admin' && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground flex items-center gap-1.5">
                        <BadgeDollarSign className="w-3.5 h-3.5" />
                        Profit
                      </span>
                      <span className="font-medium">
                        Rp {Math.round(status.todayMetrics.hpp).toLocaleString('id-ID')}
                      </span>
                    </div>
                  )}
                  {role === 'admin' && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground flex items-center gap-1.5">
                        <Calculator className="w-3.5 h-3.5" />
                        Nilai HPP
                      </span>
                      <span className="font-medium">
                        Rp {Math.round(
                          status.todayMetrics.eggsKg > 0
                            ? (status.todayMetrics.feedInKg * status.todayMetrics.feedPriceKg) / status.todayMetrics.eggsKg
                            : 0
                        ).toLocaleString('id-ID')}
                      </span>
                    </div>
                  )}
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Ayam Hidup (akhir)</span>
                    <span className="font-medium">{status.todayMetrics.totalChickenToday.toLocaleString()}</span>
                  </div>
                </div>
              ) : (
                <div className="py-4 text-center text-sm text-muted-foreground">
                  Belum ada data pada periode ini
                </div>
              )}
            </CardContent>
          </Card>
        </Link>
      ))}
    </div>
  );
}
