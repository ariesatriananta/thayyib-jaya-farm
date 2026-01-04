"use client";

import { AppLayout } from "@/components/layout/AppLayout";
import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <AppLayout title="Pengaturan" subtitle="Memuat pengaturan...">
      <div className="max-w-2xl mx-auto space-y-6 animate-fade-in">
        <Skeleton className="h-64 w-full" />
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-32 w-full" />
      </div>
    </AppLayout>
  );
}
