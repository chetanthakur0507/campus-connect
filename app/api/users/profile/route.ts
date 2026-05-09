import { connectDB } from "@/lib/mongodb";
import User from "@/lib/models/User";

export async function POST(req: Request) {
  try {
    await connectDB();

    const { sessionId } = await req.json();

    if (!sessionId) {
      return Response.json(
        { error: "Session ID is required" },
        { status: 400 }
      );
    }

    const user = await User.findOne({ sessionId });

    if (!user) {
      return Response.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    return Response.json({
      id: user._id.toString(),
      sessionId: user.sessionId,
      name: user.name,
      college: user.college,
      year: user.year,
      gender: user.gender,
      interests: user.interests || [],
      avatar: user.avatar,
      active: user.active,
    });
  } catch (error) {
    console.error("Get user error:", error);
    return Response.json(
      { error: "Failed to get user" },
      { status: 500 }
    );
  }
}
