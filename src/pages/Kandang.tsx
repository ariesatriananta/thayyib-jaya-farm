import { useEffect, useMemo, useState } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { KandangStatusBadge } from '@/components/common/StatusBadge';
import { EmptyState } from '@/components/common/EmptyState';
import { LoadingState } from '@/components/common/LoadingState';
import { Plus, Edit, Trash2, Home } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import type { Kandang } from '@/lib/domain/types';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { createKandang, deleteKandang, getKandangAll, updateKandang } from '@/services/api/kandang';
import { getSettingsAll } from '@/services/api/settings';

const KandangPage = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingKandang, setEditingKandang] = useState<Kandang | null>(null);

  const {
    data: kandangList = [],
    isLoading: kandangLoading,
    error: kandangError,
  } = useQuery({
    queryKey: ['kandang'],
    queryFn: getKandangAll,
  });

  const {
    data: settingsData = [],
    isLoading: settingsLoading,
    error: settingsError,
  } = useQuery({
    queryKey: ['settings'],
    queryFn: getSettingsAll,
  });

  const settings = settingsData[0];
  const defaultTargets = useMemo(() => {
    return {
      hdp: settings?.defaultTargetHDPPercent ?? 90,
      fcr: settings?.defaultTargetFCR ?? 2.2,
    };
  }, [settings]);

  const [formData, setFormData] = useState({
    name: '',
    initialChickenCount: '',
    targetHDPPercent: '',
    targetFCR: '',
    status: 'active' as 'active' | 'inactive',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const resetForm = () => {
    setFormData({
      name: '',
      initialChickenCount: '',
      targetHDPPercent: defaultTargets.hdp.toString(),
      targetFCR: defaultTargets.fcr.toString(),
      status: 'active',
    });
    setErrors({});
    setEditingKandang(null);
  };

  useEffect(() => {
    if (editingKandang) return;
    setFormData((prev) => ({
      ...prev,
      targetHDPPercent: prev.targetHDPPercent || defaultTargets.hdp.toString(),
      targetFCR: prev.targetFCR || defaultTargets.fcr.toString(),
    }));
  }, [defaultTargets, editingKandang]);

  const openEditDialog = (kandang: Kandang) => {
    setEditingKandang(kandang);
    setFormData({
      name: kandang.name,
      initialChickenCount: kandang.initialChickenCount.toString(),
      targetHDPPercent: kandang.targetHDPPercent.toString(),
      targetFCR: kandang.targetFCR.toString(),
      status: kandang.status,
    });
    setIsDialogOpen(true);
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) newErrors.name = 'Nama kandang wajib diisi';
    if (!formData.initialChickenCount || parseInt(formData.initialChickenCount) <= 0) {
      newErrors.initialChickenCount = 'Jumlah ayam harus lebih dari 0';
    }
    if (!formData.targetHDPPercent || parseFloat(formData.targetHDPPercent) <= 0) {
      newErrors.targetHDPPercent = 'Target HDP harus lebih dari 0';
    }
    if (!formData.targetFCR || parseFloat(formData.targetFCR) <= 0) {
      newErrors.targetFCR = 'Target FCR harus lebih dari 0';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const createMutation = useMutation({
    mutationFn: createKandang,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['kandang'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      toast({ title: 'Berhasil', description: 'Kandang baru berhasil ditambahkan.' });
    },
    onError: () => {
      toast({
        title: 'Error',
        description: 'Gagal menyimpan data.',
        variant: 'destructive',
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Parameters<typeof updateKandang>[1] }) =>
      updateKandang(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['kandang'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      toast({ title: 'Berhasil', description: 'Data kandang berhasil diperbarui.' });
    },
    onError: () => {
      toast({
        title: 'Error',
        description: 'Gagal menyimpan data.',
        variant: 'destructive',
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteKandang,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['kandang'] });
      queryClient.invalidateQueries({ queryKey: ['recordings'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      toast({ title: 'Berhasil', description: 'Kandang berhasil dihapus.' });
    },
    onError: () => {
      toast({
        title: 'Error',
        description: 'Gagal menghapus kandang.',
        variant: 'destructive',
      });
    },
  });

  const handleSubmit = () => {
    if (!validate()) return;

    const payload = {
      name: formData.name,
      initialChickenCount: parseInt(formData.initialChickenCount),
      targetHDPPercent: parseFloat(formData.targetHDPPercent),
      targetFCR: parseFloat(formData.targetFCR),
      status: formData.status,
    };

    if (editingKandang) {
      updateMutation.mutate({ id: editingKandang.id, data: payload });
    } else {
      createMutation.mutate(payload);
    }

    setIsDialogOpen(false);
    resetForm();
  };

  const handleDelete = (id: string) => {
    deleteMutation.mutate(id);
  };

  const handleToggleStatus = (id: string) => {
    const target = kandangList.find((k) => k.id === id);
    if (!target) return;
    const newStatus = target.status === 'active' ? 'inactive' : 'active';
    updateMutation.mutate({ id, data: { status: newStatus } });
  };

  const isLoading = kandangLoading || settingsLoading;
  const hasError = kandangError || settingsError;

  return (
    <AppLayout title="Manajemen Kandang" subtitle="Kelola data kandang peternakan">
      <div className="space-y-6 animate-fade-in">
        {/* Header */}
        <div className="flex justify-end">
          <Dialog open={isDialogOpen} onOpenChange={(open) => {
            setIsDialogOpen(open);
            if (open && !editingKandang) {
              resetForm();
              return;
            }
            if (!open) resetForm();
          }}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="w-4 h-4" />
                Tambah Kandang
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>{editingKandang ? 'Edit Kandang' : 'Tambah Kandang Baru'}</DialogTitle>
                <DialogDescription>
                  {editingKandang ? 'Ubah informasi kandang' : 'Isi informasi kandang baru'}
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label>Nama Kandang *</Label>
                  <Input
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Contoh: Kandang A1"
                    className={errors.name ? 'border-destructive' : ''}
                  />
                  {errors.name && <p className="text-sm text-destructive">{errors.name}</p>}
                </div>

                <div className="space-y-2">
                  <Label>Jumlah Ayam Awal *</Label>
                  <Input
                    type="number"
                    min="1"
                    value={formData.initialChickenCount}
                    onChange={(e) => setFormData({ ...formData, initialChickenCount: e.target.value })}
                    placeholder="5000"
                    className={errors.initialChickenCount ? 'border-destructive' : ''}
                  />
                  {errors.initialChickenCount && <p className="text-sm text-destructive">{errors.initialChickenCount}</p>}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Target HDP (%)</Label>
                    <Input
                      type="number"
                      step="0.1"
                      min="0"
                      max="100"
                      value={formData.targetHDPPercent}
                      onChange={(e) => setFormData({ ...formData, targetHDPPercent: e.target.value })}
                      className={errors.targetHDPPercent ? 'border-destructive' : ''}
                    />
                    {errors.targetHDPPercent && <p className="text-sm text-destructive">{errors.targetHDPPercent}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label>Target FCR</Label>
                    <Input
                      type="number"
                      step="0.1"
                      min="0"
                      value={formData.targetFCR}
                      onChange={(e) => setFormData({ ...formData, targetFCR: e.target.value })}
                      className={errors.targetFCR ? 'border-destructive' : ''}
                    />
                    {errors.targetFCR && <p className="text-sm text-destructive">{errors.targetFCR}</p>}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Status</Label>
                  <Select
                    value={formData.status}
                    onValueChange={(value: 'active' | 'inactive') => 
                      setFormData({ ...formData, status: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-popover">
                      <SelectItem value="active">Aktif</SelectItem>
                      <SelectItem value="inactive">Tidak Aktif</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Batal
                </Button>
                <Button onClick={handleSubmit}>
                  {editingKandang ? 'Simpan Perubahan' : 'Tambah'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {/* Table */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Home className="w-5 h-5" />
              Daftar Kandang ({kandangList.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <LoadingState />
            ) : hasError ? (
              <EmptyState
                title="Gagal memuat data"
                description="Silakan coba lagi beberapa saat."
                icon={<Home className="w-8 h-8 text-muted-foreground" />}
              />
            ) : kandangList.length === 0 ? (
              <EmptyState
                title="Belum ada kandang"
                description="Mulai dengan menambahkan kandang pertama."
                icon={<Home className="w-8 h-8 text-muted-foreground" />}
              />
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nama</TableHead>
                      <TableHead className="text-right">Jumlah Ayam</TableHead>
                      <TableHead className="text-right">Target HDP</TableHead>
                      <TableHead className="text-right">Target FCR</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Aksi</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {kandangList.map((k) => (
                      <TableRow key={k.id}>
                        <TableCell className="font-medium">{k.name}</TableCell>
                        <TableCell className="text-right">{k.initialChickenCount.toLocaleString()}</TableCell>
                        <TableCell className="text-right">{k.targetHDPPercent}%</TableCell>
                        <TableCell className="text-right">{k.targetFCR}</TableCell>
                        <TableCell>
                          <button onClick={() => handleToggleStatus(k.id)}>
                            <KandangStatusBadge status={k.status} size="sm" />
                          </button>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex gap-1 justify-end">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => openEditDialog(k)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive">
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Hapus Kandang?</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Kandang "{k.name}" dan semua data pencatatan terkait akan dihapus permanen.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Batal</AlertDialogCancel>
                                  <AlertDialogAction onClick={() => handleDelete(k.id)}>
                                    Hapus
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
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

export default KandangPage;
