'use client';

import { useEffect } from 'react';
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
import { updateTask } from '@/lib/api';

const taskSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  priority: z.enum(['low', 'medium', 'high']),
  assigneeId: z.string().optional(),
});

type TaskFormValues = z.infer<typeof taskSchema>;

interface EditTaskDialogProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  task: Task | null;
  users: User[];
  onUpdateTask: (task: Task) => void; // expects updated task from backend
}

export function EditTaskDialog({
  isOpen,
  onOpenChange,
  task,
  users,
  onUpdateTask,
}: EditTaskDialogProps) {
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

  // Load task data when opening dialog
  useEffect(() => {
    if (task && isOpen) {
      form.reset({
        title: task.title,
        description: task.description || '',
        priority: task.priority,
        assigneeId: task.assigneeId || undefined,
      });
    }
  }, [task, isOpen, form]);

  const onSubmit = async (data: TaskFormValues) => {
    if (!task) return;

    try {
      const updated = await updateTask(task.id, {
        title: data.title,
        description: data.description,
        priority: data.priority,
        assigneeId: data.assigneeId,
      });

      onUpdateTask(updated);

      toast({
        title: 'Task updated',
        description: `Updated "${updated.title}"`,
      });

      onOpenChange(false);
    } catch (err: any) {
      console.error('Update task error', err);

      toast({
        title: 'Could not update task',
        description: err?.message || 'Server error',
        variant: 'destructive',
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit Task</DialogTitle>
          <DialogDescription>
            Update task details and click save when you're done.
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
                    <Input placeholder="Task title" {...field} />
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
                    <Textarea placeholder="Describe the task..." {...field} />
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
                  <Select
                    defaultValue={field.value}
                    onValueChange={field.onChange}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select priority" />
                      </SelectTrigger>
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
                  <Select
                    defaultValue={field.value}
                    onValueChange={field.onChange}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select assignee" />
                      </SelectTrigger>
                    </FormControl>

                    <SelectContent>
                      {users.map((user) => (
                        <SelectItem key={user.id} value={user.id}>
                          <div className="flex items-center gap-2">
                            <span
                              className={cn(
                                'h-2 w-2 rounded-full',
                                user.status === 'online'
                                  ? 'bg-green-500'
                                  : 'bg-red-500'
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
              <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit">Save Changes</Button>
            </DialogFooter>

          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
