import connectDB from '@/config/db';
import Chat from '@/models/Chat';
import { getAuth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

export async function POST(req) {
  try {
    // Clone the request to read the body twice
    const clonedReq = req.clone();
    const body = await clonedReq.json();
    console.log("Delete chat request body:", body);
    
    const auth = getAuth(req);
    console.log("Auth info:", auth);
    const { userId } = auth;

    if (!userId) {
      console.error("No userId found in request");
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const { chatId } = await req.json();
    console.log(`Attempting to delete chat ${chatId} for user ${userId}`);
    
    if (!chatId) {
      return NextResponse.json({ success: false, error: "Chat ID is required" }, { status: 400 });
    }

    await connectDB();
    console.log("Connected to MongoDB");
    
    const result = await Chat.findOneAndDelete({ _id: chatId, userId });
    console.log("Delete result:", result ? "Success" : "Failed");

    if (!result) {
      return NextResponse.json({ success: false, error: "Chat not found or not authorized" }, { status: 404 });
    }

    return NextResponse.json({ 
      success: true, 
      message: "Chat deleted successfully" 
    }, { status: 200 });
  } catch (error) {
    console.error('Error deleting chat:', error);
    return NextResponse.json({ 
      success: false, 
      error: error.message || "Server error",
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    }, { status: 500 });
  }
}