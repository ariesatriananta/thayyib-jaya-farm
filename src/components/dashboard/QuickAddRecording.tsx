"use client";

import { useEffect, useState } from 'react';
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
import { Plus, X, Loader2 } from 'lucide-react';
import { kandangService } from '@/lib/services/kandangService';
import { recordingService } from '@/lib/services/recordingService';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import type { Kandang } from '@/lib/mock/types';
import { useSession } from 'next-auth/react';

interface QuickAddRecordingProps {
  onClose?: () => void;
}

export function QuickAddRecording({ onClose }: QuickAddRecordingProps) {
  const { toast } = useToast();
  const { data: session } = useSession();
  const role = session?.user?.role;
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [kandangList, setKandangList] = useState<Kandang[]>([]);
  
  const today = format(new Date(), 'yyyy-MM-dd');
  const adminOffset = role === 'admin' ? 2 : 0;
  const fieldAnimation = (index: number) => ({
    animationDelay: `${index * 60}ms`,
    animationDuration: "520ms",
    animationTimingFunction: "cubic-bezier(0.16, 1, 0.3, 1)",
    animationFillMode: "both",
  });

  const [formData, setFormData] = useState({
    kandangId: '',
    feedInKg: '',
    feedRemainingKg: '',
    eggsKg: '',
    eggsCount: '',
    whiteEggsKg: '',
    whiteEggsCount: '',
    brokenEggsCount: '',
    feedPriceKg: '0',
    eggsPriceKg: '0',
    deadChickenCount: '0',
    notes: '',
  });

  useEffect(() => {
    let isMounted = true;

    kandangService.getActive()
      .then((data) => {
        if (isMounted) setKandangList(data);
      })
      .catch(() => {
        // Keep empty list on error.
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Check if recording already exists
      const exists = await recordingService.existsForDateAndKandang(today, formData.kandangId);
      if (exists) {
        toast({
          title: 'Peringatan',
          description: 'Data untuk tanggal dan kandang ini sudah ada. Silakan edit data yang ada.',
          variant: 'destructive',
        });
        setIsSubmitting(false);
        return;
      }

      await recordingService.create({
        kandangId: formData.kandangId,
        date: today,
        feedInKg: parseFloat(formData.feedInKg) || 0,
        feedPriceKg: role === 'admin' ? parseFloat(formData.feedPriceKg) || 0 : 0,
        feedRemainingKg: parseFloat(formData.feedRemainingKg) || 0,
        eggsKg: parseFloat(formData.eggsKg) || 0,
        eggsPriceKg: role === 'admin' ? parseFloat(formData.eggsPriceKg) || 0 : 0,
        eggsCount: parseInt(formData.eggsCount) || 0,
        whiteEggsKg: parseFloat(formData.whiteEggsKg) || 0,
        whiteEggsCount: parseInt(formData.whiteEggsCount) || 0,
        brokenEggsCount: parseInt(formData.brokenEggsCount) || 0,
        deadChickenCount: parseInt(formData.deadChickenCount) || 0,
        notes: formData.notes,
      });

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
        whiteEggsKg: '',
        whiteEggsCount: '',
        brokenEggsCount: '',
        feedPriceKg: '0',
        eggsPriceKg: '0',
        deadChickenCount: '0',
        notes: '',
      });
      
      // Refresh the page to show new data
      window.location.reload();
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

  if (!isOpen) {
    return (
      <Button onClick={() => setIsOpen(true)} className="gap-2">
        <Plus className="w-4 h-4" />
        Tambah Pencatatan Cepat
      </Button>
    );
  }

  return (
    <Card
      className="border-primary/20 animate-slide-up"
      style={{
        animationDuration: "700ms",
        animationTimingFunction: "cubic-bezier(0.16, 1, 0.3, 1)",
        animationFillMode: "both",
      }}
    >
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
            <div className="space-y-2 animate-slide-up" style={fieldAnimation(0)}>
              <Label>Kandang *</Label>
              <Select
                value={formData.kandangId}
                onValueChange={(value) => setFormData({ ...formData, kandangId: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Pilih kandang" />
                </SelectTrigger>
                <SelectContent className="bg-popover">
                  {kandangList.map((k) => (
                    <SelectItem key={k.id} value={k.id}>{k.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2 animate-slide-up" style={fieldAnimation(1)}>
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

            <div className="space-y-2 animate-slide-up" style={fieldAnimation(2)}>
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

            <div className="space-y-2 animate-slide-up" style={fieldAnimation(3)}>
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

            <div className="space-y-2 animate-slide-up" style={fieldAnimation(4)}>
              <Label>Telur (butir) *</Label>
              <Input
                type="number"
                min="0"
                value={formData.eggsCount}
                onChange={(e) => setFormData({ ...formData, eggsCount: e.target.value })}
                placeholder="0"
              />
            </div>

            <div className="space-y-2 animate-slide-up" style={fieldAnimation(5)}>
              <Label>Telur Putih (kg)</Label>
              <Input
                type="number"
                step="0.1"
                min="0"
                value={formData.whiteEggsKg}
                onChange={(e) => setFormData({ ...formData, whiteEggsKg: e.target.value })}
                placeholder="0"
              />
            </div>

            <div className="space-y-2 animate-slide-up" style={fieldAnimation(6)}>
              <Label>Telur Putih (butir)</Label>
              <Input
                type="number"
                min="0"
                value={formData.whiteEggsCount}
                onChange={(e) => setFormData({ ...formData, whiteEggsCount: e.target.value })}
                placeholder="0"
              />
            </div>

            <div className="space-y-2 animate-slide-up" style={fieldAnimation(7)}>
              <Label>Telur BS (butir)</Label>
              <Input
                type="number"
                min="0"
                value={formData.brokenEggsCount}
                onChange={(e) => setFormData({ ...formData, brokenEggsCount: e.target.value })}
                placeholder="0"
              />
            </div>

            {role === 'admin' && (
              <div className="space-y-2 animate-slide-up" style={fieldAnimation(8)}>
                <Label>Harga Pakan (per kg)</Label>
                <Input
                  type="number"
                  min="0"
                  value={formData.feedPriceKg}
                  onChange={(e) => setFormData({ ...formData, feedPriceKg: e.target.value })}
                  placeholder="0"
                />
              </div>
            )}

            {role === 'admin' && (
              <div className="space-y-2 animate-slide-up" style={fieldAnimation(9)}>
                <Label>Harga Telur (per kg)</Label>
                <Input
                  type="number"
                  min="0"
                  value={formData.eggsPriceKg}
                  onChange={(e) => setFormData({ ...formData, eggsPriceKg: e.target.value })}
                  placeholder="0"
                />
              </div>
            )}

            <div className="space-y-2 animate-slide-up" style={fieldAnimation(8 + adminOffset)}>
              <Label>Ayam Mati</Label>
              <Input
                type="number"
                min="0"
                value={formData.deadChickenCount}
                onChange={(e) => setFormData({ ...formData, deadChickenCount: e.target.value })}
                placeholder="0"
              />
            </div>

            <div className="space-y-2 sm:col-span-2 animate-slide-up" style={fieldAnimation(9 + adminOffset)}>
              <Label>Keterangan</Label>
              <Input
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Catatan tambahan..."
              />
            </div>
          </div>

          <div className="flex gap-2 justify-end animate-slide-up" style={fieldAnimation(10 + adminOffset)}>
            <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>
              Batal
            </Button>
            <Button 
              type="submit" 
              disabled={!formData.kandangId || !formData.feedInKg || !formData.eggsKg || !formData.eggsCount || isSubmitting}
            >
              {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Simpan'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
