import type { Project } from '@/lib/data';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { cn } from '@/lib/utils';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { MoreHorizontal, Pencil, Trash2, Folder } from 'lucide-react';
import React from 'react';

type ProjectCardProps = {
  project: Project;
  draggable?: boolean;
  onDragStart?: (e: React.DragEvent<HTMLDivElement>, id: string) => void;
  onClick?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
};

export default function ProjectCard({
  project,
  draggable = false,
  onDragStart,
  onClick,
  onEdit,
  onDelete,
}: ProjectCardProps) {
  // Map backend status to a human label/color if needed
  const statusLabel = project.status ?? 'running';
  const statusColor = {
    running: 'bg-green-100 text-green-800',
    paused: 'bg-yellow-100 text-yellow-800',
    closed: 'bg-gray-100 text-gray-800',
  }[project.status] ?? 'bg-muted';

  return (
    <Card
      draggable={draggable}
      onDragStart={(e) => draggable && onDragStart && onDragStart(e, project.id)}
      onClick={onClick}
      className={cn(
        'group cursor-pointer',
        draggable ? 'active:cursor-grabbing' : ''
      )}
    >
      <CardHeader className="flex items-start justify-between">
        <div className="flex items-center gap-2">
          <Folder className="h-5 w-5" />
          <CardTitle className="text-base">{project.title}</CardTitle>
        </div>
        <div className="flex items-center gap-2">
          <Badge className={cn('capitalize', statusColor)}>{statusLabel}</Badge>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-6 w-6 opacity-0 group-hover:opacity-100" onClick={(e) => e.stopPropagation()}>
                <MoreHorizontal className="h-4 w-4" />
                <span className="sr-only">Project options</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" onClick={(e) => e.stopPropagation()}>
              <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onEdit && onEdit(); }}>
                <Pencil className="mr-2 h-4 w-4" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onDelete && onDelete(); }} className="text-destructive">
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>

      <CardContent className="text-sm text-muted-foreground">
        {project.description ?? 'No description provided.'}
      </CardContent>
    </Card>
  );
}
