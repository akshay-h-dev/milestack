import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import type { Milestone } from "@/lib/data";
import { Calendar, MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

type MilestoneCardProps = {
  milestone: Milestone;
  onEdit: () => void;
  onRemove: () => void;
  onUpdateProgress?: (newValue: number) => void;
};

export default function MilestoneCard({
  milestone,
  onEdit,
  onRemove,
  onUpdateProgress,
}: MilestoneCardProps) {
  // ✔ FIX: milestone.dueDate is the only correct field
  const deadline = new Date(milestone.dueDate);

  const formattedDeadline = deadline.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <Card className="group">
      <CardHeader>
        <div className="flex justify-between items-start">
          <CardTitle>{milestone.title}</CardTitle>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 opacity-0 group-hover:opacity-100"
              >
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={onEdit}>
                <Pencil className="mr-2 h-4 w-4" />
                Edit
              </DropdownMenuItem>

              <DropdownMenuItem
                onClick={onRemove}
                className="text-destructive"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Remove
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <CardDescription>{milestone.description}</CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        <div>
          <div className="flex justify-between items-center mb-1">
            <span className="text-sm font-medium">Progress</span>

            {onUpdateProgress && (
              <button
                onClick={() =>
                  onUpdateProgress(
                    milestone.progress === 100 ? 0 : 100
                  )
                }
                className="text-xs text-primary hover:underline"
              >
                {milestone.progress === 100
                  ? "Mark Incomplete"
                  : "Mark Complete"}
              </button>
            )}
          </div>

          <Progress value={milestone.progress} />
        </div>
      </CardContent>

      <CardFooter>
        <div className="flex items-center text-sm text-muted-foreground">
          <Calendar className="mr-2 h-4 w-4" />
          <span>Deadline: {formattedDeadline}</span>
        </div>
      </CardFooter>
    </Card>
  );
}
