import { useState, useEffect, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Loader2, Plus, Pencil, Trash2, Save, X, Lock, Package, Film, ShoppingBag, ChevronDown, ChevronUp, Check, Star, Eye, EyeOff, Upload, Users, Shield, UserCog, LayoutDashboard, DollarSign, TrendingUp, Search, LogOut, RefreshCw } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { formatPrice } from "@/lib/format";
import { getProductImage } from "@/lib/product-images";
import { cn } from "@/lib/utils";
import type { KolVideo, Order, Product } from "@/lib/api";

// ============================================================
// TYPES
// ============================================================

type KolForm = { name: string; channel: string; followers: string; videoUrl: string; thumbnailUrl: string; quote: string };
const EMPTY_KOL: KolForm = { name: "", channel: "", followers: "", videoUrl: "", thumbnailUrl: "", quote: "" };

type ProductForm = {
  name: string; scent: string; pack: string; price: string; originalPrice: string;
  image: string; description: string; inStock: boolean; isFeatured: boolean; badge: string; sortOrder: string;
};
const EMPTY_PRODUCT: ProductForm = {
  name: "SANOVA Room Fragrance Diffuser", scent: "", pack: "1", price: "", originalPrice: "",
  image: "", description: "", inStock: true, isFeatured: false, badge: "", sortOrder: "0",
};

type AdminUser = { id: number; name: string; email: string; phone: string | null; role: string; createdAt: string; };

// ============================================================
// AUTH HOOK
// ============================================================

function useAdminPassword() {
  const [password, setPassword] = useState(() => sessionStorage.getItem("admin_pw") || "");
  const [isAuth, setIsAuth] = useState(false);
  const [loginInput, setLoginInput] = useState("");
  const [loginError, setLoginError] = useState("");

  useEffect(() => {
    if (password) {
      fetch("/api/admin/kol-videos/0", { method: "PUT", headers: { "x-admin-password": password, "content-type": "application/json" }, body: "{}" })
        .then(r => { if (r.status !== 401) setIsAuth(true); });
    }
  }, []);

  const login = async () => {
    setLoginError("");
    const r = await fetch("/api/admin/kol-videos/0", { method: "PUT", headers: { "x-admin-password": loginInput, "content-type": "application/json" }, body: "{}" });
    if (r.status !== 401) { sessionStorage.setItem("admin_pw", loginInput); setPassword(loginInput); setIsAuth(true); return true; }
    setLoginError("Incorrect password");
    return false;
  };

  const logout = () => { sessionStorage.removeItem("admin_pw"); setPassword(""); setIsAuth(false); setLoginInput(""); };

  return { password, isAuth, loginInput, setLoginInput, login, logout, loginError };
}

// ============================================================
// DASHBOARD
// ============================================================

