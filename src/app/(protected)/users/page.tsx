"use client";

import { useEffect, useMemo, useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
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
} from "@/components/ui/alert-dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { EmptyState } from "@/components/common/EmptyState";
import { useToast } from "@/hooks/use-toast";
import { userService, type UserItem } from "@/lib/services/userService";
import { staffAccessService, type StaffAccessItem } from "@/lib/services/staffAccessService";
import { kandangService } from "@/lib/services/kandangService";
import type { Kandang } from "@/lib/mock/types";
import { useSession } from "next-auth/react";
import { Users, Shield, Trash2, Pencil } from "lucide-react";

const UsersPage = () => {
  const { toast } = useToast();
  const { data: session } = useSession();
  const currentUserId = session?.user?.id;

  const [users, setUsers] = useState<UserItem[]>([]);
  const [staffAccess, setStaffAccess] = useState<StaffAccessItem[]>([]);
  const [kandangList, setKandangList] = useState<Kandang[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [createForm, setCreateForm] = useState({
    username: "",
    name: "",
    role: "staff" as "admin" | "staff",
    password: "",
  });

  const [editingUser, setEditingUser] = useState<UserItem | null>(null);
  const [editForm, setEditForm] = useState({
    name: "",
    role: "staff" as "admin" | "staff",
  });

  const [selectedStaffId, setSelectedStaffId] = useState<string>("");
  const [selectedKandangIds, setSelectedKandangIds] = useState<string[]>([]);
  const [isSavingAccess, setIsSavingAccess] = useState(false);

  const staffUsers = useMemo(() => users.filter((u) => u.role === "staff"), [users]);

  useEffect(() => {
    let isMounted = true;
    Promise.all([
      userService.getAll(),
      staffAccessService.getAll(),
      kandangService.getAll(),
    ])
      .then(([userData, accessData, kandangData]) => {
        if (!isMounted) return;
        setUsers(userData);
        setStaffAccess(accessData);
        setKandangList(kandangData);
      })
      .catch((error) => {
        toast({
          title: "Error",
          description: error instanceof Error ? error.message : "Gagal memuat data user.",
          variant: "destructive",
        });
      })
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [toast]);

  useEffect(() => {
    if (!selectedStaffId) {
      setSelectedKandangIds([]);
      return;
    }
    staffAccessService.getByUser(selectedStaffId)
      .then((data) => setSelectedKandangIds(data.kandangIds))
      .catch(() => setSelectedKandangIds([]));
  }, [selectedStaffId]);

  const refreshData = async () => {
    const [userData, accessData] = await Promise.all([
      userService.getAll(),
      staffAccessService.getAll(),
    ]);
    setUsers(userData);
    setStaffAccess(accessData);
  };

  const handleCreateUser = async () => {
    if (!createForm.username.trim() || !createForm.name.trim() || !createForm.password.trim()) {
      toast({
        title: "Form belum lengkap",
        description: "Username, nama, dan password wajib diisi.",
        variant: "destructive",
      });
      return;
    }

    try {
      const created = await userService.create({
        username: createForm.username.trim(),
        name: createForm.name.trim(),
        role: createForm.role,
        password: createForm.password,
      });
      setUsers((prev) => [...prev, created].sort((a, b) => a.username.localeCompare(b.username)));
      setIsCreateOpen(false);
      setCreateForm({ username: "", name: "", role: "staff", password: "" });
      toast({ title: "Berhasil", description: "User baru berhasil dibuat." });
    } catch (error) {
      toast({
        title: "Gagal membuat user",
        description: error instanceof Error ? error.message : "Terjadi kesalahan.",
        variant: "destructive",
      });
    }
  };

  const openEditUser = (user: UserItem) => {
    setEditingUser(user);
    setEditForm({ name: user.name, role: user.role });
  };

  const handleUpdateUser = async () => {
    if (!editingUser) return;
    if (!editForm.name.trim()) {
      toast({
        title: "Nama wajib diisi",
        variant: "destructive",
      });
      return;
    }

    try {
      const updated = await userService.update(editingUser.id, {
        name: editForm.name.trim(),
        role: editForm.role,
      });
      setUsers((prev) => prev.map((item) => (item.id === updated.id ? updated : item)));
      setEditingUser(null);
      await refreshData();
      toast({ title: "Berhasil", description: "User berhasil diperbarui." });
    } catch (error) {
      toast({
        title: "Gagal memperbarui user",
        description: error instanceof Error ? error.message : "Terjadi kesalahan.",
        variant: "destructive",
      });
    }
  };

  const handleDeleteUser = async (userId: string) => {
    try {
      await userService.remove(userId);
      setUsers((prev) => prev.filter((item) => item.id !== userId));
      await refreshData();
      toast({ title: "Berhasil", description: "User berhasil dihapus." });
    } catch (error) {
      toast({
        title: "Gagal menghapus user",
        description: error instanceof Error ? error.message : "Terjadi kesalahan.",
        variant: "destructive",
      });
    }
  };

  const toggleKandang = (kandangId: string) => {
    setSelectedKandangIds((prev) =>
      prev.includes(kandangId)
        ? prev.filter((id) => id !== kandangId)
        : [...prev, kandangId]
    );
  };

  const handleSaveAccess = async () => {
    if (!selectedStaffId) return;
    setIsSavingAccess(true);
    try {
      await staffAccessService.update(selectedStaffId, selectedKandangIds);
      await refreshData();
      toast({ title: "Berhasil", description: "Akses kandang staff diperbarui." });
    } catch (error) {
      toast({
        title: "Gagal menyimpan akses",
        description: error instanceof Error ? error.message : "Terjadi kesalahan.",
        variant: "destructive",
      });
    } finally {
      setIsSavingAccess(false);
    }
  };

  if (isLoading) {
    return (
      <AppLayout title="User" subtitle="Manajemen akun">
        <div className="space-y-6 animate-fade-in">
          <Card>
            <CardHeader>
              <CardTitle>Memuat data...</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-24 rounded-lg bg-muted animate-pulse" />
            </CardContent>
          </Card>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout title="User" subtitle="Kelola akun dan akses staff">
      <div className="space-y-6 animate-fade-in">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-4">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                Manajemen User
              </CardTitle>
            </div>
            <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
              <DialogTrigger asChild>
                <Button>Tambah User</Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>Tambah User</DialogTitle>
                  <DialogDescription>Isi informasi akun baru.</DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-2">
                  <div className="space-y-2">
                    <Label>Username</Label>
                    <Input
                      value={createForm.username}
                      onChange={(e) => setCreateForm({ ...createForm, username: e.target.value })}
                      placeholder="username"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Nama</Label>
                    <Input
                      value={createForm.name}
                      onChange={(e) => setCreateForm({ ...createForm, name: e.target.value })}
                      placeholder="Nama lengkap"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Role</Label>
                    <Select
                      value={createForm.role}
                      onValueChange={(value: "admin" | "staff") =>
                        setCreateForm({ ...createForm, role: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Pilih role" />
                      </SelectTrigger>
                      <SelectContent className="bg-popover">
                        <SelectItem value="admin">Admin</SelectItem>
                        <SelectItem value="staff">Staff</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Password</Label>
                    <Input
                      type="password"
                      value={createForm.password}
                      onChange={(e) => setCreateForm({ ...createForm, password: e.target.value })}
                      placeholder="Password awal"
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsCreateOpen(false)}>
                    Batal
                  </Button>
                  <Button onClick={handleCreateUser}>Simpan</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </CardHeader>
          <CardContent>
            {users.length === 0 ? (
              <EmptyState
                title="Belum ada user"
                description="Tambahkan user baru untuk mulai mengelola akun."
              />
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Username</TableHead>
                      <TableHead>Nama</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead className="text-right">Aksi</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {users.map((user) => {
                      const isSelf = user.id === currentUserId;
                      return (
                        <TableRow key={user.id}>
                          <TableCell className="font-medium">{user.username}</TableCell>
                          <TableCell>{user.name}</TableCell>
                          <TableCell className="uppercase text-xs">{user.role}</TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-2">
                              <Dialog open={editingUser?.id === user.id} onOpenChange={(open) => {
                                if (!open) setEditingUser(null);
                              }}>
                                <DialogTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    disabled={isSelf}
                                    onClick={() => openEditUser(user)}
                                  >
                                    <Pencil className="h-4 w-4" />
                                  </Button>
                                </DialogTrigger>
                                <DialogContent className="sm:max-w-md">
                                  <DialogHeader>
                                    <DialogTitle>Edit User</DialogTitle>
                                    <DialogDescription>
                                      Ubah nama dan role user.
                                    </DialogDescription>
                                  </DialogHeader>
                                  <div className="space-y-4 py-2">
                                    <div className="space-y-2">
                                      <Label>Nama</Label>
                                      <Input
                                        value={editForm.name}
                                        onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                                      />
                                    </div>
                                    <div className="space-y-2">
                                      <Label>Role</Label>
                                      <Select
                                        value={editForm.role}
                                        onValueChange={(value: "admin" | "staff") =>
                                          setEditForm({ ...editForm, role: value })
                                        }
                                      >
                                        <SelectTrigger>
                                          <SelectValue placeholder="Pilih role" />
                                        </SelectTrigger>
                                        <SelectContent className="bg-popover">
                                          <SelectItem value="admin">Admin</SelectItem>
                                          <SelectItem value="staff">Staff</SelectItem>
                                        </SelectContent>
                                      </Select>
                                    </div>
                                  </div>
                                  <DialogFooter>
                                    <Button variant="outline" onClick={() => setEditingUser(null)}>
                                      Batal
                                    </Button>
                                    <Button onClick={handleUpdateUser}>Simpan</Button>
                                  </DialogFooter>
                                </DialogContent>
                              </Dialog>

                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button variant="ghost" size="icon" disabled={isSelf}>
                                    <Trash2 className="h-4 w-4 text-destructive" />
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>Hapus User?</AlertDialogTitle>
                                    <AlertDialogDescription>
                                      User ini akan dihapus permanen dan tidak bisa dikembalikan.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>Batal</AlertDialogCancel>
                                    <AlertDialogAction onClick={() => handleDeleteUser(user.id)}>
                                      Hapus
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            </div>
                            {isSelf && (
                              <p className="text-xs text-muted-foreground mt-1">
                                Tidak bisa edit/hapus diri sendiri
                              </p>
                            )}
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

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5" />
              Akses Kandang Staff
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {staffUsers.length === 0 ? (
              <EmptyState
                title="Belum ada staff"
                description="Tambahkan user staff terlebih dahulu."
              />
            ) : (
              <>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label>Pilih Staff</Label>
                    <Select value={selectedStaffId} onValueChange={setSelectedStaffId}>
                      <SelectTrigger>
                        <SelectValue placeholder="Pilih staff" />
                      </SelectTrigger>
                      <SelectContent className="bg-popover">
                        {staffUsers.map((user) => (
                          <SelectItem key={user.id} value={user.id}>
                            {user.name} ({user.username})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex items-end">
                    <Button
                      disabled={!selectedStaffId || isSavingAccess}
                      onClick={handleSaveAccess}
                    >
                      {isSavingAccess ? "Menyimpan..." : "Simpan Akses"}
                    </Button>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  {kandangList.map((item) => (
                    <label
                      key={item.id}
                      className="flex items-center gap-3 rounded-lg border border-border px-4 py-3"
                    >
                      <Checkbox
                        checked={selectedKandangIds.includes(item.id)}
                        onCheckedChange={() => toggleKandang(item.id)}
                        disabled={!selectedStaffId}
                      />
                      <div>
                        <p className="text-sm font-medium">{item.name}</p>
                        <p className="text-xs text-muted-foreground">
                          Target HDP {item.targetHDPPercent}% · FCR {item.targetFCR}
                        </p>
                      </div>
                    </label>
                  ))}
                </div>

                <div className="mt-4">
                  <h3 className="text-sm font-semibold mb-3">Daftar Akses Staff</h3>
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Staff</TableHead>
                          <TableHead>Kandang</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {staffAccess.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={2} className="text-center text-muted-foreground">
                              Belum ada data akses
                            </TableCell>
                          </TableRow>
                        ) : (
                          staffAccess.map((item) => (
                            <TableRow key={item.userId}>
                              <TableCell className="font-medium">
                                {item.name} ({item.username})
                              </TableCell>
                              <TableCell>
                                {item.kandangNames.length === 0
                                  ? "Belum ada akses"
                                  : item.kandangNames.join(", ")}
                              </TableCell>
                            </TableRow>
                          ))
                        )}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
};

export default UsersPage;
