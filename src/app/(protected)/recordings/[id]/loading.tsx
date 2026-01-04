"use client";

import { AppLayout } from "@/components/layout/AppLayout";
import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <AppLayout title="Edit Pencatatan" subtitle="Memuat data...">
      <div className="max-w-2xl mx-auto space-y-6 animate-fade-in">
        <Skeleton className="h-5 w-40" />
        <Skeleton className="h-96 w-full" />
      </div>
    </AppLayout>
  );
}
