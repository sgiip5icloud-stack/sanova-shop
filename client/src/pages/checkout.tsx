import { useState } from "react";
import { useLocation, Link } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useCart } from "@/hooks/use-cart";
import { useAuth } from "@/hooks/use-auth";
import { api } from "@/lib/api";
import { formatPrice } from "@/lib/format";
import { getProductImage } from "@/lib/product-images";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/components/ui/toaster";
import { Loader2, ArrowLeft, Truck, Banknote, Smartphone, Check } from "lucide-react";
import { cn } from "@/lib/utils";

const schema = z.object({
  customerName: z.string().min(2), customerEmail: z.string().email(),
  customerPhone: z.string().min(10), address: z.string().min(5),
  city: z.string().min(2), note: z.string().optional(),
});

type PaymentMethod = "cod" | "bank" | "gcash";

export function Checkout() {
  const [, setLocation] = useLocation();
  const { items, total, clearCart } = useCart();
  const { user } = useAuth();
  const { toast } = useToast();
  const [payment, setPayment] = useState<PaymentMethod>("cod");
  const [submitting, setSubmitting] = useState(false);

  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: { customerName: user?.name || "", customerEmail: user?.email || "", customerPhone: user?.phone || "", address: "", city: "", note: "" },
  });

  if (items.length === 0) { setLocation("/cart"); return null; }
  const shippingFee = 60;
  const finalTotal = total + shippingFee;

  async function onSubmit(data: z.infer<typeof schema>) {
    setSubmitting(true);
    try {
      await api.post("/orders", { ...data, items: items.map(i => ({ productId: i.productId, quantity: i.quantity })), totalAmount: finalTotal });
      clearCart();
      toast({ title: "Order placed! 🎉", description: "We'll contact you to confirm shortly." });
      setLocation("/order-success");
    } catch { toast({ title: "Error", description: "Unable to place order.", variant: "destructive" }); }
    setSubmitting(false);
  }

  const methods = [
    { id: "cod" as const, label: "Cash on Delivery", desc: "Pay in cash when delivered", icon: Truck },
    { id: "bank" as const, label: "Bank Transfer", desc: "Transfer via BPI", icon: Banknote },
    { id: "gcash" as const, label: "GCash", desc: "Pay via GCash", icon: Smartphone },
  ];

  return (
    <div className="container mx-auto px-4 py-8 md:py-12">
      <div className="mb-6"><Button variant="ghost" size="sm" asChild className="-ml-4"><Link href="/cart"><ArrowLeft className="mr-2 h-4 w-4" /> Back to Cart</Link></Button></div>
      <h1 className="text-3xl font-serif font-medium mb-8">Checkout</h1>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        <div className="order-2 lg:order-1">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              <div>
                <h3 className="text-xl font-serif font-medium mb-4">Contact Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField control={form.control} name="customerName" render={({ field }) => (<FormItem><FormLabel>Full Name</FormLabel><FormControl><Input placeholder="Juan dela Cruz" {...field} /></FormControl><FormMessage /></FormItem>)} />
                  <FormField control={form.control} name="customerPhone" render={({ field }) => (<FormItem><FormLabel>Phone</FormLabel><FormControl><Input placeholder="09XX XXX XXXX" {...field} /></FormControl><FormMessage /></FormItem>)} />
                  <FormField control={form.control} name="customerEmail" render={({ field }) => (<FormItem className="md:col-span-2"><FormLabel>Email</FormLabel><FormControl><Input type="email" placeholder="email@example.com" {...field} /></FormControl><FormMessage /></FormItem>)} />
                </div>
              </div>
              <div>
                <h3 className="text-xl font-serif font-medium mb-4">Shipping Address</h3>
                <div className="grid gap-4">
                  <FormField control={form.control} name="address" render={({ field }) => (<FormItem><FormLabel>Street Address</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
                  <FormField control={form.control} name="city" render={({ field }) => (<FormItem><FormLabel>City / Province</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
                  <FormField control={form.control} name="note" render={({ field }) => (<FormItem><FormLabel>Notes (Optional)</FormLabel><FormControl><Textarea className="resize-none" {...field} /></FormControl><FormMessage /></FormItem>)} />
                </div>
              </div>
              <div>
                <h3 className="text-xl font-serif font-medium mb-4">Payment Method</h3>
                <div className="flex flex-col gap-3">
                  {methods.map(m => (
                    <button key={m.id} type="button" onClick={() => setPayment(m.id)} className={cn("flex items-center gap-4 p-4 rounded-xl border-2 text-left transition-all", payment === m.id ? "border-primary bg-primary/5" : "border-border hover:border-primary/40")}>
                      <div className={cn("w-10 h-10 rounded-full flex items-center justify-center shrink-0", payment === m.id ? "bg-primary text-white" : "bg-muted text-muted-foreground")}><m.icon className="h-5 w-5" /></div>
                      <div className="flex-1"><div className="font-semibold text-sm">{m.label}</div><div className="text-xs text-muted-foreground">{m.desc}</div></div>
                      <div className={cn("w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0", payment === m.id ? "border-primary bg-primary" : "border-muted-foreground/30")}>{payment === m.id && <Check className="h-3 w-3 text-white" />}</div>
                    </button>
                  ))}
                </div>
                {payment === "cod" && <div className="mt-4 p-4 rounded-xl bg-green-50 border border-green-200"><p className="text-sm text-green-800">✅ Pay <strong>{formatPrice(finalTotal)}</strong> in cash upon delivery.</p></div>}
                {payment === "bank" && <div className="mt-4 p-5 rounded-xl bg-blue-50 border border-blue-200"><p className="text-sm font-semibold text-blue-800 mb-2">BPI Transfer:</p><p className="text-sm">Account: 1234567890 — SANOVA CO., LTD</p></div>}
                {payment === "gcash" && <div className="mt-4 p-5 rounded-xl bg-blue-50 border border-blue-200"><p className="text-sm font-semibold text-blue-800 mb-2">GCash:</p><p className="text-sm">0917 123 4567 — SANOVA OFFICIAL</p></div>}
              </div>
              <Button type="submit" size="lg" className="w-full h-14 rounded-full text-base bg-[#1A3A6B] hover:bg-[#152d54] text-white font-semibold shadow-lg" disabled={submitting}>
                {submitting ? <><Loader2 className="mr-2 h-5 w-5 animate-spin" />Processing...</> : `Place Order — ${formatPrice(finalTotal)}`}
              </Button>
            </form>
          </Form>
        </div>
        <div className="order-1 lg:order-2">
          <div className="bg-muted/30 rounded-2xl p-6 lg:p-8 sticky top-24">
            <h3 className="font-serif font-medium text-xl mb-6">Order Summary</h3>
            <div className="flex flex-col gap-4 mb-6">
              {items.map(item => (
                <div key={item.id} className="flex gap-4 items-center">
                  <div className="w-16 h-16 rounded-xl bg-white border overflow-hidden shrink-0 relative shadow-sm">
                    <img src={getProductImage(item.image)} alt={item.productName} className="w-full h-full object-contain p-1" />
                    <div className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-primary text-primary-foreground text-[10px] font-bold flex items-center justify-center">{item.quantity}</div>
                  </div>
                  <div className="flex-1 text-sm"><span className="font-medium line-clamp-1">{item.productName}</span><span className="text-muted-foreground text-xs uppercase block">{item.scent}</span></div>
                  <div className="font-semibold text-sm">{formatPrice(item.price * item.quantity)}</div>
                </div>
              ))}
            </div>
            <Separator className="mb-4" />
            <div className="flex justify-between text-sm mb-2"><span className="text-muted-foreground">Subtotal</span><span>{formatPrice(total)}</span></div>
            <div className="flex justify-between text-sm mb-4"><span className="text-muted-foreground">Shipping</span><span>{formatPrice(shippingFee)}</span></div>
            <Separator className="mb-4" />
            <div className="flex justify-between items-end"><span className="font-serif font-medium text-lg">Total</span><span className="font-bold text-2xl text-primary">{formatPrice(finalTotal)}</span></div>
          </div>
        </div>
      </div>
    </div>
  );
}
