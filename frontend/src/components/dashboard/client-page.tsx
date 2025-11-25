'use client';

import { useEffect, useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import type { Task, User, Project } from "@/lib/data";
import dynamic from "next/dynamic";
import { fetchTasks, fetchTeammates, fetchProjects } from "@/lib/api";
import { useRouter, useSearchParams } from "next/navigation";

const KanbanBoard = dynamic(
  () => import("@/components/kanban/kanban-board"),
  {
    ssr: false,
    loading: () => <KanbanBoardSkeleton />,
  }
);

export default function DashboardClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const projectId = searchParams.get("projectId");

  const [tasks, setTasks] = useState<Task[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);

  /* ---------------------------------------------------
     1️⃣ Load project, tasks, teammates
  --------------------------------------------------- */
  useEffect(() => {
    if (!projectId) {
      setLoading(false);
      return;
    }

    let mounted = true;

    async function loadData() {
      try {
        setLoading(true);

        // Load only visible projects to the user
        const visibleProjects = await fetchProjects();
        const foundProject = visibleProjects.find((p: Project) => p.id === projectId) || null;

        if (mounted) setProject(foundProject);

        // If project not found → stop
        if (!foundProject) {
          if (mounted) setLoading(false);
          return;
        }

        // Load tasks
        const tasksData = await fetchTasks(projectId);

        // Load teammates for THIS project only
        const usersData = await fetchTeammates(projectId);

        if (!mounted) return;

        setTasks(Array.isArray(tasksData) ? tasksData : []);
        setUsers(Array.isArray(usersData) ? usersData : []);

      } catch (err) {
        console.error("Error loading dashboard:", err);
      } finally {
        if (mounted) setLoading(false);
      }
    }

    loadData();
    return () => { mounted = false };
  }, [projectId]);

  /* ---------------------------------------------------
       2️⃣ Loading UI
  --------------------------------------------------- */
  if (loading) return <KanbanBoardSkeleton />;

  /* ---------------------------------------------------
       3️⃣ No project selected
  --------------------------------------------------- */
  if (!projectId) {
    return (
      <div className="p-6">
        <h2 className="text-lg font-semibold">No project selected</h2>
        <p className="text-sm text-muted-foreground">Please select a project first.</p>
        <button
          onClick={() => router.push("/projects")}
          className="mt-4 px-4 py-2 rounded bg-primary text-primary-foreground"
        >
          Go to Projects →
        </button>
      </div>
    );
  }

  /* ---------------------------------------------------
       4️⃣ Project not found (not a member / deleted)
  --------------------------------------------------- */
  if (!project) {
    return (
      <div className="p-6">
        <h2 className="text-lg font-semibold">Project not found</h2>
        <p className="text-sm text-muted-foreground">
          You may no longer have access to this project.
        </p>
        <button
          onClick={() => router.push("/projects")}
          className="mt-4 px-4 py-2 rounded bg-primary text-primary-foreground"
        >
          Back to Projects →
        </button>
      </div>
    );
  }

  /* ---------------------------------------------------
       5️⃣ Dashboard UI
  --------------------------------------------------- */
  return (
    <div className="flex flex-col h-full">
      <header className="bg-background border-b p-4 pb-2">
        <h1 className="text-2xl font-bold">{project.title}</h1>
        {project.description && (
          <p className="text-sm text-muted-foreground">{project.description}</p>
        )}
      </header>

      <KanbanBoard
        initialTasks={tasks}
        users={users}       // ✔ only project teammates
        projectId={projectId}
      />
    </div>
  );
}

/* ---------------------------------------------------
   Skeleton Loader
--------------------------------------------------- */
function KanbanBoardSkeleton() {
  return (
    <div className="flex flex-col h-full">
      <header className="bg-background py-4">
        <div className="flex items-center justify-between">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-10 w-28" />
        </div>
      </header>
      <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
        <div className="flex flex-col gap-4">
          <Skeleton className="h-8 w-32" />
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
        </div>
        <div className="flex flex-col gap-4">
          <Skeleton className="h-8 w-32" />
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
        </div>
        <div className="flex flex-col gap-4">
          <Skeleton className="h-8 w-32" />
          <Skeleton className="h-24 w-full" />
        </div>
      </div>
    </div>
  );
}
