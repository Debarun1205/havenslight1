import { Siren, Loader2, CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function SosButton({ status, onTrigger, size = 'lg' }) {
  const big = size === 'lg';
  return (
    <button
      onClick={onTrigger}
      disabled={status === 'triggering'}
      className={cn(
        'relative rounded-full flex flex-col items-center justify-center font-heading font-bold text-white transition-all',
        big ? 'w-56 h-56 text-2xl' : 'w-40 h-40 text-lg',
        status === 'idle' && 'bg-destructive animate-sos-pulse hover:scale-[1.02] active:scale-95',
        status === 'triggering' && 'bg-destructive/80',
        status === 'active' && 'bg-destructive'
      )}
    >
      {status === 'triggering' ? (
        <Loader2 className="w-10 h-10 animate-spin" />
      ) : status === 'active' ? (
        <CheckCircle2 className="w-10 h-10" />
      ) : (
        <Siren className="w-12 h-12" />
      )}
      <span className="mt-2 tracking-wide">
        {status === 'triggering' ? 'Sending alert…' : status === 'active' ? 'Alert active' : 'SOS'}
      </span>
    </button>
  );
}