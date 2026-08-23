import { Phone, Mail, MessageCircle, Pencil, Trash2, Star } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function ContactCard({ contact, onEdit, onDelete }) {
  const cleanPhone = contact.phone.replace(/[^\d+]/g, '');
  const waPhone = cleanPhone.replace(/^\+/, '');
  const waText = encodeURIComponent(
    `Hi ${contact.name}, this is an automated safety check from HavensLight. I may need help. Please call me.`
  );

  return (
    <div className="group rounded-2xl border border-border bg-card p-4 shadow-soft transition-all hover:shadow-glow">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-primary/15 to-accent/20 flex items-center justify-center font-heading font-bold text-primary text-lg shrink-0">
            {contact.name?.[0]?.toUpperCase() || '?'}
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <p className="font-semibold truncate">{contact.name}</p>
              {contact.priority === 1 && <Star className="w-3.5 h-3.5 fill-accent text-accent" />}
            </div>
            <p className="text-xs text-muted-foreground">{contact.relationship} · Priority {contact.priority}</p>
          </div>
        </div>
        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button onClick={() => onEdit(contact)} className="p-2 rounded-lg hover:bg-secondary">
            <Pencil className="w-4 h-4 text-muted-foreground" />
          </button>
          <button onClick={() => onDelete(contact)} className="p-2 rounded-lg hover:bg-destructive/10">
            <Trash2 className="w-4 h-4 text-destructive" />
          </button>
        </div>
      </div>

      <div className="flex items-center gap-2 mt-4">
        <a href={`tel:${cleanPhone}`} className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl bg-secondary text-sm font-medium hover:bg-secondary/70">
          <Phone className="w-4 h-4" /> Call
        </a>
        {contact.notify_whatsapp && (
          <a href={`https://wa.me/${waPhone}?text=${waText}`} target="_blank" rel="noreferrer"
            className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl bg-[#25D366]/10 text-[#1da851] text-sm font-medium hover:bg-[#25D366]/20">
            <MessageCircle className="w-4 h-4" /> WhatsApp
          </a>
        )}
        {contact.email && (
          <a href={`mailto:${contact.email}`} className="p-2 rounded-xl bg-secondary hover:bg-secondary/70">
            <Mail className="w-4 h-4 text-muted-foreground" />
          </a>
        )}
      </div>
    </div>
  );
}