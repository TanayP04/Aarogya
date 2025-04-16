import React, { useRef, useEffect, useState } from 'react';
import Image from 'next/image';
import { assets } from '@/assets/assets';
import { useAppContext } from '@/context/AppContext';
import axios from 'axios';
import toast from 'react-hot-toast';

const ChatLabel = ({ chat, openMenu, setOpenMenu, refreshChats }) => {
  const { setSelectedChat } = useAppContext();
  const menuRef = useRef(null);
  const [isRenaming, setIsRenaming] = useState(false);
  const [newName, setNewName] = useState('');
  
  // Generate a title from chat content if no title exists
  const getChatTitle = () => {
    if (!chat) return "New Chat";
    
    // If chat has a name property and it's not empty, use it
    if (chat.name && chat.name.trim() !== "") {
      return chat.name;
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
    
    setOpenMenu({
      id: chat._id,
      open: openMenu.id === chat._id ? !openMenu.open : true
    });
  };

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setOpenMenu({ id: null, open: false });
      }
    };
    
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [setOpenMenu]);

  const selectChat = () => {
    if (!chat) return;
    setSelectedChat(chat);
  };

  const handleRename = async (e) => {
    e.stopPropagation();
    setIsRenaming(true);
    setOpenMenu({ id: null, open: false });
  };

  const submitRename = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (newName.trim() === '') return;
    
    try {
      console.log("Submitting rename request for chat:", chat._id, "with name:", newName.trim());
      
      // Show loading toast
      const toastId = toast.loading("Renaming chat...");
      
      const response = await axios.post('/api/chat/rename', { 
        chatId: chat._id, 
        name: newName.trim() 
      });
      
      console.log("Rename response:", response.data);
      
      if (response.data.success) {
        toast.success("Chat renamed successfully", { id: toastId });
        setIsRenaming(false);
        // Refresh the chats list after renaming
        if (refreshChats) refreshChats();
      } else {
        toast.error(response.data.error || "Failed to rename chat", { id: toastId });
        setIsRenaming(false);
      }
    } catch (error) {
      console.error("Failed to rename chat:", error);
      toast.error("Failed to rename chat. Please try again.");
      setIsRenaming(false);
    }
  };
  
  // In the handleDelete function
  const handleDelete = async (e) => {
    e.stopPropagation();
    try {
      console.log("Submitting delete request for chat:", chat._id);
      
      // Show loading toast
      const toastId = toast.loading("Deleting chat...");
      
      const response = await axios.post('/api/chat/delete', { 
        chatId: chat._id 
      });
      
      console.log("Delete response:", response.data);
      
      if (response.data.success) {
        toast.success("Chat deleted successfully", { id: toastId });
        setOpenMenu({ id: null, open: false });
        // Refresh the chats list after deletion
        if (refreshChats) refreshChats();
      } else {
        toast.error(response.data.error || "Failed to delete chat", { id: toastId });
      }
    } catch (error) {
      console.error("Failed to delete chat:", error.response?.data || error.message);
      toast.error("Failed to delete chat. Please try again.");
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
            onClick={(e) => setNewName(e.target.value)}
            className="w-full bg-gray-700 text-white rounded p-1 focus:outline-none focus:ring-1 focus:ring-blue-500"
            autoFocus
            onBlur={(e) => {
              // Submit the form on blur if there's a valid name
              if (newName.trim() !== '') {
                submitRename(e);
              } else {
                setIsRenaming(false);
              }
            }}
          />
        </form>
      ) : (
        <p className="flex-1 truncate">{getChatTitle()}</p>
      )}
      
      {chat && (
        <div className="relative" ref={menuRef}>
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
          {openMenu.id === chat._id && openMenu.open && (
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
                onClick={handleDelete}
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