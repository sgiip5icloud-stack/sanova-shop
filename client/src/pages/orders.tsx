import { useQuery } from "@tanstack/react-query";
import { api, type Order } from "@/lib/api";
import { formatPrice } from "@/lib/format";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { Loader2, PackageOpen } from "lucide-react";

export function Orders() {
  const { data: orders, isLoading } = useQuery({ queryKey: ["orders"], queryFn: () => api.get<Order[]>("/orders") });

  if (isLoading) return <div className="w-full min-h-[60vh] flex items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;

  return (
    <div className="container mx-auto px-4 py-12 md:py-16">
      <h1 className="text-3xl md:text-4xl font-serif font-medium mb-2">My Orders</h1>
      <p className="text-muted-foreground mb-8">View and track your previous orders.</p>
      {!orders || orders.length === 0 ? (
        <div className="w-full py-16 flex flex-col items-center justify-center text-center gap-4 bg-muted/20 rounded-2xl">
          <PackageOpen className="h-8 w-8 text-primary" />
          <h3 className="text-xl font-medium">No orders yet</h3>
          <Button asChild className="mt-4 rounded-full px-8"><Link href="/shop">Start Shopping</Link></Button>
        </div>
      ) : (
        <div className="flex flex-col gap-6">
          {orders.map(order => (
            <div key={order.id} className="border rounded-2xl overflow-hidden bg-card shadow-sm">
              <div className="bg-muted/30 p-4 md:p-6 border-b flex flex-wrap justify-between items-center gap-4">
                <div className="flex flex-wrap gap-8 text-sm">
                  <div><span className="text-xs text-muted-foreground block uppercase font-semibold mb-1">Order #</span>SANOVA-{String(order.id).padStart(5, "0")}</div>
                  <div><span className="text-xs text-muted-foreground block uppercase font-semibold mb-1">Total</span>{formatPrice(order.totalAmount)}</div>
                </div>
                <Badge variant={order.status === "delivered" ? "default" : order.status === "cancelled" ? "destructive" : "secondary"} className="capitalize px-3 py-1">{order.status}</Badge>
              </div>
              <div className="p-4 md:p-6 flex flex-col gap-4">
                {order.items.map(item => (
                  <div key={item.id} className="flex gap-4 items-center">
                    <div className="w-16 h-16 rounded-md bg-muted/20 border shrink-0"></div>
                    <div className="flex-1"><span className="font-medium text-sm">{item.productName}</span><span className="text-xs text-muted-foreground block">Qty: {item.quantity}</span></div>
                    <span className="font-medium text-sm">{formatPrice(item.price * item.quantity)}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
