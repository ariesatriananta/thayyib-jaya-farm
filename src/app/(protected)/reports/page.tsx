"use client";

import { useEffect, useMemo, useRef, useState } from 'react';
import { format, subDays } from 'date-fns';
import { AppLayout } from '@/components/layout/AppLayout';
import Loading from './loading';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { StatusBadge } from '@/components/common/StatusBadge';
import { EmptyState } from '@/components/common/EmptyState';
import { kandangService } from '@/lib/services/kandangService';
import { reportService } from '@/lib/services/reportService';
import { getHDPStatus } from '@/lib/mock/calculations';
import { BarChart3, TrendingUp, Trophy, Filter, Download, Loader2 } from 'lucide-react';
import type { DailyMetrics, Kandang, RankingEntry } from '@/lib/mock/types';
import { signalNavigationDone } from '@/lib/ui/navigationProgress';
import { useSession } from 'next-auth/react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  BarChart,
  Bar,
} from 'recharts';

const Reports = () => {
  const [isLoading, setIsLoading] = useState(true);
  const { data: session } = useSession();
  const role = session?.user?.role;
  const isAdmin = role === 'admin';
  const [filters, setFilters] = useState({
    startDate: format(subDays(new Date(), 30), 'yyyy-MM-dd'),
    endDate: format(new Date(), 'yyyy-MM-dd'),
    kandangId: 'all' as string,
    kandangIds: undefined as string[] | undefined,
  });
  const [showFilters, setShowFilters] = useState(true);
  const [kandangList, setKandangList] = useState<Kandang[]>([]);
  const [selectedKandangIds, setSelectedKandangIds] = useState<string[]>([]);
  const [hasInitKandangFilter, setHasInitKandangFilter] = useState(false);
  const [dailyMetrics, setDailyMetrics] = useState<DailyMetrics[]>([]);
  const [visibleRows, setVisibleRows] = useState(50);
  const [trendData, setTrendData] = useState<{
    date: string;
    eggsKg: number;
    feedInKg: number;
    feedUsedKg: number;
    hdpPercent: number;
    feedCost: number;
    eggsRevenue: number;
    hpp: number;
  }[]>([]);
  const [ranking, setRanking] = useState<RankingEntry[]>([]);
  const [kandangLoaded, setKandangLoaded] = useState(false);
  const [reportLoaded, setReportLoaded] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const initialLoadRef = useRef(true);

  useEffect(() => {
    let isMounted = true;
    kandangService.getAll()
      .then((data) => {
        if (isMounted) setKandangList(data);
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

  const allKandangIds = useMemo(() => kandangList.map((k) => k.id), [kandangList]);

  useEffect(() => {
    if (hasInitKandangFilter) return;
    if (kandangList.length === 0) return;
    setSelectedKandangIds(allKandangIds);
    setFilters((prev) => ({ ...prev, kandangIds: allKandangIds, kandangId: 'all' }));
    setHasInitKandangFilter(true);
  }, [allKandangIds, hasInitKandangFilter, kandangList.length]);

  useEffect(() => {
    let isMounted = true;
    const isInitialLoad = initialLoadRef.current;
    reportService.getReportData(filters)
      .then((data) => {
        if (!isMounted) return;
        setDailyMetrics(data.dailyMetrics);
        setTrendData(data.trendData);
        setRanking(data.ranking);
      })
      .catch(() => {
        if (!isMounted) return;
        setDailyMetrics([]);
        setTrendData([]);
        setRanking([]);
      })
      .finally(() => {
        if (!isMounted || !isInitialLoad) return;
        setReportLoaded(true);
      });
    return () => {
      isMounted = false;
    };
  }, [filters]);

  useEffect(() => {
    setVisibleRows(50);
  }, [filters.startDate, filters.endDate, filters.kandangId, filters.kandangIds]);

  useEffect(() => {
    if (!kandangLoaded || !reportLoaded) return;
    if (!isLoading) return;
    initialLoadRef.current = false;
    setIsLoading(false);
    signalNavigationDone();
  }, [isLoading, kandangLoaded, reportLoaded]);

  if (isLoading) {
    return <Loading />;
  }

  if (role === 'staff' && kandangList.length === 0) {
    return (
      <AppLayout title="Laporan & Analisis" subtitle="Analisis performa kandang">
        <EmptyState
          title="Belum ada akses kandang"
          description="Hubungi admin untuk menambahkan akses kandang pada akun Anda."
        />
      </AppLayout>
    );
  }

  return (
    <AppLayout title="Laporan & Analisis" subtitle="Analisis performa kandang">
      <div className="space-y-6 animate-fade-in">
        {/* Filters */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base flex items-center gap-2">
                <Filter className="w-5 h-5" />
                Filter Laporan
              </CardTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowFilters(!showFilters)}
              >
                {showFilters ? 'Sembunyikan' : 'Tampilkan'}
              </Button>
            </div>
          </CardHeader>
          {showFilters && (
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Tanggal Mulai</Label>
                  <Input
                    type="date"
                    value={filters.startDate}
                    onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Tanggal Akhir</Label>
                  <Input
                    type="date"
                    value={filters.endDate}
                    onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Kandang</Label>
                  <div className="space-y-2">
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
                            setSelectedKandangIds(allKandangIds);
                            setFilters((prev) => ({ ...prev, kandangIds: allKandangIds, kandangId: 'all' }));
                          } else {
                            setSelectedKandangIds([]);
                            setFilters((prev) => ({ ...prev, kandangIds: [], kandangId: 'all' }));
                          }
                        }}
                      />
                      Semua kandang
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {kandangList.map((k) => (
                        <label
                          key={k.id}
                          className="flex items-center gap-2 rounded-lg border border-border px-3 py-2 text-sm"
                        >
                          <Checkbox
                            checked={selectedKandangIds.includes(k.id)}
                            onCheckedChange={() => {
                              setSelectedKandangIds((prev) => {
                                const next = prev.includes(k.id)
                                  ? prev.filter((id) => id !== k.id)
                                  : [...prev, k.id];
                                setFilters((current) => ({ ...current, kandangIds: next, kandangId: 'all' }));
                                return next;
                              });
                            }}
                          />
                          {k.name}
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          )}
        </Card>

        {dailyMetrics.length === 0 ? (
          <EmptyState
            title="Tidak ada data"
            description="Tidak ditemukan data untuk periode dan kandang yang dipilih."
            icon={<BarChart3 className="w-8 h-8 text-muted-foreground" />}
          />
        ) : (
          <Tabs defaultValue="charts" className="space-y-6">
            <TabsList className="grid w-full max-w-md grid-cols-3">
              <TabsTrigger value="charts">Grafik</TabsTrigger>
              <TabsTrigger value="table">Tabel</TabsTrigger>
              <TabsTrigger value="ranking">Ranking</TabsTrigger>
            </TabsList>

            {/* Charts Tab */}
            <TabsContent value="charts" className="space-y-6">
              {/* Production Trend */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <BarChart3 className="w-5 h-5" />
                    Tren Produksi Telur & Pakan
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={trendData}>
                        <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                        <XAxis 
                          dataKey="date" 
                          tickFormatter={(value) => format(new Date(value), 'dd/MM')}
                          className="text-xs"
                        />
                        <YAxis yAxisId="left" className="text-xs" />
                        <YAxis yAxisId="right" orientation="right" className="text-xs" />
                        <Tooltip 
                          labelFormatter={(value) => format(new Date(value), 'dd MMM yyyy')}
                          contentStyle={{ 
                            backgroundColor: 'hsl(var(--card))', 
                            border: '1px solid hsl(var(--border))',
                            borderRadius: '0.5rem'
                          }}
                        />
                        <Legend />
                        <Bar yAxisId="left" dataKey="eggsKg" name="Telur (kg)" fill="hsl(var(--chart-1))" radius={[4, 4, 0, 0]} />
                        <Bar yAxisId="right" dataKey="feedInKg" name="Pakan Masuk (kg)" fill="hsl(var(--chart-2))" radius={[4, 4, 0, 0]} />
                        <Bar yAxisId="right" dataKey="feedUsedKg" name="Pakan Terpakai (kg)" fill="hsl(var(--chart-3))" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              {/* HDP Trend */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <TrendingUp className="w-5 h-5" />
                    Tren HDP%
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={trendData}>
                        <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                        <XAxis 
                          dataKey="date" 
                          tickFormatter={(value) => format(new Date(value), 'dd/MM')}
                          className="text-xs"
                        />
                        <YAxis domain={[0, 100]} className="text-xs" />
                        <Tooltip 
                          labelFormatter={(value) => format(new Date(value), 'dd MMM yyyy')}
                          contentStyle={{ 
                            backgroundColor: 'hsl(var(--card))', 
                            border: '1px solid hsl(var(--border))',
                            borderRadius: '0.5rem'
                          }}
                        />
                        <Legend />
                        <Line 
                          type="monotone" 
                          dataKey="hdpPercent" 
                          name="HDP %" 
                          stroke="hsl(var(--chart-1))" 
                          strokeWidth={2}
                          dot={{ r: 3 }}
                        />
                        {/* Target line */}
                        <Line 
                          type="monotone" 
                          dataKey={() => 85} 
                          name="Target (85%)" 
                          stroke="hsl(var(--muted-foreground))" 
                          strokeDasharray="5 5"
                          dot={false}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              {isAdmin && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2">
                      <BarChart3 className="w-5 h-5" />
                      Tren HPP & Harga
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-72">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={trendData}>
                          <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                          <XAxis
                            dataKey="date"
                            tickFormatter={(value) => format(new Date(value), 'dd/MM')}
                            className="text-xs"
                          />
                          <YAxis className="text-xs" />
                          <Tooltip
                            labelFormatter={(value) => format(new Date(value), 'dd MMM yyyy')}
                            formatter={(value: number, name) => [
                              `Rp ${value.toLocaleString('id-ID')}`,
                              name as string,
                            ]}
                            contentStyle={{
                              backgroundColor: 'hsl(var(--card))',
                              border: '1px solid hsl(var(--border))',
                              borderRadius: '0.5rem',
                            }}
                          />
                          <Legend />
                          <Line
                            type="monotone"
                            dataKey="eggsRevenue"
                            name="Total Harga Telur"
                            stroke="hsl(var(--chart-1))"
                            strokeWidth={2}
                            dot={false}
                          />
                          <Line
                            type="monotone"
                            dataKey="feedCost"
                            name="Total Harga Pakan"
                            stroke="hsl(var(--chart-2))"
                            strokeWidth={2}
                            dot={false}
                          />
                          <Line
                            type="monotone"
                            dataKey="hpp"
                            name="HPP"
                            stroke="hsl(var(--chart-3))"
                            strokeWidth={2}
                            dot={{ r: 2 }}
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            {/* Table Tab */}
            <TabsContent value="table">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between gap-4">
                  <CardTitle className="text-base">
                    Rekap Data ({dailyMetrics.length} record)
                  </CardTitle>
                  <Button
                    variant="outline"
                    className="gap-2"
                    onClick={async () => {
                      if (dailyMetrics.length === 0 || isExporting) return;
                      setIsExporting(true);
                      try {
                        const XLSX = await import('xlsx');
                        const exportRows = dailyMetrics.map((m) => {
                          const baseRow: Record<string, string | number> = {
                            Tanggal: format(new Date(m.date), 'dd/MM/yyyy'),
                            Hari: m.dayName,
                            Kandang: m.kandangName,
                            Minggu: `W${m.weekNumber}`,
                            Ayam: m.totalChickenToday,
                            Mati: m.deadChickenCount,
                            "Pakan In (kg)": m.feedInKg,
                            "Sisa Pakan (kg)": m.feedRemainingKg,
                            "Pakan Terpakai (kg)": m.feedUsedKg,
                          };

                          if (isAdmin) {
                            baseRow["Harga Pakan"] = Math.round(m.feedPriceKg);
                          }

                          baseRow["Telur (kg)"] = m.eggsKg;
                          baseRow["Telur (butir)"] = m.eggsCount;

                          if (isAdmin) {
                            baseRow["Harga Telur"] = Math.round(m.eggsPriceKg);
                          }

                          baseRow["FCR"] = m.fcr;
                          baseRow["HDP%"] = m.hdpPercent;
                          baseRow["Status"] = getHDPStatus(m.hdpPercent);

                          if (isAdmin) {
                            baseRow["HPP"] = Math.round(m.hpp);
                          }

                          baseRow["Keterangan"] = m.notes || "-";
                          baseRow["Created At"] = m.createdAt;
                          baseRow["Updated At"] = m.updatedAt;

                          return baseRow;
                        });

                        const worksheet = XLSX.utils.json_to_sheet(exportRows);
                        const workbook = XLSX.utils.book_new();
                        XLSX.utils.book_append_sheet(workbook, worksheet, "Report");
                        const buffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
                        const blob = new Blob([buffer], {
                          type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                        });
                        const url = window.URL.createObjectURL(blob);
                        const anchor = document.createElement("a");
                        anchor.href = url;
                        anchor.download = `laporan-${filters.startDate}-${filters.endDate}.xlsx`;
                        anchor.click();
                        window.URL.revokeObjectURL(url);
                      } finally {
                        setIsExporting(false);
                      }
                    }}
                    disabled={dailyMetrics.length === 0 || isExporting}
                  >
                    {isExporting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
                    Export Excel
                  </Button>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Tanggal</TableHead>
                          <TableHead>Hari</TableHead>
                          <TableHead>Kandang</TableHead>
                          <TableHead>Minggu</TableHead>
                          <TableHead className="text-right">Ayam</TableHead>
                          <TableHead className="text-right">Mati</TableHead>
                          <TableHead className="text-right">Pakan In</TableHead>
                          <TableHead className="text-right">Sisa</TableHead>
                          <TableHead className="text-right">Terpakai</TableHead>
                          {isAdmin && <TableHead className="text-right">Harga Pakan</TableHead>}
                          <TableHead className="text-right">Telur (kg)</TableHead>
                          <TableHead className="text-right">Telur (butir)</TableHead>
                          {isAdmin && <TableHead className="text-right">Harga Telur</TableHead>}
                          <TableHead className="text-right">FCR</TableHead>
                          <TableHead className="text-right">HDP%</TableHead>
                          <TableHead>Status</TableHead>
                          {isAdmin && <TableHead className="text-right">HPP</TableHead>}
                          <TableHead>Keterangan</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {dailyMetrics.slice(0, visibleRows).map((m, idx) => (
                          <TableRow key={idx}>
                            <TableCell className="font-medium whitespace-nowrap">
                              {format(new Date(m.date), 'dd/MM/yyyy')}
                            </TableCell>
                            <TableCell>{m.dayName}</TableCell>
                            <TableCell>{m.kandangName}</TableCell>
                            <TableCell>W{m.weekNumber}</TableCell>
                            <TableCell className="text-right">{m.totalChickenToday.toLocaleString()}</TableCell>
                            <TableCell className="text-right">{m.deadChickenCount}</TableCell>
                            <TableCell className="text-right">{m.feedInKg}</TableCell>
                            <TableCell className="text-right">{m.feedRemainingKg}</TableCell>
                            <TableCell className="text-right">{m.feedUsedKg}</TableCell>
                            {isAdmin && (
                              <TableCell className="text-right">
                                Rp {Math.round(m.feedPriceKg).toLocaleString('id-ID')}
                              </TableCell>
                            )}
                            <TableCell className="text-right">{m.eggsKg}</TableCell>
                            <TableCell className="text-right">{m.eggsCount.toLocaleString()}</TableCell>
                            {isAdmin && (
                              <TableCell className="text-right">
                                Rp {Math.round(m.eggsPriceKg).toLocaleString('id-ID')}
                              </TableCell>
                            )}
                            <TableCell className="text-right">{m.fcr}</TableCell>
                            <TableCell className="text-right">{m.hdpPercent}%</TableCell>
                            <TableCell>
                              <StatusBadge status={getHDPStatus(m.hdpPercent)} size="sm" />
                            </TableCell>
                            {isAdmin && (
                              <TableCell className="text-right">
                                Rp {m.hpp.toLocaleString('id-ID')}
                              </TableCell>
                            )}
                            <TableCell className="max-w-32 truncate">{m.notes || '-'}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                    {dailyMetrics.length > visibleRows && (
                      <div className="mt-4 flex justify-center">
                        <Button
                          variant="outline"
                          onClick={() => setVisibleRows((prev) => prev + 50)}
                        >
                          Muat lebih banyak
                        </Button>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Ranking Tab */}
            <TabsContent value="ranking">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <Trophy className="w-5 h-5" />
                    Ranking Kandang
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-16">Rank</TableHead>
                          <TableHead>Kandang</TableHead>
                          <TableHead className="text-right">Rata-rata HDP</TableHead>
                          <TableHead className="text-right">Rata-rata FCR</TableHead>
                          <TableHead className="text-right">Total Telur (kg)</TableHead>
                          <TableHead className="text-right">Total Pakan (kg)</TableHead>
                          <TableHead className="text-right">Jumlah Record</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {ranking.map((r, idx) => (
                          <TableRow key={r.kandangId}>
                            <TableCell>
                              <span className={`inline-flex items-center justify-center w-8 h-8 rounded-full text-sm font-semibold ${
                                idx === 0 ? 'bg-yellow-100 text-yellow-800' :
                                idx === 1 ? 'bg-gray-100 text-gray-800' :
                                idx === 2 ? 'bg-amber-100 text-amber-800' :
                                'bg-muted text-muted-foreground'
                              }`}>
                                {idx + 1}
                              </span>
                            </TableCell>
                            <TableCell className="font-medium">{r.kandangName}</TableCell>
                            <TableCell className="text-right">
                              <div className="flex items-center justify-end gap-2">
                                <StatusBadge status={getHDPStatus(r.averageHDP)} label={`${r.averageHDP}%`} size="sm" />
                              </div>
                            </TableCell>
                            <TableCell className="text-right">{r.averageFCR}</TableCell>
                            <TableCell className="text-right">{r.totalEggsKg.toLocaleString()}</TableCell>
                            <TableCell className="text-right">{r.totalFeedUsed.toLocaleString()}</TableCell>
                            <TableCell className="text-right">{r.recordCount}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        )}
      </div>
    </AppLayout>
  );
};

export default Reports;
