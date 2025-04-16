import React, { useRef, useEffect, useState } from 'react';
import Image from 'next/image';
import { assets } from '@/assets/assets';
import { useAppContext } from '@/context/AppContext';
import axios from 'axios';

const ChatLabel = ({ chat, activeMenuId, setActiveMenuId, refreshChats }) => {
  const { setSelectedChat } = useAppContext();
  const menuRef = useRef(null);
  const [isRenaming, setIsRenaming] = useState(false);
  const [newName, setNewName] = useState('');
  
  // Generate a title from chat content if no title exists
  const getChatTitle = () => {
    if (!chat) return "New Chat";
    
    // If chat has a title property and it's not empty, use it
    if (chat.title && chat.title.trim() !== "") {
      return chat.title;
    }
    
    // Otherwise try to get first message content or use default
    if (chat.messages && chat.messages.length > 0) {
      const firstUserMessage = chat.messages.find(msg => msg.role === "user");
      if (firstUserMessage && firstUserMessage.content) {
        // Return truncated content as title
        return firstUserMessage.content.substring(0, 25) + (firstUserMessage.content.length > 25 ? "..." : "");
      }
    }
    
    // Default fallback
    return "New Chat";
  };

  useEffect(() => {
    if (chat) {
      setNewName(getChatTitle());
    }
  }, [chat]);

  const handleToggleMenu = (e) => {
    e.stopPropagation();
    if (!chat) return;
    
    // Toggle the menu for this chat
    setActiveMenuId(activeMenuId === chat._id ? null : chat._id);
  };

  const selectChat = () => {
    if (!chat) return;
    setSelectedChat(chat);
  };

  const handleRename = async (e) => {
    e.stopPropagation();
    setIsRenaming(true);
    setActiveMenuId(null); 
    setNewName(getChatTitle()); 
  };

  const handleDeleteSingleChat = async (e) => { 
    e.stopPropagation();
    if (!chat) return;
    
    try {
      console.log("Attempting to delete chat with ID:", chat._id);
      
      // Method 1: Send chatId as a URL parameter (matching your DELETE handler)
      const response = await axios.delete(`/api/chat/delete?chatId=${chat._id}`);
      
      console.log("Delete response:", response.data);
      
      if (response.data && response.data.success) {
        // Refresh the chats list after deletion
        if (refreshChats) refreshChats();
      }
    } catch (error) {
      console.error("Failed to delete chat:", error);
      if (error.response) {
        console.error("Response data:", error.response.data);
        console.error("Response status:", error.response.status);
      }
    }
  };

  const submitRename = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (newName.trim() === '') return;
    
    try {
      console.log("Submitting rename for chat:", chat._id, "New name:", newName.trim());
      
      // First, try with POST (Next.js API route)
      const response = await axios.post('/api/chat/rename', { 
        chatId: chat._id, 
        title: newName.trim() // Changed from 'name' to 'title' to match potential backend expectation
      });
      
      console.log("Rename response:", response.data);
      
      if (response.data && response.data.success) {
        setIsRenaming(false);
        // Refresh the chats list after renaming
        if (refreshChats) refreshChats();
      } else {
        console.error("Rename not successful:", response.data);
        setIsRenaming(false);
      }
    } catch (error) {
      console.error("Failed to rename chat:", error);
      if (error.response) {
        console.error("Response data:", error.response.data);
        console.error("Response status:", error.response.status);
      }
      setIsRenaming(false);
    }
  };

  return (
    <div 
      className="relative flex items-center justify-between p-2.5 text-white/80 hover:bg-white/10 rounded-lg text-sm group cursor-pointer w-full"
      onClick={isRenaming ? undefined : selectChat}
    >
      {isRenaming ? (
        <form onSubmit={submitRename} className="flex-1" onClick={e => e.stopPropagation()}>
          <input
            type="text"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            className="w-full bg-gray-700 text-white rounded p-1 focus:outline-none focus:ring-1 focus:ring-blue-500"
            autoFocus
            onBlur={submitRename} // Also submit on blur
          />
        </form>
      ) : (
        <p className="flex-1 truncate">{getChatTitle()}</p>
      )}
      
      {chat && (
        <div className="relative chat-menu" ref={menuRef}>
          <div
            className="flex items-center justify-center h-6 w-6 hover:bg-white/10 rounded-lg"
            onClick={handleToggleMenu}
          >
            <Image
              src={assets.Dot}
              alt="Options"
              className="w-4 filter brightness-0 invert"
              width={16}
              height={16}
            />
          </div>
          {activeMenuId === chat._id && (
            <div className="absolute right-0 top-full mt-2 bg-gray-700 rounded-xl w-40 p-2 shadow-lg z-10">
              <div 
                className="flex items-center gap-3 hover:bg-white/10 px-3 py-2 rounded-lg cursor-pointer"
                onClick={handleRename}
              >
                <Image
                  src={assets.Pencil}
                  alt="Rename"
                  className="w-3 filter brightness-0 invert"
                  width={12}
                  height={12}
                />
                <p>Rename</p>
              </div>
              <div 
                className="flex items-center gap-3 hover:bg-white/10 px-3 py-2 rounded-lg cursor-pointer text-red-400"
                onClick={handleDeleteSingleChat}
              >
                <Image
                  src={assets.DeleteIcon}
                  alt="Delete"
                  className="w-4 filter brightness-0 invert opacity-75"
                  width={16}
                  height={16}
                />
                <p>Delete</p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ChatLabel;