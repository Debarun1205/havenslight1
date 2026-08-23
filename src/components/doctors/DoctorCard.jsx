import { Phone, Mail, Star, Languages, Shield, IndianRupee } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

export default function DoctorCard({ doctor, onRecommend }) {
  const phone = doctor.phone?.replace(/[^\d+]/g, '');
  const highlighted = onRecommend?.(doctor);

  return (
    <div className={cn(
      'rounded-2xl border bg-card p-4 shadow-soft transition-all hover:shadow-glow',
      highlighted ? 'border-accent ring-2 ring-accent/30' : 'border-border'
    )}>
      <div className="flex items-start gap-3">
        <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-primary/15 to-accent/20 flex items-center justify-center font-heading font-bold text-primary shrink-0">
          {doctor.name?.[0]?.toUpperCase()}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="font-semibold truncate">{doctor.name}</p>
            {doctor.women_friendly && (
              <Badge variant="outline" className="text-[10px] py-0 px-1.5 border-pink-300 text-pink-600 bg-pink-50">
                <Shield className="w-2.5 h-2.5 mr-0.5" /> Women-vetted
              </Badge>
            )}
          </div>
          <p className="text-xs text-muted-foreground">{doctor.specialty} · {doctor.city}</p>
          <div className="flex items-center gap-1 mt-1">
            <Star className="w-3.5 h-3.5 fill-accent text-accent" />
            <span className="text-xs font-medium">{doctor.trust_score?.toFixed(1)}</span>
            <span className="text-[11px] text-muted-foreground">({doctor.reviews_count} traveler reviews)</span>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 mt-3">
        {doctor.languages?.map((l) => (
          <Badge key={l} variant="secondary" className="text-[10px] py-0 px-1.5">
            <Languages className="w-2.5 h-2.5 mr-0.5" /> {l}
          </Badge>
        ))}
        {doctor.cost_estimate && (
          <Badge variant="secondary" className="text-[10px] py-0 px-1.5">
            <IndianRupee className="w-2.5 h-2.5" /> {doctor.cost_estimate}
          </Badge>
        )}
      </div>

      <div className="flex items-center gap-2 mt-3">
        <a href={`tel:${phone}`} className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90">
          <Phone className="w-4 h-4" /> Call
        </a>
        {doctor.email && (
          <a href={`mailto:${doctor.email}`} className="p-2 rounded-xl bg-secondary hover:bg-secondary/70">
            <Mail className="w-4 h-4" />
          </a>
        )}
      </div>
    </div>
  );
}