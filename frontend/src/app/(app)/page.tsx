"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";

import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";

import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { UserPlus, Trash2, Clock } from "lucide-react";

import {
  fetchTeammates,
  inviteTeammate,
  removeTeammate,
  fetchInvites,
} from "@/lib/api";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";

import { Input } from "@/components/ui/input";

import {
  AlertDialog,
  AlertDialogHeader,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";

import type { User } from "@/lib/data";

export default function TeammatesPage() {
  const searchParams = useSearchParams();
  const projectId = searchParams.get("projectId");

  const [teammates, setTeammates] = useState<User[]>([]);
  const [invites, setInvites] = useState<any[]>([]);

  const [isInviteOpen, setIsInviteOpen] = useState(false);
  const [inviteData, setInviteData] = useState({ name: "", email: "" });

  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  /* -------------------------------------------------------------------
     Load teammates + invites for this project
  ------------------------------------------------------------------- */
  useEffect(() => {
    if (!projectId) return;

    async function loadData() {
      try {
        const members = await fetchTeammates(projectId);
        const invs = await fetchInvites(projectId);

        setTeammates(Array.isArray(members) ? members : []);
        setInvites(Array.isArray(invs) ? invs : []);
      } catch (err) {
        console.error("Teammates page load error:", err);
      }
    }

    loadData();
  }, [projectId]);

  /* -------------------------------------------------------------------
     Invite teammate
  ------------------------------------------------------------------- */
  const handleInvite = async () => {
    if (!projectId) return;

    try {
      const res = await inviteTeammate({
        name: inviteData.name,
        email: inviteData.email,
        projectId,
      });

      // If backend returns a pending invite
      if (res.status === "pending" || res.id?.startsWith("invite")) {
        setInvites((prev) => [...prev, res]);
      } else {
        // Existing user added to the project
        setTeammates((prev) => [...prev, res]);
      }

      setInviteData({ name: "", email: "" });
      setIsInviteOpen(false);
    } catch (err) {
      console.error("Invite error:", err);
    }
  };

  /* -------------------------------------------------------------------
     Remove teammate from project
  ------------------------------------------------------------------- */
  const handleRemove = async () => {
    if (!selectedUser || !projectId) return;

    try {
      await removeTeammate(selectedUser.id, projectId);
      setTeammates((prev) => prev.filter((u) => u.id !== selectedUser.id));
    } catch (err) {
      console.error("Remove teammate error:", err);
    }

    setIsDeleteOpen(false);
    setSelectedUser(null);
  };

  /* -------------------------------------------------------------------
     Missing projectId case
  ------------------------------------------------------------------- */
  if (!projectId) {
    return (
      <div className="p-10 text-center">
        <p className="text-red-500 font-semibold">
          ❌ Missing projectId.  
          Open via: <code>/teammates?projectId=proj_123</code>
        </p>
      </div>
    );
  }

  /* -------------------------------------------------------------------
     Page Layout
  ------------------------------------------------------------------- */
  return (
    <div className="flex-1 flex flex-col">
      {/* Header */}
      <header className="bg-card border-b p-4">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-2xl font-bold">Teammates</h1>
          <p className="text-muted-foreground">
            Manage collaborators for this project.
          </p>
        </div>
      </header>

      {/* Content */}
      <div className="flex-1 p-4 md:p-6 lg:p-8 overflow-y-auto">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Team Members */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Your Team</CardTitle>
                <CardDescription>
                  Active members of this project.
                </CardDescription>
              </div>

              <Button onClick={() => setIsInviteOpen(true)}>
                <UserPlus className="mr-2 h-4 w-4" />
                Invite
              </Button>
            </CardHeader>

            <CardContent>
              {teammates.length > 0 ? (
                <ul className="divide-y">
                  {teammates.map((user) => (
                    <li
                      key={user.id}
                      className="flex items-center justify-between py-4"
                    >
                      <div className="flex items-center gap-4">
                        <Avatar>
                          <AvatarFallback>
                            {user.name?.charAt(0).toUpperCase() ?? "?"}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-semibold">{user.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {user.email}
                          </p>
                        </div>
                      </div>

                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-destructive"
                        onClick={() => {
                          setSelectedUser(user);
                          setIsDeleteOpen(true);
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-center text-muted-foreground py-10">
                  No teammates yet. Invite someone!
                </p>
              )}
            </CardContent>
          </Card>

          {/* Pending Invites */}
          <Card>
            <CardHeader>
              <CardTitle>Pending Invites</CardTitle>
              <CardDescription>
                People who have been invited but haven't joined yet.
              </CardDescription>
            </CardHeader>

            <CardContent>
              {invites.length > 0 ? (
                <ul className="divide-y">
                  {invites.map((inv) => (
                    <li
                      key={inv.id}
                      className="flex items-center justify-between py-4"
                    >
                      <div className="flex items-center gap-4">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <p className="font-semibold">{inv.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {inv.email}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Pending invite
                          </p>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-center text-muted-foreground py-10">
                  No pending invites.
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Invite Dialog */}
      <Dialog open={isInviteOpen} onOpenChange={setIsInviteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Invite Teammate</DialogTitle>
            <DialogDescription>
              Enter the details to invite someone to this project.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div>
              <label className="text-sm font-medium">Name</label>
              <Input
                value={inviteData.name}
                onChange={(e) =>
                  setInviteData((prev) => ({ ...prev, name: e.target.value }))
                }
                placeholder="John Doe"
              />
            </div>

            <div>
              <label className="text-sm font-medium">Email</label>
              <Input
                value={inviteData.email}
                onChange={(e) =>
                  setInviteData((prev) => ({ ...prev, email: e.target.value }))
                }
                placeholder="user@example.com"
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="ghost" onClick={() => setIsInviteOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleInvite}>Send Invite</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirm Dialog */}
      <AlertDialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove teammate?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to remove{" "}
              <strong>{selectedUser?.name}</strong>?  
              They will lose access to this project.
            </AlertDialogDescription>
          </AlertDialogHeader>

          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>

            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={handleRemove}
            >
              Remove
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
