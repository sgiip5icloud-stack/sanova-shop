import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { api, type Product } from "@/lib/api";
import { ProductCard } from "@/components/ProductCard";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2 } from "lucide-react";

export function Shop() {
  const [scent, setScent] = useState("all");
  const [pack, setPack] = useState("all");

  const params = new URLSearchParams();
  if (scent !== "all") params.set("scent", scent);
  if (pack !== "all") params.set("pack", pack);

  const { data: products, isLoading } = useQuery({
    queryKey: ["products", scent, pack],
    queryFn: () => api.get<Product[]>(`/products?${params.toString()}`),
  });

  return (
    <div className="container mx-auto px-4 py-12 md:py-16 flex flex-col gap-8">
      <div className="flex flex-col gap-4 text-center items-center mb-4">
        <h1 className="text-4xl font-serif font-medium text-foreground">All Products</h1>
        <p className="text-muted-foreground max-w-xl">Browse our complete collection of room fragrance diffusers.</p>
      </div>
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-muted/30 p-4 rounded-lg">
        <div className="flex flex-wrap items-center gap-4 w-full sm:w-auto">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-muted-foreground w-16">Scent:</span>
            <Select value={scent} onValueChange={setScent}>
              <SelectTrigger className="w-[160px] bg-white"><SelectValue placeholder="All Scents" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Scents</SelectItem>
                <SelectItem value="peach">Peach</SelectItem>
                <SelectItem value="lavender">Lavender</SelectItem>
                <SelectItem value="ocean">Ocean</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-muted-foreground w-16">Pack:</span>
            <Select value={pack} onValueChange={setPack}>
              <SelectTrigger className="w-[160px] bg-white"><SelectValue placeholder="All Packs" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Packs</SelectItem>
                <SelectItem value="1">1 Bottle</SelectItem>
                <SelectItem value="2">2 Bottles</SelectItem>
                <SelectItem value="3">3 Bottles</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="text-sm text-muted-foreground">Showing {products?.length || 0} products</div>
      </div>
      {isLoading ? (
        <div className="w-full py-24 flex items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
      ) : products?.length === 0 ? (
        <div className="w-full py-24 flex flex-col items-center justify-center text-center gap-4">
          <h3 className="text-xl font-medium">No products found</h3>
          <Button variant="outline" onClick={() => { setScent("all"); setPack("all"); }}>Clear Filters</Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {products?.map(product => <ProductCard key={product.id} product={product} />)}
        </div>
      )}
    </div>
  );
}
