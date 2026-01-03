import { useState, useMemo } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
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
import { StatusBadge } from '@/components/common/StatusBadge';
import { EmptyState } from '@/components/common/EmptyState';
import { LoadingState } from '@/components/common/LoadingState';
import { Plus, Edit, Trash2, Filter } from 'lucide-react';
import { getHDPStatus } from '@/lib/domain/calculations';
import { buildMetricsByDateRange } from '@/lib/domain/reporting';
import { useToast } from '@/hooks/use-toast';
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
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { deleteRecording, getRecordings } from '@/services/api/recordings';
import { getKandangAll } from '@/services/api/kandang';

const Recordings = () => {
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [filters, setFilters] = useState({
    startDate: format(subDays(new Date(), 7), 'yyyy-MM-dd'),
    endDate: format(new Date(), 'yyyy-MM-dd'),
    kandangId: searchParams.get('kandang') || 'all',
  });
  const [showFilters, setShowFilters] = useState(false);

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

  const deleteMutation = useMutation({
    mutationFn: deleteRecording,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recordings'] });
      toast({
        title: 'Berhasil',
        description: 'Data pencatatan berhasil dihapus.',
      });
    },
    onError: () => {
      toast({
        title: 'Error',
        description: 'Gagal menghapus data.',
        variant: 'destructive',
      });
    },
  });

  const metrics = useMemo(() => {
    return buildMetricsByDateRange(
      filters.startDate,
      filters.endDate,
      filters.kandangId,
      kandangList,
      recordings
    );
  }, [filters.startDate, filters.endDate, filters.kandangId, kandangList, recordings]);

  const handleDelete = (id: string) => {
    deleteMutation.mutate(id);
  };

  const isLoading = kandangLoading || recordingsLoading;
  const hasError = kandangError || recordingsError;

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
          <Link to="/recordings/new">
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
            {isLoading ? (
              <LoadingState />
            ) : hasError ? (
              <EmptyState
                title="Gagal memuat data"
                description="Silakan coba lagi beberapa saat."
              />
            ) : metrics.length === 0 ? (
              <EmptyState
                title="Belum ada data pencatatan"
                description="Mulai dengan menambahkan pencatatan harian pertama."
                action={
                  <Link to="/recordings/new">
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
                      <TableHead className="text-right">Telur (kg)</TableHead>
                      <TableHead className="text-right">Telur (butir)</TableHead>
                      <TableHead className="text-right">FCR</TableHead>
                      <TableHead className="text-right">HDP%</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Aksi</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {metrics.map((m) => {
                      const recording = recordings.find(
                        (r) => r.date === m.date && r.kandangId === m.kandangId
                      );
                      return (
                        <TableRow key={`${m.date}-${m.kandangId}`}>
                          <TableCell className="font-medium">
                            {format(new Date(m.date), 'dd/MM/yyyy')}
                          </TableCell>
                          <TableCell>{m.dayName}</TableCell>
                          <TableCell>{m.kandangName}</TableCell>
                          <TableCell className="text-right">{m.totalChickenToday.toLocaleString()}</TableCell>
                          <TableCell className="text-right">{m.deadChickenCount}</TableCell>
                          <TableCell className="text-right">{m.feedUsedKg}</TableCell>
                          <TableCell className="text-right">{m.eggsKg}</TableCell>
                          <TableCell className="text-right">{m.eggsCount.toLocaleString()}</TableCell>
                          <TableCell className="text-right">{m.fcr}</TableCell>
                          <TableCell className="text-right">{m.hdpPercent}%</TableCell>
                          <TableCell>
                            <StatusBadge status={getHDPStatus(m.hdpPercent)} size="sm" />
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex gap-1 justify-end">
                              {recording && (
                                <>
                                  <Link to={`/recordings/${recording.id}`}>
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
                                          <AlertDialogAction onClick={() => handleDelete(recording.id)}>
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
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
};

export default Recordings;
