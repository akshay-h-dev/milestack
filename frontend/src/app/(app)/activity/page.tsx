"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { Activity, User } from "@/lib/data";
import { History } from "lucide-react";

import { fetchActivities, fetchTeammates } from "@/lib/api";

export default function ActivityPage() {
  const params = useSearchParams();
  const projectId = params.get("projectId");

  const [activities, setActivities] = useState<Activity[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  // Map userId → User
  const userMap = new Map(users.map((u) => [u.id, u]));

  // Load activities
  async function loadActivities() {
    if (!projectId) return;
    try {
      const list = await fetchActivities(projectId);
      setActivities(list);
    } catch (err) {
      console.error("Failed to load activities:", err);
    }
  }

  // Load teammates
  // Fetch users
async function loadUsers() {
  if (!projectId) return;
  try {
    const team = await fetchTeammates(projectId);
    setUsers(team); // <-- CORRECT: backend returns flat array
  } catch (err) {
    console.error("Failed to load teammates:", err);
  }
}


  useEffect(() => {
    if (!projectId) return;

    setLoading(true);

    Promise.all([loadActivities(), loadUsers()]).finally(() =>
      setLoading(false)
    );
  }, [projectId]);

  if (loading) {
    return (
      <div className="p-6 text-muted-foreground text-center">
        Loading activity...
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col">
      <header className="bg-card border-b p-4">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-2xl font-bold">Activity Feed</h1>
          <p className="text-muted-foreground">
            A log of all actions for this project.
          </p>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
        <div className="max-w-4xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>
                Here’s what's been happening in this project.
              </CardDescription>
            </CardHeader>

            <CardContent>
              {activities.length > 0 ? (
                <ul className="space-y-6">
                  {activities.map((activity) => {
                    const user = userMap.get(activity.userId);
                    const timestamp = new Date(activity.timestamp);

                    const date = timestamp.toLocaleDateString("en-US", {
                      month: "long",
                      day: "numeric",
                    });

                    const time = timestamp.toLocaleTimeString("en-US", {
                      hour: "2-digit",
                      minute: "2-digit",
                    });

                    return (
                      <li key={activity.id} className="flex items-start gap-4">
                        <div className="flex-1">
                          <p>
                            <span className="font-semibold">
                              {user?.name || "Someone"}
                            </span>{" "}
                            {activity.description}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {date} at {time}
                          </p>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground pt-16">
                  <History className="w-16 h-16 mb-4 text-primary/20" />
                  <h3 className="text-lg font-semibold text-foreground">
                    No Activity Yet
                  </h3>
                  <p className="mb-4">Recent actions will appear here.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
