import { useState } from "react";
import { useParams, useLocation, Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { api, type Product } from "@/lib/api";
import { formatPrice } from "@/lib/format";
import { getProductImage } from "@/lib/product-images";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/components/ui/toaster";
import { Loader2, ArrowLeft, Check, Tag, ShoppingBag, Plus, Minus, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";

const VALID_VOUCHERS: Record<string, number> = {
  "SANOSGI2": 50,
  "SANOSGI3": 50,
  "SANOSGI4": 50,
  "SANOSGI5": 50,
};

interface CartLine {
  product: Product;
  qty: number;
}

export function BuyNow() {
  const params = useParams<{ id: string }>();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const initialProductId = parseInt(params.id || "0", 10);

  const { data: allProducts = [], isLoading } = useQuery({
    queryKey: ["all-products"],
    queryFn: () => api.get<Product[]>("/products"),
  });

  const [lines, setLines] = useState<CartLine[]>([]);
  const [initialized, setInitialized] = useState(false);

  // Initialize with the product from URL
  if (!initialized && allProducts.length > 0) {
    const initial = allProducts.find(p => p.id === initialProductId);
    if (initial) setLines([{ product: initial, qty: 1 }]);
    setInitialized(true);
  }

  const [voucher, setVoucher] = useState("");
  const [discount, setDiscount] = useState(0);
  const [voucherApplied, setVoucherApplied] = useState(false);
  const [voucherError, setVoucherError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({ name: "", phone: "", email: "", address: "" });

  const addProduct = (product: Product) => {
    setLines(prev => {
      const existing = prev.find(l => l.product.id === product.id);
      if (existing) return prev.map(l => l.product.id === product.id ? { ...l, qty: l.qty + 1 } : l);
      return [...prev, { product, qty: 1 }];
    });
  };

  const updateQty = (productId: number, delta: number) => {
    setLines(prev => prev.map(l => l.product.id === productId ? { ...l, qty: Math.max(1, l.qty + delta) } : l));
  };

  const removeLine = (productId: number) => {
    setLines(prev => prev.filter(l => l.product.id !== productId));
  };

  const applyVoucher = () => {
    const code = voucher.trim().toUpperCase();
    if (VALID_VOUCHERS[code]) {
      setDiscount(VALID_VOUCHERS[code]);
      setVoucherApplied(true);
      setVoucherError("");
      toast({ title: "Voucher applied!", description: `${VALID_VOUCHERS[code]}% discount activated.` });
    } else {
      setDiscount(0);
      setVoucherApplied(false);
      setVoucherError("Invalid voucher code. Please try again.");
    }
  };

  if (isLoading) return <div className="w-full min-h-[60vh] flex items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;

  const subtotalBeforeDiscount = lines.reduce((s, l) => s + l.product.price * l.qty, 0);
  const discountAmount = discount > 0 ? subtotalBeforeDiscount * discount / 100 : 0;
  const subtotal = subtotalBeforeDiscount - discountAmount;
  const total = subtotal;

  const handleSubmit = async () => {
    if (!form.name || !form.phone || !form.address) {
      toast({ title: "Please fill in all required fields", variant: "destructive" });
      return;
    }
    if (lines.length === 0) {
      toast({ title: "Please select at least one product", variant: "destructive" });
      return;
    }
    setSubmitting(true);
    try {
      await api.post("/orders", {
        customerName: form.name,
        customerPhone: form.phone,
        customerEmail: form.email || "N/A",
        address: form.address,
        city: "Philippines",
        note: voucher ? `Voucher: ${voucher.toUpperCase()} (-${discount}%)` : "",
        items: lines.map(l => ({ productId: l.product.id, quantity: l.qty })),
        totalAmount: total,
      });
      toast({ title: "Order placed! 🎉", description: "We'll contact you to confirm shortly." });
      setLocation("/order-success");
    } catch {
      toast({ title: "Error", description: "Unable to place order.", variant: "destructive" });
    }
    setSubmitting(false);
  };

  // Group products by type for easier browsing
  const singleProducts = allProducts.filter(p => p.pack === "1");
  const packOf2 = allProducts.filter(p => p.pack === "2");
  const packOf3 = allProducts.filter(p => p.pack === "3");

  const ProductSelector = ({ products, title }: { products: Product[]; title: string }) => (
    <div className="mb-4">
      <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">{title}</h4>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
        {products.map(p => {
          const inCart = lines.some(l => l.product.id === p.id);
          return (
            <button
              key={p.id}
              onClick={() => addProduct(p)}
              className={cn(
                "flex items-center gap-3 p-3 rounded-xl border-2 text-left transition-all",
                inCart ? "border-primary bg-primary/5" : "border-border hover:border-primary/40"
              )}
            >
              <img src={getProductImage(p.image)} alt={p.name} className="w-14 h-14 rounded-lg object-contain bg-muted/20 p-1 shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="text-xs font-medium capitalize truncate">{p.scent}</div>
                <div className="text-xs text-muted-foreground">{p.pack} {parseInt(p.pack) > 1 ? "Bottles" : "Bottle"}</div>
                <div className="text-sm font-semibold text-primary mt-0.5">{formatPrice(p.price)}</div>
              </div>
              {inCart && <Check className="h-4 w-4 text-primary shrink-0" />}
            </button>
          );
        })}
      </div>
    </div>
  );

  return (
    <div className="container mx-auto px-4 py-8 md:py-12 max-w-5xl">
      <div className="mb-6">
        <Button variant="ghost" size="sm" asChild className="-ml-4">
          <Link href="/shop"><ArrowLeft className="mr-2 h-4 w-4" /> Back to Shop</Link>
        </Button>
      </div>

      <h1 className="text-3xl font-serif font-medium mb-8">Quick Order</h1>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-10">
        {/* Left: Product Selection + Form */}
        <div className="lg:col-span-3 space-y-8">

          {/* Product Selection */}
          <div>
            <h3 className="text-lg font-serif font-medium mb-4">Select Products</h3>
            <div className="border rounded-2xl p-4 bg-card">
              {singleProducts.length > 0 && <ProductSelector products={singleProducts} title="Single Bottle" />}
              {packOf2.length > 0 && <ProductSelector products={packOf2} title="Pack of 2" />}
              {packOf3.length > 0 && <ProductSelector products={packOf3} title="Pack of 3" />}
            </div>
          </div>

          {/* Selected Items */}
          {lines.length > 0 && (
            <div>
              <h3 className="text-lg font-serif font-medium mb-4">Your Items</h3>
              <div className="space-y-3">
                {lines.map(line => (
                  <div key={line.product.id} className="flex items-center gap-4 p-3 border rounded-xl bg-card">
                    <img src={getProductImage(line.product.image)} alt={line.product.name} className="w-16 h-16 rounded-lg object-contain bg-muted/20 p-1 shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-sm truncate">{line.product.name}</div>
                      <div className="text-xs text-muted-foreground capitalize">{line.product.scent} • {line.product.pack} {parseInt(line.product.pack) > 1 ? "Bottles" : "Bottle"}</div>
                      <div className="text-sm font-semibold text-primary mt-1">
                        {discount > 0 && <span className="text-muted-foreground line-through mr-2">{formatPrice(line.product.price)}</span>}
                        {formatPrice(discount > 0 ? line.product.price * (1 - discount / 100) : line.product.price)}
                      </div>
                    </div>
                    <div className="flex items-center border border-input rounded-md h-9 shrink-0">
                      <button onClick={() => updateQty(line.product.id, -1)} className="w-8 h-full flex items-center justify-center"><Minus className="h-3 w-3" /></button>
                      <span className="w-8 text-center text-sm font-semibold">{line.qty}</span>
                      <button onClick={() => updateQty(line.product.id, 1)} className="w-8 h-full flex items-center justify-center"><Plus className="h-3 w-3" /></button>
                    </div>
                    <span className="font-semibold text-sm shrink-0 w-16 text-right">
                      {formatPrice((discount > 0 ? line.product.price * (1 - discount / 100) : line.product.price) * line.qty)}
                    </span>
                    <button onClick={() => removeLine(line.product.id)} className="text-muted-foreground hover:text-destructive shrink-0"><Trash2 className="h-4 w-4" /></button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Customer Info */}
          <div>
            <h3 className="text-lg font-serif font-medium mb-4">Your Information</h3>
            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium block mb-1">Full Name <span className="text-destructive">*</span></label>
                <Input placeholder="Juan dela Cruz" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
              </div>
              <div>
                <label className="text-sm font-medium block mb-1">Phone Number <span className="text-destructive">*</span></label>
                <Input placeholder="09XX XXX XXXX" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} />
              </div>
              <div>
                <label className="text-sm font-medium block mb-1">Email</label>
                <Input type="email" placeholder="email@example.com" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} />
              </div>
              <div>
                <label className="text-sm font-medium block mb-1">Delivery Address <span className="text-destructive">*</span></label>
                <Input placeholder="Full address" value={form.address} onChange={e => setForm(f => ({ ...f, address: e.target.value }))} />
              </div>
            </div>
          </div>

          {/* Voucher */}
          <div>
            <h3 className="text-lg font-serif font-medium mb-4">Voucher Code</h3>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Tag className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Enter voucher code"
                  className={cn("pl-10", voucherApplied && "border-green-500 bg-green-50")}
                  value={voucher}
                  onChange={e => { setVoucher(e.target.value); setVoucherApplied(false); setVoucherError(""); setDiscount(0); }}
                />
              </div>
              <Button variant="outline" onClick={applyVoucher} disabled={!voucher.trim()}>Apply</Button>
            </div>
            {voucherApplied && (
              <div className="flex items-center gap-2 mt-2 text-green-600 text-sm font-medium">
                <Check className="h-4 w-4" /> {discount}% discount applied!
              </div>
            )}
            {voucherError && <p className="text-destructive text-sm mt-2">{voucherError}</p>}
          </div>
        </div>

        {/* Right: Order Summary */}
        <div className="lg:col-span-2">
          <div className="bg-muted/30 rounded-2xl p-6 sticky top-24">
            <h3 className="font-serif font-medium text-xl mb-6">Order Summary</h3>

            {lines.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">Select products to get started.</p>
            ) : (
              <>
                <div className="space-y-3 mb-6 max-h-[300px] overflow-y-auto pr-1">
                  {lines.map(line => (
                    <div key={line.product.id} className="flex gap-3 items-center">
                      <div className="w-12 h-12 rounded-lg bg-white border overflow-hidden shrink-0 relative shadow-sm">
                        <img src={getProductImage(line.product.image)} alt="" className="w-full h-full object-contain p-1" />
                        <div className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-primary text-primary-foreground text-[10px] font-bold flex items-center justify-center">{line.qty}</div>
                      </div>
                      <div className="flex-1 min-w-0 text-sm">
                        <div className="font-medium truncate">{line.product.name}</div>
                        <div className="text-xs text-muted-foreground capitalize">{line.product.scent}</div>
                      </div>
                      <span className="text-sm font-semibold shrink-0">
                        {formatPrice((discount > 0 ? line.product.price * (1 - discount / 100) : line.product.price) * line.qty)}
                      </span>
                    </div>
                  ))}
                </div>

                <Separator className="mb-4" />

                <div className="space-y-2 text-sm mb-4">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span>{formatPrice(subtotalBeforeDiscount)}</span>
                  </div>
                  {discount > 0 && (
                    <div className="flex justify-between text-green-600">
                      <span className="flex items-center gap-1"><Tag className="h-3.5 w-3.5" /> Voucher (-{discount}%)</span>
                      <span>-{formatPrice(discountAmount)}</span>
                    </div>
                  )}
                </div>

                <Separator className="mb-4" />

                <div className="flex justify-between items-end mb-6">
                  <span className="font-serif font-medium text-lg">Total</span>
                  <span className="font-bold text-2xl text-primary">{formatPrice(total)}</span>
                </div>
              </>
            )}

            <Button
              size="lg"
              className="w-full h-14 rounded-full text-base bg-[#1A3A6B] hover:bg-[#152d54] text-white font-semibold shadow-lg"
              onClick={handleSubmit}
              disabled={submitting || lines.length === 0}
            >
              {submitting ? <><Loader2 className="mr-2 h-5 w-5 animate-spin" />Processing...</> : <><ShoppingBag className="mr-2 h-5 w-5" />Place Order — {formatPrice(total)}</>}
            </Button>

            <div className="flex flex-col gap-2 text-xs text-muted-foreground mt-4">
              <div className="flex items-center gap-2"><Check className="h-3.5 w-3.5 text-green-500" />Cash on Delivery — pay when you receive</div>
              <div className="flex items-center gap-2"><Check className="h-3.5 w-3.5 text-green-500" />Delivery in 2–5 business days</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
