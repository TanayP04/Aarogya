import mongoose from "mongoose";
import mlService from './ml/mlService';

const ChatSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    messages:[
    {
        role: { type: String, required: true },
        content: { type: String, required: true },
        timestamp: { type: Date, default: Date.now },
        isMLResponse: { type: Boolean, default: false }
    }
    ],
    userId: { type: String, required: true },
  },
  { timestamps: true }
);

// Add method to get ML response
ChatSchema.methods.getMLResponse = async function(query) {
  try {
    const response = await mlService.getResponse(query);
    return response;
  } catch (error) {
    console.error('Error getting ML response:', error);
    throw error;
  }
};

const Chat = mongoose.models.Chat || mongoose.model("Chat", ChatSchema);

export default Chat;
