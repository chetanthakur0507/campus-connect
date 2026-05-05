import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import User from "@/lib/models/User";

export async function POST(req: NextRequest) {
  try {
    await dbConnect();

    const { sessionId, active, typingIndicator } = await req.json();

    if (!sessionId) {
      return NextResponse.json({ error: "Missing sessionId" }, { status: 400 });
    }

    const user = await User.findOne({ sessionId });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    if (active !== undefined) {
      user.active = active;
    }

    if (typingIndicator !== undefined) {
      user.typingIndicator = typingIndicator;
    }

    user.lastSeen = new Date();
    await user.save();

    return NextResponse.json(
      {
        success: true,
        user: {
          id: user._id,
          sessionId: user.sessionId,
          name: user.name,
          active: user.active,
          typingIndicator: user.typingIndicator,
        },
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Update status error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
