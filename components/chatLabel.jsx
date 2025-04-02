import { assets } from '@/assets/assets';
import Image from 'next/image';
import React from 'react';

const ChatLabel = ({ openMenu, setOpenMenu }) => {
  const handleToggleMenu = () => {
    setOpenMenu({ ...openMenu, open: !openMenu.open });
  };

  return (
    <div className="relative flex items-center justify-between p-2 text-white/80 hover:bg-white/10 rounded-lg text-sm group cursor-pointer">
      <p className="flex-1 truncate">Chat Name Here</p>
      <div className="relative">
        <div 
          className="flex items-center justify-center h-6 w-6 hover:bg-white/10 rounded-lg"
          onClick={handleToggleMenu}
        >
          <Image 
            src={assets.Dot} 
            alt="Options" 
            className="w-4 filter brightness-0 invert" 
          />
        </div>
        {openMenu.open && (
          <div className="absolute left-0 top-full mt-2 bg-gray-700 rounded-xl w-40 p-2 shadow-lg z-10">
            <div className="flex items-center gap-3 hover:bg-white/10 px-3 py-2 rounded-lg cursor-pointer">
              <Image 
                src={assets.Pencil} 
                alt="Rename" 
                className="w-3 filter brightness-0 invert" 
              />
              <p>Rename</p>
            </div>
            <div className="flex items-center gap-3 hover:bg-white/10 px-3 py-2 rounded-lg cursor-pointer">
              <Image 
                src={assets.DeleteIcon} 
                alt="Delete" 
                className="w-4 filter brightness-0 invert" 
              />
              <p>Delete</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatLabel;
