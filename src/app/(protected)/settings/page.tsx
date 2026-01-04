"use client";

import { useEffect, useState } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import Loading from './loading';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { settingsService } from '@/lib/services/settingsService';
import { useToast } from '@/hooks/use-toast';
import { Settings as SettingsIcon, Save } from 'lucide-react';
import { signalNavigationDone } from '@/lib/ui/navigationProgress';

const Settings = () => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
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
      })
      .finally(() => {
        if (!isMounted) return;
        setIsLoading(false);
        signalNavigationDone();
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

  if (isLoading) {
    return <Loading />;
  }

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

      </div>
    </AppLayout>
  );
};

export default Settings;
