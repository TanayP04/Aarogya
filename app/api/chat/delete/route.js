import connectDB from '@/config/db';
import { getAuth } from '@clerk/nextjs/server';
import Chat from '@/models/Chat';
import { NextResponse } from 'next/server';
import mongoose from 'mongoose';

export async function DELETE(req) {
  try {
    console.log('API: DELETE /api/chat/delete called');

    // Extract user ID from Clerk auth
    const { userId } = getAuth(req);
    if (!userId) {
      console.log('Unauthorized: No userId from Clerk');
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    // Parse the chatId from URL query parameters
    const url = new URL(req.url);
    const chatId = url.searchParams.get('chatId');

    if (!chatId) {
      console.log('Bad Request: Missing chatId');
      return NextResponse.json({ success: false, error: 'Chat ID is required' }, { status: 400 });
    }

    await connectDB();

    // Optional: Log chat before deletion
    const existingChat = await Chat.findOne({ _id: chatId });
    console.log('Chat found in DB:', existingChat);

    if (!existingChat) {
      return NextResponse.json({ success: false, error: 'Chat not found' }, { status: 404 });
    }

    if (existingChat.userId !== userId) {
      console.log('Unauthorized: Chat does not belong to user');
      return NextResponse.json({ success: false, error: 'Not authorized to delete this chat' }, { status: 403 });
    }
    const result = await Chat.deleteOne({ _id: new mongoose.Types.ObjectId(chatId), userId });

    if (result.deletedCount === 0) {
      return NextResponse.json({ success: false, error: 'Chat not found or already deleted' }, { status: 404 });
    }
    return NextResponse.json({ success: true, message: 'Chat deleted successfully' }, { status: 200 });

  } catch (error) {
    console.error('Server error during chat deletion:', error);
    return NextResponse.json({ success: false, error: 'Server error' }, { status: 500 });
  }
}