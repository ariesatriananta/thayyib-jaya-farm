"use client";

import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-accent/20 to-background p-4">
      <div className="w-full max-w-md space-y-6 animate-fade-in">
        <div className="text-center">
          <Skeleton className="h-48 w-48 rounded-3xl mx-auto mb-4" />
          <Skeleton className="h-6 w-48 mx-auto" />
          <Skeleton className="h-4 w-56 mx-auto mt-2" />
        </div>
        <Skeleton className="h-72 w-full" />
      </div>
    </div>
  );
}
