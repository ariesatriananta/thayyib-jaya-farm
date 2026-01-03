import { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { format } from 'date-fns';
import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft } from 'lucide-react';
import { EmptyState } from '@/components/common/EmptyState';
import { LoadingState } from '@/components/common/LoadingState';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { getKandangAll } from '@/services/api/kandang';
import { getRecordingById, updateRecording } from '@/services/api/recordings';

const RecordingEdit = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const {
    data: kandangList = [],
    isLoading: kandangLoading,
    error: kandangError,
  } = useQuery({
    queryKey: ['kandang'],
    queryFn: getKandangAll,
  });

  const {
    data: recording,
    isLoading: recordingLoading,
    error: recordingError,
  } = useQuery({
    queryKey: ['recordings', id],
    queryFn: () => (id ? getRecordingById(id) : Promise.resolve(null)),
    enabled: Boolean(id),
  });

  const [formData, setFormData] = useState({
    kandangId: '',
    date: '',
    feedInKg: '',
    feedRemainingKg: '',
    eggsKg: '',
    eggsCount: '',
    deadChickenCount: '',
    notes: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!recording) return;
    setFormData({
      kandangId: recording.kandangId,
      date: recording.date,
      feedInKg: recording.feedInKg.toString(),
      feedRemainingKg: recording.feedRemainingKg.toString(),
      eggsKg: recording.eggsKg.toString(),
      eggsCount: recording.eggsCount.toString(),
      deadChickenCount: recording.deadChickenCount.toString(),
      notes: recording.notes,
    });
  }, [recording]);

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setErrors(prev => ({ ...prev, [field]: '' }));
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.kandangId) newErrors.kandangId = 'Pilih kandang';
    if (!formData.date) newErrors.date = 'Pilih tanggal';
    if (!formData.feedInKg || parseFloat(formData.feedInKg) <= 0) {
      newErrors.feedInKg = 'Masukkan jumlah pakan masuk';
    }
    if (!formData.eggsKg || parseFloat(formData.eggsKg) < 0) {
      newErrors.eggsKg = 'Masukkan jumlah telur (kg)';
    }
    if (!formData.eggsCount || parseInt(formData.eggsCount) < 0) {
      newErrors.eggsCount = 'Masukkan jumlah telur (butir)';
    }
    if (parseFloat(formData.feedRemainingKg) > parseFloat(formData.feedInKg)) {
      newErrors.feedRemainingKg = 'Sisa pakan tidak boleh lebih dari pakan masuk';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Parameters<typeof updateRecording>[1] }) =>
      updateRecording(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recordings'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      toast({
        title: 'Berhasil',
        description: 'Data pencatatan berhasil diperbarui.',
      });
      navigate('/recordings');
    },
    onError: () => {
      toast({
        title: 'Error',
        description: 'Gagal menyimpan data. Silakan coba lagi.',
        variant: 'destructive',
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validate() || !id) return;
    const feedInKg = parseFloat(formData.feedInKg);
    const feedRemainingKg = parseFloat(formData.feedRemainingKg) || 0;
    const feedUsedKg = Math.max(0, feedInKg - feedRemainingKg);

    updateMutation.mutate({
      id,
      data: {
        kandangId: formData.kandangId,
        date: formData.date,
        feedInKg,
        feedRemainingKg,
        feedUsedKg,
        eggsKg: parseFloat(formData.eggsKg),
        eggsCount: parseInt(formData.eggsCount),
        deadChickenCount: parseInt(formData.deadChickenCount) || 0,
        notes: formData.notes,
      },
    });
  };

  const feedUsed = Math.max(0, (parseFloat(formData.feedInKg) || 0) - (parseFloat(formData.feedRemainingKg) || 0));

  const isLoading = kandangLoading || recordingLoading;
  const hasError = kandangError || recordingError;

  if (!isLoading && !recording && id) {
    return (
      <AppLayout title="Edit Pencatatan" subtitle="Data tidak ditemukan">
        <EmptyState
          title="Data tidak ditemukan"
          description="Pencatatan yang Anda cari tidak ada atau sudah dihapus."
          action={
            <Link to="/recordings">
              <Button>Kembali ke Daftar</Button>
            </Link>
          }
        />
      </AppLayout>
    );
  }

  return (
    <AppLayout title="Edit Pencatatan" subtitle="Ubah data pencatatan harian">
      <div className="max-w-2xl mx-auto animate-fade-in">
        <Link to="/recordings" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6">
          <ArrowLeft className="w-4 h-4" />
          Kembali ke daftar
        </Link>

        <Card>
          <CardHeader>
            <CardTitle>Edit Pencatatan</CardTitle>
            <CardDescription>
              {formData.date && `Tanggal: ${format(new Date(formData.date), 'dd MMMM yyyy')}`}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <LoadingState />
            ) : hasError ? (
              <EmptyState
                title="Gagal memuat data"
                description="Silakan coba lagi beberapa saat."
              />
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Kandang *</Label>
                  <Select
                    value={formData.kandangId}
                    onValueChange={(value) => handleChange('kandangId', value)}
                  >
                    <SelectTrigger className={errors.kandangId ? 'border-destructive' : ''}>
                      <SelectValue placeholder="Pilih kandang" />
                    </SelectTrigger>
                    <SelectContent className="bg-popover">
                      {kandangList.map((k) => (
                        <SelectItem key={k.id} value={k.id}>{k.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.kandangId && <p className="text-sm text-destructive">{errors.kandangId}</p>}
                </div>

                <div className="space-y-2">
                  <Label>Tanggal *</Label>
                  <Input
                    type="date"
                    value={formData.date}
                    onChange={(e) => handleChange('date', e.target.value)}
                    className={errors.date ? 'border-destructive' : ''}
                  />
                  {errors.date && <p className="text-sm text-destructive">{errors.date}</p>}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Pakan Masuk (kg) *</Label>
                  <Input
                    type="number"
                    step="0.1"
                    min="0"
                    value={formData.feedInKg}
                    onChange={(e) => handleChange('feedInKg', e.target.value)}
                    className={errors.feedInKg ? 'border-destructive' : ''}
                    placeholder="0"
                  />
                  {errors.feedInKg && <p className="text-sm text-destructive">{errors.feedInKg}</p>}
                </div>

                <div className="space-y-2">
                  <Label>Sisa Pakan (kg)</Label>
                  <Input
                    type="number"
                    step="0.1"
                    min="0"
                    value={formData.feedRemainingKg}
                    onChange={(e) => handleChange('feedRemainingKg', e.target.value)}
                    className={errors.feedRemainingKg ? 'border-destructive' : ''}
                    placeholder="0"
                  />
                  {errors.feedRemainingKg && <p className="text-sm text-destructive">{errors.feedRemainingKg}</p>}
                </div>

                <div className="space-y-2">
                  <Label>Pakan Terpakai (kg)</Label>
                  <Input
                    type="number"
                    value={feedUsed.toFixed(1)}
                    disabled
                    className="bg-muted"
                  />
                  <p className="text-xs text-muted-foreground">Auto-calculated</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Telur (kg) *</Label>
                  <Input
                    type="number"
                    step="0.1"
                    min="0"
                    value={formData.eggsKg}
                    onChange={(e) => handleChange('eggsKg', e.target.value)}
                    className={errors.eggsKg ? 'border-destructive' : ''}
                    placeholder="0"
                  />
                  {errors.eggsKg && <p className="text-sm text-destructive">{errors.eggsKg}</p>}
                </div>

                <div className="space-y-2">
                  <Label>Telur (butir) *</Label>
                  <Input
                    type="number"
                    min="0"
                    value={formData.eggsCount}
                    onChange={(e) => handleChange('eggsCount', e.target.value)}
                    className={errors.eggsCount ? 'border-destructive' : ''}
                    placeholder="0"
                  />
                  {errors.eggsCount && <p className="text-sm text-destructive">{errors.eggsCount}</p>}
                </div>
              </div>

              <div className="space-y-2">
                <Label>Ayam Mati</Label>
                <Input
                  type="number"
                  min="0"
                  value={formData.deadChickenCount}
                  onChange={(e) => handleChange('deadChickenCount', e.target.value)}
                  placeholder="0"
                  className="max-w-32"
                />
              </div>

              <div className="space-y-2">
                <Label>Keterangan</Label>
                <Textarea
                  value={formData.notes}
                  onChange={(e) => handleChange('notes', e.target.value)}
                  placeholder="Catatan tambahan (opsional)"
                  rows={3}
                />
              </div>

              <div className="flex gap-3 justify-end pt-4 border-t">
                <Link to="/recordings">
                  <Button type="button" variant="outline">Batal</Button>
                </Link>
                <Button type="submit" disabled={updateMutation.isPending}>
                  {updateMutation.isPending ? 'Menyimpan...' : 'Simpan Perubahan'}
                </Button>
              </div>
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
};

export default RecordingEdit;
