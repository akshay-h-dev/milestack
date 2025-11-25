'use client';

import DashboardClient from "@/components/dashboard/client-page";
import { User, users as initialUsers } from "@/lib/data";
import { useState } from "react";
import { useSearchParams } from "next/navigation";

export default function DashboardPage() {
  const searchParams = useSearchParams();
  const projectId = searchParams.get("projectId");   // <-- FIX

  const [users] = useState<User[]>(initialUsers);

  if (!projectId) {
    return (
      <div className="p-6 text-red-500 font-bold">
        ❌ Error: No projectId in URL
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col p-4 md:p-6 lg:p-8">
      <DashboardClient
        initialTasks={[]}
        users={users || []}
        usersLoading={false}
        projectId={projectId}     // <-- PASS projectId down
      />
    </div>
  );
}
