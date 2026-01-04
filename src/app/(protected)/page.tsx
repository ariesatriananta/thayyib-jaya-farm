"use client";

import { useEffect, useState } from 'react';
import { format } from 'date-fns';
import { AppLayout } from '@/components/layout/AppLayout';
import { StatCard } from '@/components/common/StatCard';
import { KandangStatusGrid } from '@/components/dashboard/KandangStatusGrid';
import { PerformanceList } from '@/components/dashboard/PerformanceList';
import { QuickAddRecording } from '@/components/dashboard/QuickAddRecording';
import { reportService } from '@/lib/services/reportService';
import { Egg, Wheat, Skull, TrendingUp, Activity, Home } from 'lucide-react';
import type { DashboardSummary, KandangStatus } from '@/lib/mock/types';
import Loading from './loading';
import { signalNavigationDone } from '@/lib/ui/navigationProgress';

const Dashboard = () => {
  const today = format(new Date(), 'yyyy-MM-dd');
  const [summary, setSummary] = useState<DashboardSummary>({
    totalEggsKg: 0,
    totalEggsCount: 0,
    totalFeedUsed: 0,
    totalDeadChickens: 0,
    averageFCR: 0,
    averageHDP: 0,
    kandangCount: 0,
    activeKandangCount: 0,
  });
  const [kandangStatuses, setKandangStatuses] = useState<KandangStatus[]>([]);
  const [topPerformers, setTopPerformers] = useState<KandangStatus[]>([]);
  const [bottomPerformers, setBottomPerformers] = useState<KandangStatus[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    Promise.all([
      reportService.getDashboardSummary(today),
      reportService.getKandangStatuses(today),
      reportService.getTopPerformers(today, 3),
      reportService.getBottomPerformers(today, 3),
    ])
      .then(([summaryData, statuses, top, bottom]) => {
        if (!isMounted) return;
        setSummary(summaryData);
        setKandangStatuses(statuses);
        setTopPerformers(top);
        setBottomPerformers(bottom);
        setIsLoading(false);
        signalNavigationDone();
      })
      .catch(() => {
        if (!isMounted) return;
        setIsLoading(false);
        signalNavigationDone();
      });

    return () => {
      isMounted = false;
    };
  }, [today]);

  if (isLoading) {
    return <Loading />;
  }

  return (
    <AppLayout 
      title="Dashboard" 
      subtitle={`Ringkasan data ${format(new Date(), 'EEEE, dd MMMM yyyy')}`}
    >
      <div className="space-y-6 animate-fade-in">
        {/* Quick Add */}
        <QuickAddRecording />

        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
          <StatCard
            title="Total Telur"
            value={`${summary.totalEggsKg} kg`}
            animatedNumber={summary.totalEggsKg}
            animationDurationMs={2000}
            valueSuffix=" kg"
            valueFormatter={(value) => value.toFixed(1)}
            revealDelayMs={0}
            revealDurationMs={700}
            revealEasing="cubic-bezier(0.16, 1, 0.3, 1)"
            subtitle={`${summary.totalEggsCount.toLocaleString()} butir`}
            icon={Egg}
            variant="primary"
          />
          <StatCard
            title="Pakan Terpakai"
            value={`${summary.totalFeedUsed} kg`}
            animatedNumber={summary.totalFeedUsed}
            animationDurationMs={2000}
            valueSuffix=" kg"
            valueFormatter={(value) => value.toFixed(1)}
            revealDelayMs={80}
            revealDurationMs={760}
            revealEasing="cubic-bezier(0.16, 1, 0.3, 1)"
            icon={Wheat}
            variant="secondary"
          />
          <StatCard
            title="Ayam Mati"
            value={summary.totalDeadChickens}
            animatedNumber={summary.totalDeadChickens}
            animationDurationMs={2000}
            valueFormatter={(value) => Math.round(value).toLocaleString('id-ID')}
            revealDelayMs={160}
            revealDurationMs={820}
            revealEasing="cubic-bezier(0.16, 1, 0.3, 1)"
            icon={Skull}
            variant={summary.totalDeadChickens > 10 ? 'danger' : 'default'}
          />
          <StatCard
            title="Rata-rata FCR"
            value={summary.averageFCR > 0 ? summary.averageFCR : '-'}
            animatedNumber={summary.averageFCR > 0 ? summary.averageFCR : undefined}
            animationDurationMs={2000}
            valueFormatter={(value) => value.toFixed(2)}
            revealDelayMs={240}
            revealDurationMs={880}
            revealEasing="cubic-bezier(0.16, 1, 0.3, 1)"
            subtitle="Target: 2.2"
            icon={Activity}
          />
          <StatCard
            title="Rata-rata HDP"
            value={summary.averageHDP > 0 ? `${summary.averageHDP}%` : '-'}
            animatedNumber={summary.averageHDP > 0 ? summary.averageHDP : undefined}
            animationDurationMs={2000}
            valueSuffix="%"
            valueFormatter={(value) => value.toFixed(2)}
            revealDelayMs={320}
            revealDurationMs={940}
            revealEasing="cubic-bezier(0.16, 1, 0.3, 1)"
            subtitle="Target: 90%"
            icon={TrendingUp}
            variant={summary.averageHDP >= 85 ? 'primary' : summary.averageHDP >= 75 ? 'warning' : 'danger'}
          />
          <StatCard
            title="Kandang Aktif"
            value={`${summary.activeKandangCount}/${summary.kandangCount}`}
            animatedNumber={summary.activeKandangCount}
            animationDurationMs={2000}
            valueSuffix={`/${summary.kandangCount}`}
            valueFormatter={(value) => Math.round(value).toLocaleString('id-ID')}
            revealDelayMs={400}
            revealDurationMs={1000}
            revealEasing="cubic-bezier(0.16, 1, 0.3, 1)"
            icon={Home}
          />
        </div>

        {/* Performance Lists */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <PerformanceList
            title="Top 3 Kandang (HDP Tertinggi)"
            statuses={topPerformers}
            variant="top"
          />
          <PerformanceList
            title="3 Kandang Perlu Perhatian"
            statuses={bottomPerformers}
            variant="bottom"
          />
        </div>

        {/* Kandang Status Grid */}
        <div>
          <h2 className="text-lg font-semibold mb-4">Status Semua Kandang</h2>
          <KandangStatusGrid statuses={kandangStatuses} />
        </div>
      </div>
    </AppLayout>
  );
};

export default Dashboard;
