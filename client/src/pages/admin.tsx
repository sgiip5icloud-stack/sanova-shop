import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Loader2, Plus, Pencil, Trash2, Save, X, Lock } from "lucide-react";
import type { KolVideo } from "@/lib/api";

type KolForm = { name: string; channel: string; followers: string; videoUrl: string; thumbnailUrl: string; quote: string };
const EMPTY: KolForm = { name: "", channel: "", followers: "", videoUrl: "", thumbnailUrl: "", quote: "" };

export function Admin() {
  const [password, setPassword] = useState(() => sessionStorage.getItem("admin_pw") || "");
  const [isAuth, setIsAuth] = useState(false);
  const [loginInput, setLoginInput] = useState("");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [addingNew, setAddingNew] = useState(false);
  const [form, setForm] = useState<KolForm>(EMPTY);
  const qc = useQueryClient();

  useEffect(() => {
    if (password) {
      fetch("/api/admin/kol-videos/0", { method: "PUT", headers: { "x-admin-password": password, "content-type": "application/json" }, body: "{}" })
        .then(r => { if (r.status !== 401) setIsAuth(true); });
    }
  }, []);

  const { data: videos = [], isLoading } = useQuery<KolVideo[]>({
    queryKey: ["kol-videos"], queryFn: async () => { const r = await fetch("/api/kol-videos"); return r.json(); }, enabled: isAuth,
  });

  const headers = { "x-admin-password": password, "content-type": "application/json" };

  const createMut = useMutation({
    mutationFn: async (data: KolForm) => { const r = await fetch("/api/admin/kol-videos", { method: "POST", headers, body: JSON.stringify({ ...data, sortOrder: videos.length + 1 }) }); return r.json(); },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["kol-videos"] }); setAddingNew(false); setForm(EMPTY); },
  });

  const updateMut = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: KolForm }) => { await fetch(`/api/admin/kol-videos/${id}`, { method: "PUT", headers, body: JSON.stringify(data) }); },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["kol-videos"] }); setEditingId(null); setForm(EMPTY); },
  });

  const deleteMut = useMutation({
    mutationFn: async (id: number) => { await fetch(`/api/admin/kol-videos/${id}`, { method: "DELETE", headers }); },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["kol-videos"] }),
  });

  const handleLogin = async () => {
    const r = await fetch("/api/admin/kol-videos/0", { method: "PUT", headers: { "x-admin-password": loginInput, "content-type": "application/json" }, body: "{}" });
    if (r.status !== 401) { sessionStorage.setItem("admin_pw", loginInput); setPassword(loginInput); setIsAuth(true); }
  };

  if (!isAuth) return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-sm space-y-6 text-center">
        <Lock className="h-12 w-12 text-primary mx-auto" />
        <h1 className="text-2xl font-serif font-medium">Admin Panel</h1>
        <div className="flex gap-2">
          <Input type="password" placeholder="Admin password" value={loginInput} onChange={e => setLoginInput(e.target.value)} onKeyDown={e => e.key === "Enter" && handleLogin()} />
          <Button onClick={handleLogin}>Login</Button>
        </div>
      </div>
    </div>
  );

  const FormFields = () => (
    <div className="grid gap-3">
      <Input placeholder="Name" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
      <Input placeholder="Channel" value={form.channel} onChange={e => setForm(f => ({ ...f, channel: e.target.value }))} />
      <Input placeholder="Followers" value={form.followers} onChange={e => setForm(f => ({ ...f, followers: e.target.value }))} />
      <Input placeholder="Video URL" value={form.videoUrl} onChange={e => setForm(f => ({ ...f, videoUrl: e.target.value }))} />
      <Input placeholder="Thumbnail URL" value={form.thumbnailUrl} onChange={e => setForm(f => ({ ...f, thumbnailUrl: e.target.value }))} />
      <Input placeholder="Quote" value={form.quote} onChange={e => setForm(f => ({ ...f, quote: e.target.value }))} />
    </div>
  );

  return (
    <div className="container mx-auto px-4 py-12 max-w-3xl">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-serif font-medium">KOL Video Manager</h1>
        <Button onClick={() => { setAddingNew(true); setForm(EMPTY); }}><Plus className="h-4 w-4 mr-2" />Add</Button>
      </div>
      {addingNew && (
        <div className="border rounded-xl p-6 mb-6 bg-card">
          <h3 className="font-semibold mb-4">New KOL Video</h3>
          <FormFields />
          <div className="flex gap-2 mt-4">
            <Button onClick={() => createMut.mutate(form)} disabled={createMut.isPending}><Save className="h-4 w-4 mr-2" />Save</Button>
            <Button variant="ghost" onClick={() => setAddingNew(false)}><X className="h-4 w-4 mr-2" />Cancel</Button>
          </div>
        </div>
      )}
      {isLoading ? <Loader2 className="h-8 w-8 animate-spin mx-auto" /> : (
        <div className="flex flex-col gap-4">
          {videos.map(v => (
            <div key={v.id} className="border rounded-xl p-6 bg-card">
              {editingId === v.id ? (
                <>
                  <FormFields />
                  <div className="flex gap-2 mt-4">
                    <Button onClick={() => updateMut.mutate({ id: v.id, data: form })}><Save className="h-4 w-4 mr-2" />Save</Button>
                    <Button variant="ghost" onClick={() => setEditingId(null)}><X className="h-4 w-4 mr-2" />Cancel</Button>
                  </div>
                </>
              ) : (
                <div className="flex justify-between items-start">
                  <div><div className="font-semibold">{v.name}</div><div className="text-sm text-muted-foreground">{v.channel} — {v.followers}</div><div className="text-sm italic mt-1">"{v.quote}"</div></div>
                  <div className="flex gap-2 shrink-0">
                    <Button variant="ghost" size="icon" onClick={() => { setEditingId(v.id); setForm({ name: v.name, channel: v.channel, followers: v.followers, videoUrl: v.videoUrl, thumbnailUrl: v.thumbnailUrl, quote: v.quote }); }}><Pencil className="h-4 w-4" /></Button>
                    <Button variant="ghost" size="icon" className="text-destructive" onClick={() => deleteMut.mutate(v.id)}><Trash2 className="h-4 w-4" /></Button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
