import connectDB from "@/config/db";
import Chat from "@/models/Chat";
import { NextResponse } from "next/server";
import { getAuth } from "@clerk/nextjs/server";

export async function POST(req) {
  try {
    // Clone the request to read the body twice (once for logging, once for processing)
    const clonedReq = req.clone();
    const body = await clonedReq.json();
    console.log("Rename chat request body:", body);
    
    const auth = getAuth(req);
    console.log("Auth info:", auth);
    const { userId } = auth;

    if (!userId) {
      console.error("No userId found in request");
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const { chatId, name } = await req.json();
    console.log(`Attempting to rename chat ${chatId} to "${name}" for user ${userId}`);
    
    if (!chatId || !name) {
      return NextResponse.json({ success: false, error: "Chat ID and name are required" }, { status: 400 });
    }

    await connectDB();
    console.log("Connected to MongoDB");

    const updatedChat = await Chat.findOneAndUpdate(
      { _id: chatId, userId },
      { name },
      { new: true }
    );

    console.log("Update result:", updatedChat ? "Success" : "Failed");

    if (!updatedChat) {
      return NextResponse.json({ success: false, error: "Chat not found or not authorized" }, { status: 404 });
    }

    return NextResponse.json({ 
      success: true, 
      message: "Chat renamed successfully",
      chat: updatedChat
    }, { status: 200 });
  } catch (error) {
    console.error("Error renaming chat:", error);
    return NextResponse.json({ 
      success: false, 
      error: error.message || "Something went wrong",
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    }, { status: 500 });
  }
}