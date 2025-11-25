import type { Task, User } from "@/lib/data";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Badge } from "../ui/badge";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, Pencil, Trash2 } from "lucide-react";

type TaskCardProps = {
  task: Task;
  assignee?: User;
  onDragStart: (e: React.DragEvent<HTMLDivElement>, taskId: string) => void;
  onRemoveTask: () => void;
  onEditTask: () => void;
};

export default function TaskCard({
  task,
  assignee,
  onDragStart,
  onRemoveTask,
  onEditTask,
}: TaskCardProps) {

  // ALWAYS draggable
  const isDraggable = true;

  const priorityClasses = {
    low: "bg-green-100 text-green-800 border-green-200",
    medium: "bg-yellow-100 text-yellow-800 border-yellow-200",
    high: "bg-red-100 text-red-800 border-red-200",
  };

  const stop = (e: React.MouseEvent) => e.stopPropagation();

  return (
    <Card
      draggable={isDraggable}
      onDragStart={(e) => onDragStart(e, task.id)}
      className={cn(
        "group",
        "cursor-grab active:cursor-grabbing"
      )}
    >
      <CardHeader className="flex flex-row items-start justify-between">
        <CardTitle className="text-base">{task.title}</CardTitle>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 opacity-0 group-hover:opacity-100"
              onClick={stop}
            >
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>

          <DropdownMenuContent align="end" onClick={stop}>
            <DropdownMenuItem onClick={onEditTask}>
              <Pencil className="mr-2 h-4 w-4" /> Edit
            </DropdownMenuItem>

            <DropdownMenuItem
              onClick={onRemoveTask}
              className="text-destructive"
            >
              <Trash2 className="mr-2 h-4 w-4" /> Remove
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </CardHeader>

      <CardContent className="flex items-center justify-between">
        <Badge variant="outline" className={cn("capitalize", priorityClasses[task.priority])}>
          {task.priority}
        </Badge>

        {assignee && (
          <div className="flex items-center gap-2">
             <span className={cn(
                "h-2 w-2 rounded-full",
                assignee.status === 'online' ? 'bg-green-500' : 'bg-red-500'
              )}></span>

            <span className="text-sm text-muted-foreground">
              {assignee.name}
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
