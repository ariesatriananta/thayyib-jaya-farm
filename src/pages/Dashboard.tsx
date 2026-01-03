import { format } from 'date-fns';
import { AppLayout } from '@/components/layout/AppLayout';
import { StatCard } from '@/components/common/StatCard';
import { KandangStatusGrid } from '@/components/dashboard/KandangStatusGrid';
import { PerformanceList } from '@/components/dashboard/PerformanceList';
import { QuickAddRecording } from '@/components/dashboard/QuickAddRecording';
import { LoadingState } from '@/components/common/LoadingState';
import { EmptyState } from '@/components/common/EmptyState';
import {
  buildBottomPerformers,
  buildDashboardSummary,
  buildKandangStatuses,
  buildTopPerformers,
} from '@/lib/domain/reporting';
import { Egg, Wheat, Skull, TrendingUp, Activity, Home } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { getKandangAll } from '@/services/api/kandang';
import { getRecordings } from '@/services/api/recordings';

const Dashboard = () => {
  const today = format(new Date(), 'yyyy-MM-dd');
  const {
    data: kandangList = [],
    isLoading: kandangLoading,
    error: kandangError,
  } = useQuery({
    queryKey: ['kandang'],
    queryFn: getKandangAll,
  });
  const {
    data: recordings = [],
    isLoading: recordingsLoading,
    error: recordingsError,
  } = useQuery({
    queryKey: ['recordings'],
    queryFn: () => getRecordings(),
  });

  const isLoading = kandangLoading || recordingsLoading;
  const hasError = kandangError || recordingsError;

  const summary = isLoading || hasError
    ? {
        totalEggsKg: 0,
        totalEggsCount: 0,
        totalFeedUsed: 0,
        totalDeadChickens: 0,
        averageFCR: 0,
        averageHDP: 0,
        kandangCount: 0,
        activeKandangCount: 0,
      }
    : buildDashboardSummary(today, kandangList, recordings);
  const kandangStatuses = isLoading || hasError
    ? []
    : buildKandangStatuses(today, kandangList, recordings);
  const topPerformers = isLoading || hasError
    ? []
    : buildTopPerformers(today, kandangList, recordings, 3);
  const bottomPerformers = isLoading || hasError
    ? []
    : buildBottomPerformers(today, kandangList, recordings, 3);

  return (
    <AppLayout 
      title="Dashboard" 
      subtitle={`Ringkasan data ${format(new Date(), 'EEEE, dd MMMM yyyy')}`}
    >
      <div className="space-y-6 animate-fade-in">
        {/* Quick Add */}
        <QuickAddRecording />

        {/* Summary Cards */}
        {isLoading ? (
          <LoadingState />
        ) : hasError ? (
          <EmptyState
            title="Gagal memuat data"
            description="Silakan coba lagi beberapa saat."
          />
        ) : (
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
        )}

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
