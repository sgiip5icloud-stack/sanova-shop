import { Link } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { useCart } from "@/hooks/use-cart";
import { ShoppingBag, Menu, User, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

export function Navbar() {
  const { user, logout } = useAuth();
  const { itemCount } = useCart();

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-6 md:gap-10">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden"><Menu className="h-5 w-5" /></Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[300px] sm:w-[400px]">
              <div className="flex flex-col gap-6 mt-6">
                <Link href="/"><span className="text-2xl font-bold tracking-widest text-[#1A3A6B]">SANOVA<span className="text-[#F7A8C4] ml-0.5">✿</span></span></Link>
                <div className="flex flex-col gap-4">
                  <Link href="/" className="text-lg font-medium">Home</Link>
                  <Link href="/shop" className="text-lg font-medium">Shop All</Link>
                </div>
              </div>
            </SheetContent>
          </Sheet>

          <Link href="/" className="flex items-center gap-2">
            <span className="text-2xl font-bold tracking-widest text-[#1A3A6B]">SANOVA<span className="text-[#F7A8C4] ml-0.5">✿</span></span>
          </Link>

          <nav className="hidden md:flex gap-6">
            <Link href="/" className="text-sm font-medium text-foreground hover:text-primary transition-colors">Home</Link>
            <Link href="/shop" className="text-sm font-medium text-foreground hover:text-primary transition-colors">Shop</Link>
            <Link href="/#about" className="text-sm font-medium text-foreground hover:text-primary transition-colors">About</Link>
          </nav>
        </div>

        <div className="flex items-center gap-4">
          <Link href="/cart">
            <Button variant="ghost" size="icon" className="relative">
              <ShoppingBag className="h-5 w-5" />
              {itemCount > 0 && (
                <span className="absolute top-1 right-1 h-4 w-4 rounded-full bg-primary text-[10px] font-medium text-primary-foreground flex items-center justify-center">{itemCount}</span>
              )}
            </Button>
          </Link>

          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="gap-2 hidden md:flex"><User className="h-4 w-4" /><span className="text-sm font-medium">{user.name}</span></Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem asChild><Link href="/orders" className="w-full cursor-pointer">My Orders</Link></DropdownMenuItem>
                <DropdownMenuItem onClick={() => logout()} className="text-destructive cursor-pointer"><LogOut className="h-4 w-4 mr-2" />Logout</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Link href="/login" className="hidden md:block"><Button variant="ghost" className="text-sm">Sign In</Button></Link>
          )}
          {!user && <Link href="/login" className="md:hidden"><Button variant="ghost" size="icon"><User className="h-5 w-5" /></Button></Link>}
        </div>
      </div>
    </header>
  );
}
