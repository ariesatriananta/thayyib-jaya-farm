"use client";

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const LoginClient = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMessage('');

    const callbackUrl = searchParams.get('callbackUrl') || '/';
    const result = await signIn('credentials', {
      username,
      password,
      callbackUrl,
      redirect: false,
    });

    if (result?.ok) {
      router.push(callbackUrl);
    } else {
      setIsSubmitting(false);
      setErrorMessage('Username atau password salah.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-accent/20 to-background p-4">
      <div className="w-full max-w-md space-y-6 animate-fade-in">
        {/* Logo */}
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-48 h-48 rounded-3xl mb-4 overflow-hidden bg-background/60 ring-1 ring-border/40 shadow-sm">
            <img
              src="/logo-1.png"
              alt="Logo Thayyib Jaya Farm"
              className="w-36 h-36 object-contain drop-shadow-sm"
            />
          </div>
          <h1 className="text-2xl font-bold text-foreground">Thayyib Jaya Farm</h1>
          <p className="text-muted-foreground">Sistem Pencatatan Layer Farm</p>
        </div>

        {/* Login Card */}
        <Card className="border-border/50 shadow-soft">
          <CardHeader className="text-center pb-2">
            <CardTitle>Masuk ke Akun</CardTitle>
            <CardDescription>
              Masuk menggunakan akun Anda
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Masukkan username"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Masukkan password"
                />
              </div>

              <div className="pt-4">
                <Button type="submit" className="w-full" disabled={isSubmitting}>
                  {isSubmitting ? 'Memproses...' : 'Masuk'}
                </Button>
                {errorMessage && (
                  <p className="text-sm text-destructive text-center mt-3">{errorMessage}</p>
                )}
              </div>
            </form>

          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center">
          <p className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground/80">
            Thayyib Jaya Farm
          </p>
          <p className="text-xs text-muted-foreground">
            Ac 2026. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginClient;
