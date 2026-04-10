import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Loader2, Plus, Pencil, Trash2, Save, X, Lock, Package, Film, ChevronDown, ChevronUp } from "lucide-react";
import { formatPrice } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { KolVideo, Order } from "@/lib/api";

type KolForm = { name: string; channel: string; followers: string; videoUrl: string; thumbnailUrl: string; quote: string };
const EMPTY: KolForm = { name: "", channel: "", followers: "", videoUrl: "", thumbnailUrl: "", quote: "" };

function useAdminPassword() {
  const [password, setPassword] = useState(() => sessionStorage.getItem("admin_pw") || "");
  const [isAuth, setIsAuth] = useState(false);
  const [loginInput, setLoginInput] = useState("");

  useEffect(() => {
    if (password) {
      fetch("/api/admin/kol-videos/0", { method: "PUT", headers: { "x-admin-password": password, "content-type": "application/json" }, body: "{}" })
        .then(r => { if (r.status !== 401) setIsAuth(true); });
    }
  }, []);

  const login = async () => {
    const r = await fetch("/api/admin/kol-videos/0", { method: "PUT", headers: { "x-admin-password": loginInput, "content-type": "application/json" }, body: "{}" });
    if (r.status !== 401) { sessionStorage.setItem("admin_pw", loginInput); setPassword(loginInput); setIsAuth(true); return true; }
    return false;
  };

  return { password, isAuth, loginInput, setLoginInput, login };
}

