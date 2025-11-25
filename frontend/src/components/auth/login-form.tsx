'use client';

import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../ui/card';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
export const API_BASE =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

const formSchema = z.object({
  email: z.string().email({ message: 'Invalid email address.' }),
  password: z.string().min(1, { message: 'Password is required.' }),
});

export default function LoginForm() {
  const { toast } = useToast();
  const router = useRouter();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
  try {
    const res = await fetch(`${API_BASE}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values), 
      //credentials: "include",
    });

    const data = await res.json();

    if (!res.ok) {
      toast({
        title: "Login failed",
        description: data.error || "Invalid email or password.",
        variant: "destructive",
      });
      return;
    }

    // Save token + user in localStorage
    localStorage.setItem("token", data.token);
    localStorage.setItem("user", JSON.stringify(data.user));

    toast({
      title: "Login successful!",
      description: `Welcome back, ${data.user.name}!`,
    });

    console.log("Redirecting to /projects...");
    router.push("/projects");


  } catch (err) {
    console.error(err);
    toast({
      title: "Server Error",
      description: "Unable to connect to the backend.",
      variant: "destructive",
    });
  }
}
  return (
    <Card suppressHydrationWarning>
      <CardHeader className="text-center">
        <CardTitle className="text-3xl font-bold">Welcome Back</CardTitle>
        <CardDescription>Enter your credentials to access your account.</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input placeholder="name@example.com" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Password</FormLabel>
                  <FormControl>
                    <Input type="password" placeholder="••••••••" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" className="w-full">
              Login
            </Button>
          </form>
        </Form>
      </CardContent>
      <CardFooter className="flex justify-center">
        <p className="text-sm text-muted-foreground">
            Don't have an account?{' '}
            <Link href="/signup" className="text-primary hover:underline">
                Sign up
            </Link>
        </p>
      </CardFooter>
    </Card>
  );
}
