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
      })
      .catch(() => {
        // Keep fallback values on error.
      });

    return () => {
      isMounted = false;
    };
  }, [today]);

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
            subtitle={`${summary.totalEggsCount.toLocaleString()} butir`}
            icon={Egg}
            variant="primary"
          />
          <StatCard
            title="Pakan Terpakai"
            value={`${summary.totalFeedUsed} kg`}
            icon={Wheat}
            variant="secondary"
          />
          <StatCard
            title="Ayam Mati"
            value={summary.totalDeadChickens}
            icon={Skull}
            variant={summary.totalDeadChickens > 10 ? 'danger' : 'default'}
          />
          <StatCard
            title="Rata-rata FCR"
            value={summary.averageFCR || '-'}
            subtitle="Target: 2.2"
            icon={Activity}
          />
          <StatCard
            title="Rata-rata HDP"
            value={summary.averageHDP ? `${summary.averageHDP}%` : '-'}
            subtitle="Target: 90%"
            icon={TrendingUp}
            variant={summary.averageHDP >= 85 ? 'primary' : summary.averageHDP >= 75 ? 'warning' : 'danger'}
          />
          <StatCard
            title="Kandang Aktif"
            value={`${summary.activeKandangCount}/${summary.kandangCount}`}
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
