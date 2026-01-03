import { useState } from 'react';
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
import { Plus, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { createRecording, getRecordings } from '@/services/api/recordings';
import { getKandangAll } from '@/services/api/kandang';

interface QuickAddRecordingProps {
  onClose?: () => void;
}

export function QuickAddRecording({ onClose }: QuickAddRecordingProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isOpen, setIsOpen] = useState(false);
  
  const today = format(new Date(), 'yyyy-MM-dd');
  const { data: kandangList = [] } = useQuery({
    queryKey: ['kandang'],
    queryFn: getKandangAll,
  });
  const activeKandang = kandangList.filter((k) => k.status === 'active');

  const { data: todayRecordings = [] } = useQuery({
    queryKey: ['recordings', today],
    queryFn: () => getRecordings({ date: today }),
  });

  const createMutation = useMutation({
    mutationFn: createRecording,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recordings'] });
      queryClient.invalidateQueries({ queryKey: ['recordings', today] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      toast({
        title: 'Berhasil',
        description: 'Data pencatatan berhasil ditambahkan.',
      });
      setIsOpen(false);
      setFormData({
        kandangId: '',
        feedInKg: '',
        feedRemainingKg: '',
        eggsKg: '',
        eggsCount: '',
        deadChickenCount: '0',
        notes: '',
      });
    },
    onError: () => {
      toast({
        title: 'Error',
        description: 'Gagal menyimpan data. Silakan coba lagi.',
        variant: 'destructive',
      });
    },
  });

  const [formData, setFormData] = useState({
    kandangId: '',
    feedInKg: '',
    feedRemainingKg: '',
    eggsKg: '',
    eggsCount: '',
    deadChickenCount: '0',
    notes: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (todayRecordings.some((r) => r.kandangId === formData.kandangId)) {
      toast({
        title: 'Peringatan',
        description: 'Data untuk tanggal dan kandang ini sudah ada. Silakan edit data yang ada.',
        variant: 'destructive',
      });
      return;
    }

    const feedInKg = parseFloat(formData.feedInKg) || 0;
    const feedRemainingKg = parseFloat(formData.feedRemainingKg) || 0;
    const feedUsedKg = Math.max(0, feedInKg - feedRemainingKg);

    createMutation.mutate({
      kandangId: formData.kandangId,
      date: today,
      feedInKg,
      feedRemainingKg,
      feedUsedKg,
      eggsKg: parseFloat(formData.eggsKg) || 0,
      eggsCount: parseInt(formData.eggsCount) || 0,
      deadChickenCount: parseInt(formData.deadChickenCount) || 0,
      notes: formData.notes,
    });
  };

  if (!isOpen) {
    return (
      <Button onClick={() => setIsOpen(true)} className="gap-2">
        <Plus className="w-4 h-4" />
        Tambah Pencatatan Cepat
      </Button>
    );
  }

  return (
    <Card className="border-primary/20">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">Pencatatan Cepat - {format(new Date(), 'dd MMM yyyy')}</CardTitle>
          <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)}>
            <X className="w-4 h-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label>Kandang *</Label>
              <Select
                value={formData.kandangId}
                onValueChange={(value) => setFormData({ ...formData, kandangId: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Pilih kandang" />
                </SelectTrigger>
                <SelectContent className="bg-popover">
                  {activeKandang.map((k) => (
                    <SelectItem key={k.id} value={k.id}>{k.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Pakan Masuk (kg) *</Label>
              <Input
                type="number"
                step="0.1"
                min="0"
                value={formData.feedInKg}
                onChange={(e) => setFormData({ ...formData, feedInKg: e.target.value })}
                placeholder="0"
              />
            </div>

            <div className="space-y-2">
              <Label>Sisa Pakan (kg)</Label>
              <Input
                type="number"
                step="0.1"
                min="0"
                value={formData.feedRemainingKg}
                onChange={(e) => setFormData({ ...formData, feedRemainingKg: e.target.value })}
                placeholder="0"
              />
            </div>

            <div className="space-y-2">
              <Label>Telur (kg) *</Label>
              <Input
                type="number"
                step="0.1"
                min="0"
                value={formData.eggsKg}
                onChange={(e) => setFormData({ ...formData, eggsKg: e.target.value })}
                placeholder="0"
              />
            </div>

            <div className="space-y-2">
              <Label>Telur (butir) *</Label>
              <Input
                type="number"
                min="0"
                value={formData.eggsCount}
                onChange={(e) => setFormData({ ...formData, eggsCount: e.target.value })}
                placeholder="0"
              />
            </div>

            <div className="space-y-2">
              <Label>Ayam Mati</Label>
              <Input
                type="number"
                min="0"
                value={formData.deadChickenCount}
                onChange={(e) => setFormData({ ...formData, deadChickenCount: e.target.value })}
                placeholder="0"
              />
            </div>

            <div className="space-y-2 sm:col-span-2">
              <Label>Keterangan</Label>
              <Input
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Catatan tambahan..."
              />
            </div>
          </div>

          <div className="flex gap-2 justify-end">
            <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>
              Batal
            </Button>
            <Button 
              type="submit" 
              disabled={
                !formData.kandangId ||
                !formData.feedInKg ||
                !formData.eggsKg ||
                !formData.eggsCount ||
                createMutation.isPending
              }
            >
              {createMutation.isPending ? 'Menyimpan...' : 'Simpan'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
