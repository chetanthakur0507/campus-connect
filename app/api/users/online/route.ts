import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import User from "@/lib/models/User";

export async function GET(req: NextRequest) {
  try {
    await dbConnect();

    // Get all active users (online)
    const users = await User.find({ active: true }).select(
      "sessionId name college year gender interests avatar active typingIndicator busy currentChatWith"
    );

    // Format the response
    const formattedUsers = users.map((user: any) => ({
      id: user._id.toString(),
      sessionId: user.sessionId,
      name: user.name,
      college: user.college,
      year: user.year,
      gender: user.gender,
      interests: user.interests || [],
      avatar: user.avatar,
      active: user.active,
      busy: user.busy || false,
      typingIndicator: user.typingIndicator || false,
    }));

    return NextResponse.json(
      {
        success: true,
        users: formattedUsers,
        count: formattedUsers.length,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Get online users error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
