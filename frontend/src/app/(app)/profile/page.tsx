"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { ProfileForm } from "@/components/profile/profile-form";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";

import { fetchTeammates, updateMyRole } from "@/lib/api";

export default function ProfilePage() {
  const searchParams = useSearchParams();
  const projectId = searchParams.get("projectId");

  const { toast } = useToast();

  const [role, setRole] = useState("");
  const [initialRole, setInitialRole] = useState("");
  const [loading, setLoading] = useState(true);

  const currentUser =
    typeof window !== "undefined"
      ? JSON.parse(localStorage.getItem("user") || "{}")
      : null;

  /* -------------------------------------------------------
     Load current user role for this project
  ------------------------------------------------------- */
  useEffect(() => {
    if (!projectId || !currentUser?.id) return;

    async function load() {
      try {
        setLoading(true);

        const list = await fetchTeammates(projectId);

        if (!Array.isArray(list)) return;

        // Find the user’s own record in the list
        const me = list.find((u: any) => u.id === currentUser.id);

        if (me) {
          setRole(me.role || "");
          setInitialRole(me.role || "");
        }
      } catch (err) {
        toast({
          title: "Failed to load role",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [projectId]);

  /* -------------------------------------------------------
     Save role
  ------------------------------------------------------- */
  const saveRole = async () => {
    if (!projectId) {
      return toast({
        title: "Missing project",
        description: "Please open profile from a project page.",
        variant: "destructive",
      });
    }

    try {
      await updateMyRole(projectId, role.trim());

      toast({
        title: "Role updated",
        description: "Your project role has been updated.",
      });

      setInitialRole(role.trim());
    } catch (err: any) {
      toast({
        title: "Update failed",
        description: err.message || "Server error",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="flex-1 p-4 md:p-6 lg:p-8">
      <div className="max-w-2xl mx-auto space-y-8">

        {/* Profile info card */}
        <Card>
          <CardHeader>
            <CardTitle>Profile</CardTitle>
            <CardDescription>
              Update your name and status. This is for display purposes only.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ProfileForm />
          </CardContent>
        </Card>

        {/* Role editing card */}
        <Card>
          <CardHeader>
            <CardTitle>My Role in This Project</CardTitle>
            <CardDescription>
              You can choose any role name. Only affects this project.
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">
            <Input
              placeholder="e.g., Developer, Designer, QA"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              disabled={loading}
            />

            <Button
              onClick={saveRole}
              disabled={loading || role.trim() === initialRole.trim()}
            >
              Save Role
            </Button>
          </CardContent>
        </Card>

      </div>
    </div>
  );
}
