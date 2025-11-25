"use client";

import { SidebarProvider } from "@/components/ui/sidebar";
import AppSidebar from "@/components/layout/sidebar";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <div className="flex min-h-screen">
        {/* Sidebar */}
        <AppSidebar />

        {/* Main content */}
        <div className="flex-1 overflow-hidden">
          {children}
        </div>
      </div>
    </SidebarProvider>
  );
}
