import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { Admin } from "@/lib/models/Admin";
import bcrypt from "bcryptjs";
import { SignJWT } from "jose";

export async function POST(req: Request) {
  try {
    await connectDB();
    const { email, password } = await req.json();

    const admin = await Admin.findOne({ email });
    if (!admin) {
      return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });
    }

    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) {
      return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });
    }

    // ✅ Generate token using jose (Edge-compatible)
    const secret = new TextEncoder().encode(process.env.JWT_SECRET);
    const token = await new SignJWT({ 
      id: admin._id.toString(), 
      email 
    })
      .setProtectedHeader({ alg: "HS256" })
      .setIssuedAt()
      .setExpirationTime("7d")
      .sign(secret);

    // ✅ Return success with cookie
    const res = NextResponse.json({ success: true, message: "Login successful" });
    
    res.cookies.set("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 7 * 24 * 60 * 60, // 7 days
    });

    return res;
    
  } catch (err) {
    console.error("Login Error:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}