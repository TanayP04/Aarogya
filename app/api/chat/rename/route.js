import connectDB from '@/config/db.js';
import { getAuth } from '@clerk/nextjs/server';
import Chat from '@/models/Chat';
import { NextResponse } from 'next/server';

export async function POST(req) {
  try {
    const { userId } = getAuth(req);
    if (!userId) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const { chatId, title } = await req.json();
    
    // Check required fields
    if (!chatId) {
      return NextResponse.json({ success: false, error: "Chat ID is required" }, { status: 400 });
    }
    
    if (!title || title.trim() === '') {
      return NextResponse.json({ success: false, error: "Title is required" }, { status: 400 });
    }

    await connectDB();
    
    // Update the chat title
    const updatedChat = await Chat.findOneAndUpdate(
      { _id: chatId, userId },
      { $set: { title: title.trim() } },
      { new: true }
    );

    if (!updatedChat) {
      return NextResponse.json({ success: false, error: "Chat not found or not authorized" }, { status: 404 });
    }

    return NextResponse.json({ 
      success: true, 
      message: "Chat renamed successfully",
      chat: updatedChat 
    }, { status: 200 });
    
  } catch (error) {
    console.error('Error renaming chat:', error);
    return NextResponse.json({ success: false, error: "Server error" }, { status: 500 });
  }
}