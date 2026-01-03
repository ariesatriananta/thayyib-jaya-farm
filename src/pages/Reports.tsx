import { useState, useMemo } from 'react';
import { format, subDays } from 'date-fns';
import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
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
import { LoadingState } from '@/components/common/LoadingState';
import { buildReportData } from '@/lib/domain/reporting';
import { getHDPStatus } from '@/lib/domain/calculations';
import { BarChart3, TrendingUp, Trophy, Filter } from 'lucide-react';
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
import { useQuery } from '@tanstack/react-query';
import { getKandangAll } from '@/services/api/kandang';
import { getRecordings } from '@/services/api/recordings';

const Reports = () => {
  const [filters, setFilters] = useState({
    startDate: format(subDays(new Date(), 30), 'yyyy-MM-dd'),
    endDate: format(new Date(), 'yyyy-MM-dd'),
    kandangId: 'all' as string,
  });
  const [showFilters, setShowFilters] = useState(true);

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

  const reportData = useMemo(() => {
    if (kandangLoading || recordingsLoading) {
      return { dailyMetrics: [], trendData: [], ranking: [] };
    }
    return buildReportData(filters, kandangList, recordings);
  }, [filters, kandangList, recordings, kandangLoading, recordingsLoading]);

  const { dailyMetrics, trendData, ranking } = reportData;
  const isLoading = kandangLoading || recordingsLoading;
  const hasError = kandangError || recordingsError;

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
                  <Select
                    value={filters.kandangId}
                    onValueChange={(value) => setFilters({ ...filters, kandangId: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih kandang" />
                    </SelectTrigger>
                    <SelectContent className="bg-popover">
                      <SelectItem value="all">Semua Kandang</SelectItem>
                      {kandangList.map((k) => (
                        <SelectItem key={k.id} value={k.id}>{k.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          )}
        </Card>

        {isLoading ? (
          <LoadingState />
        ) : hasError ? (
          <EmptyState
            title="Gagal memuat data"
            description="Silakan coba lagi beberapa saat."
            icon={<BarChart3 className="w-8 h-8 text-muted-foreground" />}
          />
        ) : dailyMetrics.length === 0 ? (
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
                        <Bar yAxisId="right" dataKey="feedUsedKg" name="Pakan (kg)" fill="hsl(var(--chart-2))" radius={[4, 4, 0, 0]} />
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
            </TabsContent>

            {/* Table Tab */}
            <TabsContent value="table">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">
                    Rekap Data ({dailyMetrics.length} record)
                  </CardTitle>
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
                          <TableHead className="text-right">Telur (kg)</TableHead>
                          <TableHead className="text-right">Telur (butir)</TableHead>
                          <TableHead className="text-right">FCR</TableHead>
                          <TableHead className="text-right">HDP%</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Keterangan</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {dailyMetrics.map((m, idx) => (
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
                            <TableCell className="text-right">{m.eggsKg}</TableCell>
                            <TableCell className="text-right">{m.eggsCount.toLocaleString()}</TableCell>
                            <TableCell className="text-right">{m.fcr}</TableCell>
                            <TableCell className="text-right">{m.hdpPercent}%</TableCell>
                            <TableCell>
                              <StatusBadge status={getHDPStatus(m.hdpPercent)} size="sm" />
                            </TableCell>
                            <TableCell className="max-w-32 truncate">{m.notes || '-'}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
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
