import { useEffect, useMemo, useState } from 'react';
import { Stethoscope, Search, SlidersHorizontal, MapPin } from 'lucide-react';
import Layout from '@/components/Layout';
import DoctorCard from '@/components/doctors/DoctorCard';
import TriageWidget from '@/components/doctors/TriageWidget';
import { base44 } from '@/api/base44Client';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export default function Doctors() {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [city, setCity] = useState('all');
  const [specialty, setSpecialty] = useState('all');
  const [language, setLanguage] = useState('all');
  const [womenOnly, setWomenOnly] = useState(false);

  useEffect(() => {
    base44.entities.Doctor.list().then(setDoctors).finally(() => setLoading(false));
  }, []);

  const cities = useMemo(() => ['all', ...new Set(doctors.map((d) => d.city))], [doctors]);
  const specialties = useMemo(() => ['all', ...new Set(doctors.map((d) => d.specialty))], [doctors]);
  const languages = useMemo(() => {
    const set = new Set(['all']);
    doctors.forEach((d) => (d.languages || []).forEach((l) => set.add(l)));
    return [...set];
  }, [doctors]);

  const filtered = useMemo(() => {
    return doctors
      .filter((d) => city === 'all' || d.city === city)
      .filter((d) => specialty === 'all' || d.specialty.toLowerCase() === specialty.toLowerCase())
      .filter((d) => language === 'all' || (d.languages || []).map((l) => l.toLowerCase()).includes(language.toLowerCase()))
      .filter((d) => !womenOnly || d.women_friendly)
      .filter((d) => !query || d.name.toLowerCase().includes(query.toLowerCase()) || d.specialty.toLowerCase().includes(query.toLowerCase()))
      .sort((a, b) => (b.trust_score || 0) - (a.trust_score || 0));
  }, [doctors, city, specialty, language, womenOnly, query]);

  return (
    <Layout>
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-10 py-8 lg:py-12">
        <div className="flex items-center gap-2 text-xs font-medium text-primary mb-2">
          <Stethoscope className="w-4 h-4" /> Medical directory
        </div>
        <h1 className="font-heading text-2xl sm:text-3xl font-bold">Find a Doctor</h1>
        <p className="text-sm text-muted-foreground mt-1.5 max-w-xl">
          Real, language-matched doctors across India — vetted by other travelers, with transparent pricing.
        </p>

        <div className="grid lg:grid-cols-3 gap-5 mt-6">
          {/* Filters + triage */}
          <div className="space-y-4">
            <TriageWidget onPickSpecialty={(s) => setSpecialty(s)} />
            <div className="rounded-2xl border border-border bg-card p-4 space-y-3">
              <div className="flex items-center gap-2 text-sm font-semibold">
                <SlidersHorizontal className="w-4 h-4" /> Filters
              </div>
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search name or specialty" className="pl-9" />
              </div>
              <Select value={city} onValueChange={setCity}>
                <SelectTrigger><SelectValue placeholder="City" /></SelectTrigger>
                <SelectContent>{cities.map((c) => <SelectItem key={c} value={c}>{c === 'all' ? 'All cities' : c}</SelectItem>)}</SelectContent>
              </Select>
              <Select value={specialty} onValueChange={setSpecialty}>
                <SelectTrigger><SelectValue placeholder="Specialty" /></SelectTrigger>
                <SelectContent>{specialties.map((s) => <SelectItem key={s} value={s}>{s === 'all' ? 'All specialties' : s}</SelectItem>)}</SelectContent>
              </Select>
              <Select value={language} onValueChange={setLanguage}>
                <SelectTrigger><SelectValue placeholder="Language" /></SelectTrigger>
                <SelectContent>{languages.map((l) => <SelectItem key={l} value={l}>{l === 'all' ? 'Any language' : l}</SelectItem>)}</SelectContent>
              </Select>
              <label className="flex items-center gap-2 text-sm cursor-pointer">
                <input type="checkbox" checked={womenOnly} onChange={(e) => setWomenOnly(e.target.checked)} className="rounded" />
                Women-vetted only
              </label>
            </div>
          </div>

          {/* Results */}
          <div className="lg:col-span-2">
            <p className="text-sm text-muted-foreground mb-3">{filtered.length} doctor{filtered.length !== 1 ? 's' : ''} found</p>
            {loading ? (
              <div className="grid sm:grid-cols-2 gap-3">{[0,1,2,3].map((i) => <div key={i} className="h-44 rounded-2xl bg-secondary animate-pulse" />)}</div>
            ) : filtered.length === 0 ? (
              <div className="rounded-2xl border-2 border-dashed border-border p-10 text-center">
                <MapPin className="w-8 h-8 text-muted-foreground mx-auto" />
                <p className="font-semibold mt-3">No doctors match</p>
                <p className="text-sm text-muted-foreground mt-1">Try widening your filters.</p>
              </div>
            ) : (
              <div className="grid sm:grid-cols-2 gap-3">
                {filtered.map((d) => <DoctorCard key={d.id} doctor={d} />)}
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}