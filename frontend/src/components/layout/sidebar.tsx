"use client";

import {
  Sidebar,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarContent,
  SidebarTrigger,
  SidebarFooter,
} from "@/components/ui/sidebar";

import {
  Folder,
  Target,
  MessageSquare,
  History,
  Users,
  LogOut,
  MoreHorizontal,
  User as UserIcon,
} from "lucide-react";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { useEffect, useState } from "react";
import { fetchProjects } from "@/lib/api";

/* -------------------------------------------------------
   EXPORT LOGO (Fix for LoginPage)
------------------------------------------------------- */
export const Logo = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
    <path
      d="M12 2L2 7V17L12 22L22 17V7L12 2Z"
      stroke="hsl(var(--primary))"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M2 7L12 12L22 7"
      stroke="hsl(var(--primary))"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M12 22V12"
      stroke="hsl(var(--primary))"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

/* -------------------------------------------------------
   USER HOOK
------------------------------------------------------- */
function useUser() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const u = localStorage.getItem("user");
    if (u) setUser(JSON.parse(u));
    setLoading(false);
  }, []);

  return { user, loading };
}

export const AppSidebarTrigger = () => <SidebarTrigger className="flex" />;

/* -------------------------------------------------------
   SIDEBAR
------------------------------------------------------- */
export default function AppSidebar() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter();

  const { user, loading } = useUser();
  const projectId = searchParams.get("projectId");

  const [projectName, setProjectName] = useState<string | null>(null);
  const [projectExists, setProjectExists] = useState<boolean>(true);

  /* -------------------------------------------------------
     LOAD PROJECT NAME
  ------------------------------------------------------- */
  useEffect(() => {
    if (!projectId) {
      setProjectExists(false);
      setProjectName(null);
      return;
    }

    const token = localStorage.getItem("token");
    if (!token) return;

    (async () => {
      try {
        const projects = await fetchProjects();
        const found = projects.find((p: any) => p.id === projectId);

        if (!found) {
          setProjectExists(false);
          setProjectName(null);
        } else {
          setProjectExists(true);
          setProjectName(found.title);
        }
      } catch {
        setProjectExists(false);
        setProjectName(null);
      }
    })();
  }, [projectId]);

  /* Redirect if user logged out */
  useEffect(() => {
    if (!loading && !user) {
      router.replace("/login");
    }
  }, [loading, user, router]);

  /* -------------------------------------------------------
     BLOCK SIDEBAR ON LOGIN/SIGNUP
  ------------------------------------------------------- */
  if (pathname === "/login" || pathname === "/signup") return null;
  if (loading) return null;
  if (!user) return null;

  /* -------------------------------------------------------
     MENU CONFIG
  ------------------------------------------------------- */
  const onProjectsPage = pathname.startsWith("/projects");
  const baseLabel =
    !projectId || !projectExists ? "Projects" : projectName || "Projects";

  const menu = [
    { href: `/dashboard?projectId=${projectId}`, label: "Dashboard", icon: Target },
    { href: `/milestones?projectId=${projectId}`, label: "Milestones", icon: Target },
    { href: `/chat?projectId=${projectId}`, label: "Chat", icon: MessageSquare },
    { href: `/activity?projectId=${projectId}`, label: "Activity", icon: History },
    { href: `/teammates?projectId=${projectId}`, label: "Teammates", icon: Users },
  ];

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    router.push("/login");
  };

  /* -------------------------------------------------------
     RENDER SIDEBAR
  ------------------------------------------------------- */
  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <div className="flex items-center gap-2">
          <Logo />
          <span className="font-semibold text-lg group-data-[collapsible=icon]:hidden">
            Milestack
          </span>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarMenu>
          {/* Projects root */}
          <SidebarMenuItem>
            <Link href="/projects" className="w-full">
              <SidebarMenuButton
                isActive={onProjectsPage}
                tooltip="Projects"
              >
                <Folder />
                <span>{baseLabel}</span>
              </SidebarMenuButton>
            </Link>
          </SidebarMenuItem>

          {/* Project menu */}
          {!onProjectsPage &&
            projectId &&
            projectExists &&
            menu.map((item) => (
              <SidebarMenuItem key={item.href}>
                <Link href={item.href} className="w-full">
                  <SidebarMenuButton
                    isActive={pathname.startsWith(item.href.split("?")[0])}
                    tooltip={item.label}
                  >
                    <item.icon />
                    <span>{item.label}</span>
                  </SidebarMenuButton>
                </Link>
              </SidebarMenuItem>
            ))}

          {/* Invalid project */}
          {!onProjectsPage && projectId && !projectExists && (
            <SidebarMenuItem>
              <SidebarMenuButton disabled tooltip="Project not found">
                <Folder />
                <span className="text-muted-foreground">Invalid Project</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          )}
        </SidebarMenu>
      </SidebarContent>

      <SidebarFooter>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <div className="flex items-center gap-3 p-2 cursor-pointer hover:bg-muted rounded-md">
              <Avatar className="h-9 w-9">
                <AvatarImage src={user?.avatar} />
                <AvatarFallback>
                  {(user?.name?.[0] || user?.email?.[0] || "?").toUpperCase()}
                </AvatarFallback>
              </Avatar>

              <div className="group-data-[collapsible=icon]:hidden overflow-hidden">
                <p className="font-medium truncate">{user.name}</p>
              </div>

              <MoreHorizontal className="group-data-[collapsible=icon]:hidden" />
            </div>
          </DropdownMenuTrigger>

          <DropdownMenuContent className="w-56 mb-2">
            <DropdownMenuLabel>{user.email}</DropdownMenuLabel>

            <DropdownMenuSeparator />

            <DropdownMenuItem asChild>
              <Link href="/profile">
                <UserIcon className="mr-2 h-4 w-4" />
                Profile
              </Link>
            </DropdownMenuItem>

            <DropdownMenuSeparator />

            <DropdownMenuItem onClick={logout}>
              <LogOut className="mr-2 h-4 w-4" /> Logout
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
