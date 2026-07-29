import React, { useEffect, useState } from "react";
import { fetchContacts, createContact, updateContact, deleteContact } from "../api/endpoints";
import PageHeader from "../components/ui/PageHeader";
import { Card, Field, Input, Select, ErrorBanner, EmptyState } from "../components/ui/Primitives";
import Button from "../components/ui/Button";

const relationships = ["Parent", "Sibling", "Spouse", "Friend", "Roommate", "Relative", "Other"];

export default function Contacts() {
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const load = async () => {
    const { data } = await fetchContacts();
    setContacts(data.contacts);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm("Remove this contact from your guardian circle?")) return;
    setError("");
    try {
      await deleteContact(id);
      setContacts((prev) => prev.filter((c) => c._id !== id));
    } catch (err) {
      setError(err.response?.data?.message || "Couldn't remove this contact.");
    }
  };

  const editingContact = contacts.find((c) => c._id === editingId);

  return (
    <div>
      <PageHeader
        eyebrow="Your guardian circle"
        title="Emergency contacts"
        subtitle="These are the people notified the instant you trigger SOS, in priority order."
        action={
          <Button
            onClick={() => {
              setEditingId(null);
              setShowForm((v) => !v);
            }}
          >
            {showForm && !editingId ? "Close" : "Add contact"}
          </Button>
        }
      />

      <ErrorBanner message={error} />

      {(showForm || editingContact) && (
        <ContactForm
          key={editingId || "new"}
          initial={editingContact}
          onSaved={(contact) => {
            setContacts((prev) => {
              const exists = prev.some((c) => c._id === contact._id);
              return exists ? prev.map((c) => (c._id === contact._id ? contact : c)) : [...prev, contact];
            });
            setShowForm(false);
            setEditingId(null);
          }}
          onCancel={() => {
            setShowForm(false);
            setEditingId(null);
          }}
          onError={setError}
        />
      )}

      <div className="mt-6">
        {loading ? (
          <p className="text-sm text-ink-soft">Loading...</p>
        ) : contacts.length === 0 ? (
          <EmptyState
            title="No emergency contacts yet"
            description="SOS needs at least one contact on file before it can be triggered. Add the people you'd want notified first."
            action={
              <Button onClick={() => setShowForm(true)} variant="subtle">
                Add your first contact
              </Button>
            }
          />
        ) : (
          <div className="space-y-3">
            {[...contacts]
              .sort((a, b) => a.priority - b.priority)
              .map((c) => (
                <Card key={c._id} className="flex items-center justify-between gap-3 p-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-teal-soft font-display text-sm text-teal-deep">
                      {c.priority}
                    </div>
                    <div>
                      <p className="font-medium text-ink">{c.name}</p>
                      <p className="text-xs text-ink-soft">
                        {c.relationship || "Contact"} · <span className="font-mono">{c.phone}</span>
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      className="px-3 py-1.5 text-xs"
                      onClick={() => {
                        setEditingId(c._id);
                        setShowForm(true);
                      }}
                    >
                      Edit
                    </Button>
                    <Button
                      variant="ghost"
                      className="px-3 py-1.5 text-xs text-alert-deep"
                      onClick={() => handleDelete(c._id)}
                    >
                      Remove
                    </Button>
                  </div>
                </Card>
              ))}
          </div>
        )}
      </div>
    </div>
  );
}

function ContactForm({ initial, onSaved, onCancel, onError }) {
  const [form, setForm] = useState({
    name: initial?.name || "",
    phone: initial?.phone || "",
    relationship: initial?.relationship || relationships[0],
    priority: initial?.priority ?? 1,
  });
  const [submitting, setSubmitting] = useState(false);

  const set = (key) => (e) =>
    setForm({ ...form, [key]: key === "priority" ? Number(e.target.value) : e.target.value });

  const onSubmit = async (e) => {
    e.preventDefault();
    onError("");
    setSubmitting(true);
    try {
      const { data } = initial ? await updateContact(initial._id, form) : await createContact(form);
      onSaved(data.contact);
    } catch (err) {
      onError(err.response?.data?.message || "Couldn't save this contact.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Card className="p-5">
      <form onSubmit={onSubmit} className="grid gap-4 sm:grid-cols-2">
        <Field label="Name" htmlFor="name">
          <Input id="name" required value={form.name} onChange={set("name")} placeholder="Full name" />
        </Field>
        <Field label="Phone" htmlFor="phone">
          <Input id="phone" required type="tel" value={form.phone} onChange={set("phone")} placeholder="+91 98765 43210" />
        </Field>
        <Field label="Relationship" htmlFor="relationship">
          <Select id="relationship" value={form.relationship} onChange={set("relationship")}>
            {relationships.map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="Priority" htmlFor="priority" hint="Lower number = contacted first">
          <Input id="priority" type="number" min="1" value={form.priority} onChange={set("priority")} />
        </Field>
        <div className="flex gap-3 sm:col-span-2">
          <Button type="submit" disabled={submitting}>
            {submitting ? "Saving..." : initial ? "Save changes" : "Add contact"}
          </Button>
          <Button type="button" variant="ghost" onClick={onCancel}>
            Cancel
          </Button>
        </div>
      </form>
    </Card>
  );
}
