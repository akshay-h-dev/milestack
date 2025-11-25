'use client';

import { useEffect, useState } from 'react';
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
import { useRouter, useSearchParams } from 'next/navigation';

import { getInvite, signup } from '@/lib/api';

const formSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email({ message: 'Invalid email address.' }),
  password: z.string().min(6, { message: 'Password must be at least 6 characters.' }),
});

type FormValues = z.infer<typeof formSchema>;

export default function SignupForm() {
  const { toast } = useToast();
  const router = useRouter();
  const searchParams = useSearchParams();
  const inviteIdFromUrl = searchParams.get('invite') || undefined;

  const [inviteId, setInviteId] = useState<string | undefined>(inviteIdFromUrl);
  const [isPrefilled, setIsPrefilled] = useState(false);
  const [loadingInvite, setLoadingInvite] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
    },
  });

  // Load invite if present and prefill name/email (read-only)
  useEffect(() => {
    async function loadInvite(id?: string) {
      if (!id) return;
      setLoadingInvite(true);
      try {
        const inv = await getInvite(id);
        if (inv) {
          form.reset({
            name: inv.name || '',
            email: inv.email || '',
            password: '',
          });
          setInviteId(inv.id);
          setIsPrefilled(true);
        }
      } catch (err: any) {
        console.error('Unable to load invite', err);
        toast({
          title: 'Invalid invite',
          description: 'Unable to load the invite. You can still sign up normally.',
          variant: 'destructive',
        });
      } finally {
        setLoadingInvite(false);
      }
    }

    loadInvite(inviteIdFromUrl || undefined);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inviteIdFromUrl]);

  async function onSubmit(values: FormValues) {
    try {
      const payload: any = {
        name: values.name,
        email: values.email,
        password: values.password,
      };
      if (inviteId) payload.inviteId = inviteId;

      const res = await signup(payload);

      // signup() will throw for non-2xx responses; if we reach here it's OK
      if (res?.token) {
        // store token
        localStorage.setItem('token', res.token);
        toast({
          title: 'Welcome!',
          description: 'Your account was created and you have been signed in.',
        });
        // redirect to dashboard (or project if you want to add route)
        router.push('/');
        return;
      }

      // Fallback if backend returned unexpected shape
      toast({
        title: 'Signed up',
        description: 'Account created — please log in.',
      });
      router.push('/login');
    } catch (err: any) {
      console.error('Signup error', err);
      toast({
        title: 'Signup failed',
        description: err?.message || 'Something went wrong. Please try again.',
        variant: 'destructive',
      });
    }
  }

  return (
    <Card suppressHydrationWarning>
      <CardHeader className="text-center">
        <CardTitle className="text-3xl font-bold">Create an Account</CardTitle>
        <CardDescription>Create a new account to get started.</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="e.g. Jane Doe"
                      {...field}
                      readOnly={isPrefilled}
                      disabled={loadingInvite}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="name@example.com"
                      {...field}
                      readOnly={isPrefilled}
                      disabled={loadingInvite}
                    />
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
              Create Account
            </Button>
          </form>
        </Form>
      </CardContent>
      <CardFooter className="flex justify-center">
        <p className="text-sm text-muted-foreground">
          Already have an account?{' '}
          <Link href="/login" className="text-primary hover:underline">
            Log in
          </Link>
        </p>
      </CardFooter>
    </Card>
  );
}
