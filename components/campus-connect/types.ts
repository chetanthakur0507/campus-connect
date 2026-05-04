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
