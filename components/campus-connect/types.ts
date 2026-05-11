export type MatchPreference = "male" | "female" | "any";

export type ActivePanel = "chat" | "voice" | "video";

export type ChatMessage = {
  id: string;
  sender: "you" | "partner";
  text: string;
  time: string;
  status: "sending" | "sent" | "read";
  dateKey: string;
  attachment?: {
    name: string;
    sizeLabel: string;
    previewUrl?: string;
  };
};

export type UserProfile = {
  id: string;
  sessionId?: string;
  name: string;
  college: string;
  year: "1st" | "2nd" | "3rd" | "4th";
  gender: "male" | "female";
  interests: string[];
  avatar: string; // emoji or color code
  lastSeen?: string;
  active: boolean;
  busy?: boolean;
  typingIndicator?: boolean;
};

export type ReportReason = "inappropriate" | "harassment" | "spam" | "fake" | "other";

export type BlockedUser = {
  userId: string;
  name: string;
  blockedAt: string;
  reason?: ReportReason;
  reportDetails?: string;
};
