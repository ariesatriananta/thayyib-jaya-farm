"use client";

import { useState } from 'react';
import Link from 'next/link';
import { signIn } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Egg, ArrowRight } from 'lucide-react';

const Login = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

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
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-accent/20 to-background p-4">
      <div className="w-full max-w-md space-y-6 animate-fade-in">
        {/* Logo */}
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary text-primary-foreground mb-4">
            <Egg className="w-8 h-8" />
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
                  placeholder="thayyib"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                />
              </div>

              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? 'Memproses...' : 'Masuk'}
              </Button>
            </form>

            <div className="mt-6 pt-6 border-t text-center">
              <p className="text-sm text-muted-foreground mb-3">
                Gunakan akun yang tersedia. Jika sudah login, Anda akan diarahkan ke dashboard.
              </p>
              <Link href="/">
                <Button variant="outline" className="gap-2">
                  Langsung ke Dashboard
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <p className="text-center text-xs text-muted-foreground">
          © 2024 Thayyib Jaya Farm. All rights reserved.
        </p>
      </div>
    </div>
  );
};

export default Login;
