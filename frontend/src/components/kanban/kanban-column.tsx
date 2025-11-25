import type { Task, User } from "@/lib/data";
import TaskCard from "./task-card";
import { ScrollArea } from "../ui/scroll-area";
import { Card, CardHeader, CardTitle, CardContent } from "../ui/card";

type KanbanColumnProps = {
  title: string;
  status: Task["status"];
  tasks: Task[];
  userMap: Map<string, User>;
  onDragStart: (e: React.DragEvent<HTMLDivElement>, taskId: string) => void;
  onDrop: (e: React.DragEvent<HTMLDivElement>, status: Task["status"]) => void;
  onDragOver: (e: React.DragEvent<HTMLDivElement>) => void;
  onRemoveTask: (task: Task) => void;
  onEditTask: (task: Task) => void;
};

export default function KanbanColumn({
  title,
  status,
  tasks,
  userMap,
  onDragStart,
  onDrop,
  onDragOver,
  onRemoveTask,
  onEditTask,
}: KanbanColumnProps) {
  return (
    <Card
      className="flex flex-col h-full max-h-[calc(100vh-12rem)]"
      onDrop={(e) => onDrop(e, status)}
      onDragOver={onDragOver}
    >
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
            <span>{title}</span>
            <span className="text-sm font-normal bg-muted text-muted-foreground rounded-full px-2 py-1">{tasks.length}</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-1 overflow-hidden p-2">
        <ScrollArea className="h-full">
            <div className="space-y-4 p-2">
            {tasks.map((task) => (
                <TaskCard
                key={task.id}
                task={task}
                assignee={task.assigneeId ? userMap.get(task.assigneeId) : undefined}
                onDragStart={onDragStart}
                onRemoveTask={() => onRemoveTask(task)}
                onEditTask={() => onEditTask(task)}
                />
            ))}
            </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
