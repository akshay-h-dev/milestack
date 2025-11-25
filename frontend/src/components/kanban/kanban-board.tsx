'use client';

import { useState, useMemo } from "react";
import type { Task, User } from "@/lib/data";
import KanbanColumn from "./kanban-column";
import { Button } from "../ui/button";
import { Plus } from "lucide-react";
import { AddTaskDialog } from "./add-task-dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { EditTaskDialog } from "./edit-task-dialog";
import { useToast } from "@/hooks/use-toast";
import { createTask, updateTask, deleteTask } from "@/lib/api";

type KanbanBoardProps = {
  initialTasks: Task[];
  users: User[];
  projectId: string;
};

const columns = [
  { id: "todo", title: "To Do" },
  { id: "in-progress", title: "In Progress" },
  { id: "done", title: "Done" },
] as const;

export default function KanbanBoard({ initialTasks, users, projectId }: KanbanBoardProps) {
  const [tasks, setTasks] = useState<Task[]>(initialTasks);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [taskToEdit, setTaskToEdit] = useState<Task | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [taskToRemove, setTaskToRemove] = useState<Task | null>(null);
  const { toast } = useToast();

  const userMap = useMemo(() => new Map(users.map(user => [user.id, user])), [users]);

  const handleDragStart = (e: React.DragEvent<HTMLDivElement>, taskId: string) => {
    e.dataTransfer.setData("taskId", taskId);
  };

  const handleDrop = async (e: React.DragEvent<HTMLDivElement>, status: Task["status"]) => {
    e.preventDefault();
    const taskId = e.dataTransfer.getData("taskId");
    if (!taskId) return;

    // Optimistic UI update
    setTasks(prevTasks => prevTasks.map(t => t.id === taskId ? { ...t, status } : t));

    try {
      await updateTask(taskId, { status });
      toast({ title: 'Task updated', description: 'Status updated.' });
    } catch (err: any) {
      console.error('Failed to update task status', err);
      toast({ title: 'Update failed', description: err?.message || 'Could not update task.' , variant: 'destructive' });
      // revert on failure: refetch or revert in-place (simple revert here)
      setTasks(prevTasks => prevTasks.map(t => t.id === taskId ? { ...t, status: prevTasks.find(p => p.id === taskId)?.status ?? 'todo' } : t));
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  const handleAddTask = async (newTask: Omit<Task, 'id' | 'status'>) => {
    try {
      const created = await createTask({
        ...newTask,
        status: 'todo',
        projectId,
      });
      setTasks(prev => [created, ...prev]);
      toast({ title: 'Task created', description: `Created "${created.title}"` });
    } catch (err: any) {
      console.error('Create task error', err);
      toast({ title: 'Could not create task', description: err?.message || 'Server error', variant: 'destructive' });
    } finally {
      setIsAddDialogOpen(false);
    }
  };

  const handleRemoveTaskClick = (task: Task) => {
    setTaskToRemove(task);
  };

  const confirmRemove = async () => {
    if (!taskToRemove) return;

    const id = taskToRemove.id;
    // optimistic removal
    const old = tasks;
    setTasks(prev => prev.filter(t => t.id !== id));
    try {
      await deleteTask(id);
      toast({ title: 'Task deleted', description: `"${taskToRemove.title}" removed` });
    } catch (err: any) {
      console.error('Delete task error', err);
      toast({ title: 'Could not delete task', description: err?.message || 'Server error', variant: 'destructive' });
      setTasks(old); // revert
    } finally {
      setTaskToRemove(null);
    }
  };

  const handleEditTaskClick = (task: Task) => {
    setTaskToEdit(task);
    setIsEditDialogOpen(true);
  };

  const handleUpdateTask = async (updatedTask: Omit<Task, 'id' | 'status'>) => {
    if (!taskToEdit) return;
    const id = taskToEdit.id;

    // optimistic update
    const old = tasks;
    setTasks(prev => prev.map(t => t.id === id ? { ...t, ...updatedTask } : t));
    try {
      const result = await updateTask(id, updatedTask);
      setTasks(prev => prev.map(t => t.id === id ? result : t));
      toast({ title: 'Task updated', description: `Updated "${result.title}"` });
    } catch (err: any) {
      console.error('Update task error', err);
      toast({ title: 'Could not update task', description: err?.message || 'Server error', variant: 'destructive' });
      setTasks(old); // revert
    } finally {
      setIsEditDialogOpen(false);
      setTaskToEdit(null);
    }
  };

  return (
    <div className="flex flex-col h-full">
      <header className="bg-background py-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <Button onClick={() => setIsAddDialogOpen(true)}>
            <Plus />
            Add Task
          </Button>
        </div>
      </header>
      <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
        {columns.map((column) => (
          <KanbanColumn
            key={column.id}
            title={column.title}
            status={column.id}
            tasks={tasks.filter((task) => task.status === column.id)}
            userMap={userMap}
            onDragStart={handleDragStart}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onRemoveTask={handleRemoveTaskClick}
            onEditTask={handleEditTaskClick}
          />
        ))}
      </div>
      <AddTaskDialog
        isOpen={isAddDialogOpen}
        onOpenChange={setIsAddDialogOpen}
        users={users}
        onAddTask={handleAddTask}
        projectId={projectId}
      />
      <EditTaskDialog
        isOpen={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        task={taskToEdit}
        users={users}
        onUpdateTask={handleUpdateTask}
      />
      <AlertDialog open={!!taskToRemove} onOpenChange={(open) => !open && setTaskToRemove(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the task "{taskToRemove?.title}". This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmRemove} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
