import { useLocation, Link } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/toaster";
import { Loader2 } from "lucide-react";

const schema = z.object({ email: z.string().email(), password: z.string().min(6) });

export function Login() {
  const [, setLocation] = useLocation();
  const { login } = useAuth();
  const { toast } = useToast();
  const form = useForm<z.infer<typeof schema>>({ resolver: zodResolver(schema), defaultValues: { email: "", password: "" } });

  async function onSubmit(data: z.infer<typeof schema>) {
    try { await login(data); toast({ title: "Welcome back!" }); setLocation("/"); }
    catch { toast({ title: "Login failed", description: "Check your credentials.", variant: "destructive" }); }
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-serif font-medium">Welcome Back</h1>
          <p className="text-muted-foreground">Sign in to your SANOVA account</p>
        </div>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField control={form.control} name="email" render={({ field }) => (<FormItem><FormLabel>Email</FormLabel><FormControl><Input type="email" placeholder="you@example.com" {...field} /></FormControl><FormMessage /></FormItem>)} />
            <FormField control={form.control} name="password" render={({ field }) => (<FormItem><FormLabel>Password</FormLabel><FormControl><Input type="password" placeholder="••••••••" {...field} /></FormControl><FormMessage /></FormItem>)} />
            <Button type="submit" className="w-full h-12 rounded-full" disabled={form.formState.isSubmitting}>
              {form.formState.isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}Sign In
            </Button>
          </form>
        </Form>
        <div className="text-center text-sm text-muted-foreground pt-4 border-t">Don't have an account? <Link href="/register" className="font-semibold text-primary hover:underline">Register here</Link></div>
      </div>
    </div>
  );
}