function OrdersPanel() {
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const qc = useQueryClient();
  const password = sessionStorage.getItem("admin_pw") || "";

  const { data: orders = [], isLoading } = useQuery<Order[]>({
    queryKey: ["admin-orders"],
    queryFn: async () => {
      const res = await fetch("/api/admin/orders", {
        headers: { "x-admin-password": password },
      });
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
  });

  const updateStatus = useMutation({
    mutationFn: async ({ id, status }: { id: number; status: string }) => {
      await fetch(`/api/admin/orders/${id}/status`, {
        method: "PUT",
        headers: { "x-admin-password": password, "content-type": "application/json" },
        body: JSON.stringify({ status }),
      });
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin-orders"] }),
  });

  const statuses = ["pending", "confirmed", "shipping", "delivered", "cancelled"];

  const statusColor = (s: string, active: boolean) => {
    if (!active) return "";
    switch (s) {
      case "pending": return "bg-yellow-500 hover:bg-yellow-600 text-white";
      case "confirmed": return "bg-blue-600 hover:bg-blue-700 text-white";
      case "shipping": return "bg-orange-500 hover:bg-orange-600 text-white";
      case "delivered": return "bg-green-600 hover:bg-green-700 text-white";
      case "cancelled": return "bg-destructive hover:bg-destructive/90 text-white";
      default: return "";
    }
  };

  const badgeVariant = (s: string) => {
    switch (s) {
      case "delivered": return "default" as const;
      case "cancelled": return "destructive" as const;
      default: return "secondary" as const;
    }
  };

  if (isLoading) return <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin" /></div>;

  return (
    <div className="space-y-4">
      {orders.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">No orders yet.</div>
      ) : (
        orders.map(order => (
          <div key={order.id} className="border rounded-xl bg-card overflow-hidden">
            <div
              className="p-4 flex flex-wrap items-center justify-between gap-4 cursor-pointer hover:bg-muted/30 transition-colors"
              onClick={() => setExpandedId(expandedId === order.id ? null : order.id)}
            >
              <div className="flex items-center gap-6 flex-wrap">
                <span className="font-mono text-sm font-semibold">#{String(order.id).padStart(5, "0")}</span>
                <span className="font-medium">{order.customerName}</span>
                <span className="text-sm text-muted-foreground">{order.customerPhone}</span>
                <span className="font-semibold text-primary">{formatPrice(order.totalAmount)}</span>
              </div>
              <div className="flex items-center gap-3">
                <Badge variant={badgeVariant(order.status)} className="capitalize">{order.status}</Badge>
                <span className="text-xs text-muted-foreground">{new Date(order.createdAt).toLocaleDateString()}</span>
                {expandedId === order.id ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </div>
            </div>

            {expandedId === order.id && (
              <div className="border-t p-4 bg-muted/10 space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground block mb-1">Customer</span>
                    <div className="font-medium">{order.customerName}</div>
                    <div>{order.customerPhone}</div>
                    <div>{order.customerEmail}</div>
                  </div>
                  <div>
                    <span className="text-muted-foreground block mb-1">Delivery Address</span>
                    <div>{order.address}</div>
                    <div>{order.city}</div>
                  </div>
                  {order.note && (
                    <div className="sm:col-span-2">
                      <span className="text-muted-foreground block mb-1">Note / Voucher</span>
                      <div className="bg-yellow-50 border border-yellow-200 rounded-lg px-3 py-2 text-sm">{order.note}</div>
                    </div>
                  )}
                </div>

                <Separator />

                <div>
                  <span className="text-sm font-semibold block mb-2">Order Items</span>
                  {order.items.map(item => (
                    <div key={item.id} className="flex items-center justify-between py-2 text-sm">
                      <div>
                        <span className="font-medium">{item.productName}</span>
                        <span className="text-muted-foreground ml-2">× {item.quantity}</span>
                      </div>
                      <span className="font-medium">{formatPrice(item.price * item.quantity)}</span>
                    </div>
                  ))}
                </div>

                <Separator />

                <div className="flex justify-between items-center">
                  <span className="font-semibold">Total</span>
                  <span className="font-bold text-lg text-primary">{formatPrice(order.totalAmount)}</span>
                </div>

                <Separator />

                <div>
                  <span className="text-sm font-semibold block mb-3">Update Status</span>
                  <div className="flex flex-wrap gap-2">
                    {statuses.map(s => (
                      <Button
                        key={s}
                        size="sm"
                        variant={order.status === s ? "default" : "outline"}
                        className={cn(
                          "capitalize rounded-full",
                          order.status === s && statusColor(s, true)
                        )}
                        onClick={(e) => {
                          e.stopPropagation();
                          updateStatus.mutate({ id: order.id, status: s });
                        }}
                        disabled={updateStatus.isPending}
                      >
                        {s}
                      </Button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        ))
      )}
    </div>
  );
}

function KolPanel() {
  const [editingId, setEditingId] = useState<number | null>(null);
  const [addingNew, setAddingNew] = useState(false);
  const [form, setForm] = useState<KolForm>(EMPTY);
  const qc = useQueryClient();
  const password = sessionStorage.getItem("admin_pw") || "";
  const headers = { "x-admin-password": password, "content-type": "application/json" };

  const { data: videos = [], isLoading } = useQuery<KolVideo[]>({
    queryKey: ["kol-videos"],
    queryFn: async () => { const r = await fetch("/api/kol-videos"); return r.json(); },
  });

  const createMut = useMutation({
    mutationFn: async (data: KolForm) => { await fetch("/api/admin/kol-videos", { method: "POST", headers, body: JSON.stringify({ ...data, sortOrder: videos.length + 1 }) }); },
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

  const FormFields = () => (
    <div className="grid gap-3">
      <Input placeholder="Name" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
      <Input placeholder="Channel" value={form.channel} onChange={e => setForm(f => ({ ...f, channel: e.target.value }))} />
      <Input placeholder="Followers" value={form.followers} onChange={e => setForm(f => ({ ...f, followers: e.target.value }))} />
      <Input placeholder="Video URL" value={form.videoUrl} onChange={e => setForm(f => ({ ...f, videoUrl: e.target.value }))} />
      <Input placeholder="TikTok Link" value={form.thumbnailUrl} onChange={e => setForm(f => ({ ...f, thumbnailUrl: e.target.value }))} />
      <Input placeholder="Quote" value={form.quote} onChange={e => setForm(f => ({ ...f, quote: e.target.value }))} />
    </div>
  );

  if (isLoading) return <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin" /></div>;

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button onClick={() => { setAddingNew(true); setForm(EMPTY); }}><Plus className="h-4 w-4 mr-2" />Add Video</Button>
      </div>
      {addingNew && (
        <div className="border rounded-xl p-6 bg-card">
          <h3 className="font-semibold mb-4">New KOL Video</h3>
          <FormFields />
          <div className="flex gap-2 mt-4">
            <Button onClick={() => createMut.mutate(form)} disabled={createMut.isPending}><Save className="h-4 w-4 mr-2" />Save</Button>
            <Button variant="ghost" onClick={() => setAddingNew(false)}><X className="h-4 w-4 mr-2" />Cancel</Button>
          </div>
        </div>
      )}
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
              <div><div className="font-semibold">{v.name || "(No name)"}</div><div className="text-sm text-muted-foreground">{v.channel} — {v.followers}</div><div className="text-sm italic mt-1">"{v.quote}"</div></div>
              <div className="flex gap-2 shrink-0">
                <Button variant="ghost" size="icon" onClick={() => { setEditingId(v.id); setForm({ name: v.name, channel: v.channel, followers: v.followers, videoUrl: v.videoUrl, thumbnailUrl: v.thumbnailUrl, quote: v.quote }); }}><Pencil className="h-4 w-4" /></Button>
                <Button variant="ghost" size="icon" className="text-destructive" onClick={() => deleteMut.mutate(v.id)}><Trash2 className="h-4 w-4" /></Button>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

export function Admin() {
  const { password, isAuth, loginInput, setLoginInput, login } = useAdminPassword();
  const [tab, setTab] = useState<"orders" | "kol">("orders");

  if (!isAuth) return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-sm space-y-6 text-center">
        <Lock className="h-12 w-12 text-primary mx-auto" />
        <h1 className="text-2xl font-serif font-medium">Admin Panel</h1>
        <div className="flex gap-2">
          <Input type="password" placeholder="Admin password" value={loginInput} onChange={e => setLoginInput(e.target.value)} onKeyDown={e => e.key === "Enter" && login()} />
          <Button onClick={login}>Login</Button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl">
      <h1 className="text-3xl font-serif font-medium mb-8">Admin Panel</h1>

      <div className="flex gap-2 mb-8">
        <Button variant={tab === "orders" ? "default" : "outline"} onClick={() => setTab("orders")} className="rounded-full">
          <Package className="h-4 w-4 mr-2" /> Orders
        </Button>
        <Button variant={tab === "kol" ? "default" : "outline"} onClick={() => setTab("kol")} className="rounded-full">
          <Film className="h-4 w-4 mr-2" /> KOL Videos
        </Button>
      </div>

      {tab === "orders" && <OrdersPanel />}
      {tab === "kol" && <KolPanel />}
    </div>
  );
}
