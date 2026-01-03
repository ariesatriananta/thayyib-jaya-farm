import { useEffect, useState } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { Settings as SettingsIcon, RotateCcw, Save } from 'lucide-react';
import { LoadingState } from '@/components/common/LoadingState';
import { EmptyState } from '@/components/common/EmptyState';
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
import { createSettings, getSettingsAll, updateSettings } from '@/services/api/settings';

const Settings = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const {
    data: settingsData = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ['settings'],
    queryFn: getSettingsAll,
  });
  const currentSettings = settingsData[0];
  const [settings, setSettings] = useState({
    farmName: '',
    defaultTargetHDPPercent: 90,
    defaultTargetFCR: 2.2,
  });

  useEffect(() => {
    if (!currentSettings) return;
    setSettings({
      farmName: currentSettings.farmName,
      defaultTargetHDPPercent: currentSettings.defaultTargetHDPPercent,
      defaultTargetFCR: currentSettings.defaultTargetFCR,
    });
  }, [currentSettings]);

  const saveMutation = useMutation({
    mutationFn: async () => {
      if (currentSettings?.id) {
        return updateSettings(currentSettings.id, settings);
      }
      return createSettings(settings);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['settings'] });
      queryClient.invalidateQueries({ queryKey: ['kandang'] });
      toast({
        title: 'Berhasil',
        description: 'Pengaturan berhasil disimpan.',
      });
    },
    onError: () => {
      toast({
        title: 'Error',
        description: 'Gagal menyimpan pengaturan.',
        variant: 'destructive',
      });
    },
  });

  const handleResetData = () => {
    toast({
      title: 'Info',
      description: 'Reset data hanya tersedia pada mode mock.',
    });
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
            {isLoading ? (
              <LoadingState />
            ) : error ? (
              <EmptyState
                title="Gagal memuat pengaturan"
                description="Silakan coba lagi beberapa saat."
              />
            ) : (
              <>
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
                      onChange={(e) =>
                        setSettings({
                          ...settings,
                          defaultTargetHDPPercent: parseFloat(e.target.value) || 0,
                        })
                      }
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
                      onChange={(e) =>
                        setSettings({
                          ...settings,
                          defaultTargetFCR: parseFloat(e.target.value) || 0,
                        })
                      }
                    />
                    <p className="text-xs text-muted-foreground">
                      Feed Conversion Ratio target
                    </p>
                  </div>
                </div>

                <div className="flex justify-end">
                  <Button onClick={() => saveMutation.mutate()} disabled={saveMutation.isPending} className="gap-2">
                    <Save className="w-4 h-4" />
                    {saveMutation.isPending ? 'Menyimpan...' : 'Simpan Pengaturan'}
                  </Button>
                </div>
              </>
            )}
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
              Kembalikan semua data ke kondisi awal (khusus mode mock)
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
                <p className="font-medium">React + Vite</p>
              </div>
              <div>
                <p className="text-muted-foreground">UI Library</p>
                <p className="font-medium">shadcn/ui + Tailwind</p>
              </div>
              <div>
                <p className="text-muted-foreground">Database</p>
                <p className="font-medium">Postgres (Neon)</p>
              </div>
            </div>
            <Separator />
            <p className="text-sm text-muted-foreground">
              Aplikasi ini menggunakan API serverless (Vercel Functions) untuk akses database Neon.
              Endpoint tersedia di <code className="bg-muted px-1 rounded">/api</code>.
            </p>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
};

export default Settings;
