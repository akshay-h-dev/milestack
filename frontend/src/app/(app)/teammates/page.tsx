'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter
} from '@/components/ui/card';

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
import { Trash2, Crown } from 'lucide-react';

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

import { useSearchParams } from "next/navigation";
import { Skeleton } from '@/components/ui/skeleton';

import {
  fetchTeammates,
  inviteTeammate,
  removeTeammate,
} from "@/lib/api";

/* -------------------------------------------------------------
  SCHEMA
------------------------------------------------------------- */
const inviteSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email address'),
});

export default function TeammatesPage() {

  const searchParams = useSearchParams();
  const projectId = searchParams.get("projectId");

  const [leader, setLeader] = useState<any>(null);
  const [members, setMembers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [userToRemove, setUserToRemove] = useState<any | null>(null);
  const { toast } = useToast();

  const currentUser =
    typeof window !== "undefined"
      ? JSON.parse(localStorage.getItem("user") || "{}")
      : null;

  /* -------------------------------------------------------------
    LOAD TEAMMATES
    fetchTeammates() returns: { leader, members }
  ------------------------------------------------------------- */
  useEffect(() => {
    if (!projectId) return;

    async function load() {
      try {
        setIsLoading(true);

        const { leader, members } = await fetchTeammates(projectId);

        setLeader(leader || null);
        setMembers(members || []);

      } catch (err: any) {
        toast({
          title: "Failed to load teammates",
          description: err.message,
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    }

    load();
  }, [projectId]);

  /* -------------------------------------------------------------
    INVITE TEAMMATE
  ------------------------------------------------------------- */
  const form = useForm({
    resolver: zodResolver(inviteSchema),
    defaultValues: { name: '', email: '' },
  });

  const onSubmit = async (values: z.infer<typeof inviteSchema>) => {
    try {
      await inviteTeammate({ ...values, projectId });

      toast({
        title: "Invitation Sent",
        description: `${values.email} can now sign up and join.`,
      });

      form.reset();
    } catch (err: any) {
      toast({
        title: "Invite Failed",
        description: err.message,
        variant: "destructive",
      });
    }
  };

  /* -------------------------------------------------------------
    REMOVE CLICK → check permissions
    Backend rules:
      - Leader can remove anyone
      - User can remove himself
      - Leader cannot be removed
  ------------------------------------------------------------- */
  const handleRemoveClick = (user: any) => {
    if (!leader) return;

    // Cannot remove leader
    if (user.id === leader.id) {
      toast({
        title: "Not allowed",
        description: "The project leader cannot be removed.",
        variant: "destructive",
      });
      return;
    }

    // If NOT leader and NOT self → deny
    if (currentUser.id !== leader.id && currentUser.id !== user.id) {
      toast({
        title: "Not allowed",
        description: "Only the project leader can remove teammates.",
        variant: "destructive",
      });
      return;
    }

    setUserToRemove(user);
  };

  /* -------------------------------------------------------------
    CONFIRM REMOVE
  ------------------------------------------------------------- */
  const confirmRemove = async () => {
    if (!userToRemove) return;

    try {
      await removeTeammate(userToRemove.id, projectId!);

      setMembers(prev => prev.filter(u => u.id !== userToRemove.id));

      toast({
        title: "Removed",
        description: `${userToRemove.name} has been removed.`,
      });

      // If self-removed → redirect
      if (userToRemove.id === currentUser.id) {
        window.location.href = "/projects";
      }

    } finally {
      setUserToRemove(null);
    }
  };

  /* -------------------------------------------------------------
    RENDER
  ------------------------------------------------------------- */
  return (
    <div className="flex-1 p-4 md:p-6 lg:p-8">
      <div className="max-w-4xl mx-auto space-y-8">

        {/* INVITE */}
        <Card>
          <CardHeader>
            <CardTitle>Invite a Teammate</CardTitle>
            <CardDescription>Send an invitation to join this project.</CardDescription>
          </CardHeader>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)}>
              <CardContent className="space-y-4">
                <div className="grid sm:grid-cols-2 gap-4">

                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Teammate name" {...field} />
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
                          <Input placeholder="email@example.com" type="email" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                </div>
              </CardContent>
              <CardFooter>
                <Button type="submit">Send Invite</Button>
              </CardFooter>
            </form>
          </Form>
        </Card>

        {/* TEAM LIST */}
        <Card>
          <CardHeader>
            <CardTitle>Team Members</CardTitle>
            <CardDescription>Project leader + teammates.</CardDescription>
          </CardHeader>

          <CardContent>

            {isLoading ? (
              <ul className="space-y-4">
                {[...Array(4)].map((_, i) => (
                  <li key={i} className="flex items-center justify-between p-3 rounded-lg border">
                    <Skeleton className="h-10 w-10 rounded-full" />
                    <Skeleton className="h-4 w-24" />
                  </li>
                ))}
              </ul>
            ) : (
              <ul className="space-y-4">

                {/* Leader */}
                {leader && (
                  <li className="flex items-center justify-between p-3 rounded-lg border bg-primary/5">
                    <div>
                      <p className="font-semibold flex items-center gap-2">
                        {leader.name}
                        <span className="text-xs bg-primary text-primary-foreground px-2 py-0.5 rounded flex items-center gap-1">
                          <Crown className="w-3 h-3" /> Leader
                        </span>
                      </p>
                      <p className="text-sm text-muted-foreground">{leader.email}</p>
                    </div>
                  </li>
                )}

                {/* Members */}
                {members.map(user => (
                  <li key={user.id} className="flex items-center justify-between p-3 rounded-lg border">
                    <div>
                      <p className="font-semibold">{user.name}</p>
                      <p className="text-sm text-muted-foreground">{user.email}</p>
                    </div>

                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleRemoveClick(user)}
                    >
                      <Trash2 className="h-5 w-5 text-destructive" />
                    </Button>
                  </li>
                ))}

              </ul>
            )}

          </CardContent>
        </Card>

      </div>

      {/* DELETE CONFIRMATION */}
      <AlertDialog open={!!userToRemove}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove Teammate?</AlertDialogTitle>
            <AlertDialogDescription>
              They will lose access to this project.
            </AlertDialogDescription>
          </AlertDialogHeader>

          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setUserToRemove(null)}>
              Cancel
            </AlertDialogCancel>

            <AlertDialogAction
              onClick={confirmRemove}
              className="bg-destructive text-destructive-foreground"
            >
              Remove
            </AlertDialogAction>
          </AlertDialogFooter>

        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
