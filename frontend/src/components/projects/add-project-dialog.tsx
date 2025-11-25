'use client';

import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import type { Project } from '@/lib/data';
import { useToast } from '@/hooks/use-toast';
import { createProject as apiCreateProject } from '@/lib/api';

const projectSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
});

type ProjectFormValues = z.infer<typeof projectSchema>;

interface AddProjectDialogProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  onAddProject: (project: Project) => void; // now expects full project returned by backend
}

export function AddProjectDialog({ isOpen, onOpenChange, onAddProject }: AddProjectDialogProps) {
  const form = useForm<ProjectFormValues>({
    resolver: zodResolver(projectSchema),
    defaultValues: { title: '', description: '' },
  });
  const { toast } = useToast();

  const onSubmit = async (data: ProjectFormValues) => {
    try {
      const created = await apiCreateProject({ ...data, status: 'running' });
      onAddProject(created);
      toast({ title: 'Project created', description: `Created "${created.title}"` });
      form.reset();
      onOpenChange(false);
    } catch (err: any) {
      console.error('Create project error', err);
      toast({
        title: 'Could not create project',
        description: err?.message || 'Server error',
        variant: 'destructive',
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create New Project</DialogTitle>
          <DialogDescription>
            Fill in the details for your new project. Click save when you're done.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Project Name</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. Website Redesign" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Add a short description..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit">Save Project</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
