'use client';

import { useEffect, useState } from 'react';
import { Plus, FolderOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Project } from '@/lib/data';
import { AddProjectDialog } from '@/components/projects/add-project-dialog';
import ProjectCard from '@/components/projects/project-card';
import { useRouter } from 'next/navigation';

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

import { EditProjectDialog } from '@/components/projects/edit-project-dialog';
import { useToast } from '@/hooks/use-toast';

import {
  fetchProjects as apiFetchProjects,
  updateProject as apiUpdateProject,
  deleteProject as apiDeleteProject,
  createProject as apiCreateProject
} from '@/lib/api';

/* -----------------------------------------------------
   Column mappings
------------------------------------------------------ */
const columns = [
  { id: 'todo', title: 'In Progress' },
  { id: 'in-progress', title: 'Paused' },
  { id: 'done', title: 'Done' },
] as const;

const uiToBackend: Record<string, Project['status']> = {
  todo: 'running',
  'in-progress': 'paused',
  done: 'closed',
};

const backendToUi: Record<Project['status'], string> = {
  running: 'todo',
  paused: 'in-progress',
  closed: 'done',
};

/* -----------------------------------------------------
   MAIN COMPONENT
------------------------------------------------------ */
export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);

  const router = useRouter();
  const { toast } = useToast();

  /* -----------------------------------------------------
     Load Projects on Mount
     Safe-token approach avoids 401 spam
  ------------------------------------------------------ */
  useEffect(() => {
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;

    // Not logged in → go to login before fetching anything
    if (!token) {
      router.replace("/login");
      return;
    }

    let mounted = true;

    async function loadProjects() {
      try {
        setIsLoading(true);

        const data = await apiFetchProjects(); // safe: returns [] if token missing
        if (!mounted) return;

        setProjects(Array.isArray(data) ? data : []);
      } catch (err: any) {
        console.error("Projects fetch error:", err);

        if (err.status === 401) {
          localStorage.removeItem("token");
          localStorage.removeItem("user");
          router.replace("/login");
          return;
        }

        toast({
          title: "Failed to load projects",
          description: err?.message || "Unable to fetch projects",
          variant: "destructive",
        });
      } finally {
        if (mounted) setIsLoading(false);
      }
    }

    loadProjects();

    return () => {
      mounted = false;
    };
  }, [router, toast]);

  /* -----------------------------------------------------
     Drag Start
  ------------------------------------------------------ */
  const handleDragStart = (e: React.DragEvent<HTMLDivElement>, projectId: string) => {
    e.dataTransfer.setData('projectId', projectId);
  };

  /* -----------------------------------------------------
     Drop → Update Status
  ------------------------------------------------------ */
  const handleDrop = async (e: React.DragEvent<HTMLDivElement>, uiStatus: string) => {
    e.preventDefault();
    const projectId = e.dataTransfer.getData('projectId');
    if (!projectId) return;

    const backendStatus = uiToBackend[uiStatus];

    const oldProjects = [...projects];

    // Optimistic UI
    setProjects(prev =>
      prev.map(p => p.id === projectId ? { ...p, status: backendStatus } : p)
    );

    try {
      await apiUpdateProject(projectId, { status: backendStatus });
      toast({ title: "Project updated", description: "Status changed." });
    } catch (err: any) {
      console.error("Status update failed", err);
      setProjects(oldProjects); // revert
      toast({
        title: "Update failed",
        description: err?.message || "Could not update status",
        variant: "destructive"
      });
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => e.preventDefault();

  /* -----------------------------------------------------
     Add New Project
  ------------------------------------------------------ */
  const handleAddProject = async (newProject: Omit<Project, "id" | "status">) => {
    try {
      const created = await apiCreateProject({
        ...newProject,
        status: "running",
      });

      setProjects(prev => [created, ...prev]);

      toast({
        title: "Project created",
        description: `"${created.title}" added`,
      });
    } catch (err: any) {
      console.error("Create error", err);
      toast({
        title: "Create failed",
        description: err?.message || "Error creating project",
        variant: "destructive",
      });
    } finally {
      setIsAddDialogOpen(false);
    }
  };

  /* -----------------------------------------------------
     Edit / Update Project
  ------------------------------------------------------ */
  const handleUpdateProject = (updatedProject: Project) => {
    setProjects(prev =>
      prev.map(p => (p.id === updatedProject.id ? updatedProject : p))
    );
    setIsEditDialogOpen(false);
    setSelectedProject(null);
  };

  /* -----------------------------------------------------
     Delete Project
  ------------------------------------------------------ */
  const confirmDelete = async () => {
    if (!selectedProject) return;

    const id = selectedProject.id;
    const old = [...projects];

    // optimistic delete
    setProjects(prev => prev.filter(p => p.id !== id));

    try {
      await apiDeleteProject(id);
      toast({
        title: "Deleted",
        description: `"${selectedProject.title}" removed`,
      });
    } catch (err: any) {
      console.error("Delete error", err);
      setProjects(old); // revert
      toast({
        title: "Delete failed",
        description: err?.message || "Server error",
        variant: "destructive",
      });
    }

    setIsDeleteDialogOpen(false);
    setSelectedProject(null);
  };

  /* -----------------------------------------------------
     Loading State
  ------------------------------------------------------ */
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full text-lg text-muted-foreground">
        Loading projects…
      </div>
    );
  }

  /* -----------------------------------------------------
     Organize by UI Columns
  ------------------------------------------------------ */
  const projectsByUi: Record<string, Project[]> = {
    todo: [],
    'in-progress': [],
    done: [],
  };

  for (const p of projects) {
    const ui = backendToUi[p.status] || "todo";
    projectsByUi[ui].push(p);
  }

  /* -----------------------------------------------------
     Render Page
  ------------------------------------------------------ */
  return (
    <div className="flex-1 flex flex-col">
      <header className="bg-card border-b p-4 px-6">
        <div className="flex items-center justify-between mx-auto">
          <h1 className="text-2xl font-bold">Projects</h1>
          <Button onClick={() => setIsAddDialogOpen(true)}>
            <Plus /> New Project
          </Button>
        </div>
      </header>

      {/* Columns */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="grid gap-6 grid-cols-1 md:grid-cols-3">
          {columns.map(col => (
            <div
              key={col.id}
              onDrop={e => handleDrop(e, col.id)}
              onDragOver={handleDragOver}
              className="flex flex-col gap-4"
            >
              {/* Column Header */}
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-lg font-semibold">{col.title}</h3>
                <span className="text-sm bg-muted text-muted-foreground rounded-full px-2 py-1">
                  {projectsByUi[col.id].length}
                </span>
              </div>

              {/* Items */}
              <div className="space-y-4">
                {projectsByUi[col.id].length ? (
                  projectsByUi[col.id].map(project => (
                    <ProjectCard
                      key={project.id}
                      project={project}
                      draggable
                      onDragStart={e => handleDragStart(e, project.id)}
                      onClick={() =>
                        router.push(`/dashboard?projectId=${project.id}`)
                      }
                      onEdit={() => {
                        setSelectedProject(project);
                        setIsEditDialogOpen(true);
                      }}
                      onDelete={() => {
                        setSelectedProject(project);
                        setIsDeleteDialogOpen(true);
                      }}
                    />
                  ))
                ) : (
                  <div className="flex flex-col items-center justify-center text-muted-foreground py-8 border border-dashed rounded">
                    <FolderOpen className="w-12 h-12 mb-2 text-primary/20" />
                    <div className="text-sm">No projects</div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Dialogs */}
      <AddProjectDialog
        isOpen={isAddDialogOpen}
        onOpenChange={setIsAddDialogOpen}
        onAddProject={handleAddProject}
      />

      <EditProjectDialog
        isOpen={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        project={selectedProject}
        onUpdateProject={handleUpdateProject}
      />

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete project?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete "{selectedProject?.title}".
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
