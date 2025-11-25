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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import type { Task, User } from '@/lib/data';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { createTask } from '@/lib/api';

const taskSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  priority: z.enum(['low', 'medium', 'high']),
  assigneeId: z.string().optional(),
});

type TaskFormValues = z.infer<typeof taskSchema>;

interface AddTaskDialogProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  users: User[];
  onAddTask: (task: Task) => void;
  projectId: string;     // REQUIRED
}

export function AddTaskDialog({
  isOpen,
  onOpenChange,
  users,
  onAddTask,
  projectId,
}: AddTaskDialogProps) {
  const form = useForm<TaskFormValues>({
    resolver: zodResolver(taskSchema),
    defaultValues: {
      title: '',
      description: '',
      priority: 'medium',
      assigneeId: undefined,
    },
  });

  const { toast } = useToast();

  const onSubmit = async (data: TaskFormValues) => {
    try {
      const created = await createTask({
        title: data.title,
        description: data.description,
        priority: data.priority,
        assigneeId: data.assigneeId,
        status: 'todo',
        projectId,                // <-- FIX: always send projectId
      });

      onAddTask(created);

      toast({
        title: 'Task created',
        description: `Created "${created.title}"`,
      });

      form.reset();
      onOpenChange(false);
    } catch (err: any) {
      console.error('Create task error', err);

      toast({
        title: 'Could not create task',
        description: err?.message || 'Server error',
        variant: 'destructive',
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add New Task</DialogTitle>
          <DialogDescription>
            Fill in the details for the new task.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">

            {/* Title */}
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. Design landing page" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Description */}
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea placeholder="More details..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Priority */}
            <FormField
              control={form.control}
              name="priority"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Priority</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Assignee */}
            <FormField
              control={form.control}
              name="assigneeId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Assignee</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                    </FormControl>

                    <SelectContent>
                      {users.map((user) => (
                        <SelectItem key={user.id} value={user.id}>
                          <div className="flex items-center gap-2">
                            <span
                              className={cn(
                                'h-2 w-2 rounded-full',
                                user.status === 'online' ? 'bg-green-500' : 'bg-red-500'
                              )}
                            />
                            {user.name}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>

                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button
                type="button"
                variant="ghost"
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>

              <Button type="submit">Save Task</Button>
            </DialogFooter>

          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
