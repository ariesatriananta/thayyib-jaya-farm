"use client";

import { AppLayout } from "@/components/layout/AppLayout";
import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <AppLayout title="Manajemen Kandang" subtitle="Memuat data kandang...">
      <div className="space-y-6 animate-fade-in">
        <div className="flex justify-end">
          <Skeleton className="h-10 w-40" />
        </div>
        <Skeleton className="h-96 w-full" />
      </div>
    </AppLayout>
  );
}
