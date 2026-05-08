'use client';

import { ChangeEvent, FormEvent, useEffect, useRef, useState } from "react";
import { ActivePanel, ChatMessage, UserProfile } from "./types";

type ChatWorkspaceProps = {
  partner: UserProfile;
  onExit: () => void;
  userSessionId: string;
};

type CallState = "idle" | "ringing" | "connected";

type DBMessage = {
  _id: string;
  senderSessionId: string;
  receiverSessionId: string;
  senderName: string;
  senderAvatar: string;
  text: string;
  timestamp: string;
  status: 'sent' | 'read';
};

const formatClock = (date: Date) =>
  `${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`;

const formatTimer = (seconds: number) => {
  const min = Math.floor(seconds / 60);
  const sec = seconds % 60;
  return `${String(min).padStart(2, "0")}:${String(sec).padStart(2, "0")}`;
};

const getDateKey = (date: Date) =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;

const getDateLabel = (dateKey: string) => {
  const date = new Date(`${dateKey}T00:00:00`);
  return date.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
};

const getStatusTick = (status: ChatMessage["status"]) => {
  if (status === "sending") {
    return "✓";
  }
  return "✓✓";
};

export default function ChatWorkspace({ partner, onExit, userSessionId }: ChatWorkspaceProps) {
  const [panel, setPanel] = useState<ActivePanel>("chat");
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [speakerOn, setSpeakerOn] = useState(true);
  const [videoOn, setVideoOn] = useState(true);
  const [micOn, setMicOn] = useState(true);
  const [frontCamera, setFrontCamera] = useState(true);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [callSeconds, setCallSeconds] = useState(0);
  const [callState, setCallState] = useState<CallState>("idle");
  const [mediaError, setMediaError] = useState("");
  const [loading, setLoading] = useState(true);
  const [newMessageIds, setNewMessageIds] = useState<Set<string>>(new Set());

  const localVideoRef = useRef<HTMLVideoElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const activeStreamRef = useRef<MediaStream | null>(null);
  const pollIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const lastMessageTimeRef = useRef<string>("");
  const previousLengthRef = useRef<number>(0);
  const messagesContainerRef = useRef<HTMLDivElement | null>(null);

  const contactRail = [
    { id: "active", name: partner.name, status: "Online now", active: true, avatar: partner.avatar },
    { id: "recent-1", name: "Recent Match", status: "Last seen 2m ago", active: false, avatar: "👤" },
    { id: "recent-2", name: "Anonymous User", status: "Last seen 11m ago", active: false, avatar: "👤" },
  ];

  // Mark user as busy when chat starts
  useEffect(() => {
    const markBusy = async () => {
      try {
        await fetch("/api/users/chat-status", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            sessionId: userSessionId,
            busy: true,
            currentChatWith: partner.sessionId,
          }),
        });
      } catch (error) {
        console.error("Error marking user as busy:", error);
      }
    };

    markBusy();
  }, [userSessionId, partner.sessionId]);

  // Fetch initial messages
  useEffect(() => {
    const fetchMessages = async () => {
      try {
        setLoading(true);
        const response = await fetch(
          `/api/messages/between?userSessionId=${userSessionId}&otherSessionId=${partner.sessionId}`
        );
        const dbMessages = await response.json();

        if (Array.isArray(dbMessages)) {
          const converted: ChatMessage[] = dbMessages.map((msg: DBMessage) => ({
            id: msg._id,
            sender: msg.senderSessionId === userSessionId ? "you" : "partner",
            text: msg.text,
            time: formatClock(new Date(msg.timestamp)),
            status: msg.status === 'sent' ? "sent" : "read",
            dateKey: getDateKey(new Date(msg.timestamp)),
          }));
          setMessages(converted);
          if (converted.length > 0) {
            lastMessageTimeRef.current = dbMessages[dbMessages.length - 1].timestamp;
          }
        }
      } catch (error) {
        console.error("Error fetching messages:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchMessages();
  }, [userSessionId, partner.sessionId]);

  // Track newly added messages for animation
  useEffect(() => {
    if (messages.length > previousLengthRef.current) {
      const newIds = new Set<string>();
      const startIndex = previousLengthRef.current;
      
      for (let i = startIndex; i < messages.length; i++) {
        newIds.add(messages[i].id);
      }
      
      setNewMessageIds(newIds);
      
      // Remove animation class after animation completes (400ms)
      const timer = setTimeout(() => {
        setNewMessageIds(new Set());
      }, 400);
      
      return () => clearTimeout(timer);
    }
    
    previousLengthRef.current = messages.length;
  }, [messages]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (messagesContainerRef.current) {
      setTimeout(() => {
        messagesContainerRef.current?.scrollTo({
          top: messagesContainerRef.current.scrollHeight,
          behavior: "smooth",
        });
      }, 0);
    }
  }, [messages]);

  // Poll for new messages
  useEffect(() => {
    const poll = async () => {
      try {
        const response = await fetch(
          `/api/messages/between?userSessionId=${userSessionId}&otherSessionId=${partner.sessionId}`
        );
        const dbMessages = await response.json();

        if (Array.isArray(dbMessages) && dbMessages.length > 0) {
          const lastMsg = dbMessages[dbMessages.length - 1];
          
          if (lastMsg.timestamp !== lastMessageTimeRef.current) {
            lastMessageTimeRef.current = lastMsg.timestamp;

            const converted: ChatMessage[] = dbMessages.map((msg: DBMessage) => ({
              id: msg._id,
              sender: msg.senderSessionId === userSessionId ? "you" : "partner",
              text: msg.text,
              time: formatClock(new Date(msg.timestamp)),
              status: msg.status === 'sent' ? "sent" : "read",
              dateKey: getDateKey(new Date(msg.timestamp)),
            }));
            setMessages(converted);
          }
        }
      } catch (error) {
        console.error("Error polling messages:", error);
      }
    };

    pollIntervalRef.current = setInterval(poll, 1500);
    return () => {
      if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
    };
  }, [userSessionId, partner.sessionId]);

  useEffect(() => {
    return () => {
      if (activeStreamRef.current) {
        activeStreamRef.current.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  const stopActiveStream = () => {
    if (activeStreamRef.current) {
      activeStreamRef.current.getTracks().forEach((track) => track.stop());
      activeStreamRef.current = null;
    }

    if (localVideoRef.current) {
      localVideoRef.current.srcObject = null;
    }
  };

  const switchPanel = async (nextPanel: ActivePanel) => {
    setPanel(nextPanel);

    if (nextPanel === "chat") {
      setCallState("idle");
      setCallSeconds(0);
      setMediaError("");
      stopActiveStream();
      return;
    }

    setCallState("ringing");
    setCallSeconds(0);
    setMediaError("");
    stopActiveStream();

    try {
      const stream = await navigator.mediaDevices.getUserMedia(
        nextPanel === "voice" ? { audio: true, video: false } : { audio: true, video: true },
      );

      activeStreamRef.current = stream;
      if (nextPanel === "video" && localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }

      window.setTimeout(() => {
        setCallState("connected");
      }, 900);
    } catch {
      setMediaError("Mic/Camera permission required for real call start.");
      setCallState("idle");
    }
  };

  useEffect(() => {
    if (callState !== "connected" || panel === "chat") {
      return;
    }

    const interval = window.setInterval(() => {
      setCallSeconds((prev) => prev + 1);
    }, 1000);

    return () => window.clearInterval(interval);
  }, [callState, panel]);

  useEffect(() => {
    const stream = activeStreamRef.current;
    if (!stream) {
      return;
    }

    const audioTrack = stream.getAudioTracks()[0];
    if (audioTrack) {
      audioTrack.enabled = micOn && !isMuted;
    }

    const videoTrack = stream.getVideoTracks()[0];
    if (videoTrack) {
      videoTrack.enabled = videoOn;
    }
  }, [micOn, isMuted, videoOn]);

  const sendMessage = async (event: FormEvent) => {
    event.preventDefault();

    const trimmed = input.trim();
    if (!trimmed) {
      return;
    }

    const now = new Date();
    const tempId = `temp-${Date.now()}`;

    // Optimistic update
    const outgoing: ChatMessage = {
      id: tempId,
      sender: "you",
      text: trimmed,
      time: formatClock(now),
      status: "sending",
      dateKey: getDateKey(now),
    };

    setMessages((prev) => [...prev, outgoing]);
    setInput("");

    try {
      const response = await fetch("/api/messages/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          senderSessionId: userSessionId,
          receiverSessionId: partner.sessionId,
          text: trimmed,
        }),
      });

      if (response.ok) {
        const savedMsg = await response.json();
        
        // Replace temp message with actual saved message
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === tempId
              ? {
                  ...msg,
                  id: savedMsg._id,
                  status: "sent" as const,
                }
              : msg
          )
        );
      }
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  const sendFileMessage = (file: File) => {
    const now = new Date();

    const fileMessage: ChatMessage = {
      id: `${Date.now()}-${Math.random()}-file`,
      sender: "you",
      text: "Shared a file",
      time: formatClock(now),
      status: "sent",
      dateKey: getDateKey(now),
      attachment: {
        name: file.name,
        sizeLabel: `${(file.size / 1024).toFixed(1)} KB`,
      },
    };

    setMessages((prev) => [...prev, fileMessage]);
  };

  const onSelectFile = (event: ChangeEvent<HTMLInputElement>) => {
    const selected = event.target.files?.[0];
    if (!selected) {
      return;
    }

    sendFileMessage(selected);
    event.target.value = "";
  };

  const handleExit = async () => {
    // Mark user as not busy
    try {
      await fetch("/api/users/chat-status", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId: userSessionId,
          busy: false,
          currentChatWith: null,
        }),
      });
    } catch (error) {
      console.error("Error marking user as not busy:", error);
    }

    onExit();
  };

  const callStatusText =
    panel === "chat"
      ? "Chat active"
      : callState === "ringing"
        ? "Ringing..."
        : callState === "connected"
          ? `Connected • ${formatTimer(callSeconds)}`
          : "Idle";

  const statusColor =
    callState === "ringing"
      ? "text-amber-200"
      : callState === "connected"
        ? "text-emerald-200"
        : "text-cyan-200";

  return (
    <section className="glass-panel overflow-hidden rounded-3xl border border-white/15">
      <div className="grid min-h-[560px] lg:grid-cols-[260px_1fr]">
        <aside className="hidden border-r border-white/10 bg-slate-950/55 lg:block">
          <div className="border-b border-white/10 px-4 py-4">
            <p className="text-xs uppercase tracking-[0.2em] text-cyan-200/70">Anonymous Inbox</p>
            <p className="mt-1 text-lg font-semibold text-white">College Pool</p>
          </div>
          <div className="space-y-2 p-3">
            {contactRail.map((contact) => (
              <button
                key={contact.id}
                className={`w-full rounded-2xl border px-3 py-3 text-left transition ${
                  contact.active
                    ? "border-cyan-300/35 bg-cyan-400/10"
                    : "border-white/10 bg-slate-900/70 hover:bg-slate-800/80"
                }`}
              >
                <p className="text-sm font-semibold text-white">{contact.name}</p>
                <p className="text-xs text-slate-300">{contact.status}</p>
              </button>
            ))}
          </div>
        </aside>

        <div className="flex flex-col">
          <header className="sticky top-0 z-20 flex flex-wrap items-center justify-between gap-3 border-b border-white/10 bg-slate-900/95 px-4 py-3 backdrop-blur">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-full bg-gradient-to-br from-cyan-400 to-orange-400 flex items-center justify-center text-xl font-bold">
                {partner.avatar}
              </div>
              <div>
                <p className="text-xs text-cyan-200/80">Connected and Anonymous</p>
                <p className="text-base font-semibold text-white">{partner.name}</p>
                <p className="text-xs text-slate-300">{partner.year} Year • {partner.college}</p>
                <p className={`text-xs ${statusColor}`}>{callStatusText}</p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {["chat", "voice", "video"].map((id) => {
                const current = id as ActivePanel;
                const label = id === "chat" ? "Chat" : id === "voice" ? "Call" : "VC";
                const active = panel === current;

                return (
                  <button
                    key={id}
                    onClick={() => {
                      void switchPanel(current);
                    }}
                    className={`rounded-xl px-3 py-2 text-sm font-semibold transition ${
                      active
                        ? "bg-cyan-400 text-slate-950"
                        : "border border-white/20 bg-white/5 text-white"
                    }`}
                  >
                    {label}
                  </button>
                );
              })}
              <button
                onClick={handleExit}
                className="rounded-xl border border-rose-300/40 bg-rose-500/15 px-3 py-2 text-xs font-semibold text-rose-100"
              >
                Instant Exit
              </button>
            </div>
          </header>

          {panel === "chat" && (
            <div className="flex min-h-[500px] flex-col bg-slate-950/45">
              <div ref={messagesContainerRef} className="custom-scroll flex-1 space-y-3 overflow-y-auto bg-[radial-gradient(circle_at_20%_20%,rgba(56,189,248,0.15),transparent_35%),radial-gradient(circle_at_80%_75%,rgba(45,212,191,0.14),transparent_38%),#020617] p-4">
                {loading ? (
                  <div className="flex items-center justify-center h-full">
                    <p className="text-slate-400">Loading messages...</p>
                  </div>
                ) : messages.length === 0 ? (
                  <div className="flex items-center justify-center h-full">
                    <p className="text-slate-400">No messages yet. Start the conversation!</p>
                  </div>
                ) : (
                  messages.map((message, index) => {
                    const previous = messages[index - 1];
                    const showDateSeparator = !previous || previous.dateKey !== message.dateKey;
                    const isYou = message.sender === "you";
                    const tickColor = message.status === "read" ? "text-sky-500" : "text-slate-400";

                    return (
                      <div key={message.id}>
                        {showDateSeparator && (
                          <div className="my-3 flex justify-center">
                            <span className="rounded-full border border-white/15 bg-slate-800/75 px-3 py-1 text-[11px] text-slate-200">
                              {getDateLabel(message.dateKey)}
                            </span>
                          </div>
                        )}

                        <div
                          className={`max-w-[86%] rounded-2xl px-3 py-2 text-sm shadow-sm md:max-w-[74%] ${
                            isYou
                              ? "ml-auto rounded-tr-md bg-[#d9fdd3] text-slate-900"
                              : "rounded-tl-md bg-white text-slate-900"
                          } ${newMessageIds.has(message.id) ? "message-animate" : ""}`}
                        >
                          {message.attachment ? (
                            <div className="flex items-center gap-2">
                              <span>📎</span>
                              <a href="#" className="underline">
                                {message.attachment.name}
                              </a>
                              <span className="text-xs text-slate-600">({message.attachment.sizeLabel})</span>
                            </div>
                          ) : (
                            message.text
                          )}
                          <div className="mt-1 flex items-center justify-between gap-1">
                            <p className="text-xs text-slate-600">{message.time}</p>
                            {isYou && <span className={`text-xs ${tickColor}`}>{getStatusTick(message.status)}</span>}
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              <form onSubmit={sendMessage} className="border-t border-white/10 bg-slate-900 p-3">
                <div className="flex items-end gap-3">
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={onSelectFile}
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="rounded-full bg-white/10 px-4 py-3 text-sm font-semibold text-slate-200 hover:bg-white/20"
                  >
                    📎 Attach
                  </button>
                  <input
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Type a message..."
                    className="flex-1 rounded-full bg-slate-800 px-4 py-3 text-sm text-white placeholder-slate-400 outline-none"
                  />
                  <button
                    type="submit"
                    className="rounded-full bg-cyan-400 px-5 py-3 text-sm font-semibold text-slate-950"
                  >
                    Send
                  </button>
                </div>
              </form>
            </div>
          )}

          {panel === "voice" && (
            <div className="flex min-h-[500px] flex-col justify-between bg-slate-950/45 p-4 text-center">
              <div className="flex flex-1 flex-col items-center justify-center gap-4">
                <div className="relative flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-emerald-300 to-teal-500 text-3xl text-slate-950 ring-8 ring-emerald-300/25">
                  V
                  <span className="voice-ring" />
                </div>
                <p className="text-xl font-semibold text-white">Voice Call</p>
                <p className="text-sm text-emerald-200">{callStatusText}</p>
                {mediaError && <p className="text-xs text-rose-200">{mediaError}</p>}
              </div>

              <div className="flex flex-wrap items-center justify-center gap-3">
                <button
                  onClick={() => setIsMuted((prev) => !prev)}
                  className="rounded-full border border-white/20 bg-white/5 px-4 py-2 text-sm text-white"
                >
                  {isMuted ? "Unmute" : "Mute"}
                </button>
                <button
                  onClick={() => setSpeakerOn((prev) => !prev)}
                  className="rounded-full border border-white/20 bg-white/5 px-4 py-2 text-sm text-white"
                >
                  {speakerOn ? "Speaker On" : "Speaker Off"}
                </button>
                <button
                  onClick={handleExit}
                  className="rounded-full bg-rose-500 px-4 py-2 text-sm font-semibold text-white"
                >
                  End Call
                </button>
              </div>
            </div>
          )}

          {panel === "video" && (
            <div className="flex min-h-[500px] flex-col justify-between bg-slate-950/45 p-4">
              <div className="grid flex-1 gap-3 md:grid-cols-2">
                <div className="rounded-2xl border border-white/10 bg-[radial-gradient(circle_at_30%_30%,rgba(56,189,248,0.45),transparent_38%),#0f172a] p-3">
                  <p className="mb-2 text-xs text-slate-200">Partner VC</p>
                  <div className="h-[240px] rounded-xl border border-white/10 bg-slate-950/60" />
                </div>
                <div className="rounded-2xl border border-white/10 bg-slate-900/70 p-3">
                  <p className="mb-2 text-xs text-slate-200">
                    Your VC ({frontCamera ? "Front Cam" : "Rear Cam"})
                  </p>
                  <video
                    ref={localVideoRef}
                    autoPlay
                    muted
                    playsInline
                    className="h-[240px] w-full rounded-xl border border-white/10 bg-slate-950/60 object-cover"
                  />
                </div>
              </div>

              {mediaError && <p className="mt-2 text-xs text-rose-200">{mediaError}</p>}

              <div className="mt-3 flex flex-wrap items-center justify-center gap-3">
                <button
                  onClick={() => setVideoOn((prev) => !prev)}
                  className="rounded-full border border-white/20 bg-white/5 px-4 py-2 text-sm text-white"
                >
                  {videoOn ? "Video On" : "Video Off"}
                </button>
                <button
                  onClick={() => setMicOn((prev) => !prev)}
                  className="rounded-full border border-white/20 bg-white/5 px-4 py-2 text-sm text-white"
                >
                  {micOn ? "Mic On" : "Mic Off"}
                </button>
                <button
                  onClick={() => setFrontCamera((prev) => !prev)}
                  className="rounded-full border border-white/20 bg-white/5 px-4 py-2 text-sm text-white"
                >
                  Flip Camera
                </button>
                <button
                  onClick={handleExit}
                  className="rounded-full bg-rose-500 px-4 py-2 text-sm font-semibold text-white"
                >
                  End VC
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
