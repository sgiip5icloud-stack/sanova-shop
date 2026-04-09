import { useState, useEffect } from "react";
import { useParams, useLocation, Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { api, type Product } from "@/lib/api";
import { formatPrice } from "@/lib/format";
import { getProductImage } from "@/lib/product-images";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/components/ui/toaster";
import { Loader2, ArrowLeft, Check, Tag, ShoppingBag } from "lucide-react";
import { cn } from "@/lib/utils";

const VALID_VOUCHERS: Record<string, number> = {
  "SANOVA50": 50,
  "WELCOME50": 50,
  "HALF": 50,
};

export function BuyNow() {
  const params = useParams<{ id: string }>();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const productId = parseInt(params.id || "0", 10);
  const { data: product, isLoading } = useQuery({
    queryKey: ["product", productId],
    queryFn: () => api.get<Product>(`/products/${productId}`),
  });

  const [qty, setQty] = useState(1);
  const [voucher, setVoucher] = useState("");
  const [discount, setDiscount] = useState(0);
  const [voucherApplied, setVoucherApplied] = useState(false);
  const [voucherError, setVoucherError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const [form, setForm] = useState({
    name: "", phone: "", email: "", address: "",
  });

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
  if (!product) return <div className="container mx-auto px-4 py-24 text-center"><h2 className="text-2xl font-semibold mb-4">Product not found</h2><Button asChild><Link href="/shop">Back to Shop</Link></Button></div>;

  const unitPrice = discount > 0 ? product.price * (1 - discount / 100) : product.price;
  const subtotal = unitPrice * qty;
  const shipping = 60;
  const total = subtotal + shipping;

  const handleSubmit = async () => {
    if (!form.name || !form.phone || !form.address) {
      toast({ title: "Please fill in all required fields", variant: "destructive" });
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
        items: [{ productId: product.id, quantity: qty }],
        totalAmount: total,
      });
      toast({ title: "Order placed! 🎉", description: "We'll contact you to confirm shortly." });
      setLocation("/order-success");
    } catch {
      toast({ title: "Error", description: "Unable to place order.", variant: "destructive" });
    }
    setSubmitting(false);
  };

  return (
    <div className="container mx-auto px-4 py-8 md:py-12 max-w-4xl">
      <div className="mb-6">
        <Button variant="ghost" size="sm" asChild className="-ml-4">
          <Link href={`/product/${product.id}`}><ArrowLeft className="mr-2 h-4 w-4" /> Back to Product</Link>
        </Button>
      </div>

      <h1 className="text-3xl font-serif font-medium mb-8">Quick Order</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        {/* Left: Form */}
        <div className="space-y-6">
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

          <Button
            size="lg"
            className="w-full h-14 rounded-full text-base bg-[#1A3A6B] hover:bg-[#152d54] text-white font-semibold shadow-lg"
            onClick={handleSubmit}
            disabled={submitting}
          >
            {submitting ? <><Loader2 className="mr-2 h-5 w-5 animate-spin" />Processing...</> : <><ShoppingBag className="mr-2 h-5 w-5" />Place Order — {formatPrice(total)}</>}
          </Button>

          <div className="flex flex-col gap-2 text-xs text-muted-foreground">
            <div className="flex items-center gap-2"><Check className="h-3.5 w-3.5 text-green-500" />Cash on Delivery — pay when you receive</div>
            <div className="flex items-center gap-2"><Check className="h-3.5 w-3.5 text-green-500" />Delivery in 2–5 business days</div>
            <div className="flex items-center gap-2"><Check className="h-3.5 w-3.5 text-green-500" />100% authentic — money-back guarantee</div>
          </div>
        </div>

        {/* Right: Order Summary */}
        <div>
          <div className="bg-muted/30 rounded-2xl p-6 sticky top-24">
            <h3 className="font-serif font-medium text-xl mb-6">Order Summary</h3>

            <div className="flex gap-4 items-center mb-6">
              <div className="w-24 h-24 rounded-xl bg-white border overflow-hidden shrink-0 shadow-sm">
                <img src={getProductImage(product.image)} alt={product.name} className="w-full h-full object-contain p-2" />
              </div>
              <div className="flex-1">
                <div className="font-medium line-clamp-2">{product.name}</div>
                <div className="text-xs text-muted-foreground uppercase mt-1">{product.scent} • {product.pack} {parseInt(product.pack) > 1 ? "Bottles" : "Bottle"}</div>
              </div>
            </div>

            {/* Quantity */}
            <div className="flex items-center justify-between mb-6">
              <span className="text-sm font-medium">Quantity</span>
              <div className="flex items-center border border-input rounded-md h-10">
                <button onClick={() => setQty(q => Math.max(1, q - 1))} className="w-10 h-full flex items-center justify-center text-lg">−</button>
                <span className="w-10 text-center font-semibold">{qty}</span>
                <button onClick={() => setQty(q => q + 1)} className="w-10 h-full flex items-center justify-center text-lg">+</button>
              </div>
            </div>

            <Separator className="mb-4" />

            <div className="space-y-3 text-sm mb-4">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Unit Price</span>
                <div className="flex items-center gap-2">
                  {discount > 0 && <span className="text-muted-foreground line-through">{formatPrice(product.price)}</span>}
                  <span className="font-medium">{formatPrice(unitPrice)}</span>
                </div>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Subtotal ({qty}x)</span>
                <span className="font-medium">{formatPrice(subtotal)}</span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-green-600">
                  <span className="flex items-center gap-1"><Tag className="h-3.5 w-3.5" /> Voucher ({discount}%)</span>
                  <span className="font-medium">-{formatPrice(product.price * qty - subtotal)}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-muted-foreground">Shipping</span>
                <span className="font-medium">{formatPrice(shipping)}</span>
              </div>
            </div>

            <Separator className="mb-4" />

            <div className="flex justify-between items-end">
              <span className="font-serif font-medium text-lg">Total</span>
              <span className="font-bold text-2xl text-primary">{formatPrice(total)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}