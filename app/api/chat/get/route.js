import connectDB from "@/config/db";
import Chat from "@/models/Chat";
import { NextResponse } from "next/server";
import { getAuth } from "@clerk/nextjs/server";

export async function GET(req) {
    try {
        const { userId } = getAuth(req);
        if (!userId) {
            return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
        }
        await connectDB();

        const chats = await Chat.find({ userId });
        
        return NextResponse.json({ success: true, chats }, { status: 200 });

        
    } catch (error) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

}