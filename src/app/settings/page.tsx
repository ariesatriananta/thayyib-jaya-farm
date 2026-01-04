"use client";

import { useEffect, useState } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { settingsService } from '@/lib/services/settingsService';
import { useToast } from '@/hooks/use-toast';
import { Settings as SettingsIcon, RotateCcw, Save } from 'lucide-react';
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

const Settings = () => {
  const { toast } = useToast();
  const [settings, setSettings] = useState({
    defaultTargetHDPPercent: 90,
    defaultTargetFCR: 2.2,
    farmName: 'Thayyib Jaya Farm',
  });
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    let isMounted = true;
    settingsService.get()
      .then((data) => {
        if (isMounted) setSettings(data);
      })
      .catch(() => {
        // Keep defaults on error.
      });
    return () => {
      isMounted = false;
    };
  }, []);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const saved = await settingsService.update(settings);
      setSettings(saved);
      toast({
        title: 'Berhasil',
        description: 'Pengaturan berhasil disimpan.',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Gagal menyimpan pengaturan.',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleResetData = async () => {
    await settingsService.resetData();
    const updated = await settingsService.get();
    setSettings(updated);
    toast({
      title: 'Berhasil',
      description: 'Semua data berhasil direset ke kondisi awal.',
    });
    // Reload page to reflect changes
    window.location.reload();
  };

  return (
    <AppLayout title="Pengaturan" subtitle="Kelola pengaturan aplikasi">
      <div className="max-w-2xl mx-auto space-y-6 animate-fade-in">
        {/* Farm Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <SettingsIcon className="w-5 h-5" />
              Pengaturan Farm
            </CardTitle>
            <CardDescription>
              Konfigurasi default untuk aplikasi
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label>Nama Farm</Label>
              <Input
                value={settings.farmName}
                onChange={(e) => setSettings({ ...settings, farmName: e.target.value })}
                placeholder="Nama farm Anda"
              />
            </div>

            <Separator />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Default Target HDP (%)</Label>
                <Input
                  type="number"
                  step="0.1"
                  min="0"
                  max="100"
                  value={settings.defaultTargetHDPPercent}
                  onChange={(e) => setSettings({ 
                    ...settings, 
                    defaultTargetHDPPercent: parseFloat(e.target.value) || 0 
                  })}
                />
                <p className="text-xs text-muted-foreground">
                  Digunakan sebagai default saat membuat kandang baru
                </p>
              </div>

              <div className="space-y-2">
                <Label>Default Target FCR</Label>
                <Input
                  type="number"
                  step="0.1"
                  min="0"
                  value={settings.defaultTargetFCR}
                  onChange={(e) => setSettings({ 
                    ...settings, 
                    defaultTargetFCR: parseFloat(e.target.value) || 0 
                  })}
                />
                <p className="text-xs text-muted-foreground">
                  Feed Conversion Ratio target
                </p>
              </div>
            </div>

            <div className="flex justify-end">
              <Button onClick={handleSave} disabled={isSaving} className="gap-2">
                <Save className="w-4 h-4" />
                {isSaving ? 'Menyimpan...' : 'Simpan Pengaturan'}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Reset Data */}
        <Card className="border-destructive/30">
          <CardHeader>
            <CardTitle className="text-destructive flex items-center gap-2">
              <RotateCcw className="w-5 h-5" />
              Reset Data
            </CardTitle>
            <CardDescription>
              Kembalikan semua data ke kondisi awal (mock data)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">
                  Tindakan ini akan menghapus semua perubahan yang Anda buat dan mengembalikan data demo.
                </p>
              </div>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive" className="gap-2">
                    <RotateCcw className="w-4 h-4" />
                    Reset
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Reset Semua Data?</AlertDialogTitle>
                    <AlertDialogDescription>
                      Semua kandang dan pencatatan akan dikembalikan ke data demo awal. Perubahan yang telah Anda buat akan hilang.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Batal</AlertDialogCancel>
                    <AlertDialogAction onClick={handleResetData}>
                      Ya, Reset Data
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </CardContent>
        </Card>

        {/* About */}
        <Card>
          <CardHeader>
            <CardTitle>Tentang Aplikasi</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground">Versi</p>
                <p className="font-medium">1.0.0</p>
              </div>
              <div>
                <p className="text-muted-foreground">Framework</p>
                <p className="font-medium">Next.js (App Router)</p>
              </div>
              <div>
                <p className="text-muted-foreground">UI Library</p>
                <p className="font-medium">shadcn/ui + Tailwind</p>
              </div>
              <div>
                <p className="text-muted-foreground">Database</p>
                <p className="font-medium">Neon (Postgres)</p>
              </div>
            </div>
            <Separator />
            <p className="text-sm text-muted-foreground">
              Data aplikasi disimpan di Neon melalui Drizzle ORM. Pengaturan ini mempengaruhi default 
              saat membuat kandang baru.
            </p>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
};

export default Settings;
