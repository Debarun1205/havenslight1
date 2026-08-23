import { useEffect, useRef, useState } from "react";
import { FolderLock, Plus, FileText, Download, Trash2, Loader2, Lock, Calendar } from "lucide-react";
import Layout from "@/components/Layout";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { useToast } from "@/components/ui/use-toast";
import { cn } from "@/lib/utils";

const TYPES = ["Passport", "Visa", "Vaccination", "Insurance", "Other"];
const TYPE_STYLE = {
  Passport: "text-blue-600 bg-blue-50",
  Visa: "text-green-600 bg-green-50",
  Vaccination: "text-purple-600 bg-purple-50",
  Insurance: "text-amber-600 bg-amber-50",
  Other: "text-slate-600 bg-slate-50"
};

export default function DocumentLocker() {
  const { toast } = useToast();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [viewing, setViewing] = useState(null);
  const [title, setTitle] = useState("");
  const [docType, setDocType] = useState("Passport");
  const [file, setFile] = useState(null);
  const [notes, setNotes] = useState("");
  const [expiresOn, setExpiresOn] = useState("");
  const fileRef = useRef(null);

  const load = () => {
    setLoading(true);
    base44.entities.Document.list("-created_date", 100).then(setItems).finally(() => setLoading(false));
  };
  useEffect(() => { load(); }, []);

  const reset = () => {
    setTitle(""); setDocType("Passport"); setFile(null); setNotes(""); setExpiresOn("");
    if (fileRef.current) fileRef.current.value = "";
  };

  const submit = async () => {
    if (!title || !file) { toast({ title: "Add a title and a file", variant: "destructive" }); return; }
    setSaving(true);
    try {
      const { file_uri } = await base44.integrations.Core.UploadPrivateFile({ file });
      await base44.entities.Document.create({
        title, doc_type: docType, file_uri, file_name: file.name, notes, expires_on: expiresOn || null,
      });
      setOpen(false); reset(); load();
      toast({ title: "Document saved", description: "Stored securely in your private locker." });
    } catch (e) {
      toast({ title: "Upload failed", description: e.message, variant: "destructive" });
    }
    setSaving(false);
  };

  const view = async (doc) => {
    setViewing(doc.id);
    try {
      const { signed_url } = await base44.integrations.Core.CreateFileSignedUrl({ file_uri: doc.file_uri, expires_in: 300 });
      window.open(signed_url, "_blank", "noopener");
    } catch (e) {
      toast({ title: "Could not open file", description: e.message, variant: "destructive" });
    }
    setViewing(null);
  };

  const remove = async (doc) => {
    await base44.entities.Document.delete(doc.id);
    load();
    toast({ title: "Document removed" });
  };

  return (
    <Layout>
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-10 py-8 lg:py-12">
        <div className="flex items-center gap-2 text-xs font-medium text-primary mb-2">
          <FolderLock className="w-4 h-4" /> Encrypted, private to you
        </div>
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h1 className="font-heading text-2xl sm:text-3xl font-bold">Document Locker</h1>
            <p className="text-sm text-muted-foreground mt-1.5">Securely store passport, visa, and vaccination copies for instant retrieval.</p>
          </div>
          <Button onClick={() => setOpen(true)}><Plus className="w-4 h-4" /> Add document</Button>
        </div>

        <div className="flex items-center gap-2 mt-4 text-xs text-muted-foreground bg-primary/5 border border-primary/20 rounded-xl px-3.5 py-2.5">
          <Lock className="w-3.5 h-3.5 text-primary" />
          Only you can see your documents. Files are private and accessed via time-limited links.
        </div>

        <div className="mt-5 space-y-3">
          {loading ? (
            [0, 1, 2].map((i) => <div key={i} className="h-24 rounded-2xl bg-secondary animate-pulse" />)
          ) : items.length === 0 ? (
            <div className="rounded-2xl border-2 border-dashed border-border p-12 text-center">
              <FolderLock className="w-10 h-10 text-muted-foreground mx-auto" />
              <p className="font-semibold mt-3">Your locker is empty</p>
              <p className="text-sm text-muted-foreground mt-1">Add your passport, visas, and vaccination records for easy access.</p>
            </div>
          ) : items.map((doc) => {
            const expired = doc.expires_on && new Date(doc.expires_on) < new Date();
            const soon = doc.expires_on && !expired && (new Date(doc.expires_on) - new Date()) < 30 * 86400000;
            return (
              <div key={doc.id} className="flex items-center gap-3 rounded-2xl border border-border bg-card p-4">
                <div className={cn("w-11 h-11 rounded-xl flex items-center justify-center shrink-0", TYPE_STYLE[doc.doc_type] || TYPE_STYLE.Other)}>
                  <FileText className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-medium truncate">{doc.title}</p>
                    <span className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-secondary text-muted-foreground">{doc.doc_type}</span>
                  </div>
                  <p className="text-xs text-muted-foreground truncate">{doc.file_name}</p>
                  {doc.expires_on && (
                    <span className={cn("text-[11px] inline-flex items-center gap-0.5 mt-0.5 font-medium",
                      expired ? "text-red-600" : soon ? "text-amber-600" : "text-muted-foreground")}>
                      <Calendar className="w-3 h-3" /> {expired ? "Expired" : "Expires"} {new Date(doc.expires_on).toLocaleDateString()}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <Button variant="outline" size="icon" onClick={() => view(doc)} disabled={viewing === doc.id}>
                    {viewing === doc.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => remove(doc)} className="text-destructive hover:text-destructive">
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <Dialog open={open} onOpenChange={(o) => { setOpen(o); if (!o) reset(); }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader><DialogTitle>Add a document</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div className="space-y-1.5">
              <Label htmlFor="title">Title</Label>
              <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Passport copy" />
            </div>
            <div className="space-y-1.5">
              <Label>Type</Label>
              <Select value={docType} onValueChange={setDocType}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{TYPES.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="file">File (PDF / image)</Label>
              <Input id="file" type="file" ref={fileRef} onChange={(e) => setFile(e.target.files?.[0] || null)} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="expires">Expiry date (optional)</Label>
              <Input id="expires" type="date" value={expiresOn} onChange={(e) => setExpiresOn(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="notes">Notes (optional)</Label>
              <Textarea id="notes" value={notes} onChange={(e) => setNotes(e.target.value)} rows={2} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={submit} disabled={saving || !file || !title}>
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Lock className="w-4 h-4" />}
              {saving ? "Securing\u2026" : "Save securely"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Layout>
  );
}