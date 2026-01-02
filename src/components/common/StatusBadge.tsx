import { cn } from '@/lib/utils';

interface StatusBadgeProps {
  status: 'excellent' | 'good' | 'warning' | 'danger';
  label?: string;
  size?: 'sm' | 'md';
}

const statusConfig = {
  excellent: { 
    class: 'status-excellent', 
    defaultLabel: 'Excellent',
    dotClass: 'bg-success'
  },
  good: { 
    class: 'status-good', 
    defaultLabel: 'Good',
    dotClass: 'bg-primary'
  },
  warning: { 
    class: 'status-warning', 
    defaultLabel: 'Warning',
    dotClass: 'bg-warning'
  },
  danger: { 
    class: 'status-danger', 
    defaultLabel: 'Danger',
    dotClass: 'bg-destructive'
  },
};

export function StatusBadge({ status, label, size = 'md' }: StatusBadgeProps) {
  const config = statusConfig[status];
  
  return (
    <span 
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border font-medium",
        config.class,
        size === 'sm' ? "px-2 py-0.5 text-xs" : "px-3 py-1 text-sm"
      )}
    >
      <span className={cn("w-1.5 h-1.5 rounded-full", config.dotClass)} />
      {label || config.defaultLabel}
    </span>
  );
}

interface KandangStatusBadgeProps {
  status: 'active' | 'inactive';
  size?: 'sm' | 'md';
}

export function KandangStatusBadge({ status, size = 'md' }: KandangStatusBadgeProps) {
  return (
    <span 
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border font-medium",
        status === 'active' ? 'status-good' : 'status-warning',
        size === 'sm' ? "px-2 py-0.5 text-xs" : "px-3 py-1 text-sm"
      )}
    >
      <span className={cn(
        "w-1.5 h-1.5 rounded-full",
        status === 'active' ? 'bg-primary' : 'bg-warning'
      )} />
      {status === 'active' ? 'Aktif' : 'Tidak Aktif'}
    </span>
  );
}
