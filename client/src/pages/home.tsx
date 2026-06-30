import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ProductCard } from "@/components/ProductCard";
import { api, type Product, type KolVideo } from "@/lib/api";
import { ArrowRight, Leaf, Wind, Sparkles, Play, Shield } from "lucide-react";

export function Home() {
  const { data: featuredProducts, isLoading } = useQuery({
    queryKey: ["products-featured"],
    queryFn: () => api.get<Product[]>("/products/featured"),
  });
  const { data: kolVideos = [] } = useQuery({
    queryKey: ["kol-videos"],
    queryFn: () => api.get<KolVideo[]>("/kol-videos"),
  });

  return (
    <div className="flex flex-col w-full">
      {/* Hero */}
      <section className="relative w-full overflow-hidden bg-[#f5eef8]">
        <img src="/assets/banner-hero.png" alt="SANOVA Room Fragrance Diffusers" className="w-full h-auto block" />
        <div className="absolute inset-0 flex items-center justify-end pr-8 md:pr-16 lg:pr-24">
          <Button size="lg" className="bg-[#1A3A6B] text-white hover:bg-[#152d54] rounded-full px-10 text-base h-12 shadow-xl font-semibold" asChild>
            <Link href="/shop">Shop Now →</Link>
          </Button>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="flex flex-col items-center text-center mb-14">
            <span className="text-xs uppercase tracking-[0.2em] text-[#F7A8C4] font-semibold mb-3">Collection</span>
            <h2 className="text-3xl md:text-4xl font-serif font-medium text-foreground mb-4">Featured Products</h2>
            <p className="text-muted-foreground max-w-xl">Three signature scents, carefully crafted to transform your living space into a sanctuary of calm.</p>
          </div>
          {isLoading ? (
            <div className="flex flex-wrap justify-center gap-6">
              {[1, 2, 3].map(i => (
                <div key={i} className="flex flex-col gap-4 animate-pulse w-full sm:w-[calc(50%-12px)] lg:w-[calc(33.333%-16px)] max-w-xs">
                  <div className="aspect-square bg-muted rounded-xl" /><div className="h-4 bg-muted rounded w-1/3" /><div className="h-6 bg-muted rounded w-3/4" /><div className="h-5 bg-muted rounded w-1/4 mt-4" />
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-wrap justify-center gap-6">
              {featuredProducts?.slice(0, 4).map(product => (
                <div key={product.id} className="w-full sm:w-[calc(50%-12px)] lg:w-[calc(33.333%-16px)] max-w-xs">
                  <ProductCard product={product} />
                </div>
              ))}
            </div>
          )}
          <div className="mt-12 flex justify-center">
            <Button variant="outline" size="lg" className="rounded-full px-8 border-primary text-primary hover:bg-primary hover:text-white" asChild>
              <Link href="/shop">View All Products <ArrowRight className="ml-2 h-4 w-4" /></Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Video Reviews */}
      {kolVideos.length > 0 && (
        <section className="py-20 bg-[#fdf6fb]">
          <div className="container mx-auto px-4">
            <div className="flex flex-col items-center text-center mb-14">
              <span className="text-xs uppercase tracking-[0.2em] text-[#F7A8C4] font-semibold mb-3">Real Reviews</span>
              <h2 className="text-3xl md:text-4xl font-serif font-medium text-foreground mb-4">What People Are Saying</h2>
              <p className="text-muted-foreground max-w-xl">Hear from real customers who have experienced SANOVA in their homes.</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {kolVideos.map(kol => (
                <div key={kol.id} className="group flex flex-col rounded-2xl overflow-hidden bg-white shadow-sm hover:shadow-xl transition-all duration-300 border border-border/40">
                  <div className="relative aspect-[9/16] overflow-hidden bg-black cursor-pointer"
                    onClick={() => kol.thumbnailUrl && window.open(kol.thumbnailUrl, "_blank", "noopener,noreferrer")}>
                    <video
                      src={kol.videoUrl}
                      className="w-full h-full object-cover"
                      muted
                      loop
                      playsInline
                      onMouseEnter={e => (e.target as HTMLVideoElement).play()}
                      onMouseLeave={e => { const v = e.target as HTMLVideoElement; v.pause(); v.currentTime = 0; }}
                    />
                    <div className="absolute bottom-3 right-3 bg-black/60 text-white text-xs font-semibold px-3 py-1.5 rounded-full flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                      <svg viewBox="0 0 24 24" className="h-4 w-4 fill-current"><path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.27 6.27 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.34-6.34V8.75a8.18 8.18 0 004.76 1.52V6.84a4.84 4.84 0 01-1-.15z"/></svg>
                      Watch on TikTok
                    </div>
                  </div>
                  <div className="p-4">
                    <p className="text-sm text-muted-foreground leading-relaxed italic">"{kol.quote}"</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Benefits */}
      <section className="py-20 bg-white overflow-hidden">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div className="relative"><div className="aspect-[4/5] rounded-2xl overflow-hidden shadow-2xl"><img src="/assets/banner-benefits.png" alt="SANOVA Diffuser Benefits" className="w-full h-full object-cover" /></div></div>
            <div className="flex flex-col gap-10">
              <div>
                <span className="text-xs uppercase tracking-[0.2em] text-[#F7A8C4] font-semibold mb-3 block">Why Choose SANOVA</span>
                <h2 className="text-3xl md:text-4xl font-serif font-medium text-foreground mb-6">Crafted for your well-being</h2>
                <p className="text-muted-foreground text-lg leading-relaxed">Every SANOVA diffuser doesn't just scent a room — it transforms the entire atmosphere.</p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                {[
                  { icon: Leaf, title: "Natural Extracts", desc: "Made with premium natural essential oils for an authentic, pure scent experience." },
                  { icon: Wind, title: "Lasts 45–90 Days", desc: "Slow-release formula maintains continuous fragrance — no refills needed." },
                  { icon: Sparkles, title: "Elegant Design", desc: "Beautiful birdcage-style bottles that double as sophisticated home decor." },
                  { icon: Shield, title: "Family Safe", desc: "No alcohol, no harmful chemicals — completely safe for children and pets." },
                ].map(({ icon: Icon, title, desc }) => (
                  <div key={title} className="flex flex-col gap-3">
                    <div className="w-12 h-12 rounded-full bg-[#fdf6fb] flex items-center justify-center text-[#1A3A6B] shadow-sm border border-[#F7A8C4]/30"><Icon className="h-6 w-6" /></div>
                    <h3 className="font-semibold text-lg">{title}</h3>
                    <p className="text-sm text-muted-foreground">{desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* About */}
      <section id="about" className="py-20 bg-[#fdf6fb]">
        <div className="container mx-auto px-4">
          {/* Hero intro */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center mb-20">
            <div className="order-2 lg:order-1 flex flex-col gap-6">
              <span className="text-xs uppercase tracking-[0.2em] text-[#F7A8C4] font-semibold">Our Story</span>
              <h2 className="text-3xl md:text-4xl font-serif font-medium text-foreground">SANOVA – Natural Fragrance for a Better Quality of Life</h2>
              <p className="text-lg text-[#F7A8C4] font-medium">Safe and gentle for human and pet.</p>
              <p className="text-muted-foreground leading-relaxed">Your living and working spaces are where your daily activities take place. A pleasant natural scent helps reduce stress, protects your health, and improves mental well-being.</p>
              <p className="text-muted-foreground leading-relaxed">Nowadays, natural room fragrances are increasingly preferred over traditional air sprays due to their health benefits, ability to repel insects, and light, refreshing scent.</p>
              <p className="text-muted-foreground leading-relaxed">Each scent has its own unique character, allowing you to easily choose one that matches your personality.</p>
              <div className="pt-2">
                <Button className="rounded-full px-8 bg-[#1A3A6B] hover:bg-[#152d54] text-white" asChild>
                  <Link href="/shop">Explore the Collection <ArrowRight className="ml-2 h-4 w-4" /></Link>
                </Button>
              </div>
            </div>
            <div className="order-1 lg:order-2 relative"><img src="/assets/all-3.jpg" alt="SANOVA 3 Scents" className="w-full h-auto rounded-2xl shadow-xl" /></div>
          </div>

          {/* Benefits + Ingredients */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 mb-20">
            <div className="bg-white rounded-2xl p-8 shadow-sm">
              <h3 className="text-xl font-serif font-medium text-foreground mb-6 flex items-center gap-2"><Sparkles className="h-5 w-5 text-[#F7A8C4]" /> Benefits</h3>
              <ul className="space-y-3 text-muted-foreground">
                <li className="flex items-start gap-3"><span className="text-[#F7A8C4] mt-0.5">✦</span> Eliminates odors and damp smells</li>
                <li className="flex items-start gap-3"><span className="text-[#F7A8C4] mt-0.5">✦</span> Light fruity scent helps relax the mind, improve focus, and support better sleep</li>
                <li className="flex items-start gap-3"><span className="text-[#F7A8C4] mt-0.5">✦</span> Long-lasting fragrance for over 45 days</li>
                <li className="flex items-start gap-3"><span className="text-[#F7A8C4] mt-0.5">✦</span> Helps relax your mind, reduce stress and fatigue, and promote better sleep</li>
                <li className="flex items-start gap-3"><span className="text-[#F7A8C4] mt-0.5">✦</span> More affordable compared to high-end perfumes</li>
              </ul>
            </div>
            <div className="bg-white rounded-2xl p-8 shadow-sm">
              <h3 className="text-xl font-serif font-medium text-foreground mb-6 flex items-center gap-2"><Leaf className="h-5 w-5 text-[#F7A8C4]" /> Key Ingredients</h3>
              <ul className="space-y-3 text-muted-foreground">
                <li className="flex items-start gap-3"><span className="text-[#F7A8C4] mt-0.5">✦</span> Deionized water</li>
                <li className="flex items-start gap-3"><span className="text-[#F7A8C4] mt-0.5">✦</span> Hydrogenated castor oil</li>
                <li className="flex items-start gap-3"><span className="text-[#F7A8C4] mt-0.5">✦</span> Surfactant</li>
                <li className="flex items-start gap-3"><span className="text-[#F7A8C4] mt-0.5">✦</span> Citroial essential oil</li>
                <li className="flex items-start gap-3"><span className="text-[#F7A8C4] mt-0.5">✦</span> Deodorant</li>
                <li className="flex items-start gap-3"><span className="text-[#F7A8C4] mt-0.5">✦</span> Essence</li>
                <li className="flex items-start gap-3"><span className="text-[#F7A8C4] mt-0.5">✦</span> Sodium benzoate</li>
              </ul>
            </div>
          </div>

          {/* How to Use */}
          <div className="mb-20">
            <h3 className="text-2xl font-serif font-medium text-foreground text-center mb-10">How to Use</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {[
                { step: "1", title: "Tear the packaging", desc: "Along the dotted line" },
                { step: "2", title: "Remove the outer cap", desc: "Carefully remove" },
                { step: "3", title: "Remove the inner stopper", desc: "Adjust the wick length" },
                { step: "4", title: "Insert the wick", desc: "Close the cap and enjoy" },
              ].map(s => (
                <div key={s.step} className="bg-white rounded-2xl p-6 text-center shadow-sm">
                  <div className="w-12 h-12 rounded-full bg-[#F7A8C4] text-white font-bold text-lg flex items-center justify-center mx-auto mb-4">{s.step}</div>
                  <h4 className="font-medium text-foreground mb-1">{s.title}</h4>
                  <p className="text-sm text-muted-foreground">{s.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Suitable Spaces */}
          <div className="mb-20">
            <h3 className="text-2xl font-serif font-medium text-foreground text-center mb-10">Suitable Spaces</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {[
                { icon: "🛏️", title: "Bedroom", desc: "Relax and sleep better" },
                { icon: "🚿", title: "Bathroom", desc: "Eliminate dampness and odors" },
                { icon: "🚗", title: "Cars", desc: "Fresh ride every day" },
                { icon: "👟", title: "Shoe Cabinet", desc: "No more shoe odor" },
              ].map(s => (
                <div key={s.title} className="bg-white rounded-2xl p-6 text-center shadow-sm">
                  <div className="text-3xl mb-3">{s.icon}</div>
                  <h4 className="font-medium text-foreground mb-1">{s.title}</h4>
                  <p className="text-sm text-muted-foreground">{s.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Available Scents */}
          <div>
            <h3 className="text-2xl font-serif font-medium text-foreground text-center mb-10">Available Scents</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
              {[
                { icon: "🍑", name: "Peach", desc: "Sweet and fruity, perfect for bedrooms" },
                { icon: "💜", name: "Lavender", desc: "Calming and soothing, promotes deep sleep" },
                { icon: "🌊", name: "Ocean", desc: "Fresh and clean, ideal for bathrooms and cars" },
                { icon: "🌿", name: "Lemongrass", desc: "Refreshing and citrusy, naturally repels insects" },
                { icon: "🍈", name: "Melon", desc: "Sweet and tropical, uplifts your mood instantly" },
                { icon: "🌼", name: "Vanilla", desc: "Warm and cozy, creates a comforting atmosphere" },
              ].map(s => (
                <div key={s.name} className="bg-white rounded-2xl p-6 flex items-start gap-4 shadow-sm">
                  <div className="text-3xl shrink-0">{s.icon}</div>
                  <div>
                    <h4 className="font-medium text-foreground">{s.name}</h4>
                    <p className="text-sm text-muted-foreground mt-1">{s.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Newsletter */}
      <section className="py-20 bg-[#1A3A6B] text-white">
        <div className="container mx-auto px-4 flex flex-col items-center text-center">
          <span className="text-xs uppercase tracking-[0.2em] text-[#F7A8C4] font-semibold mb-3">Stay Connected</span>
          <h2 className="text-3xl font-serif font-medium mb-4">Join the SANOVA Family</h2>
          <p className="text-white/70 max-w-md mb-8">Subscribe to receive updates on new scents, exclusive offers, and home styling inspiration.</p>
          <form className="flex w-full max-w-md gap-2" onSubmit={e => e.preventDefault()}>
            <Input type="email" placeholder="Your email address" className="bg-white/10 border-white/20 text-white placeholder:text-white/50 h-12 rounded-full px-6 focus-visible:ring-white" />
            <Button type="submit" className="rounded-full h-12 px-8 bg-[#F7A8C4] text-[#1A3A6B] hover:bg-[#f590b4] font-semibold">Subscribe</Button>
          </form>
        </div>
      </section>
    </div>
  );
}