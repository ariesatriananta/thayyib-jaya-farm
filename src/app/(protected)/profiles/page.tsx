"use client";

import { useEffect, useMemo, useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import type { UserItem } from "@/lib/services/userService";
import { useSession } from "next-auth/react";
import { Lock, User, Save, Loader2 } from "lucide-react";

const ProfilesPage = () => {
  const { data: session, update } = useSession();
  const { toast } = useToast();
  const currentUserId = session?.user?.id;

  const [profile, setProfile] = useState<UserItem | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);

  const [name, setName] = useState("");
  const [passwordForm, setPasswordForm] = useState({
    password: "",
    confirmPassword: "",
  });

  const initials = useMemo(() => {
    const displayName = profile?.name || session?.user?.name || session?.user?.username || "User";
    return displayName
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase())
      .join("");
  }, [profile?.name, session?.user?.name, session?.user?.username]);

  useEffect(() => {
    let isMounted = true;
    if (!currentUserId) {
      setIsLoading(false);
      return;
    }

    fetch(`/api/users/${currentUserId}`)
      .then(async (response) => {
        if (!response.ok) {
          const message = await response.text();
          throw new Error(message || "Gagal memuat profil");
        }
        return response.json() as Promise<UserItem>;
      })
      .then((current) => {
        if (!isMounted) return;
        setProfile(current);
        setName(current?.name || "");
      })
      .catch((error) => {
        toast({
          title: "Gagal memuat profil",
          description: error instanceof Error ? error.message : "Terjadi kesalahan.",
          variant: "destructive",
        });
      })
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [currentUserId, toast]);

  const handleUpdateName = async () => {
    if (!profile) return;
    if (!name.trim()) {
      toast({
        title: "Nama wajib diisi",
        variant: "destructive",
      });
      return;
    }

    setIsSaving(true);
    try {
      const response = await fetch(`/api/users/${profile.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim() }),
      });

      if (!response.ok) {
        const message = await response.text();
        throw new Error(message || "Gagal menyimpan profil");
      }

      const updated = (await response.json()) as UserItem;
      setProfile(updated);
      await update({ name: updated.name });
      toast({ title: "Berhasil", description: "Profil berhasil diperbarui." });
    } catch (error) {
      toast({
        title: "Gagal menyimpan",
        description: error instanceof Error ? error.message : "Terjadi kesalahan.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleUpdatePassword = async () => {
    if (!profile) return;
    const password = passwordForm.password.trim();
    const confirm = passwordForm.confirmPassword.trim();

    if (!password || !confirm) {
      toast({
        title: "Form belum lengkap",
        description: "Password dan konfirmasi wajib diisi.",
        variant: "destructive",
      });
      return;
    }

    if (password !== confirm) {
      toast({
        title: "Password tidak cocok",
        description: "Pastikan konfirmasi password sama.",
        variant: "destructive",
      });
      return;
    }

    setIsUpdatingPassword(true);
    try {
      const response = await fetch(`/api/users/${profile.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });

      if (!response.ok) {
        const message = await response.text();
        throw new Error(message || "Gagal mengganti password");
      }

      setPasswordForm({ password: "", confirmPassword: "" });
      toast({ title: "Berhasil", description: "Password berhasil diperbarui." });
    } catch (error) {
      toast({
        title: "Gagal mengganti password",
        description: error instanceof Error ? error.message : "Terjadi kesalahan.",
        variant: "destructive",
      });
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  if (isLoading) {
    return (
      <AppLayout title="Profil Saya" subtitle="Kelola informasi akun">
        <div className="space-y-6 animate-fade-in">
          <div className="h-32 rounded-2xl bg-muted animate-pulse" />
          <div className="h-48 rounded-2xl bg-muted animate-pulse" />
        </div>
      </AppLayout>
    );
  }

  if (!profile) {
    return (
      <AppLayout title="Profil Saya" subtitle="Kelola informasi akun">
        <Card>
          <CardHeader>
            <CardTitle>Profil tidak ditemukan</CardTitle>
            <CardDescription>Silakan login ulang atau hubungi admin.</CardDescription>
          </CardHeader>
        </Card>
      </AppLayout>
    );
  }

  return (
    <AppLayout title="Profil Saya" subtitle="Kelola informasi akun">
      <div className="space-y-6 animate-fade-in">
        <Card className="overflow-hidden">
          <div className="h-14 w-full bg-gradient-to-r from-primary/10 via-secondary/10 to-primary/5" />
          <CardHeader className="flex flex-row items-center gap-4 pt-2">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary text-lg font-semibold shadow-sm ring-1 ring-primary/20">
              {initials}
            </div>
            <div>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                {profile?.name || "User"}
              </CardTitle>
              <CardDescription className="flex flex-wrap items-center gap-2">
                <span>@{profile?.username}</span>
                <span className="inline-flex items-center rounded-full border border-primary/20 bg-primary/10 px-2 py-0.5 text-[11px] font-semibold text-primary">
                  {profile?.role?.toUpperCase()}
                </span>
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Nama</Label>
                <Input value={name} onChange={(e) => setName(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Username</Label>
                <Input value={profile?.username || ""} disabled />
              </div>
            </div>
            <div className="mt-6 flex justify-end">
              <Button onClick={handleUpdateName} disabled={isSaving} className="gap-2">
                {isSaving ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <>
                    <Save className="h-4 w-4" />
                    Simpan Perubahan
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="space-y-1">
            <CardTitle className="flex items-center gap-2">
              <Lock className="h-5 w-5" />
              Ganti Password
            </CardTitle>
            <CardDescription>
              Gunakan password yang kuat dan mudah diingat.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Password Baru</Label>
                <Input
                  type="password"
                  value={passwordForm.password}
                  onChange={(e) => setPasswordForm({ ...passwordForm, password: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Konfirmasi Password</Label>
                <Input
                  type="password"
                  value={passwordForm.confirmPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                />
              </div>
            </div>
            <Separator />
            <div className="flex justify-end">
              <Button variant="secondary" onClick={handleUpdatePassword} disabled={isUpdatingPassword}>
                {isUpdatingPassword ? <Loader2 className="h-4 w-4 animate-spin" /> : "Ganti Password"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
};

export default ProfilesPage;
