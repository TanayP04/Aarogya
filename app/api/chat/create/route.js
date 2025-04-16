import connectDB from "@/config/db";
import Chat from "@/models/Chat";
import { NextResponse } from "next/server";
import { getAuth } from "@clerk/nextjs/server";

export async function POST(req) {
   try {
        const { userId } = getAuth(req);
        
        if (!userId) {
            return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
        }

        // Make sure we're connecting to the database before creating the chat
        await connectDB();
        
        const { name, messages } = await req.json();

        // Ensure name is provided and not empty
        if (!name || name.trim() === "") {
            return NextResponse.json({ 
                success: false, 
                error: "Chat name is required" 
            }, { status: 400 });
        }
        
        const newChat = new Chat({
            userId,
            name: name.trim(),
            messages: messages || []
        });

        await newChat.save();

        return NextResponse.json({ 
            success: true, 
            message: "Chat created successfully",
            chat: newChat
        }, { status: 201 });
   }
   catch (error) {
        console.error("Error creating chat:", error);
        return NextResponse.json({ 
            success: false, 
            error: "Failed to create chat" 
        }, { status: 500 });
   }
}