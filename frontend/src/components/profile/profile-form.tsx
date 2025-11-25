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
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';
import type { User as AppUser } from '@/lib/data';

const profileSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  status: z.enum(['online', 'offline']),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

export function ProfileForm() {
  const { toast } = useToast();
  const [user, setUser] = useState<any>(null);
  
  useEffect(() => {
    const userJson = localStorage.getItem('user');
    if (userJson) {
        const storedUser = JSON.parse(userJson);
        setUser(storedUser);
        form.reset({
            name: storedUser.name || '',
            status: storedUser.status || 'offline',
        });
    }
  }, []);

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: '',
      status: 'offline',
    },
  });

  const onSubmit = async (data: ProfileFormValues) => {
    try {
      const updatedUser = { ...user, ...data };
      localStorage.setItem('user', JSON.stringify(updatedUser));
      setUser(updatedUser);
      
      toast({
        title: 'Profile Updated',
        description: 'Your changes have been saved successfully.',
      });

      // Optionally refresh the page to see changes reflected in the sidebar
      window.location.reload();

    } catch (error) {
      console.error('Error updating profile:', error);
      toast({
        variant: 'destructive',
        title: 'Update Failed',
        description: 'Could not save your profile changes. Please try again.',
      });
    }
  };

  const handleStatusChange = (checked: boolean) => {
    const newStatus = checked ? 'online' : 'offline';
    form.setValue('status', newStatus);
  };
  
  const currentStatus = form.watch('status');

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Display Name</FormLabel>
              <FormControl>
                <Input placeholder="Your Name" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="status"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <FormLabel className="text-base">Status</FormLabel>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <span className={cn(
                        "h-2.5 w-2.5 rounded-full",
                        currentStatus === 'online' ? 'bg-green-500' : 'bg-red-500'
                    )}></span>
                    You are currently {currentStatus}
                </div>
              </div>
              <FormControl>
                <Switch
                  checked={field.value === 'online'}
                  onCheckedChange={handleStatusChange}
                />
              </FormControl>
            </FormItem>
          )}
        />
        <Button type="submit">Save Changes</Button>
      </form>
    </Form>
  );
}
