import { useParams, Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { api, type Product } from "@/lib/api";
import { formatPrice } from "@/lib/format";
import { getProductImage } from "@/lib/product-images";
import { ProductCard } from "@/components/ProductCard";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ShoppingBag, Loader2, ArrowLeft, Check } from "lucide-react";

const SHOPEE_URL = "https://shopee.ph/product/1742720557/57057828484/";

export function ProductDetail() {
  const params = useParams<{ id: string }>();
  const productId = parseInt(params.id || "0", 10);
  const { data: product, isLoading } = useQuery({ queryKey: ["product", productId], queryFn: () => api.get<Product>(`/products/${productId}`) });
  const { data: relatedProducts } = useQuery({ queryKey: ["products", product?.scent], queryFn: () => api.get<Product[]>(`/products?scent=${product?.scent}`), enabled: !!product });

  if (isLoading) return <div className="w-full min-h-[60vh] flex items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  if (!product) return <div className="container mx-auto px-4 py-24 text-center"><h2 className="text-2xl font-semibold mb-4">Product not found</h2><Button asChild><Link href="/shop">Back to Shop</Link></Button></div>;

  const variantProducts = relatedProducts?.filter(p => p.scent === product.scent) || [];

  return (
    <div className="container mx-auto px-4 py-8 md:py-12">
      <div className="mb-6"><Button variant="ghost" size="sm" asChild className="text-muted-foreground hover:text-foreground -ml-4"><Link href="/shop"><ArrowLeft className="mr-2 h-4 w-4" /> Back to Shop</Link></Button></div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 lg:gap-16 mb-16">
        <div className="aspect-square bg-muted/20 rounded-2xl overflow-hidden flex items-center justify-center p-4">
          <img src={getProductImage(product.image)} alt={product.name} className="w-full h-full object-contain" />
        </div>
        <div className="flex flex-col">
          <div className="mb-2 flex items-center gap-3 text-sm font-medium text-muted-foreground uppercase tracking-wider">
            <span>{product.scent}</span><span className="w-1 h-1 rounded-full bg-border"></span><span>{product.pack} {parseInt(product.pack) > 1 ? "Bottles" : "Bottle"}</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-serif font-medium text-foreground mb-4">{product.name}</h1>
          <div className="flex items-end gap-3 mb-6">
            <span className="text-2xl font-semibold text-primary">{formatPrice(product.price)}</span>
          </div>
          <p className="text-muted-foreground leading-relaxed mb-8">{product.description}</p>
          <Separator className="mb-8" />
          {variantProducts.length > 0 && (
            <div className="mb-8">
              <h3 className="text-sm font-semibold uppercase tracking-wider mb-3">Select Pack Size</h3>
              <div className="flex flex-wrap gap-3">
                {variantProducts.map(vp => (
                  <Button key={vp.id} variant={vp.id === product.id ? "default" : "outline"} className="h-12 px-6" asChild>
                    <Link href={`/product/${vp.id}`}>{vp.pack} {parseInt(vp.pack) > 1 ? "Bottles" : "Bottle"}</Link>
                  </Button>
                ))}
              </div>
            </div>
          )}
          <div className="flex flex-col gap-3 mb-4">
            <Button size="lg" className="h-12 rounded-full text-base shadow-lg shadow-primary/20 bg-[#1A3A6B] hover:bg-[#152d54]" asChild>
              <Link href={`/buy/${product.id}`}>
                <ShoppingBag className="mr-2 h-5 w-5" /> Buy Now
              </Link>
            </Button>
            <Button size="lg" variant="outline" className="h-12 rounded-full text-base" onClick={() => window.open(SHOPEE_URL, "_blank")} disabled={!product.inStock}>
              🛒 Buy on Shopee
            </Button>
          </div>
          <div className="flex items-start gap-3 bg-orange-50 border border-orange-200 rounded-xl px-4 py-3 mb-8">
            <span className="text-xl shrink-0">🛒</span>
            <p className="text-sm text-orange-800 leading-snug"><span className="font-semibold">Get a better deal on Shopee!</span> Tap "Buy on Shopee" to enjoy exclusive discounts and fast delivery.</p>
          </div>
          <div className="flex flex-col gap-3 text-sm text-muted-foreground">
            <div className="flex items-center gap-2"><Check className="h-4 w-4 text-primary" /><span>100% natural extracts</span></div>
            <div className="flex items-center gap-2"><Check className="h-4 w-4 text-primary" /><span>Lasts up to 90 days per bottle</span></div>
          </div>
        </div>
      </div>
      <div className="mt-16 mb-24">
        <Tabs defaultValue="description" className="w-full">
          <TabsList className="w-full justify-start border-b rounded-none h-auto p-0 bg-transparent mb-8">
            <TabsTrigger value="description" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none px-6 py-3 text-base">Description</TabsTrigger>
            <TabsTrigger value="how-to-use" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none px-6 py-3 text-base">How to Use</TabsTrigger>
            <TabsTrigger value="ingredients" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none px-6 py-3 text-base">Ingredients</TabsTrigger>
          </TabsList>

          <TabsContent value="description" className="text-muted-foreground leading-relaxed max-w-3xl">
            <div className="space-y-8">
              <div>
                <h3 className="text-xl font-serif font-semibold text-foreground mb-3">SANOVA – Natural Fragrance for a Better Quality of Life</h3>
                <p>Safe and gentle for your health.</p>
              </div>

              <div>
                <h4 className="font-semibold text-foreground mb-2">The Importance of Fragrance in Living Spaces</h4>
                <p className="mb-3">Your living and working spaces are where your daily activities take place. A pleasant natural scent helps reduce stress, protects your health, and improves mental well-being.</p>
                <p className="mb-3">Nowadays, natural room fragrances are increasingly preferred over traditional air sprays due to their health benefits, ability to repel insects, and light, refreshing scent.</p>
                <p className="mb-3">SANOVA introduces its reed diffuser, made from plant-based ingredients that are safe and gentle. Each scent has its own unique character, allowing you to easily choose one that matches your personality.</p>
                <p className="mb-3">When diffused into the air, SANOVA not only freshens your space but also helps repel mosquitoes, relax your mind, reduce stress and fatigue, and promote better sleep.</p>
                <p>SANOVA is also more affordable compared to high-end perfumes.</p>
              </div>

              <div>
                <h4 className="font-semibold text-foreground mb-2">Benefits</h4>
                <ul className="list-disc pl-5 space-y-2">
                  <li>Eliminates odors and damp smells with plant-based deodorizing agents</li>
                  <li>Light fruity scent helps relax the mind, improve focus, and support better sleep</li>
                  <li>Helps repel mosquitoes naturally</li>
                  <li>Long-lasting fragrance for over 45 days</li>
                  <li>More affordable compared to high-end perfumes</li>
                </ul>
              </div>

              <div>
                <h4 className="font-semibold text-foreground mb-2">Suitable Spaces</h4>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {["Bathroom", "Bedroom", "Living Room", "Workspace", "Shoe Cabinet", "Office"].map(space => (
                    <div key={space} className="flex items-center gap-2 bg-muted/30 rounded-lg px-3 py-2">
                      <span className="text-primary font-bold">✓</span>
                      <span className="text-sm">{space}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="font-semibold text-foreground mb-2">Available Scents</h4>
                <div className="flex gap-4">
                  {[["🍑", "Peach"], ["💜", "Lavender"], ["🌊", "Ocean"]].map(([icon, name]) => (
                    <div key={name} className="flex items-center gap-2 bg-muted/30 rounded-full px-4 py-2">
                      <span>{icon}</span>
                      <span className="text-sm font-medium">{name}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="how-to-use" className="text-muted-foreground leading-relaxed max-w-3xl">
            <ol className="list-decimal pl-5 space-y-3">
              <li>Tear the packaging along the dotted line on the cap and bottle.</li>
              <li>Remove the outer cap.</li>
              <li>Remove the inner stopper and adjust the length of the diffuser wick.</li>
              <li>Insert the cotton wick and close the cap.</li>
              <li>Allow 24–48 hours for the fragrance to fully diffuse.</li>
              <li>For a stronger scent, flip the wick every 1–2 weeks.</li>
            </ol>
          </TabsContent>

          <TabsContent value="ingredients" className="text-muted-foreground leading-relaxed max-w-3xl">
            <h4 className="font-semibold text-foreground mb-3">Key Ingredients</h4>
            <ul className="list-disc pl-5 space-y-2">
              <li>Deionized Water</li>
              <li>Plant-based Deodorizing Agents</li>
              <li>Fruity Fragrances (Natural Extracts)</li>
            </ul>
            <p className="mt-4 italic text-sm">Free from phthalates, parabens, and formaldehydes. Safe for children and pets.</p>
          </TabsContent>
        </Tabs>
      </div>
      {relatedProducts && relatedProducts.length > 1 && (
        <div><h2 className="text-2xl font-serif font-medium mb-8">You might also like</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {relatedProducts.filter(p => p.id !== product.id).slice(0, 4).map(rp => <ProductCard key={rp.id} product={rp} />)}
          </div>
        </div>
      )}
    </div>
  );
}