function DashboardPanel() {
  const password = sessionStorage.getItem("admin_pw") || "";

  const { data: orders = [] } = useQuery<Order[]>({
    queryKey: ["admin-orders"],
    queryFn: async () => { const r = await fetch("/api/admin/orders", { headers: { "x-admin-password": password } }); return r.json(); },
  });
  const { data: products = [] } = useQuery<Product[]>({
    queryKey: ["admin-products"],
    queryFn: async () => { const r = await fetch("/api/products"); return r.json(); },
  });
  const { data: users = [] } = useQuery<AdminUser[]>({
    queryKey: ["admin-users"],
    queryFn: async () => { const r = await fetch("/api/admin/users", { headers: { "x-admin-password": password } }); return r.json(); },
  });

  const totalRevenue = orders.filter(o => o.status !== "cancelled").reduce((s, o) => s + o.totalAmount, 0);
  const pendingOrders = orders.filter(o => o.status === "pending").length;
  const deliveredOrders = orders.filter(o => o.status === "delivered").length;
  const recentOrders = [...orders].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 5);

  const stats = [
    { label: "Total Revenue", value: formatPrice(totalRevenue), icon: DollarSign, color: "text-green-600 bg-green-50" },
    { label: "Total Orders", value: orders.length, icon: Package, color: "text-blue-600 bg-blue-50", sub: `${pendingOrders} pending` },
    { label: "Products", value: products.length, icon: ShoppingBag, color: "text-purple-600 bg-purple-50", sub: `${products.filter(p => p.inStock).length} in stock` },
    { label: "Users", value: users.length, icon: Users, color: "text-amber-600 bg-amber-50", sub: `${users.filter(u => u.role === "admin").length} admins` },
  ];

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map(s => (
          <div key={s.label} className="border rounded-xl bg-card p-5">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm text-muted-foreground">{s.label}</span>
              <div className={cn("w-9 h-9 rounded-lg flex items-center justify-center", s.color)}>
                <s.icon className="h-5 w-5" />
              </div>
            </div>
            <div className="text-2xl font-bold">{s.value}</div>
            {s.sub && <div className="text-xs text-muted-foreground mt-1">{s.sub}</div>}
          </div>
        ))}
      </div>

      <div>
        <h3 className="font-semibold mb-4">Recent Orders</h3>
        {recentOrders.length === 0 ? (
          <p className="text-sm text-muted-foreground">No orders yet.</p>
        ) : (
          <div className="border rounded-xl bg-card overflow-hidden">
            {recentOrders.map((o, i) => (
              <div key={o.id} className={cn("flex items-center justify-between p-4 text-sm", i > 0 && "border-t")}>
                <div className="flex items-center gap-4">
                  <span className="font-mono font-semibold text-xs">#{String(o.id).padStart(5, "0")}</span>
                  <span className="font-medium">{o.customerName}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-semibold text-primary">{formatPrice(o.totalAmount)}</span>
                  <Badge variant={o.status === "delivered" ? "default" : o.status === "cancelled" ? "destructive" : "secondary"} className="capitalize text-xs">{o.status}</Badge>
                  <span className="text-xs text-muted-foreground">{new Date(o.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <h3 className="font-semibold mb-4">Order Status Breakdown</h3>
          <div className="border rounded-xl bg-card p-5 space-y-3">
            {["pending", "confirmed", "shipping", "delivered", "cancelled"].map(s => {
              const count = orders.filter(o => o.status === s).length;
              const pct = orders.length > 0 ? (count / orders.length) * 100 : 0;
              const colors: Record<string, string> = { pending: "bg-yellow-500", confirmed: "bg-blue-500", shipping: "bg-orange-500", delivered: "bg-green-500", cancelled: "bg-red-400" };
              return (
                <div key={s} className="flex items-center gap-3">
                  <span className="text-sm capitalize w-24">{s}</span>
                  <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                    <div className={cn("h-full rounded-full transition-all", colors[s])} style={{ width: `${pct}%` }} />
                  </div>
                  <span className="text-sm font-medium w-8 text-right">{count}</span>
                </div>
              );
            })}
          </div>
        </div>
        <div>
          <h3 className="font-semibold mb-4">Product Scents</h3>
          <div className="border rounded-xl bg-card p-5 space-y-3">
            {Object.entries(products.reduce<Record<string, number>>((acc, p) => { acc[p.scent] = (acc[p.scent] || 0) + 1; return acc; }, {})).map(([scent, count]) => (
              <div key={scent} className="flex items-center justify-between">
                <span className="text-sm capitalize">{scent}</span>
                <Badge variant="secondary">{count} products</Badge>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================================
// ORDERS PANEL (with search + filter)
// ============================================================

function OrdersPanel() {
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const qc = useQueryClient();
  const password = sessionStorage.getItem("admin_pw") || "";

  const { data: orders = [], isLoading } = useQuery<Order[]>({
    queryKey: ["admin-orders"],
    queryFn: async () => { const r = await fetch("/api/admin/orders", { headers: { "x-admin-password": password } }); if (!r.ok) throw new Error("Failed"); return r.json(); },
  });

  const updateStatus = useMutation({
    mutationFn: async ({ id, status }: { id: number; status: string }) => {
      await fetch(`/api/admin/orders/${id}/status`, { method: "PUT", headers: { "x-admin-password": password, "content-type": "application/json" }, body: JSON.stringify({ status }) });
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin-orders"] }),
  });

  const deleteOrder = useMutation({
    mutationFn: async (id: number) => { await fetch(`/api/admin/orders/${id}`, { method: "DELETE", headers: { "x-admin-password": password } }); },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["admin-orders"] }); setDeleteConfirm(null); setExpandedId(null); },
  });

  const statuses = ["pending", "confirmed", "shipping", "delivered", "cancelled"];
  const statusColor = (s: string, active: boolean) => {
    if (!active) return "";
    const m: Record<string, string> = { pending: "bg-yellow-500 hover:bg-yellow-600 text-white", confirmed: "bg-blue-600 hover:bg-blue-700 text-white", shipping: "bg-orange-500 hover:bg-orange-600 text-white", delivered: "bg-green-600 hover:bg-green-700 text-white", cancelled: "bg-destructive hover:bg-destructive/90 text-white" };
    return m[s] || "";
  };
  const badgeVariant = (s: string) => s === "delivered" ? "default" as const : s === "cancelled" ? "destructive" as const : "secondary" as const;

  const filtered = useMemo(() => {
    let result = orders;
    if (statusFilter !== "all") result = result.filter(o => o.status === statusFilter);
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(o => o.customerName.toLowerCase().includes(q) || o.customerPhone.includes(q) || o.customerEmail.toLowerCase().includes(q) || String(o.id).includes(q));
    }
    return result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [orders, statusFilter, searchQuery]);

  if (isLoading) return <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin" /></div>;

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search by name, phone, email, order #..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="pl-9" />
        </div>
        <div className="flex gap-1 flex-wrap">
          <Button size="sm" variant={statusFilter === "all" ? "default" : "outline"} onClick={() => setStatusFilter("all")} className="rounded-full text-xs">All ({orders.length})</Button>
          {statuses.map(s => {
            const count = orders.filter(o => o.status === s).length;
            return <Button key={s} size="sm" variant={statusFilter === s ? "default" : "outline"} onClick={() => setStatusFilter(s)} className={cn("rounded-full text-xs capitalize", statusFilter === s && statusColor(s, true))}>{s} ({count})</Button>;
          })}
        </div>
      </div>

      <div className="text-sm text-muted-foreground">{filtered.length} orders</div>

      {filtered.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">No orders found.</div>
      ) : filtered.map(order => (
        <div key={order.id} className="border rounded-xl bg-card overflow-hidden">
          <div className="p-4 flex flex-wrap items-center justify-between gap-4 cursor-pointer hover:bg-muted/30 transition-colors" onClick={() => setExpandedId(expandedId === order.id ? null : order.id)}>
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
                <div><span className="text-muted-foreground block mb-1">Customer</span><div className="font-medium">{order.customerName}</div><div>{order.customerPhone}</div><div>{order.customerEmail}</div></div>
                <div><span className="text-muted-foreground block mb-1">Delivery Address</span><div>{order.address}</div><div>{order.city}</div></div>
                {order.note && <div className="sm:col-span-2"><span className="text-muted-foreground block mb-1">Note / Voucher</span><div className="bg-yellow-50 border border-yellow-200 rounded-lg px-3 py-2 text-sm">{order.note}</div></div>}
              </div>
              <Separator />
              <div><span className="text-sm font-semibold block mb-2">Order Items</span>
                {order.items.map(item => (
                  <div key={item.id} className="flex items-center gap-4 py-3 text-sm">
                    <div className="w-14 h-14 rounded-lg bg-white border overflow-hidden shrink-0 shadow-sm"><img src={getProductImage(item.image)} alt={item.productName} className="w-full h-full object-contain p-1" /></div>
                    <div className="flex-1 min-w-0"><span className="font-medium block truncate">{item.productName}</span><span className="text-muted-foreground">× {item.quantity}</span></div>
                    <span className="font-medium shrink-0">{formatPrice(item.price * item.quantity)}</span>
                  </div>
                ))}
              </div>
              <Separator />
              <div className="flex justify-between items-center"><span className="font-semibold">Total</span><span className="font-bold text-lg text-primary">{formatPrice(order.totalAmount)}</span></div>
              <Separator />
              <div><span className="text-sm font-semibold block mb-3">Update Status</span>
                <div className="flex flex-wrap gap-2">
                  {statuses.map(s => <Button key={s} size="sm" variant={order.status === s ? "default" : "outline"} className={cn("capitalize rounded-full", order.status === s && statusColor(s, true))} onClick={e => { e.stopPropagation(); updateStatus.mutate({ id: order.id, status: s }); }} disabled={updateStatus.isPending}>{s}</Button>)}
                </div>
              </div>
              <Separator />
              <div>
                {deleteConfirm === order.id ? (
                  <div className="flex items-center gap-3 bg-red-50 border border-red-200 rounded-xl p-4">
                    <span className="text-sm text-red-800 flex-1">Are you sure? This cannot be undone.</span>
                    <Button size="sm" variant="destructive" onClick={e => { e.stopPropagation(); deleteOrder.mutate(order.id); }} disabled={deleteOrder.isPending}><Trash2 className="h-4 w-4 mr-1" /> Delete</Button>
                    <Button size="sm" variant="ghost" onClick={e => { e.stopPropagation(); setDeleteConfirm(null); }}>Cancel</Button>
                  </div>
                ) : (
                  <Button size="sm" variant="ghost" className="text-destructive hover:text-destructive hover:bg-red-50" onClick={e => { e.stopPropagation(); setDeleteConfirm(order.id); }}><Trash2 className="h-4 w-4 mr-2" /> Delete Order</Button>
                )}
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

// ============================================================
// KOL FORM FIELDS (standalone to fix typing bug)
// ============================================================

function KolFormFields({ form, setForm, uploading, onVideoUpload }: {
  form: KolForm; setForm: React.Dispatch<React.SetStateAction<KolForm>>; uploading: boolean; onVideoUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
}) {
  return (
    <div className="grid gap-3">
      <Input placeholder="Name" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
      <Input placeholder="Channel" value={form.channel} onChange={e => setForm(f => ({ ...f, channel: e.target.value }))} />
      <Input placeholder="Followers" value={form.followers} onChange={e => setForm(f => ({ ...f, followers: e.target.value }))} />
      <div>
        <label className="text-sm text-muted-foreground block mb-1">Video</label>
        <div className="flex items-center gap-3">
          {form.videoUrl && <video src={form.videoUrl} className="w-24 h-16 rounded-lg border object-cover shrink-0" muted />}
          <div className="flex-1 flex flex-col gap-2">
            <label className={cn("flex items-center justify-center gap-2 px-4 py-2 border-2 border-dashed rounded-lg cursor-pointer text-sm transition-colors", uploading ? "opacity-50 pointer-events-none" : "hover:border-primary hover:bg-primary/5")}>
              {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
              {uploading ? "Uploading..." : form.videoUrl ? "Change video" : "Upload video"}
              <input type="file" accept="video/mp4,video/webm,video/quicktime" className="hidden" onChange={onVideoUpload} disabled={uploading} />
            </label>
            <Input placeholder="Or paste Video URL" value={form.videoUrl} onChange={e => setForm(f => ({ ...f, videoUrl: e.target.value }))} />
          </div>
        </div>
      </div>
      <Input placeholder="TikTok Link" value={form.thumbnailUrl} onChange={e => setForm(f => ({ ...f, thumbnailUrl: e.target.value }))} />
      <Input placeholder="Quote" value={form.quote} onChange={e => setForm(f => ({ ...f, quote: e.target.value }))} />
    </div>
  );
}

function KolPanel() {
  const [editingId, setEditingId] = useState<number | null>(null);
  const [addingNew, setAddingNew] = useState(false);
  const [form, setForm] = useState<KolForm>(EMPTY_KOL);
  const [uploading, setUploading] = useState(false);
  const qc = useQueryClient();
  const password = sessionStorage.getItem("admin_pw") || "";
  const headers = { "x-admin-password": password, "content-type": "application/json" };

  const handleVideoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; if (!file) return; setUploading(true);
    try {
      const fd = new FormData(); fd.append("video", file);
      const res = await fetch("/api/admin/upload-video", { method: "POST", headers: { "x-admin-password": password }, body: fd });
      if (!res.ok) { const err = await res.json(); alert(err.error); return; }
      const data = await res.json(); setForm(f => ({ ...f, videoUrl: data.url }));
    } catch { alert("Upload failed"); } finally { setUploading(false); e.target.value = ""; }
  };

  const { data: videos = [], isLoading } = useQuery<KolVideo[]>({ queryKey: ["kol-videos"], queryFn: async () => { const r = await fetch("/api/kol-videos"); return r.json(); } });
  const createMut = useMutation({ mutationFn: async (data: KolForm) => { await fetch("/api/admin/kol-videos", { method: "POST", headers, body: JSON.stringify({ ...data, sortOrder: videos.length + 1 }) }); }, onSuccess: () => { qc.invalidateQueries({ queryKey: ["kol-videos"] }); setAddingNew(false); setForm(EMPTY_KOL); } });
  const updateMut = useMutation({ mutationFn: async ({ id, data }: { id: number; data: KolForm }) => { await fetch(`/api/admin/kol-videos/${id}`, { method: "PUT", headers, body: JSON.stringify(data) }); }, onSuccess: () => { qc.invalidateQueries({ queryKey: ["kol-videos"] }); setEditingId(null); setForm(EMPTY_KOL); } });
  const deleteMut = useMutation({ mutationFn: async (id: number) => { await fetch(`/api/admin/kol-videos/${id}`, { method: "DELETE", headers }); }, onSuccess: () => qc.invalidateQueries({ queryKey: ["kol-videos"] }) });

  if (isLoading) return <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin" /></div>;

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <span className="text-sm text-muted-foreground">{videos.length} videos</span>
        <Button onClick={() => { setAddingNew(true); setForm(EMPTY_KOL); }}><Plus className="h-4 w-4 mr-2" />Add Video</Button>
      </div>
      {addingNew && (
        <div className="border rounded-xl p-6 bg-card">
          <h3 className="font-semibold mb-4">New KOL Video</h3>
          <KolFormFields form={form} setForm={setForm} uploading={uploading} onVideoUpload={handleVideoUpload} />
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
              <KolFormFields form={form} setForm={setForm} uploading={uploading} onVideoUpload={handleVideoUpload} />
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

// ============================================================
// PRODUCT FORM FIELDS (standalone to fix typing bug)
// ============================================================

function ProductFormFields({ form, setForm, uploading, onImageUpload }: {
  form: ProductForm; setForm: React.Dispatch<React.SetStateAction<ProductForm>>; uploading: boolean; onImageUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
}) {
  return (
    <div className="grid gap-3">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div><label className="text-sm text-muted-foreground block mb-1">Product name</label><Input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="SANOVA Room Fragrance Diffuser" /></div>
        <div><label className="text-sm text-muted-foreground block mb-1">Scent</label><Input value={form.scent} onChange={e => setForm(f => ({ ...f, scent: e.target.value }))} placeholder="peach, lavender, ocean..." /></div>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div><label className="text-sm text-muted-foreground block mb-1">Pack</label><Input value={form.pack} onChange={e => setForm(f => ({ ...f, pack: e.target.value }))} placeholder="1, 2, 3" /></div>
        <div><label className="text-sm text-muted-foreground block mb-1">Price (₱)</label><Input type="number" value={form.price} onChange={e => setForm(f => ({ ...f, price: e.target.value }))} placeholder="279" /></div>
        <div><label className="text-sm text-muted-foreground block mb-1">Original price</label><Input type="number" value={form.originalPrice} onChange={e => setForm(f => ({ ...f, originalPrice: e.target.value }))} placeholder="349" /></div>
        <div><label className="text-sm text-muted-foreground block mb-1">Sort order</label><Input type="number" value={form.sortOrder} onChange={e => setForm(f => ({ ...f, sortOrder: e.target.value }))} placeholder="0" /></div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="text-sm text-muted-foreground block mb-1">Product image</label>
          <div className="flex items-center gap-3">
            {form.image && <div className="w-16 h-16 rounded-lg border bg-white overflow-hidden shrink-0"><img src={getProductImage(form.image)} alt="Preview" className="w-full h-full object-contain p-1" /></div>}
            <div className="flex-1">
              <label className={cn("flex items-center justify-center gap-2 px-4 py-2 border-2 border-dashed rounded-lg cursor-pointer text-sm transition-colors", uploading ? "opacity-50 pointer-events-none" : "hover:border-primary hover:bg-primary/5")}>
                {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
                {uploading ? "Uploading..." : form.image ? "Change image" : "Choose image"}
                <input type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={onImageUpload} disabled={uploading} />
              </label>
              {form.image && <p className="text-xs text-muted-foreground mt-1">Key: {form.image}</p>}
            </div>
          </div>
        </div>
        <div><label className="text-sm text-muted-foreground block mb-1">Badge</label><Input value={form.badge} onChange={e => setForm(f => ({ ...f, badge: e.target.value }))} placeholder="New, Sale, Best Value, Popular" /></div>
      </div>
      <div><label className="text-sm text-muted-foreground block mb-1">Description</label><Textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="Product description..." rows={3} /></div>
      <div className="flex gap-6">
        <label className="flex items-center gap-2 cursor-pointer text-sm"><input type="checkbox" checked={form.inStock} onChange={e => setForm(f => ({ ...f, inStock: e.target.checked }))} className="rounded" /> In stock</label>
        <label className="flex items-center gap-2 cursor-pointer text-sm"><input type="checkbox" checked={form.isFeatured} onChange={e => setForm(f => ({ ...f, isFeatured: e.target.checked }))} className="rounded" /> Featured</label>
      </div>
    </div>
  );
}

// ============================================================
// PRODUCTS PANEL (with search)
// ============================================================

function ProductsPanel() {
  const [editingId, setEditingId] = useState<number | null>(null);
  const [addingNew, setAddingNew] = useState(false);
  const [form, setForm] = useState<ProductForm>(EMPTY_PRODUCT);
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);
  const [uploading, setUploading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const qc = useQueryClient();
  const password = sessionStorage.getItem("admin_pw") || "";
  const headers: Record<string, string> = { "x-admin-password": password, "content-type": "application/json" };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; if (!file) return; setUploading(true);
    try {
      const fd = new FormData(); fd.append("image", file);
      const res = await fetch("/api/admin/upload", { method: "POST", headers: { "x-admin-password": password }, body: fd });
      if (!res.ok) { const err = await res.json(); alert(err.error); return; }
      const data = await res.json(); setForm(f => ({ ...f, image: data.imageKey }));
    } catch { alert("Upload failed"); } finally { setUploading(false); e.target.value = ""; }
  };

  const { data: products = [], isLoading } = useQuery<Product[]>({ queryKey: ["admin-products"], queryFn: async () => { const r = await fetch("/api/products"); return r.json(); } });

  const createMut = useMutation({
    mutationFn: async (data: ProductForm) => {
      const res = await fetch("/api/admin/products", { method: "POST", headers, body: JSON.stringify({ name: data.name, scent: data.scent, pack: data.pack, price: Number(data.price), originalPrice: data.originalPrice ? Number(data.originalPrice) : null, image: data.image, description: data.description, inStock: data.inStock, isFeatured: data.isFeatured, badge: data.badge || null, sortOrder: Number(data.sortOrder) || 0 }) });
      if (!res.ok) { const err = await res.json(); throw new Error(err.error); } return res.json();
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["admin-products"] }); setAddingNew(false); setForm(EMPTY_PRODUCT); },
  });
  const updateMut = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: ProductForm }) => {
      const res = await fetch(`/api/admin/products/${id}`, { method: "PUT", headers, body: JSON.stringify({ name: data.name, scent: data.scent, pack: data.pack, price: Number(data.price), originalPrice: data.originalPrice ? Number(data.originalPrice) : null, image: data.image, description: data.description, inStock: data.inStock, isFeatured: data.isFeatured, badge: data.badge || null, sortOrder: Number(data.sortOrder) || 0 }) });
      if (!res.ok) { const err = await res.json(); throw new Error(err.error); } return res.json();
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["admin-products"] }); setEditingId(null); setForm(EMPTY_PRODUCT); },
  });
  const deleteMut = useMutation({ mutationFn: async (id: number) => { await fetch(`/api/admin/products/${id}`, { method: "DELETE", headers }); }, onSuccess: () => { qc.invalidateQueries({ queryKey: ["admin-products"] }); setDeleteConfirm(null); } });
  const toggleStock = useMutation({ mutationFn: async ({ id, inStock }: { id: number; inStock: boolean }) => { await fetch(`/api/admin/products/${id}`, { method: "PUT", headers, body: JSON.stringify({ inStock }) }); }, onSuccess: () => qc.invalidateQueries({ queryKey: ["admin-products"] }) });
  const toggleFeatured = useMutation({ mutationFn: async ({ id, isFeatured }: { id: number; isFeatured: boolean }) => { await fetch(`/api/admin/products/${id}`, { method: "PUT", headers, body: JSON.stringify({ isFeatured }) }); }, onSuccess: () => qc.invalidateQueries({ queryKey: ["admin-products"] }) });

  const filtered = useMemo(() => {
    if (!searchQuery.trim()) return products;
    const q = searchQuery.toLowerCase();
    return products.filter(p => p.name.toLowerCase().includes(q) || p.scent.toLowerCase().includes(q) || p.badge?.toLowerCase().includes(q));
  }, [products, searchQuery]);

  if (isLoading) return <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin" /></div>;

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search by name, scent, badge..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="pl-9" />
        </div>
        <Button onClick={() => { setAddingNew(true); setForm(EMPTY_PRODUCT); setEditingId(null); }}><Plus className="h-4 w-4 mr-2" />Add product</Button>
      </div>
      <div className="text-sm text-muted-foreground">{filtered.length} products</div>

      {addingNew && (
        <div className="border rounded-xl p-6 bg-card">
          <h3 className="font-semibold mb-4">New product</h3>
          <ProductFormFields form={form} setForm={setForm} uploading={uploading} onImageUpload={handleImageUpload} />
          <div className="flex gap-2 mt-4">
            <Button onClick={() => createMut.mutate(form)} disabled={createMut.isPending || !form.name || !form.scent || !form.price || !form.image}>{createMut.isPending ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}Save</Button>
            <Button variant="ghost" onClick={() => setAddingNew(false)}><X className="h-4 w-4 mr-2" />Cancel</Button>
          </div>
          {createMut.isError && <p className="text-sm text-destructive mt-2">{(createMut.error as Error).message}</p>}
        </div>
      )}

      {filtered.map(p => (
        <div key={p.id} className="border rounded-xl bg-card overflow-hidden">
          {editingId === p.id ? (
            <div className="p-6">
              <h3 className="font-semibold mb-4">Edit product #{p.id}</h3>
              <ProductFormFields form={form} setForm={setForm} uploading={uploading} onImageUpload={handleImageUpload} />
              <div className="flex gap-2 mt-4">
                <Button onClick={() => updateMut.mutate({ id: p.id, data: form })} disabled={updateMut.isPending}>{updateMut.isPending ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}Save</Button>
                <Button variant="ghost" onClick={() => { setEditingId(null); setForm(EMPTY_PRODUCT); }}><X className="h-4 w-4 mr-2" />Cancel</Button>
              </div>
              {updateMut.isError && <p className="text-sm text-destructive mt-2">{(updateMut.error as Error).message}</p>}
            </div>
          ) : (
            <div className="p-4 flex items-center gap-4">
              <div className="w-16 h-16 rounded-lg bg-white border overflow-hidden shrink-0 shadow-sm"><img src={getProductImage(p.image)} alt={p.name} className="w-full h-full object-contain p-1" /></div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap"><span className="font-medium truncate">{p.name}</span>{p.badge && <Badge variant="secondary" className="text-xs">{p.badge}</Badge>}</div>
                <div className="flex items-center gap-3 text-sm text-muted-foreground mt-1 flex-wrap">
                  <span className="capitalize">{p.scent}</span><span>Pack {p.pack}</span><span className="font-semibold text-primary">{formatPrice(p.price)}</span>
                  {p.originalPrice && <span className="line-through text-xs">{formatPrice(p.originalPrice)}</span>}
                </div>
              </div>
              <div className="flex items-center gap-1 shrink-0">
                <Button variant="ghost" size="icon" title={p.inStock ? "In stock" : "Out of stock"} onClick={() => toggleStock.mutate({ id: p.id, inStock: !p.inStock })} className={p.inStock ? "text-green-600" : "text-muted-foreground"}>{p.inStock ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}</Button>
                <Button variant="ghost" size="icon" title={p.isFeatured ? "Featured" : "Not featured"} onClick={() => toggleFeatured.mutate({ id: p.id, isFeatured: !p.isFeatured })} className={p.isFeatured ? "text-yellow-500" : "text-muted-foreground"}><Star className="h-4 w-4" /></Button>
                <Button variant="ghost" size="icon" onClick={() => { setEditingId(p.id); setAddingNew(false); setForm({ name: p.name, scent: p.scent, pack: p.pack, price: String(p.price), originalPrice: p.originalPrice ? String(p.originalPrice) : "", image: p.image, description: p.description, inStock: p.inStock, isFeatured: p.isFeatured, badge: p.badge || "", sortOrder: String(p.sortOrder ?? 0) }); }}><Pencil className="h-4 w-4" /></Button>
                {deleteConfirm === p.id ? (
                  <div className="flex items-center gap-1">
                    <Button size="icon" variant="destructive" onClick={() => deleteMut.mutate(p.id)} disabled={deleteMut.isPending}><Check className="h-4 w-4" /></Button>
                    <Button size="icon" variant="ghost" onClick={() => setDeleteConfirm(null)}><X className="h-4 w-4" /></Button>
                  </div>
                ) : (
                  <Button variant="ghost" size="icon" className="text-destructive" onClick={() => setDeleteConfirm(p.id)}><Trash2 className="h-4 w-4" /></Button>
                )}
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

// ============================================================
// USERS PANEL
// ============================================================

function UsersPanel() {
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const qc = useQueryClient();
  const password = sessionStorage.getItem("admin_pw") || "";

  const { data: users = [], isLoading } = useQuery<AdminUser[]>({ queryKey: ["admin-users"], queryFn: async () => { const r = await fetch("/api/admin/users", { headers: { "x-admin-password": password } }); return r.json(); } });
  const toggleRole = useMutation({ mutationFn: async ({ id, role }: { id: number; role: string }) => { const r = await fetch(`/api/admin/users/${id}/role`, { method: "PUT", headers: { "x-admin-password": password, "content-type": "application/json" }, body: JSON.stringify({ role }) }); if (!r.ok) throw new Error("Failed"); return r.json(); }, onSuccess: () => qc.invalidateQueries({ queryKey: ["admin-users"] }) });
  const deleteUser = useMutation({ mutationFn: async (id: number) => { await fetch(`/api/admin/users/${id}`, { method: "DELETE", headers: { "x-admin-password": password } }); }, onSuccess: () => { qc.invalidateQueries({ queryKey: ["admin-users"] }); setDeleteConfirm(null); } });

  const filtered = useMemo(() => {
    if (!searchQuery.trim()) return users;
    const q = searchQuery.toLowerCase();
    return users.filter(u => u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q) || u.phone?.includes(q));
  }, [users, searchQuery]);

  if (isLoading) return <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin" /></div>;

  const admins = users.filter(u => u.role === "admin").length;

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search by name, email, phone..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="pl-9" />
        </div>
      </div>
      <div className="text-sm text-muted-foreground">{users.length} users ({admins} admins, {users.length - admins} customers)</div>

      {filtered.map(u => (
        <div key={u.id} className="border rounded-xl bg-card p-4 flex items-center gap-4">
          <div className={cn("w-10 h-10 rounded-full flex items-center justify-center shrink-0", u.role === "admin" ? "bg-amber-100 text-amber-700" : "bg-gray-100 text-gray-500")}>
            {u.role === "admin" ? <Shield className="h-5 w-5" /> : <UserCog className="h-5 w-5" />}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap"><span className="font-medium">{u.name}</span><Badge variant={u.role === "admin" ? "default" : "secondary"} className="text-xs capitalize">{u.role}</Badge></div>
            <div className="flex items-center gap-3 text-sm text-muted-foreground mt-0.5 flex-wrap"><span>{u.email}</span>{u.phone && <span>{u.phone}</span>}<span>{new Date(u.createdAt).toLocaleDateString()}</span></div>
          </div>
          <div className="flex items-center gap-1 shrink-0">
            <Button variant={u.role === "admin" ? "default" : "outline"} size="sm" onClick={() => toggleRole.mutate({ id: u.id, role: u.role === "admin" ? "customer" : "admin" })} disabled={toggleRole.isPending} className="text-xs">
              <Shield className="h-3 w-3 mr-1" />{u.role === "admin" ? "Remove admin" : "Make admin"}
            </Button>
            {deleteConfirm === u.id ? (
              <div className="flex items-center gap-1"><Button size="icon" variant="destructive" onClick={() => deleteUser.mutate(u.id)}><Check className="h-4 w-4" /></Button><Button size="icon" variant="ghost" onClick={() => setDeleteConfirm(null)}><X className="h-4 w-4" /></Button></div>
            ) : (
              <Button variant="ghost" size="icon" className="text-destructive" onClick={() => setDeleteConfirm(u.id)}><Trash2 className="h-4 w-4" /></Button>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

// ============================================================
// MAIN ADMIN EXPORT
// ============================================================

const TABS = [
  { key: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { key: "products", label: "Products", icon: ShoppingBag },
  { key: "orders", label: "Orders", icon: Package },
  { key: "kol", label: "KOL Videos", icon: Film },
  { key: "users", label: "Users", icon: Users },
] as const;

type TabKey = typeof TABS[number]["key"];

export function Admin() {
  const { isAuth, loginInput, setLoginInput, login, logout, loginError } = useAdminPassword();
  const [tab, setTab] = useState<TabKey>("dashboard");

  if (!isAuth) return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-muted/30">
      <div className="w-full max-w-sm space-y-6 text-center bg-card border rounded-2xl p-8 shadow-lg">
        <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto"><Lock className="h-8 w-8 text-primary" /></div>
        <div><h1 className="text-2xl font-serif font-medium">Admin Panel</h1><p className="text-sm text-muted-foreground mt-1">SANOVA Shop Management</p></div>
        <div className="space-y-3">
          <Input type="password" placeholder="Admin password" value={loginInput} onChange={e => setLoginInput(e.target.value)} onKeyDown={e => e.key === "Enter" && login()} className="h-11 text-center" />
          <Button onClick={login} className="w-full h-11">Login</Button>
          {loginError && <p className="text-sm text-destructive">{loginError}</p>}
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-muted/30">
      {/* Header */}
      <div className="bg-card border-b sticky top-0 z-50">
        <div className="container mx-auto px-4 max-w-6xl flex items-center justify-between h-14">
          <h1 className="text-lg font-serif font-medium">SANOVA Admin</h1>
          <Button variant="ghost" size="sm" onClick={logout} className="text-muted-foreground"><LogOut className="h-4 w-4 mr-2" />Logout</Button>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6 max-w-6xl">
        {/* Tabs */}
        <div className="flex gap-1 mb-6 overflow-x-auto pb-1">
          {TABS.map(t => (
            <Button key={t.key} variant={tab === t.key ? "default" : "ghost"} onClick={() => setTab(t.key)} className={cn("rounded-full shrink-0", tab !== t.key && "text-muted-foreground")}>
              <t.icon className="h-4 w-4 mr-2" />{t.label}
            </Button>
          ))}
        </div>

        {/* Content */}
        {tab === "dashboard" && <DashboardPanel />}
        {tab === "products" && <ProductsPanel />}
        {tab === "orders" && <OrdersPanel />}
        {tab === "kol" && <KolPanel />}
        {tab === "users" && <UsersPanel />}
      </div>
    </div>
  );
}
