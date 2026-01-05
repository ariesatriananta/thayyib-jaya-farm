"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { format } from 'date-fns';
import { AppLayout } from '@/components/layout/AppLayout';
import Loading from './loading';
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
import { kandangService } from '@/lib/services/kandangService';
import { recordingService } from '@/lib/services/recordingService';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft } from 'lucide-react';
import { EmptyState } from '@/components/common/EmptyState';
import type { Kandang, Recording } from '@/lib/mock/types';
import { signalNavigationDone } from '@/lib/ui/navigationProgress';
import { useSession } from 'next-auth/react';

const RecordingEdit = () => {
  const params = useParams<{ id: string }>();
  const id = params?.id;
  const router = useRouter();
  const { toast } = useToast();
  const { data: session } = useSession();
  const role = session?.user?.role;
  const [kandangList, setKandangList] = useState<Kandang[]>([]);
  const [recording, setRecording] = useState<Recording | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [kandangLoaded, setKandangLoaded] = useState(false);
  const [recordingLoaded, setRecordingLoaded] = useState(false);

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
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [notFound, setNotFound] = useState(false);

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
    if (!id) return;

    recordingService.getById(id)
      .then((data) => {
        if (!isMounted) return;
        if (data) {
          setRecording(data);
          setFormData({
            kandangId: data.kandangId,
            date: data.date,
            feedInKg: data.feedInKg.toString(),
            feedRemainingKg: data.feedRemainingKg.toString(),
            eggsKg: data.eggsKg.toString(),
            eggsCount: data.eggsCount.toString(),
            deadChickenCount: data.deadChickenCount.toString(),
            notes: data.notes,
          });
        } else {
          setNotFound(true);
        }
      })
      .catch(() => {
        if (isMounted) setNotFound(true);
      })
      .finally(() => {
        if (isMounted) setRecordingLoaded(true);
      });

    return () => {
      isMounted = false;
    };
  }, [id]);

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validate() || !id) return;

    setIsSubmitting(true);

    try {
      await recordingService.update(id, {
        kandangId: formData.kandangId,
        date: formData.date,
        feedInKg: parseFloat(formData.feedInKg),
        feedRemainingKg: parseFloat(formData.feedRemainingKg) || 0,
        eggsKg: parseFloat(formData.eggsKg),
        eggsCount: parseInt(formData.eggsCount),
        deadChickenCount: parseInt(formData.deadChickenCount) || 0,
        notes: formData.notes,
      });

      toast({
        title: 'Berhasil',
        description: 'Data pencatatan berhasil diperbarui.',
      });

      router.push('/recordings');
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Gagal menyimpan data. Silakan coba lagi.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const feedUsed = Math.max(0, (parseFloat(formData.feedInKg) || 0) - (parseFloat(formData.feedRemainingKg) || 0));

  useEffect(() => {
    if (!kandangLoaded || !recordingLoaded) return;
    if (!isLoading) return;
    setIsLoading(false);
    signalNavigationDone();
  }, [isLoading, kandangLoaded, recordingLoaded]);

  if (isLoading) {
    return <Loading />;
  }

  if (role === 'staff' && kandangList.length === 0) {
    return (
      <AppLayout title="Edit Pencatatan" subtitle="Ubah data pencatatan harian">
        <EmptyState
          title="Belum ada akses kandang"
          description="Hubungi admin untuk menambahkan akses kandang pada akun Anda."
        />
      </AppLayout>
    );
  }

  if (notFound) {
    return (
      <AppLayout title="Edit Pencatatan" subtitle="Data tidak ditemukan">
        <EmptyState
          title="Data tidak ditemukan"
          description="Pencatatan yang Anda cari tidak ada atau sudah dihapus."
          action={
            <Link href="/recordings">
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
        <Link href="/recordings" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6">
          <ArrowLeft className="w-4 h-4" />
          Kembali ke daftar
        </Link>

        <Card>
          <CardHeader>
            <CardTitle>Edit Pencatatan</CardTitle>
            <CardDescription>
              {recording?.date && `Tanggal: ${format(new Date(recording.date), 'dd MMMM yyyy')}`}
            </CardDescription>
          </CardHeader>
          <CardContent>
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
                <Link href="/recordings">
                  <Button type="button" variant="outline">Batal</Button>
                </Link>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? 'Menyimpan...' : 'Simpan Perubahan'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
};

export default RecordingEdit;
