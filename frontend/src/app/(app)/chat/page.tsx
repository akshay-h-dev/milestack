'use client';

import { useEffect, useState } from 'react';
import ChatClient from '@/components/chat/chat-client';
import ThreadsSidebar from '@/components/chat/threads-sidebar';
import type { ChatThread, User } from '@/lib/data';

const STORAGE_KEY = "milestack_chat_threads";

export default function ChatPage() {
  const [openThreads, setOpenThreads] = useState<ChatThread[]>([]);
  const [users] = useState<User[]>([]);
  const [allThreads, setAllThreads] = useState<ChatThread[]>([]);

  /* -----------------------------------------------------
     LOAD THREADS ON MOUNT
  ----------------------------------------------------- */
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as ChatThread[];
        setAllThreads(parsed);
      }
    } catch (err) {
      console.error("Failed to load threads:", err);
      setAllThreads([]);
    }
  }, []);

  /* -----------------------------------------------------
     PERSIST THREADS WHEN CHANGED
  ----------------------------------------------------- */
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(allThreads));
    } catch (err) {
      console.error("Failed to save threads:", err);
    }
  }, [allThreads]);

  /* -----------------------------------------------------
     SELECT THREAD (OPEN TAB)
  ----------------------------------------------------- */
  const handleThreadSelect = (thread: ChatThread) => {
    const latest = allThreads.find(t => t.id === thread.id) || thread;

    setOpenThreads(prev => {
      if (prev.some(t => t.id === latest.id)) return prev;
      return [...prev, latest];
    });
  };

  /* -----------------------------------------------------
     CLOSE THREAD TAB
  ----------------------------------------------------- */
  const handleCloseThread = (threadId: string) => {
    setOpenThreads(prev => prev.filter(t => t.id !== threadId));
  };

  /* -----------------------------------------------------
     UPDATE THREAD (messages, rename, etc.)
  ----------------------------------------------------- */
  const handleUpdateThread = (updated: ChatThread) => {
    // Update main list
    setAllThreads(prev =>
      prev.some(t => t.id === updated.id)
        ? prev.map(t => (t.id === updated.id ? updated : t))
        : [updated, ...prev]
    );

    // Update open windows
    setOpenThreads(prev =>
      prev.map(t => (t.id === updated.id ? updated : t))
    );
  };

  return (
    <div className="h-full grid grid-cols-[300px_1fr]">
      <ThreadsSidebar
        threads={allThreads}
        setThreads={setAllThreads}
        onThreadSelect={handleThreadSelect}
      />

      <div className="flex-1 flex h-full bg-background overflow-x-auto">
        <ChatClient
          openThreads={openThreads}
          users={users}
          onCloseThread={handleCloseThread}
          onUpdateThread={handleUpdateThread}
        />
      </div>
    </div>
  );
}
