export const maxDuration = 60;
import { getAuth } from "@clerk/nextjs/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";
import connectDB from "@/config/db";
import Chat from "@/models/Chat";

// Initialize Google Gemini client with API key
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GEMINI_API_KEY);

export async function POST(req) {
  try {
    const { userId } = getAuth(req);
    
    // Extract chatId and prompt from the request body
    const { chatId, prompt } = await req.json();
    
    if (!userId) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401 }
      );
    }
    
    await connectDB();
    const chat = await Chat.findOne({ userId, _id: chatId });
    
    if (!chat) {
      return NextResponse.json(
        { error: "Chat not found" },
        { status: 404 }
      );
    }

    const userPrompt = {
      role: "user",
      content: prompt,
      timestamp: Date.now()
    };

    chat.messages.push(userPrompt);
    
    // Call the Gemini API to get the chat completion
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
    
    // Map chat messages for Gemini API format, converting roles and ensuring content exists
    const mappedHistory = chat.messages
      .filter(msg => msg && msg.content) // Ensure message and content exist
      .map(msg => ({
        role: msg.role === "assistant" ? "model" : msg.role, // Convert assistant to model
        parts: [{ text: msg.content }]
      }));
    
    const chatSession = model.startChat({
      history: mappedHistory
    });
    
    const result = await chatSession.sendMessage(prompt);
    
    // Safely extract response text with error handling
    let responseText;
    try {
      responseText = result.response.text();
    } catch (error) {
      console.error("Error extracting response text:", error);
      responseText = "Sorry, I couldn't process your request.";
    }
    
    const assistantMessage = {
      role: "assistant",
      content: responseText,
      timestamp: Date.now()
    };

    chat.messages.push(assistantMessage);
    await chat.save();
    
    return NextResponse.json(
      { success: true, message: assistantMessage },
      { status: 200 }
    );

  } catch (error) {
    console.error("Gemini API Error:", error);
    return NextResponse.json(
      { error: error.message || "Something went wrong" },
      { status: 500 }
    );
  }
}