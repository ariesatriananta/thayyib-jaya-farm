"use client";

import { useEffect, useMemo, useState } from 'react';
import { format } from 'date-fns';
import { AppLayout } from '@/components/layout/AppLayout';
import { StatCard } from '@/components/common/StatCard';
import { KandangStatusGrid } from '@/components/dashboard/KandangStatusGrid';
import { PerformanceList } from '@/components/dashboard/PerformanceList';
import { QuickAddRecording } from '@/components/dashboard/QuickAddRecording';
import { reportService } from '@/lib/services/reportService';
import { kandangService } from '@/lib/services/kandangService';
import { Egg, Wheat, Skull, TrendingUp, Activity, Coins, Receipt, BadgeDollarSign, Package, Loader2, Calculator } from 'lucide-react';
import type { DashboardSummary, KandangStatus, Kandang } from '@/lib/mock/types';
import Loading from './loading';
import { signalNavigationDone } from '@/lib/ui/navigationProgress';
import { useSession } from 'next-auth/react';
import { EmptyState } from '@/components/common/EmptyState';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Filter } from 'lucide-react';
import { recordingService } from '@/lib/services/recordingService';
import { Checkbox } from '@/components/ui/checkbox';

const Dashboard = () => {
  const today = useMemo(() => format(new Date(), 'yyyy-MM-dd'), []);
  const { data: session } = useSession();
  const role = session?.user?.role;
  const [selectedStartDate, setSelectedStartDate] = useState(today);
  const [selectedEndDate, setSelectedEndDate] = useState(today);
  const [appliedStartDate, setAppliedStartDate] = useState(today);
  const [appliedEndDate, setAppliedEndDate] = useState(today);
  const [latestDate, setLatestDate] = useState<string | null>(null);
  const [showFilter, setShowFilter] = useState(false);
  const [filterNonce, setFilterNonce] = useState(0);
  const [hasManualFilter, setHasManualFilter] = useState(false);
  const [isApplyingFilter, setIsApplyingFilter] = useState(false);
  const [selectedKandangIds, setSelectedKandangIds] = useState<string[]>([]);
  const [appliedKandangIds, setAppliedKandangIds] = useState<string[]>([]);
  const [hasInitKandangFilter, setHasInitKandangFilter] = useState(false);
  const [summary, setSummary] = useState<DashboardSummary>({
    totalEggsKg: 0,
    totalEggsCount: 0,
    totalFeedIn: 0,
    totalFeedUsed: 0,
    totalDeadChickens: 0,
    totalEggsRevenue: 0,
    totalFeedCost: 0,
    totalHpp: 0,
    averageFCR: 0,
    averageHDP: 0,
    kandangCount: 0,
    activeKandangCount: 0,
  });
  const [kandangStatuses, setKandangStatuses] = useState<KandangStatus[]>([]);
  const [topPerformers, setTopPerformers] = useState<KandangStatus[]>([]);
  const [bottomPerformers, setBottomPerformers] = useState<KandangStatus[]>([]);
  const [kandangList, setKandangList] = useState<Kandang[]>([]);
  const [kandangLoaded, setKandangLoaded] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const nilaiHpp = summary.totalEggsKg > 0
    ? Math.round(summary.totalFeedCost / summary.totalEggsKg)
    : 0;
  const defaultKandangIds = useMemo(
    () => kandangList.map((item) => item.id),
    [kandangList]
  );
  const effectiveKandangIds = useMemo(
    () => (appliedKandangIds.length ? appliedKandangIds : defaultKandangIds),
    [appliedKandangIds, defaultKandangIds]
  );
  const hasNoAccess = role === 'staff' && kandangLoaded && kandangList.length === 0;
  const periodLabel = useMemo(() => {
    if (appliedStartDate === appliedEndDate) {
      return `Periode ${format(new Date(appliedStartDate), 'dd MMM yyyy')}`;
    }
    return `Periode ${format(new Date(appliedStartDate), 'dd MMM yyyy')} - ${format(new Date(appliedEndDate), 'dd MMM yyyy')}`;
  }, [appliedEndDate, appliedStartDate]);

  useEffect(() => {
    let isMounted = true;
    kandangService.getAll()
      .then((data) => {
        if (!isMounted) return;
        setKandangList(data);
      })
      .catch(() => {
        // Keep empty list on error.
      })
      .finally(() => {
        if (isMounted) setKandangLoaded(true);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    if (!hasInitKandangFilter && kandangList.length > 0) {
      setSelectedKandangIds(defaultKandangIds);
      setAppliedKandangIds(defaultKandangIds);
      setHasInitKandangFilter(true);
    }
  }, [defaultKandangIds, hasInitKandangFilter, kandangList.length]);

  useEffect(() => {
    let isMounted = true;
    if (hasNoAccess) {
      setLatestDate(null);
      return () => {
        isMounted = false;
      };
    }
    recordingService.getLatestDate(effectiveKandangIds.length ? effectiveKandangIds : undefined)
      .then((date) => {
        if (!isMounted) return;
        setLatestDate(date);
        if (!hasManualFilter && date && date !== today && appliedStartDate === today && appliedEndDate === today) {
          setSelectedStartDate(date);
          setSelectedEndDate(date);
          setAppliedStartDate(date);
          setAppliedEndDate(date);
        }
      })
      .catch(() => {
        // Keep default date on error.
      });
    return () => {
      isMounted = false;
    };
  }, [appliedEndDate, appliedStartDate, effectiveKandangIds, hasNoAccess, today]);

  const handleApplyFilter = async () => {
    setIsApplyingFilter(true);
    const nextIds = selectedKandangIds.length
      ? selectedKandangIds
      : defaultKandangIds;
    let nextStartDate = selectedStartDate || today;
    let nextEndDate = selectedEndDate || today;
    if (nextStartDate > nextEndDate) {
      nextEndDate = nextStartDate;
      setSelectedEndDate(nextStartDate);
    }
    const allowFallback = !hasManualFilter;
    setHasManualFilter(true);

    try {
      if (allowFallback && nextStartDate === today && nextEndDate === today) {
        try {
          const latest = await recordingService.getLatestDate(nextIds);
          if (latest && latest !== today) {
            setLatestDate(latest);
            setSelectedStartDate(latest);
            setSelectedEndDate(latest);
            setAppliedStartDate(latest);
            setAppliedEndDate(latest);
          } else {
            setAppliedStartDate(nextStartDate);
            setAppliedEndDate(nextEndDate);
          }
        } catch {
          setAppliedStartDate(nextStartDate);
          setAppliedEndDate(nextEndDate);
        }
      } else {
        setAppliedStartDate(nextStartDate);
        setAppliedEndDate(nextEndDate);
      }
    } finally {
      setIsApplyingFilter(false);
    }

    setAppliedKandangIds(nextIds);
    setFilterNonce((prev) => prev + 1);
  };

  const handleResetFilter = () => {
    setSelectedKandangIds(defaultKandangIds);
    setAppliedKandangIds(defaultKandangIds);
    setSelectedStartDate(today);
    setSelectedEndDate(today);
    setAppliedStartDate(today);
    setAppliedEndDate(today);
  };

  useEffect(() => {
    if (!kandangLoaded) return;
    if (hasNoAccess) {
      setSummary((prev) => ({ ...prev }));
      setKandangStatuses([]);
      setTopPerformers([]);
      setBottomPerformers([]);
      setIsLoading(false);
      signalNavigationDone();
      return;
    }

    let isMounted = true;
    setIsLoading(true);

    Promise.all([
      reportService.getDashboardSummary(appliedStartDate, appliedEndDate, effectiveKandangIds),
      reportService.getKandangStatuses(appliedStartDate, appliedEndDate, effectiveKandangIds),
      reportService.getTopPerformers(appliedStartDate, appliedEndDate, 3, effectiveKandangIds),
      reportService.getBottomPerformers(appliedStartDate, appliedEndDate, 3, effectiveKandangIds),
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
  }, [appliedEndDate, appliedStartDate, effectiveKandangIds, filterNonce, hasNoAccess, kandangLoaded]);

  if (isLoading) {
    return <Loading />;
  }

  if (hasNoAccess) {
    return (
      <AppLayout
        title="Dashboard"
        subtitle={`Ringkasan data ${format(new Date(), 'EEEE, dd MMMM yyyy')}`}
      >
        <EmptyState
          title="Belum ada akses kandang"
          description="Hubungi admin untuk menambahkan akses kandang pada akun Anda."
        />
      </AppLayout>
    );
  }

  return (
    <AppLayout 
      title="Dashboard" 
      subtitle={
        appliedStartDate === appliedEndDate
          ? `Ringkasan data ${format(new Date(appliedStartDate), 'EEEE, dd MMMM yyyy')}`
          : `Ringkasan data ${format(new Date(appliedStartDate), 'dd MMM yyyy')} - ${format(new Date(appliedEndDate), 'dd MMM yyyy')}`
      }
    >
      <div className="space-y-6 animate-fade-in">
        {/* Quick Add */}
        <div className="flex flex-wrap items-start justify-between gap-3">
          <QuickAddRecording />
          <Button
            variant="outline"
            className="gap-2 bg-background"
            onClick={() => setShowFilter((prev) => !prev)}
          >
            <Filter className="w-4 h-4" />
            Filter By
            <span className="rounded-full border border-border bg-muted px-2 py-0.5 text-[11px] font-semibold text-muted-foreground">
              {effectiveKandangIds.length} Kandang
            </span>
          </Button>
        </div>

        {showFilter && (
          <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
              <div className="space-y-2">
                <Label>Tanggal</Label>
                <div className="grid gap-2 sm:grid-cols-2">
                  <div className="space-y-1">
                    <Label className="text-xs text-muted-foreground">Dari</Label>
                    <Input
                      type="date"
                      value={selectedStartDate}
                      onChange={(e) => setSelectedStartDate(e.target.value)}
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs text-muted-foreground">Sampai</Label>
                    <Input
                      type="date"
                      value={selectedEndDate}
                      onChange={(e) => setSelectedEndDate(e.target.value)}
                    />
                  </div>
                </div>
                {latestDate && (selectedStartDate !== latestDate || selectedEndDate !== latestDate) && (
                  <p className="text-xs text-muted-foreground">
                    Data terakhir tersedia: {format(new Date(latestDate), 'dd MMMM yyyy')}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label>Kandang</Label>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  <label className="flex items-center gap-2 rounded-lg border border-border px-3 py-2 text-sm">
                    <Checkbox
                      checked={
                        selectedKandangIds.length === kandangList.length && kandangList.length > 0
                          ? true
                          : selectedKandangIds.length > 0
                            ? 'indeterminate'
                            : false
                      }
                      onCheckedChange={(checked) => {
                        if (checked === true) {
                          setSelectedKandangIds(defaultKandangIds);
                        } else {
                          setSelectedKandangIds([]);
                        }
                      }}
                    />
                    Semua kandang
                  </label>
                  {kandangList.map((item) => (
                    <label
                      key={item.id}
                      className="flex items-center gap-2 rounded-lg border border-border px-3 py-2 text-sm"
                    >
                      <Checkbox
                        checked={selectedKandangIds.includes(item.id)}
                        onCheckedChange={() => {
                          setSelectedKandangIds((prev) => {
                            const next = prev.includes(item.id)
                              ? prev.filter((id) => id !== item.id)
                              : [...prev, item.id];
                            return next;
                          });
                        }}
                      />
                      {item.name}
                    </label>
                  ))}
                </div>
              </div>
            </div>
            <div className="mt-4 flex flex-wrap items-center gap-3">
              <Button onClick={handleApplyFilter} disabled={isApplyingFilter}>
                {isApplyingFilter ? <Loader2 className="h-4 w-4 animate-spin" /> : "Terapkan"}
              </Button>
              <Button variant="outline" onClick={handleResetFilter}>
                Reset
              </Button>
            </div>
          </div>
        )}

        {/* Summary Cards */}
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          <span>Ringkasan</span>
          <span className="rounded-full border border-border bg-muted px-2 py-0.5 text-[10px] font-semibold uppercase text-muted-foreground">
            {periodLabel}
          </span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
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
            title="Pakan Masuk"
            value={`${summary.totalFeedIn} kg`}
            animatedNumber={summary.totalFeedIn}
            animationDurationMs={2000}
            valueSuffix=" kg"
            valueFormatter={(value) => value.toFixed(1)}
            revealDelayMs={140}
            revealDurationMs={800}
            revealEasing="cubic-bezier(0.16, 1, 0.3, 1)"
            icon={Package}
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
          {role === 'admin' && (
            <StatCard
              title="Revenue Telur"
              value={`Rp ${summary.totalEggsRevenue.toLocaleString('id-ID')}`}
              animatedNumber={summary.totalEggsRevenue}
              animationDurationMs={2000}
              valuePrefix="Rp "
              valueFormatter={(value) => Math.round(value).toLocaleString('id-ID')}
              revealDelayMs={440}
              revealDurationMs={1040}
              revealEasing="cubic-bezier(0.16, 1, 0.3, 1)"
              icon={Coins}
              valueClassName="text-xl"
            />
          )}
          {role === 'admin' && (
            <StatCard
              title="Biaya Pakan"
              value={`Rp ${summary.totalFeedCost.toLocaleString('id-ID')}`}
              animatedNumber={summary.totalFeedCost}
              animationDurationMs={2000}
              valuePrefix="Rp "
              valueFormatter={(value) => Math.round(value).toLocaleString('id-ID')}
              revealDelayMs={480}
              revealDurationMs={1080}
              revealEasing="cubic-bezier(0.16, 1, 0.3, 1)"
              icon={Receipt}
              valueClassName="text-xl"
            />
          )}
          {role === 'admin' && (
            <StatCard
              title="Total Profit"
              value={`Rp ${summary.totalHpp.toLocaleString('id-ID')}`}
              animatedNumber={summary.totalHpp}
              animationDurationMs={2000}
              valuePrefix="Rp "
              valueFormatter={(value) => Math.round(value).toLocaleString('id-ID')}
              revealDelayMs={520}
              revealDurationMs={1120}
              revealEasing="cubic-bezier(0.16, 1, 0.3, 1)"
              icon={BadgeDollarSign}
              valueClassName="text-xl"
            />
          )}
          {role === 'admin' && (
            <StatCard
              title="Nilai HPP"
              value={`Rp ${nilaiHpp.toLocaleString('id-ID')}`}
              animatedNumber={nilaiHpp}
              animationDurationMs={2000}
              valuePrefix="Rp "
              valueFormatter={(value) => Math.round(value).toLocaleString('id-ID')}
              revealDelayMs={560}
              revealDurationMs={1160}
              revealEasing="cubic-bezier(0.16, 1, 0.3, 1)"
              icon={Calculator}
              valueClassName="text-xl"
            />
          )}
        </div>

        {/* Performance Lists */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <PerformanceList
            title="Top 3 Kandang (HDP Tertinggi)"
            statuses={topPerformers}
            variant="top"
            periodLabel={periodLabel}
          />
          <PerformanceList
            title="3 Kandang Perlu Perhatian"
            statuses={bottomPerformers}
            variant="bottom"
            periodLabel={periodLabel}
          />
        </div>

        {/* Kandang Status Grid */}
        <div>
          <div className="mb-4 flex items-center gap-2">
            <h2 className="text-lg font-semibold">Status Semua Kandang</h2>
            <span className="rounded-full border border-border bg-muted px-2 py-0.5 text-[10px] font-semibold uppercase text-muted-foreground">
              {periodLabel}
            </span>
          </div>
          <KandangStatusGrid statuses={kandangStatuses} />
        </div>
      </div>
    </AppLayout>
  );
};

export default Dashboard;
