export const maxDuration = 60;
import { getAuth } from "@clerk/nextjs/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";
import connectDB from "@/config/db";
import Chat from "@/models/Chat";

// Initialize Google Gemini client with API key
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GEMINI_API_KEY);

// Helper function to check if a prompt is medical-related
async function isMedicalQuery(prompt) {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
    const result = await model.generateContent(
      `Determine if the following query is related to medicine, health, wellness, or medical topics. 
      Respond with only "yes" or "no".
      
      Query: "${prompt}"`
    );
    
    const response = result.response.text().toLowerCase().trim();
    return response.includes("yes");
  } catch (error) {
    console.error("Error checking medical relevance:", error);
    return true; // Default to true on error to avoid blocking legitimate queries
  }
}

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

    // Check if query is medical-related
    const isMedical = await isMedicalQuery(prompt);
    
    if (!isMedical) {
      const nonMedicalResponse = {
        role: "assistant",
        content: "I'm sorry, but I can only answer questions related to medical or health topics. Please ask a health-related question instead.",
        timestamp: Date.now()
      };
      
      // Add the user prompt and non-medical response to chat
      chat.messages.push(
        {
          role: "user",
          content: prompt,
          timestamp: Date.now()
        },
        nonMedicalResponse
      );
      
      await chat.save();
      
      return NextResponse.json(
        { success: true, message: nonMedicalResponse },
        { status: 200 }
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
    
    // Make sure history starts with a user message
    let formattedHistory = [];
    
    // Only use history if it exists and has messages
    if (mappedHistory.length > 0) {
      // Find the first user message
      const firstUserIndex = mappedHistory.findIndex(msg => msg.role === "user");
      
      if (firstUserIndex !== -1) {
        // Use history starting from the first user message
        formattedHistory = mappedHistory.slice(firstUserIndex);
      }
    }
    
    // Create a new chat session with the properly formatted history
    const chatSession = model.startChat({
      history: formattedHistory
    });
    
    // Include medical context in the prompt
    const medicalPrompt = 
      "You are Aarogya, an AI medical assistant. Only answer questions related to medicine, health, and wellness. " +
      "Always include appropriate disclaimers about consulting healthcare professionals for proper diagnosis and treatment. " +
      "User question: " + prompt;
    
    const result = await chatSession.sendMessage(medicalPrompt);
    
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