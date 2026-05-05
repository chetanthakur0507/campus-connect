import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import User from "@/lib/models/User";

export async function POST(req: NextRequest) {
  try {
    await dbConnect();

    const { name, year, gender, interests, avatar, sessionId } = await req.json();

    if (!name || !year || !gender || !sessionId || !avatar) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Check if session already exists
    let user = await User.findOne({ sessionId });

    if (user) {
      // Update existing user
      user.active = true;
      user.lastSeen = new Date();
      user.name = name;
      user.year = year;
      user.gender = gender;
      user.interests = interests || [];
      user.avatar = avatar;
      await user.save();
    } else {
      // Create new user
      user = new User({
        sessionId,
        name,
        year,
        gender,
        interests: interests || [],
        avatar,
        active: true,
        college: "Delhi University",
      });
      await user.save();
    }

    return NextResponse.json(
      {
        success: true,
        user: {
          id: user._id,
          sessionId: user.sessionId,
          name: user.name,
          college: user.college,
          year: user.year,
          gender: user.gender,
          interests: user.interests,
          avatar: user.avatar,
          active: user.active,
        },
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Create profile error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
