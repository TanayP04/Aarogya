import React, { useEffect } from 'react';
import Image from 'next/image';
import { assets } from '@/assets/assets';
import MarkDown from 'react-markdown';
import Prism from 'prismjs';
import { toast } from 'react-hot-toast';

function Message({ role, content }) {
  useEffect(() => {
    // Initialize syntax highlighting when content changes
    Prism.highlightAll();
  }, [content]);

  const copyMessage = () => {
    navigator.clipboard.writeText(content);
    toast.success("Message copied to clipboard!");
  };

  return (
    <div className="flex w-full justify-center mb-6 pt-5">
      <div className={`flex w-full max-w-3xl ${role === "user" ? "justify-end" : "justify-start"}`}>
        <div className={`group relative ${
          role === "user"
            ? "bg-[#414158] px-4 py-3 rounded-xl max-w-[85%] md:max-w-2xl"
            : "bg-[#2d2e35] px-4 py-3 rounded-xl max-w-[90%] md:max-w-3xl"
        }`}>
          {/* Action buttons on hover */}
          <div className={`opacity-0 group-hover:opacity-100 absolute ${
            role === "user"
              ? "-right-10 top-2"
              : "-left-10 top-2"
            } transition-all hidden sm:flex z-10`}>
            <div className="flex items-center gap-2 opacity-70">
              <button
                onClick={copyMessage}
                className="p-1 hover:bg-white/10 rounded-md transition-colors"
                aria-label="Copy message"
              >
                <Image
                  src={assets.copyIcon}
                  alt="Copy text"
                  width={16}
                  height={16}
                  className="w-4 cursor-pointer brightness-0 invert"
                />
              </button>
          
            </div>
          </div>
          
          {/* Message content */}
          {role === "user" ? (
            <div className="text-white/90 break-words text-sm md:text-base ">{content}</div>
          ) : (
            <div className="flex gap-3 items-start w-full">
              <div className="flex-shrink-0 pt-1">
                <Image
                  src={assets.LogoSmall}
                  alt="Aarogya"
                  width={36}
                  height={36}
                  className="w-8 h-8 border border-white/15 rounded-full"
                />
              </div>
              <div className="space-y-4 w-full overflow-auto pt-1 text-sm md:text-base text-white/90">
                <MarkDown>{content}</MarkDown>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Message;