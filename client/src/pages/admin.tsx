import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Loader2, Plus, Pencil, Trash2, Save, X, Lock, Package, Film, ShoppingBag, ChevronDown, ChevronUp, Check, Star, Eye, EyeOff, Upload } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { formatPrice } from "@/lib/format";
import { getProductImage } from "@/lib/product-images";
import { cn } from "@/lib/utils";
import type { KolVideo, Order, Product } from "@/lib/api";

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
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);
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

  const deleteOrder = useMutation({
    mutationFn: async (id: number) => {
      await fetch(`/api/admin/orders/${id}`, {
        method: "DELETE",
        headers: { "x-admin-password": password },
      });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-orders"] });
      setDeleteConfirm(null);
      setExpandedId(null);
    },
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
                    <div key={item.id} className="flex items-center gap-4 py-3 text-sm">
                      <div className="w-14 h-14 rounded-lg bg-white border overflow-hidden shrink-0 shadow-sm">
                        <img src={getProductImage(item.image)} alt={item.productName} className="w-full h-full object-contain p-1" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <span className="font-medium block truncate">{item.productName}</span>
                        <span className="text-muted-foreground">× {item.quantity}</span>
                      </div>
                      <span className="font-medium shrink-0">{formatPrice(item.price * item.quantity)}</span>
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

                <Separator />

                <div>
                  {deleteConfirm === order.id ? (
                    <div className="flex items-center gap-3 bg-red-50 border border-red-200 rounded-xl p-4">
                      <span className="text-sm text-red-800 flex-1">Are you sure? This cannot be undone.</span>
                      <Button size="sm" variant="destructive" onClick={(e) => { e.stopPropagation(); deleteOrder.mutate(order.id); }} disabled={deleteOrder.isPending}>
                        {deleteOrder.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : <Trash2 className="h-4 w-4 mr-1" />}
                        Delete
                      </Button>
                      <Button size="sm" variant="ghost" onClick={(e) => { e.stopPropagation(); setDeleteConfirm(null); }}>Cancel</Button>
                    </div>
                  ) : (
                    <Button size="sm" variant="ghost" className="text-destructive hover:text-destructive hover:bg-red-50" onClick={(e) => { e.stopPropagation(); setDeleteConfirm(order.id); }}>
                      <Trash2 className="h-4 w-4 mr-2" /> Delete Order
                    </Button>
                  )}
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

type ProductForm = {
  name: string; scent: string; pack: string; price: string; originalPrice: string;
  image: string; description: string; inStock: boolean; isFeatured: boolean; badge: string; sortOrder: string;
};

const EMPTY_PRODUCT: ProductForm = {
  name: "SANOVA Room Fragrance Diffuser", scent: "", pack: "1", price: "", originalPrice: "",
  image: "", description: "", inStock: true, isFeatured: false, badge: "", sortOrder: "0",
};

function ProductsPanel() {
  const [editingId, setEditingId] = useState<number | null>(null);
  const [addingNew, setAddingNew] = useState(false);
  const [form, setForm] = useState<ProductForm>(EMPTY_PRODUCT);
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);
  const [uploading, setUploading] = useState(false);
  const qc = useQueryClient();
  const password = sessionStorage.getItem("admin_pw") || "";
  const headers: Record<string, string> = { "x-admin-password": password, "content-type": "application/json" };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("image", file);
      const res = await fetch("/api/admin/upload", {
        method: "POST",
        headers: { "x-admin-password": password },
        body: fd,
      });
      if (!res.ok) { const err = await res.json(); alert(err.error); return; }
      const data = await res.json();
      setForm(f => ({ ...f, image: data.imageKey }));
    } catch (err) {
      alert("Upload failed");
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  const { data: products = [], isLoading } = useQuery<Product[]>({
    queryKey: ["admin-products"],
    queryFn: async () => {
      const res = await fetch("/api/products");
      return res.json();
    },
  });

  const createMut = useMutation({
    mutationFn: async (data: ProductForm) => {
      const res = await fetch("/api/admin/products", {
        method: "POST", headers,
        body: JSON.stringify({
          name: data.name, scent: data.scent, pack: data.pack,
          price: Number(data.price), originalPrice: data.originalPrice ? Number(data.originalPrice) : null,
          image: data.image, description: data.description,
          inStock: data.inStock, isFeatured: data.isFeatured,
          badge: data.badge || null, sortOrder: Number(data.sortOrder) || 0,
        }),
      });
      if (!res.ok) { const err = await res.json(); throw new Error(err.error); }
      return res.json();
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["admin-products"] }); setAddingNew(false); setForm(EMPTY_PRODUCT); },
  });

  const updateMut = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: ProductForm }) => {
      const res = await fetch(`/api/admin/products/${id}`, {
        method: "PUT", headers,
        body: JSON.stringify({
          name: data.name, scent: data.scent, pack: data.pack,
          price: Number(data.price), originalPrice: data.originalPrice ? Number(data.originalPrice) : null,
          image: data.image, description: data.description,
          inStock: data.inStock, isFeatured: data.isFeatured,
          badge: data.badge || null, sortOrder: Number(data.sortOrder) || 0,
        }),
      });
      if (!res.ok) { const err = await res.json(); throw new Error(err.error); }
      return res.json();
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["admin-products"] }); setEditingId(null); setForm(EMPTY_PRODUCT); },
  });

  const deleteMut = useMutation({
    mutationFn: async (id: number) => {
      await fetch(`/api/admin/products/${id}`, { method: "DELETE", headers });
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["admin-products"] }); setDeleteConfirm(null); },
  });

  const toggleStock = useMutation({
    mutationFn: async ({ id, inStock }: { id: number; inStock: boolean }) => {
      await fetch(`/api/admin/products/${id}`, {
        method: "PUT", headers,
        body: JSON.stringify({ inStock }),
      });
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin-products"] }),
  });

  const toggleFeatured = useMutation({
    mutationFn: async ({ id, isFeatured }: { id: number; isFeatured: boolean }) => {
      await fetch(`/api/admin/products/${id}`, {
        method: "PUT", headers,
        body: JSON.stringify({ isFeatured }),
      });
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin-products"] }),
  });

  const ProductFormFields = () => (
    <div className="grid gap-3">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="text-sm text-muted-foreground block mb-1">Product name</label>
          <Input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="SANOVA Room Fragrance Diffuser" />
        </div>
        <div>
          <label className="text-sm text-muted-foreground block mb-1">Scent (mùi hương)</label>
          <Input value={form.scent} onChange={e => setForm(f => ({ ...f, scent: e.target.value }))} placeholder="peach, lavender, ocean..." />
        </div>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div>
          <label className="text-sm text-muted-foreground block mb-1">Pack</label>
          <Input value={form.pack} onChange={e => setForm(f => ({ ...f, pack: e.target.value }))} placeholder="1, 2, 3" />
        </div>
        <div>
          <label className="text-sm text-muted-foreground block mb-1">Price (₱)</label>
          <Input type="number" value={form.price} onChange={e => setForm(f => ({ ...f, price: e.target.value }))} placeholder="279" />
        </div>
        <div>
          <label className="text-sm text-muted-foreground block mb-1">Original price</label>
          <Input type="number" value={form.originalPrice} onChange={e => setForm(f => ({ ...f, originalPrice: e.target.value }))} placeholder="349" />
        </div>
        <div>
          <label className="text-sm text-muted-foreground block mb-1">Sort order</label>
          <Input type="number" value={form.sortOrder} onChange={e => setForm(f => ({ ...f, sortOrder: e.target.value }))} placeholder="0" />
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="text-sm text-muted-foreground block mb-1">Ảnh sản phẩm</label>
          <div className="flex items-center gap-3">
            {form.image && (
              <div className="w-16 h-16 rounded-lg border bg-white overflow-hidden shrink-0">
                <img src={getProductImage(form.image)} alt="Preview" className="w-full h-full object-contain p-1" />
              </div>
            )}
            <div className="flex-1">
              <label className={cn(
                "flex items-center justify-center gap-2 px-4 py-2 border-2 border-dashed rounded-lg cursor-pointer text-sm transition-colors",
                uploading ? "opacity-50 pointer-events-none" : "hover:border-primary hover:bg-primary/5"
              )}>
                {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
                {uploading ? "Đang upload..." : form.image ? "Đổi ảnh" : "Chọn ảnh"}
                <input type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={handleImageUpload} disabled={uploading} />
              </label>
              {form.image && <p className="text-xs text-muted-foreground mt-1">Key: {form.image}</p>}
            </div>
          </div>
        </div>
        <div>
          <label className="text-sm text-muted-foreground block mb-1">Badge</label>
          <Input value={form.badge} onChange={e => setForm(f => ({ ...f, badge: e.target.value }))} placeholder="New, Sale, Best Value, Popular" />
        </div>
      </div>
      <div>
        <label className="text-sm text-muted-foreground block mb-1">Description</label>
        <Textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="Mô tả sản phẩm..." rows={3} />
      </div>
      <div className="flex gap-6">
        <label className="flex items-center gap-2 cursor-pointer text-sm">
          <input type="checkbox" checked={form.inStock} onChange={e => setForm(f => ({ ...f, inStock: e.target.checked }))} className="rounded" />
          In stock
        </label>
        <label className="flex items-center gap-2 cursor-pointer text-sm">
          <input type="checkbox" checked={form.isFeatured} onChange={e => setForm(f => ({ ...f, isFeatured: e.target.checked }))} className="rounded" />
          Featured (hiện trang chủ)
        </label>
      </div>
    </div>
  );

  if (isLoading) return <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin" /></div>;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <span className="text-sm text-muted-foreground">{products.length} products</span>
        <Button onClick={() => { setAddingNew(true); setForm(EMPTY_PRODUCT); setEditingId(null); }}>
          <Plus className="h-4 w-4 mr-2" />Add product
        </Button>
      </div>

      {addingNew && (
        <div className="border rounded-xl p-6 bg-card">
          <h3 className="font-semibold mb-4">New product</h3>
          <ProductFormFields />
          <div className="flex gap-2 mt-4">
            <Button onClick={() => createMut.mutate(form)} disabled={createMut.isPending || !form.name || !form.scent || !form.price || !form.image}>
              {createMut.isPending ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}Save
            </Button>
            <Button variant="ghost" onClick={() => setAddingNew(false)}><X className="h-4 w-4 mr-2" />Cancel</Button>
          </div>
          {createMut.isError && <p className="text-sm text-destructive mt-2">{(createMut.error as Error).message}</p>}
        </div>
      )}

      {products.map(p => (
        <div key={p.id} className="border rounded-xl bg-card overflow-hidden">
          {editingId === p.id ? (
            <div className="p-6">
              <h3 className="font-semibold mb-4">Edit product #{p.id}</h3>
              <ProductFormFields />
              <div className="flex gap-2 mt-4">
                <Button onClick={() => updateMut.mutate({ id: p.id, data: form })} disabled={updateMut.isPending}>
                  {updateMut.isPending ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}Save
                </Button>
                <Button variant="ghost" onClick={() => { setEditingId(null); setForm(EMPTY_PRODUCT); }}><X className="h-4 w-4 mr-2" />Cancel</Button>
              </div>
              {updateMut.isError && <p className="text-sm text-destructive mt-2">{(updateMut.error as Error).message}</p>}
            </div>
          ) : (
            <div className="p-4 flex items-center gap-4">
              <div className="w-16 h-16 rounded-lg bg-white border overflow-hidden shrink-0 shadow-sm">
                <img src={getProductImage(p.image)} alt={p.name} className="w-full h-full object-contain p-1" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-medium truncate">{p.name}</span>
                  {p.badge && <Badge variant="secondary" className="text-xs">{p.badge}</Badge>}
                </div>
                <div className="flex items-center gap-3 text-sm text-muted-foreground mt-1 flex-wrap">
                  <span className="capitalize">{p.scent}</span>
                  <span>Pack {p.pack}</span>
                  <span className="font-semibold text-primary">{formatPrice(p.price)}</span>
                  {p.originalPrice && <span className="line-through text-xs">{formatPrice(p.originalPrice)}</span>}
                </div>
              </div>
              <div className="flex items-center gap-1 shrink-0">
                <Button
                  variant="ghost" size="icon" title={p.inStock ? "In stock" : "Out of stock"}
                  onClick={() => toggleStock.mutate({ id: p.id, inStock: !p.inStock })}
                  className={p.inStock ? "text-green-600" : "text-muted-foreground"}
                >
                  {p.inStock ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                </Button>
                <Button
                  variant="ghost" size="icon" title={p.isFeatured ? "Featured" : "Not featured"}
                  onClick={() => toggleFeatured.mutate({ id: p.id, isFeatured: !p.isFeatured })}
                  className={p.isFeatured ? "text-yellow-500" : "text-muted-foreground"}
                >
                  <Star className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" onClick={() => {
                  setEditingId(p.id); setAddingNew(false);
                  setForm({
                    name: p.name, scent: p.scent, pack: p.pack, price: String(p.price),
                    originalPrice: p.originalPrice ? String(p.originalPrice) : "",
                    image: p.image, description: p.description,
                    inStock: p.inStock, isFeatured: p.isFeatured,
                    badge: p.badge || "", sortOrder: String(p.sortOrder ?? 0),
                  });
                }}><Pencil className="h-4 w-4" /></Button>
                {deleteConfirm === p.id ? (
                  <div className="flex items-center gap-1">
                    <Button size="icon" variant="destructive" onClick={() => deleteMut.mutate(p.id)} disabled={deleteMut.isPending}>
                      <Check className="h-4 w-4" />
                    </Button>
                    <Button size="icon" variant="ghost" onClick={() => setDeleteConfirm(null)}>
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ) : (
                  <Button variant="ghost" size="icon" className="text-destructive" onClick={() => setDeleteConfirm(p.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
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
  const [tab, setTab] = useState<"orders" | "products" | "kol">("products");

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
        <Button variant={tab === "products" ? "default" : "outline"} onClick={() => setTab("products")} className="rounded-full">
          <ShoppingBag className="h-4 w-4 mr-2" /> Products
        </Button>
        <Button variant={tab === "orders" ? "default" : "outline"} onClick={() => setTab("orders")} className="rounded-full">
          <Package className="h-4 w-4 mr-2" /> Orders
        </Button>
        <Button variant={tab === "kol" ? "default" : "outline"} onClick={() => setTab("kol")} className="rounded-full">
          <Film className="h-4 w-4 mr-2" /> KOL Videos
        </Button>
      </div>

      {tab === "products" && <ProductsPanel />}
      {tab === "orders" && <OrdersPanel />}
      {tab === "kol" && <KolPanel />}
    </div>
  );
}
