// app/api/chat/deleteAll/route.js
import connectDB from '@/config/db';
import Chat from '@/models/Chat';
import { getAuth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

export async function DELETE(req) {
  try {
    const { userId } = getAuth(req);
    if (!userId) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();
    
    // Delete all chats belonging to the user
    const result = await Chat.deleteMany({ userId });

    return NextResponse.json({ 
      success: true, 
      message: "All chats deleted successfully",
      count: result.deletedCount
    }, { status: 200 });
  } catch (error) {
    console.error('Error deleting all chats:', error);
    return NextResponse.json({ 
      success: false, 
      error: error.message || "Server error" 
    }, { status: 500 });
  }
}