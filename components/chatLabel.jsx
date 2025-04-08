import React, { useRef, useEffect } from 'react';
import Image from 'next/image';
import { assets } from '@/assets/assets';
import { useAppContext } from '@/context/AppContext';

const ChatLabel = ({ chat, openMenu, setOpenMenu }) => {
  const { setSelectedChat } = useAppContext();
  const menuRef = useRef(null);
  
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

  return (
    <div 
      className="relative flex items-center justify-between p-2.5 text-white/80 hover:bg-white/10 rounded-lg text-sm group cursor-pointer w-full"
      onClick={selectChat}
    >
      <p className="flex-1 truncate">{getChatTitle()}</p>
      
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
              <div className="flex items-center gap-3 hover:bg-white/10 px-3 py-2 rounded-lg cursor-pointer">
                <Image
                  src={assets.Pencil}
                  alt="Rename"
                  className="w-3 filter brightness-0 invert"
                  width={12}
                  height={12}
                />
                <p>Rename</p>
              </div>
              <div className="flex items-center gap-3 hover:bg-white/10 px-3 py-2 rounded-lg cursor-pointer text-red-400">
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