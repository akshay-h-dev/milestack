"use client";

import { useState, useEffect, useRef } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Wand2, Send, MessageSquare, X } from "lucide-react";
import type { ChatThread, User, Message } from "@/lib/data";
import { useToast } from "@/hooks/use-toast";

type ChatWindowProps = {
  thread: ChatThread;
  users: User[];
  userMap: Map<string, User>;
  onClose: () => void;
  onUpdateThread: (thread: ChatThread) => void;
};

/* ---------------------------------------------------------
   GET CURRENT LOGGED USER FROM LOCALSTORAGE
--------------------------------------------------------- */
const useUser = () => {
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const userJson = localStorage.getItem("user");
    if (userJson) setUser(JSON.parse(userJson));
  }, []);

  return { user };
};

export default function ChatWindow({
  thread,
  users,
  userMap,
  onClose,
  onUpdateThread,
}: ChatWindowProps) {
  const { user: currentUser } = useUser();
  const [messages, setMessages] = useState<Message[]>(thread.messages);
  const [newMessage, setNewMessage] = useState("");
  const { toast } = useToast();
  const bottomRef = useRef<HTMLDivElement>(null);

  /* ---------------------------------------------------------
     When thread.messages changes → sync messages
  --------------------------------------------------------- */
  useEffect(() => {
    setMessages(thread.messages);
  }, [thread.messages]);

  /* ---------------------------------------------------------
     Auto-scroll to bottom
  --------------------------------------------------------- */
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  /* ---------------------------------------------------------
     SEND MESSAGE
  --------------------------------------------------------- */
  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !currentUser) return;

    const msg: Message = {
      id: `msg-${Date.now()}`,
      text: newMessage.trim(),
      senderId: currentUser.id || currentUser.email,
      timestamp: new Date().toISOString(),
    };

    const updated = [...messages, msg];
    setMessages(updated);

    // push updated thread upward
    onUpdateThread({ ...thread, messages: updated });

    setNewMessage("");
  };

  /* ---------------------------------------------------------
     FILTER IMPORTANT MESSAGES (AI)
     Keeping your feature but improved handling
  --------------------------------------------------------- */
  const handleFilterMessages = async () => {
    if (!messages.length) return;

    try {
      toast({
        title: "AI Feature Not Implemented",
        description:
          "Filtering will work once connected to backend or OpenAI.",
      });
    } catch {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Could not filter messages.",
      });
    }
  };

  /* ---------------------------------------------------------
     RENDER
  --------------------------------------------------------- */
  return (
    <>
      <header className="p-4 border-b flex items-center justify-between">
        <h2 className="text-xl font-bold truncate">{thread.title}</h2>
        <div className="flex items-center gap-2">
          <Button onClick={handleFilterMessages} variant="outline" size="sm">
            <Wand2 className="mr-2 h-4 w-4" />
            Filter
          </Button>

          <Button onClick={onClose} variant="ghost" size="icon">
            <X className="h-4 w-4" />
          </Button>
        </div>
      </header>

      {/* ---------------- MESSAGE LIST ---------------- */}
      <div className="flex-1 overflow-y-auto p-4">
        {messages.length ? (
          <div className="space-y-4">
            {messages.map((m) => {
              const sender =
                userMap.get(m.senderId) || ({
                  name: m.senderId,
                  initials: m.senderId.charAt(0).toUpperCase(),
                } as User);

              return (
                <div key={m.id} className="flex items-start gap-3">
                  <Avatar>
                    <AvatarImage src={sender.avatar} />
                    <AvatarFallback>{sender.initials}</AvatarFallback>
                  </Avatar>

                  <div>
                    <p className="font-semibold">{sender.name}</p>
                    <Card className="mt-1 inline-block bg-muted p-3 rounded-lg">
                      <p>{m.text}</p>
                    </Card>
                  </div>
                </div>
              );
            })}

            <div ref={bottomRef} />
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-muted-foreground text-center">
            <MessageSquare className="w-12 h-12 mb-4" />
            <h3 className="text-lg font-semibold">Start the conversation</h3>
          </div>
        )}
      </div>

      {/* ---------------- INPUT BOX ---------------- */}
      <div className="p-4 border-t bg-card">
        <form onSubmit={handleSendMessage}>
          <div className="relative">
            <Input
              placeholder="Type a message..."
              className="pr-12"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
            />

            <Button
              type="submit"
              size="icon"
              className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-10"
            >
              <Send />
            </Button>
          </div>
        </form>
      </div>
    </>
  );
}
