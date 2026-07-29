import React, { useEffect, useState } from "react";
import { searchDoctors } from "../api/endpoints";
import PageHeader from "../components/ui/PageHeader";
import { Card, Field, Input, Select, Badge, EmptyState, ErrorBanner } from "../components/ui/Primitives";
import Button from "../components/ui/Button";
import { SCHEDULED_LANGUAGES } from "../constants/india";

const specialties = [
  "General Physician",
  "Gynecologist",
  "Dermatologist",
  "Orthopedic",
  "Pediatrician",
  "Psychiatrist",
  "Dentist",
  "ENT",
];

export default function Doctors() {
  const [filters, setFilters] = useState({ city: "", specialty: "", language: "" });
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searched, setSearched] = useState(false);

  const runSearch = async (params) => {
    setLoading(true);
    setError("");
    try {
      const cleaned = Object.fromEntries(Object.entries(params).filter(([, v]) => v));
      const { data } = await searchDoctors(cleaned);
      setDoctors(data.doctors);
    } catch (err) {
      setError(err.response?.data?.message || "Couldn't load the doctor directory.");
    } finally {
      setLoading(false);
      setSearched(true);
    }
  };

  useEffect(() => {
    runSearch(filters);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onSubmit = (e) => {
    e.preventDefault();
    runSearch(filters);
  };

  return (
    <div>
      <PageHeader
        eyebrow="No login needed"
        title="Find a doctor"
        subtitle="Search by city, specialty, and the language you're most comfortable speaking — because explaining symptoms shouldn't be the hard part."
      />

      <Card className="p-5">
        <form onSubmit={onSubmit} className="grid gap-4 sm:grid-cols-4">
          <Field label="City">
            <Input
              value={filters.city}
              onChange={(e) => setFilters({ ...filters, city: e.target.value })}
              placeholder="e.g. Chennai"
            />
          </Field>
          <Field label="Specialty">
            <Select value={filters.specialty} onChange={(e) => setFilters({ ...filters, specialty: e.target.value })}>
              <option value="">Any</option>
              {specialties.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Language">
            <Select value={filters.language} onChange={(e) => setFilters({ ...filters, language: e.target.value })}>
              <option value="">Any</option>
              {SCHEDULED_LANGUAGES.map((l) => (
                <option key={l} value={l}>
                  {l}
                </option>
              ))}
            </Select>
          </Field>
          <div className="flex items-end">
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Searching..." : "Search"}
            </Button>
          </div>
        </form>
      </Card>

      <ErrorBanner message={error} />

      <div className="mt-6">
        {loading ? (
          <p className="text-sm text-ink-soft">Searching the directory...</p>
        ) : doctors.length === 0 && searched ? (
          <EmptyState
            title="No doctors match those filters"
            description="Try a broader search — clear the specialty or language filter and search by city alone."
          />
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {doctors.map((d) => (
              <Card key={d._id} className="p-5">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="font-display text-lg text-ink">{d.name}</h3>
                    {d.clinicName && <p className="text-sm text-ink-soft">{d.clinicName}</p>}
                  </div>
                  {d.verified && <Badge tone="teal">Verified</Badge>}
                </div>

                <div className="mt-3 flex flex-wrap gap-1.5">
                  <Badge tone="navy">{d.specialty}</Badge>
                  <Badge tone="gold">{d.city}</Badge>
                </div>

                {d.languagesSpoken?.length > 0 && (
                  <p className="mt-3 text-xs text-ink-soft">
                    Speaks: {d.languagesSpoken.join(", ")}
                  </p>
                )}

                <div className="mt-3 flex items-center justify-between border-t border-ink/10 pt-3 text-sm">
                  <span className="font-mono text-ink-soft">{d.phone || "—"}</span>
                  {d.consultationFeeINR != null && (
                    <span className="font-semibold text-teal-deep">₹{d.consultationFeeINR}</span>
                  )}
                </div>
                {d.address && <p className="mt-2 text-xs text-ink-soft">{d.address}</p>}
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
