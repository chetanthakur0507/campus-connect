import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import ChatMessage from "@/lib/models/ChatMessage";

export async function GET(request: NextRequest) {
  try {
    await dbConnect();
    
    const { searchParams } = new URL(request.url);
    const userSessionId = searchParams.get('userSessionId');
    const otherSessionId = searchParams.get('otherSessionId');

    if (!userSessionId || !otherSessionId) {
      return NextResponse.json(
        { error: "userSessionId and otherSessionId required" },
        { status: 400 }
      );
    }

    // Fetch messages between the two users (both directions)
    const messages = await ChatMessage.find({
      $or: [
        {
          senderSessionId: userSessionId,
          receiverSessionId: otherSessionId,
        },
        {
          senderSessionId: otherSessionId,
          receiverSessionId: userSessionId,
        },
      ],
    })
      .sort({ timestamp: 1 })
      .limit(100);

    return NextResponse.json(messages, { status: 200 });
  } catch (error) {
    console.error("Get messages error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
