import { Link } from "wouter";

export function Footer() {
  return (
    <footer className="bg-muted py-12 md:py-16 mt-auto">
      <div className="container mx-auto px-4 grid grid-cols-1 md:grid-cols-4 gap-8 md:gap-12">
        <div className="flex flex-col gap-4 md:col-span-1">
          <Link href="/"><img src="/assets/logo.jpg" alt="SANOVA" className="h-12 w-auto object-contain mix-blend-multiply" /></Link>
          <p className="text-sm text-muted-foreground leading-relaxed max-w-xs">Better Space, Better Living. Premium room fragrance diffusers designed to bring elegance and freshness to your home.</p>
        </div>
        <div>
          <h4 className="font-serif font-semibold mb-4 text-foreground">Shop</h4>
          <ul className="flex flex-col gap-3">
            <li><Link href="/shop" className="text-sm text-muted-foreground hover:text-primary transition-colors">All Products</Link></li>
            <li><Link href="/shop?scent=peach" className="text-sm text-muted-foreground hover:text-primary transition-colors">Peach Scent</Link></li>
            <li><Link href="/shop?scent=lavender" className="text-sm text-muted-foreground hover:text-primary transition-colors">Lavender Scent</Link></li>
            <li><Link href="/shop?scent=ocean" className="text-sm text-muted-foreground hover:text-primary transition-colors">Ocean Scent</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="font-serif font-semibold mb-4 text-foreground">Customer Care</h4>
          <ul className="flex flex-col gap-3">
            <li><Link href="/login" className="text-sm text-muted-foreground hover:text-primary transition-colors">My Account</Link></li>
            <li><Link href="/orders" className="text-sm text-muted-foreground hover:text-primary transition-colors">Track Order</Link></li>
            <li><span className="text-sm text-muted-foreground">Shipping Policy</span></li>
            <li><span className="text-sm text-muted-foreground">Returns & Exchanges</span></li>
          </ul>
        </div>
        <div>
          <h4 className="font-serif font-semibold mb-4 text-foreground">Contact Us</h4>
          <ul className="flex flex-col gap-3">
            <li className="text-sm text-muted-foreground">Email: hello@sanova.ph</li>
            <li className="text-sm text-muted-foreground">Phone: +63 917 123 4567</li>
            <li className="text-sm text-muted-foreground">Manila, Philippines</li>
            <li className="text-sm text-muted-foreground mt-2">Follow us on Instagram @sanova.ph</li>
          </ul>
        </div>
      </div>
      <div className="container mx-auto px-4 mt-12 pt-8 border-t border-border/40 text-center">
        <p className="text-xs text-muted-foreground">&copy; {new Date().getFullYear()} SANOVA. All rights reserved.</p>
      </div>
    </footer>
  );
}
