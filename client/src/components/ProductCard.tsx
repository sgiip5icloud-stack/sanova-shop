import { Link } from "wouter";
import type { Product } from "@/lib/api";
import { formatPrice } from "@/lib/format";
import { Badge } from "@/components/ui/badge";
import { ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getProductImage } from "@/lib/product-images";

const SHOPEE_URL = "https://shopee.ph/product/1742720557/57057828484/";

export function ProductCard({ product }: { product: Product }) {
  const imageSrc = getProductImage(product.image);

  return (
    <div className="group flex flex-col gap-4 rounded-xl border border-transparent hover:border-border hover:shadow-lg transition-all duration-300 p-4 bg-white">
      <Link href={`/product/${product.id}`} className="relative aspect-square rounded-lg overflow-hidden bg-muted/30">
        <img src={imageSrc} alt={product.name} className="w-full h-full object-contain object-center group-hover:scale-105 transition-transform duration-500 p-2" />
        {product.badge && <Badge className="absolute top-3 left-3 bg-secondary text-secondary-foreground hover:bg-secondary/90">{product.badge}</Badge>}
      </Link>
      <div className="flex flex-col flex-1 gap-2">
        <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
          {product.scent} • {product.pack} {parseInt(product.pack) > 1 ? "Bottles" : "Bottle"}
        </span>
        <Link href={`/product/${product.id}`} className="font-serif text-lg font-medium text-foreground hover:text-primary transition-colors line-clamp-2">{product.name}</Link>
        <div className="mt-auto pt-4 flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-base font-semibold text-primary">{formatPrice(product.price)}</span>
            {product.originalPrice && <span className="text-xs text-muted-foreground line-through">{formatPrice(product.originalPrice)}</span>}
          </div>
          <Button variant="outline" size="icon" className="rounded-full shrink-0 group-hover:bg-primary group-hover:text-primary-foreground group-hover:border-primary transition-colors"
            onClick={(e) => { e.preventDefault(); window.open(SHOPEE_URL, "_blank", "noopener,noreferrer"); }}>
            <ShoppingBag className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
