import connectDB from "@/config/db";
import Chat from "@/models/Chat";
import { NextResponse } from "next/server";
import { getAuth } from "@clerk/nextjs/server";

export async function POST(req) {
    try{
        const {userId} = getAuth(req);
        if(!userId){
            return NextResponse.json({success:false,error:"Unauthorized"}, {status:401})
        }

        const chatData={
            userId,
            messages:[],
            name:"New Chat"
        }

        await connectDB();
        await Chat.create(chatData);

        return NextResponse.json({success:true,message:"Chat Created"}, {status:200})
    }
    catch (error) {
        return NextResponse.json({error:"Unauthorized"}, {status:401})
    }
}
