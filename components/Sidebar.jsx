import React, { useState } from 'react';
import Image from 'next/image';
import { assets } from '@/assets/assets';
import { useClerk } from '@clerk/nextjs';
import ProfileDialog from '@/components/ProfileDialog';
import ChatLabel from '@/components/chatLabel';
import { useAppContext } from '@/context/AppContext';

const Sidebar = ({ expand, setExpand }) => {
  const { openSignIn } = useClerk();
  const { user } = useAppContext();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [openMenu, setOpenMenu] = useState({ id: 0, open: false });

  return (
    <div className={`flex flex-col justify-between bg-[#212327] pt-7 transition-all z-50 max-md:absolute max-md:h-screen ${
      expand ? 'p-4 w-64' : 'md:w-20 w-0 max-md:overflow-hidden'
    }`}>
      <div>
        <div className={`flex ${expand ? "flex-row gap-10" : "flex-col items-center gap-8"}`}>
          <Image
            className={expand ? "w-30" : "w-10"}
            src={expand ? assets.logodarksmall1 : assets.logodarksmall}
            alt="Logo"
          />
          <div
            className="group relative flex items-center justify-center hover:bg-gray-500/20 transition-all duration-300 h-9 w-9 aspect-square rounded-lg cursor-pointer"
            onClick={() => setExpand(!expand)}
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
            <div className={`absolute w-max ${
              expand ? "left-1/2 -translate-x-1/2 top-12" : "-top-12 left-0"
            } opacity-0 group-hover:opacity-100 transition bg-black text-white text-sm px-3 py-2 rounded-lg shadow-lg pointer-events-none`}>
              {expand ? 'Close Sidebar' : "Open Sidebar"}
              <div className={`w-3 h-3 absolute bg-black rotate-45 ${
                expand ? "left-1/2 -top-1.5 -translate-x-1/2" : "left-4 -bottom-1.5"
              }`}>
              </div>
            </div>
          </div>
        </div>

        <button className={`mt-8 flex items-center justify-center cursor-pointer text-white ${
          expand
            ? "bg-primary hover:opacity-90 rounded-2xl gap-2 p-2.5 w-max"
            : "group relative h-9 w-9 mx-auto hover:bg-gray-500/30 rounded-lg"
        }`}>
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

        <div className={`mt-8 text-white text-sm ${expand ? "block" : "hidden"}`}>
          <p className="my-1">Recents</p>
          <ChatLabel openMenu={openMenu} setOpenMenu={setOpenMenu} />
        </div>
      </div>

      <div
        onClick={() => setDialogOpen(true)}
        className={`flex items-center bottom-3 ${
          expand ? 'hover:bg-white/10 rounded-lg' : 'justify-center w-full'
        } gap-3 text-white/60 text-sm p-2 mt-2 cursor-pointer `}
      >
        <Image 
          src={assets.ProfileIcon || "/icons/profile.svg"} 
          alt="Profile Icon" 
          className="w-6 h-6 filter brightness-0 invert bottom-5" 
          width={24} 
          height={24} 
        />
        {expand && <span>My Profile</span>}
      </div>

      {/* Profile Dialog Component */}
      <ProfileDialog 
        open={dialogOpen} 
        onClose={() => setDialogOpen(false)} 
        onDeleteAllChats={() => console.log("Delete all chats")} 
      />
    </div>
  );
};

export default Sidebar;
