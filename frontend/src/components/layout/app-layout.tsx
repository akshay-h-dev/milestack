'use client';

import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

import AppSidebar, { AppSidebarTrigger } from '../layout/sidebar';
import { SidebarProvider } from '../ui/sidebar';

const protectedRoutes = [
  '/projects',
  '/dashboard',
  '/milestones',
  '/chat',
  '/activity',
  '/teammates',
  '/profile',
];

const publicRoutes = ['/login', '/signup'];

/* ----------------------------------------------------
   USER HOOK (always same hook order)
---------------------------------------------------- */
const useUser = () => {
  const [user, setUser] = useState<any>(null);
  const [isUserLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const json = localStorage.getItem('user');
    if (json) setUser(JSON.parse(json));
    setIsLoading(false);
  }, []);

  return { user, isUserLoading };
};

/* ----------------------------------------------------
   MAIN LAYOUT
---------------------------------------------------- */
export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { user, isUserLoading } = useUser();
  const router = useRouter();
  const pathname = usePathname();

  const isProtected = protectedRoutes.some((r) => pathname.startsWith(r));
  const isPublic = publicRoutes.includes(pathname);

  /* ----------------------------------------------------
     Redirect logic (safe — only inside useEffect)
  ---------------------------------------------------- */
  useEffect(() => {
    if (isUserLoading) return;

    if (!user && isProtected) {
      router.replace('/login');
      return;
    }

    if (user && isPublic) {
      router.replace('/projects');
      return;
    }

    if (pathname === '/') {
      router.replace(user ? '/projects' : '/login');
    }
  }, [user, isUserLoading, pathname, router]);

  /* ----------------------------------------------------
     Loading state
  ---------------------------------------------------- */
  if (isUserLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

  /* ----------------------------------------------------
     Public routes (login/signup)
  ---------------------------------------------------- */
  if (!user) {
    return <>{children}</>;
  }

  /* ----------------------------------------------------
     Private authenticated layout
  ---------------------------------------------------- */
  return (
    <SidebarProvider>
      <div className="flex min-h-screen">
        <AppSidebar />

        <div className="flex flex-1 flex-col">

          {/* Header */}
          <header className="flex h-14 items-center gap-4 border-b bg-muted/40 px-4 lg:h-[60px]">
            <AppSidebarTrigger />
          </header>

          {/* Centered content wrapper */}
          <main className="flex-1 overflow-auto flex justify-center px-6 py-8">
            <div className="w-full max-w-5xl">
              {children}
            </div>
          </main>

        </div>
      </div>
    </SidebarProvider>
  );
}
