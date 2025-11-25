"use client";

import type { ChatThread, User } from "@/lib/data";
import ChatWindow from "./chat-window";

type ChatClientProps = {
  openThreads: ChatThread[];
  users: User[];
  onCloseThread: (threadId: string) => void;
  onUpdateThread: (thread: ChatThread) => void;
};

export default function ChatClient({
  openThreads,
  users,
  onCloseThread,
  onUpdateThread,
}: ChatClientProps) {

  /* ---------------------------------------------------------
     Create a stable sender lookup map
     Supports: user.id  OR  user.email as fallback key
  --------------------------------------------------------- */
  const userMap = new Map<string, User>();
  users.forEach((u) => {
    if (u.id) userMap.set(u.id, u);
    if (u.email) userMap.set(u.email, u);
  });

  /* ---------------------------------------------------------
     RENDER
  --------------------------------------------------------- */
  if (openThreads.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <p className="text-muted-foreground">
          Select a thread or create a new one to start chatting.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-1 gap-4 p-4 overflow-x-auto">
      {openThreads.map((thread) => (
        <div
          key={thread.id}
          className="flex-1 min-w-[350px] max-w-[450px] flex flex-col border rounded-lg bg-card"
        >
          <ChatWindow
            thread={thread}
            users={users}
            userMap={userMap}
            onClose={() => onCloseThread(thread.id)}
            onUpdateThread={onUpdateThread}
          />
        </div>
      ))}
    </div>
  );
}
