'use client';

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import type { ChatThread } from "@/lib/data";
import { MoreHorizontal, Pencil, Plus, Trash2 } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";

type ThreadsSidebarProps = {
  threads: ChatThread[];
  setThreads: (threads: ChatThread[]) => void;
  onThreadSelect: (thread: ChatThread) => void;
};

export default function ThreadsSidebar({
  threads,
  setThreads,
  onThreadSelect,
}: ThreadsSidebarProps) {
  const [activeThreadId, setActiveThreadId] = useState<string | null>(null);

  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isRenameDialogOpen, setIsRenameDialogOpen] = useState(false);
  const [currentThread, setCurrentThread] = useState<ChatThread | null>(null);
  const [newTitle, setNewTitle] = useState("");

  /* -------------------------------------------------------
     SELECT THREAD
  ------------------------------------------------------- */
  const handleThreadClick = (thread: ChatThread) => {
    setActiveThreadId(thread.id);
    onThreadSelect(thread);
  };

  /* -------------------------------------------------------
     CREATE NEW THREAD
  ------------------------------------------------------- */
  const handleNewThreadClick = () => {
    const newThread: ChatThread = {
      id: `thread-${Date.now()}`,
      title: `New Thread ${threads.length + 1}`,
      messages: [],
    };

    const updated = [newThread, ...threads];
    setThreads(updated);

    // auto-open new thread
    setActiveThreadId(newThread.id);
    onThreadSelect(newThread);
  };

  /* -------------------------------------------------------
     DELETE
  ------------------------------------------------------- */
  const handleDeleteClick = (thread: ChatThread) => {
    setCurrentThread(thread);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (!currentThread) return;

    const updated = threads.filter((t) => t.id !== currentThread.id);
    setThreads(updated);

    // If deleted thread was active → reset active
    if (activeThreadId === currentThread.id) {
      setActiveThreadId(null);
    }

    setIsDeleteDialogOpen(false);
    setCurrentThread(null);
  };

  /* -------------------------------------------------------
     RENAME
  ------------------------------------------------------- */
  const handleRenameClick = (thread: ChatThread) => {
    setCurrentThread(thread);
    setNewTitle(thread.title);
    setIsRenameDialogOpen(true);
  };

  const confirmRename = () => {
    if (!currentThread) return;

    const updated = threads.map((t) =>
      t.id === currentThread.id ? { ...t, title: newTitle } : t
    );

    setThreads(updated);

    // Update active selection title as well
    if (activeThreadId === currentThread.id) {
      onThreadSelect({ ...currentThread, title: newTitle });
    }

    setIsRenameDialogOpen(false);
    setCurrentThread(null);
    setNewTitle("");
  };

  return (
    <>
      <aside className="w-[300px] border-r h-full flex flex-col bg-card flex-shrink-0">
        <header className="p-4 border-b flex items-center justify-between">
          <h2 className="text-xl font-bold">Threads</h2>

          <Button variant="ghost" size="icon" onClick={handleNewThreadClick}>
            <Plus />
            <span className="sr-only">New Thread</span>
          </Button>
        </header>

        <ScrollArea className="flex-1">
          {threads.length > 0 ? (
            threads.map((thread) => (
              <div
                key={thread.id}
                className={cn(
                  "flex items-center justify-between p-4 cursor-pointer border-b group",
                  activeThreadId === thread.id
                    ? "bg-primary/10"
                    : "hover:bg-muted"
                )}
                onClick={() => handleThreadClick(thread)}
              >
                <p className="font-semibold truncate flex-1">{thread.title}</p>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>

                  <DropdownMenuContent
                    align="end"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <DropdownMenuItem onClick={() => handleRenameClick(thread)}>
                      <Pencil className="mr-2 h-4 w-4" />
                      Rename
                    </DropdownMenuItem>

                    <DropdownMenuItem
                      onClick={() => handleDeleteClick(thread)}
                      className="text-destructive"
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            ))
          ) : (
            <div className="flex flex-col items-center justify-center h-full p-4 text-center">
              <p className="text-muted-foreground">No threads yet.</p>
              <p className="text-sm text-muted-foreground">
                Click the "+" button to start a new conversation.
              </p>
            </div>
          )}
        </ScrollArea>
      </aside>

      {/* ---------------- Rename Dialog ---------------- */}
      <AlertDialog
        open={isRenameDialogOpen}
        onOpenChange={setIsRenameDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Rename Thread</AlertDialogTitle>
            <AlertDialogDescription>
              Enter a new name for "{currentThread?.title}".
            </AlertDialogDescription>
          </AlertDialogHeader>

          <Input
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && confirmRename()}
          />

          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmRename}>
              Rename
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* ---------------- Delete Dialog ---------------- */}
      <AlertDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Thread?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete "{currentThread?.title}" and all
              messages. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>

          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-destructive text-destructive-foreground"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
