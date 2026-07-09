"use client";

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { format, subDays } from 'date-fns';
import { AppLayout } from '@/components/layout/AppLayout';
import Loading from './loading';
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
import { StatusBadge } from '@/components/common/StatusBadge';
import { EmptyState } from '@/components/common/EmptyState';
import { Plus, Edit, Trash2, Filter } from 'lucide-react';
import { kandangService } from '@/lib/services/kandangService';
import { recordingService } from '@/lib/services/recordingService';
import { getHDPStatus } from '@/lib/mock/calculations';
import { useToast } from '@/hooks/use-toast';
import type { DailyMetrics, Kandang } from '@/lib/mock/types';
import { signalNavigationDone } from '@/lib/ui/navigationProgress';
import { useSession } from 'next-auth/react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

const RecordingsClient = () => {
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const { data: session } = useSession();
  const role = session?.user?.role;

  const [filters, setFilters] = useState({
    startDate: format(subDays(new Date(), 7), 'yyyy-MM-dd'),
    endDate: format(new Date(), 'yyyy-MM-dd'),
    kandangId: searchParams.get('kandang') || 'all',
  });
  const [showFilters, setShowFilters] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [kandangList, setKandangList] = useState<Kandang[]>([]);
  const [metrics, setMetrics] = useState<DailyMetrics[]>([]);
  const [visibleRows, setVisibleRows] = useState(50);
  const [isLoading, setIsLoading] = useState(true);
  const [kandangLoaded, setKandangLoaded] = useState(false);
  const [metricsLoaded, setMetricsLoaded] = useState(false);
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

  useEffect(() => {
    let isMounted = true;
    const isInitialLoad = initialLoadRef.current;
    recordingService.getMetricsByDateRange(
      filters.startDate,
      filters.endDate,
      filters.kandangId === 'all' ? undefined : filters.kandangId
    )
      .then((data) => {
        if (isMounted) setMetrics(data);
      })
      .catch(() => {
        if (isMounted) setMetrics([]);
      })
      .finally(() => {
        if (!isMounted || !isInitialLoad) return;
        setMetricsLoaded(true);
      });
    return () => {
      isMounted = false;
    };
  }, [filters.startDate, filters.endDate, filters.kandangId, refreshKey]);

  useEffect(() => {
    setVisibleRows(50);
  }, [filters.startDate, filters.endDate, filters.kandangId]);

  useEffect(() => {
    if (!kandangLoaded || !metricsLoaded) return;
    if (!isLoading) return;
    initialLoadRef.current = false;
    setIsLoading(false);
    signalNavigationDone();
  }, [isLoading, kandangLoaded, metricsLoaded]);

  const handleDelete = async (id: string) => {
    const result = await recordingService.delete(id);
    if (result.success) {
      toast({
        title: 'Berhasil',
        description: 'Data pencatatan berhasil dihapus.',
      });
      setRefreshKey(prev => prev + 1);
    } else {
      toast({
        title: 'Error',
        description: 'Gagal menghapus data.',
        variant: 'destructive',
      });
    }
  };

  if (isLoading) {
    return <Loading />;
  }

  if (role === 'staff' && kandangList.length === 0) {
    return (
      <AppLayout title="Pencatatan Harian" subtitle="Kelola data pencatatan harian kandang">
        <EmptyState
          title="Belum ada akses kandang"
          description="Hubungi admin untuk menambahkan akses kandang pada akun Anda."
        />
      </AppLayout>
    );
  }

  return (
    <AppLayout title="Pencatatan Harian" subtitle="Kelola data pencatatan harian kandang">
      <div className="space-y-6 animate-fade-in">
        {/* Header Actions */}
        <div className="flex flex-col sm:flex-row gap-4 justify-between">
          <Button
            variant="outline"
            onClick={() => setShowFilters(!showFilters)}
            className="gap-2"
          >
            <Filter className="w-4 h-4" />
            Filter
          </Button>
          <Link href="/recordings/new">
            <Button className="gap-2 w-full sm:w-auto">
              <Plus className="w-4 h-4" />
              Tambah Pencatatan
            </Button>
          </Link>
        </div>

        {/* Filters */}
        {showFilters && (
          <Card>
            <CardContent className="pt-6">
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
          </Card>
        )}

        {/* Table */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">
              Data Pencatatan ({metrics.length} record)
            </CardTitle>
          </CardHeader>
          <CardContent>
            {metrics.length === 0 ? (
              <EmptyState
                title="Belum ada data pencatatan"
                description="Mulai dengan menambahkan pencatatan harian pertama."
                action={
                  <Link href="/recordings/new">
                    <Button>Tambah Pencatatan</Button>
                  </Link>
                }
              />
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Tanggal</TableHead>
                      <TableHead>Hari</TableHead>
                      <TableHead>Kandang</TableHead>
                      <TableHead className="text-right">Ayam</TableHead>
                      <TableHead className="text-right">Mati</TableHead>
                      <TableHead className="text-right">Pakan (kg)</TableHead>
                      {role === 'admin' && <TableHead className="text-right">Harga Pakan</TableHead>}
                      <TableHead className="text-right">Telur (kg)</TableHead>
                      <TableHead className="text-right">Telur (butir)</TableHead>
                      <TableHead className="text-right">Telur Putih (kg)</TableHead>
                      <TableHead className="text-right">Telur Putih (butir)</TableHead>
                      <TableHead className="text-right">Telur BS (butir)</TableHead>
                      {role === 'admin' && <TableHead className="text-right">Harga Telur</TableHead>}
                      <TableHead className="text-right">FCR</TableHead>
                      <TableHead className="text-right">HDP%</TableHead>
                      <TableHead>Status</TableHead>
                      {role === 'admin' && <TableHead className="text-right">HPP</TableHead>}
                      {role === 'admin' && <TableHead className="text-right">Profit</TableHead>}
                      <TableHead className="text-right">Aksi</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {metrics.slice(0, visibleRows).map((m) => (
                      <TableRow key={`${m.date}-${m.kandangId}`}>
                        <TableCell className="font-medium">
                          {format(new Date(m.date), 'dd/MM/yyyy')}
                        </TableCell>
                        <TableCell>{m.dayName}</TableCell>
                        <TableCell>{m.kandangName}</TableCell>
                        <TableCell className="text-right">{m.totalChickenToday.toLocaleString()}</TableCell>
                        <TableCell className="text-right">{m.deadChickenCount}</TableCell>
                        <TableCell className="text-right">{m.feedUsedKg}</TableCell>
                        {role === 'admin' && (
                          <TableCell className="text-right">
                            Rp {Math.round(m.feedPriceKg).toLocaleString('id-ID')}
                          </TableCell>
                        )}
                        <TableCell className="text-right">{m.eggsKg}</TableCell>
                        <TableCell className="text-right">{m.eggsCount.toLocaleString()}</TableCell>
                        <TableCell className="text-right">{m.whiteEggsKg}</TableCell>
                        <TableCell className="text-right">{m.whiteEggsCount.toLocaleString()}</TableCell>
                        <TableCell className="text-right">{m.brokenEggsCount.toLocaleString()}</TableCell>
                        {role === 'admin' && (
                          <TableCell className="text-right">
                            Rp {Math.round(m.eggsPriceKg).toLocaleString('id-ID')}
                          </TableCell>
                        )}
                        <TableCell className="text-right">{m.fcr}</TableCell>
                        <TableCell className="text-right">{m.hdpPercent}%</TableCell>
                        <TableCell>
                          <StatusBadge status={getHDPStatus(m.hdpPercent)} size="sm" />
                        </TableCell>
                        {role === 'admin' && (
                          <TableCell className="text-right">
                            Rp {Math.round(
                              m.totalEggsKg > 0
                                ? (m.feedInKg * m.feedPriceKg) / m.totalEggsKg
                                : 0
                            ).toLocaleString('id-ID')}
                          </TableCell>
                        )}
                        {role === 'admin' && (
                          <TableCell className="text-right">
                            Rp {Math.round(m.hpp).toLocaleString('id-ID')}
                          </TableCell>
                        )}
                        <TableCell className="text-right">
                          <div className="flex gap-1 justify-end">
                            {m.recordingId && (
                              <>
                                <Link href={`/recordings/${m.recordingId}`}>
                                  <Button variant="ghost" size="icon" className="h-8 w-8">
                                    <Edit className="h-4 w-4" />
                                  </Button>
                                </Link>
                                <AlertDialog>
                                  <AlertDialogTrigger asChild>
                                    <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive">
                                      <Trash2 className="h-4 w-4" />
                                    </Button>
                                  </AlertDialogTrigger>
                                  <AlertDialogContent>
                                    <AlertDialogHeader>
                                      <AlertDialogTitle>Hapus Pencatatan?</AlertDialogTitle>
                                      <AlertDialogDescription>
                                        Data pencatatan ini akan dihapus permanen dan tidak dapat dikembalikan.
                                      </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                      <AlertDialogCancel>Batal</AlertDialogCancel>
                                      <AlertDialogAction onClick={() => handleDelete(m.recordingId!)}>
                                        Hapus
                                      </AlertDialogAction>
                                    </AlertDialogFooter>
                                  </AlertDialogContent>
                                </AlertDialog>
                              </>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                {metrics.length > visibleRows && (
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
            )}
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
};

export default RecordingsClient;
