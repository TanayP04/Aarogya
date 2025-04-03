import Chat from "@/models/Chat";
import { NextResponse } from "next/server";
import { getAuth } from "@clerk/nextjs/server";

export async function POST(req) {
   try{
        const { userId } = getAuth(req);
        if (!userId) {
            return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
        }

        const { chatId, name } = await req.json();

        await connectDB();

         await Chat.findByIdAndUpdate({_id:chatId,userId}, { name });

        return NextResponse.json({ success: true, message: "Chat renamed successfully" }, { status: 200 });
   }
    catch (error) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
}