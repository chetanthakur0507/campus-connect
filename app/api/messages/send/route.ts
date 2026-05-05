import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import ChatMessage from "@/lib/models/ChatMessage";
import User from "@/lib/models/User";

export async function POST(request: NextRequest) {
  try {
    await dbConnect();
    
    const { senderSessionId, receiverSessionId, text } = await request.json();
    
    if (!senderSessionId || !receiverSessionId || !text) {
      return NextResponse.json(
        { error: "senderSessionId, receiverSessionId, and text required" },
        { status: 400 }
      );
    }

    // Get sender info
    const sender = await User.findOne({ sessionId: senderSessionId });
    if (!sender) {
      return NextResponse.json(
        { error: "Sender not found" },
        { status: 404 }
      );
    }

    // Create and save message
    const message = new ChatMessage({
      senderSessionId,
      receiverSessionId,
      senderName: sender.name,
      senderAvatar: sender.avatar,
      text,
      timestamp: new Date(),
      status: 'sent',
    });

    await message.save();

    return NextResponse.json(message, { status: 201 });
  } catch (error) {
    console.error("Send message error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
