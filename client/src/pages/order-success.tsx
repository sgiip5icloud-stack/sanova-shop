import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { CheckCircle2 } from "lucide-react";

export function OrderSuccess() {
  return (
    <div className="min-h-[70vh] flex items-center justify-center py-12 px-4">
      <div className="max-w-md w-full bg-card p-8 rounded-3xl shadow-xl text-center flex flex-col items-center gap-6">
        <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center text-primary"><CheckCircle2 className="w-10 h-10" /></div>
        <div><h1 className="text-3xl font-serif font-medium mb-2">Order Confirmed!</h1><p className="text-muted-foreground">Thank you for your purchase.</p></div>
        <div className="w-full space-y-3 mt-4">
          <Button className="w-full rounded-full h-12" asChild><Link href="/orders">View My Orders</Link></Button>
          <Button variant="outline" className="w-full rounded-full h-12" asChild><Link href="/">Return to Home</Link></Button>
        </div>
      </div>
    </div>
  );
}
