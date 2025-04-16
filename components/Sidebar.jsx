import React, { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { assets } from '@/assets/assets';
import { useClerk } from '@clerk/nextjs';
import ProfileDialog from '@/components/ProfileDialog';
import ChatLabel from '@/components/chatLabel';
import { useAppContext } from '@/context/AppContext';
import axios from 'axios';

const Sidebar = ({ expand, setExpand }) => {
  const { openSignIn } = useClerk();
  const { user, setSelectedChat } = useAppContext();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [openMenu, setOpenMenu] = useState({ id: 0, open: false });
  const [chats, setChats] = useState([]);

  const fetchChats = useCallback(async () => {
    try {
      console.log("Fetching chats...");
      const response = await axios.get('/api/chat/get');
      console.log("Fetched chats response:", response.data);
      if (response.data.success) {
        setChats(response.data.chats);
      }
    } catch (error) {
      console.error("Failed to fetch chats:", error);
    }
  }, []);

  useEffect(() => {
    fetchChats();
  }, [fetchChats]);

  const createNewChat = async () => {
    try {
      const response = await axios.post('/api/chat/create', {
        name: "New Chat",
        messages: []
      });

      if (response.data.success) {
        fetchChats();
        setSelectedChat(response.data.chat);
      }
    } catch (error) {
      console.error("Failed to create new chat:", error);
    }
  };

  const handleDeleteAllChats = async () => {
    try {
      const response = await axios.delete('/api/chat/deleteAll');
      if (response.data.success) {
        setSelectedChat(null);
        fetchChats();
      }
    } catch (error) {
      console.error("Failed to delete all chats:", error);
    }
  };

  return (
    <div className={`flex flex-col justify-between bg-[#212327] h-screen pt-7 transition-all z-50 max-md:fixed max-md:top-0 max-md:left-0 ${expand ? 'p-4 w-64' : 'md:w-20 w-0 max-md:overflow-hidden'}`}>
      {/* Main content area */}
      <div className="flex flex-col flex-1 overflow-hidden">
        {/* Logo and sidebar toggle */}
        <div className={`flex ${expand ? "flex-row gap-10" : "flex-col items-center gap-8"}`}>
          <Image
            className={expand ? "w-30" : "w-10"}
            src={expand ? assets.logodarksmall1 : assets.logodarksmall}
            alt="Logo"
            priority
          />
          <button
            className="group relative flex items-center justify-center hover:bg-gray-500/20 transition-all duration-300 h-9 w-9 aspect-square rounded-lg focus:outline-none"
            onClick={() => setExpand(!expand)}
            aria-label={expand ? 'Close sidebar' : 'Open sidebar'}
          >
            <Image
              src={assets.openSidebar}
              alt="Toggle sidebar"
              className="md:hidden filter brightness-0 invert"
              width={28}
              height={28}
            />
            <Image
              src={expand ? assets.closeSidebar : assets.openSidebar}
              alt="Toggle sidebar"
              className="hidden md:block w-7 filter brightness-0 invert"
              width={28}
              height={28}
            />
            <div className={`absolute w-max ${expand ? "left-1/2 -translate-x-1/2 top-12" : "-top-12 left-0"} opacity-0 group-hover:opacity-100 transition bg-black text-white text-sm px-3 py-2 rounded-lg shadow-lg pointer-events-none`}>
              {expand ? 'Close Sidebar' : "Open Sidebar"}
              <div className={`w-3 h-3 absolute bg-black rotate-45 ${expand ? "left-1/2 -top-1.5 -translate-x-1/2" : "left-4 -bottom-1.5"}`}></div>
            </div>
          </button>
        </div>

        {/* New Chat button */}
        <button
          onClick={createNewChat}
          aria-label="New Chat"
          className={`mt-8 flex items-center justify-center cursor-pointer text-white ${expand
            ? "bg-primary hover:opacity-90 rounded-2xl gap-2 p-2.5 w-max"
            : "group relative h-9 w-9 mx-auto hover:bg-gray-500/30 rounded-lg"
            }`}
        >
          <Image
            src={assets.newchatIcon}
            alt="New Chat"
            className="w-6 h-6 filter brightness-0 invert"
            width={24}
            height={24}
          />
          {expand ? (
            <span className="text-white text-sm font-medium">New Chat</span>
          ) : (
            <div className="absolute w-max -top-12 -right-12 opacity-0 group-hover:opacity-100 transition bg-black text-white text-sm px-3 py-2 rounded-lg shadow-lg pointer-events-none">
              New Chat
              <div className="w-3 h-3 absolute bg-black rotate-45 left-4 -bottom-1.5"></div>
            </div>
          )}
        </button>

        {/* Chat list */}
        <div className={`mt-8 text-white text-sm flex-1 overflow-hidden ${expand ? "block" : "hidden"}`}>
          <p className="my-1">Recents</p>
          <div className="h-[calc(100%-2rem)] overflow-y-auto">
            {chats.length > 0 ? (
              chats.map((chat) => (
                <ChatLabel
                  key={chat._id}
                  chat={chat}
                  openMenu={openMenu}
                  setOpenMenu={setOpenMenu}
                  refreshChats={fetchChats}  // This is crucial
                />
              ))
            ) : (
              <p className="text-white/50 text-xs italic p-2">No recent chats</p>
            )}
          </div>
        </div>
      </div>

      {/* Profile section */}
      <button
        onClick={() => setDialogOpen(true)}
        aria-label="Profile"
        className={`flex items-center mt-4 mb-6 ${expand ? 'hover:bg-white/10 rounded-lg' : 'justify-center w-full'
          } gap-3 text-white/60 text-sm p-2 cursor-pointer focus:outline-none`}
      >
        <Image
          src={assets.ProfileIcon}
          alt="Profile Icon"
          className="w-6 h-6 filter brightness-0 invert"
          width={24}
          height={24}
        />
        {expand && <span className="font-medium">Profile</span>}
      </button>

      {/* Profile Dialog */}
      <ProfileDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        onDeleteAllChats={handleDeleteAllChats}
        onLogin={openSignIn}
      />
    </div>
  );
};

export default Sidebar;