import { Link } from "wouter";
import { useCart } from "@/hooks/use-cart";
import { formatPrice } from "@/lib/format";
import { getProductImage } from "@/lib/product-images";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Minus, Plus, Trash2, ArrowRight } from "lucide-react";

export function Cart() {
  const { items, updateQuantity, removeItem, total, itemCount } = useCart();

  if (items.length === 0) return (
    <div className="container mx-auto px-4 py-24 flex flex-col items-center justify-center text-center">
      <div className="w-24 h-24 bg-muted rounded-full flex items-center justify-center mb-6 text-4xl">🛍️</div>
      <h2 className="text-2xl font-serif font-medium mb-4">Your cart is empty</h2>
      <p className="text-muted-foreground max-w-md mb-8">Let's find some amazing scents for your home!</p>
      <Button size="lg" className="rounded-full px-8" asChild><Link href="/shop">Continue Shopping</Link></Button>
    </div>
  );

  return (
    <div className="container mx-auto px-4 py-12 md:py-16">
      <h1 className="text-3xl md:text-4xl font-serif font-medium mb-8">Your Cart ({itemCount})</h1>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 items-start">
        <div className="lg:col-span-2 flex flex-col gap-6">
          {items.map(item => (
            <div key={item.id} className="flex gap-4 py-4 border-b last:border-0 items-center">
              <div className="w-20 h-20 bg-muted/20 rounded-lg overflow-hidden shrink-0">
                <img src={getProductImage(item.image)} alt={item.productName} className="w-full h-full object-contain p-1" />
              </div>
              <div className="flex-1 min-w-0">
                <Link href={`/product/${item.productId}`} className="font-serif font-medium hover:text-primary transition-colors line-clamp-1">{item.productName}</Link>
                <span className="text-xs text-muted-foreground uppercase tracking-wider block">{item.scent} • {item.pack} {parseInt(item.pack) > 1 ? "Bottles" : "Bottle"}</span>
                <span className="text-sm font-medium mt-1">{formatPrice(item.price)}</span>
              </div>
              <div className="flex items-center border border-input rounded-md h-10 w-28 shrink-0">
                <Button variant="ghost" size="icon" onClick={() => updateQuantity(item.id, Math.max(1, item.quantity - 1))} className="h-full w-8 rounded-none rounded-l-md"><Minus className="h-3 w-3" /></Button>
                <div className="flex-1 flex items-center justify-center font-medium text-sm">{item.quantity}</div>
                <Button variant="ghost" size="icon" onClick={() => updateQuantity(item.id, item.quantity + 1)} className="h-full w-8 rounded-none rounded-r-md"><Plus className="h-3 w-3" /></Button>
              </div>
              <span className="font-semibold shrink-0">{formatPrice(item.price * item.quantity)}</span>
              <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-destructive shrink-0" onClick={() => removeItem(item.id)}><Trash2 className="h-4 w-4" /></Button>
            </div>
          ))}
        </div>
        <div className="bg-muted/30 rounded-2xl p-6 flex flex-col gap-6">
          <h3 className="font-serif font-medium text-xl">Order Summary</h3>
          <div className="flex justify-between text-sm"><span className="text-muted-foreground">Subtotal</span><span className="font-medium">{formatPrice(total)}</span></div>
          <Separator />
          <div className="flex justify-between items-center text-lg"><span className="font-serif font-medium">Total</span><span className="font-bold text-primary">{formatPrice(total)}</span></div>
          <Button size="lg" className="w-full rounded-full h-14 text-base shadow-lg shadow-primary/20" asChild>
            <Link href="/checkout">Proceed to Checkout <ArrowRight className="ml-2 h-5 w-5" /></Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
