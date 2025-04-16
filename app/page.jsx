'use client';
import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { assets } from '@/assets/assets';
import Sidebar from "@/components/Sidebar";
import SearchBox from "@/components/SearchBox";
import Message from "@/components/Message";
import { useAppContext } from "@/context/AppContext";

export default function Home() {
  const [expand, setExpand] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [currentLanguageIndex, setCurrentLanguageIndex] = useState(0);
  const { selectedChat, createNewChat } = useAppContext();
  const containerRef = useRef(null);

  const indianLanguages = [
    { language: "English", text: "Welcome to Aarogya" },
    { language: "Hindi", text: "आरोग्य में आपका स्वागत है" },
    { language: "Marathi", text: "आरोग्यामध्ये आपले स्वागत आहे" },
  ];

  // Handle sidebar visibility based on screen size
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setExpand(false);
      } else if (window.innerWidth >= 1280) {
        // Auto-expand on larger screens
        setExpand(true);
      }
    };

    window.addEventListener('resize', handleResize);
    handleResize(); // Initialize on load

    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentLanguageIndex((prev) => (prev + 1) % indianLanguages.length);
    }, 3000);
    return () => clearInterval(interval);
  }, [indianLanguages.length]);

  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTo({ 
        behavior: 'smooth', 
        top: containerRef.current.scrollHeight 
      });
    }
  }, [selectedChat?.messages]);

  const handleMobileNewChat = () => {
    createNewChat();
    // After creating a new chat, close the sidebar on mobile
    if (window.innerWidth < 768) {
      setExpand(false);
    }
  };

  return (
    <div className="flex h-screen w-full overflow-hidden bg-gradient-to-br from-[#1a1b1e] to-[#2d2e32]">
      {/* Overlay for mobile when sidebar is open */}
      {expand && (
        <div
          className="fixed inset-0 bg-black/50 z-30 md:hidden"
          onClick={() => setExpand(false)}
          aria-hidden="true"
        />
      )}

      {/* Sidebar component */}
      <div className="h-screen z-40">
        <Sidebar expand={expand} setExpand={setExpand} />
      </div>

      {/* Main content area */}
      <div
        className={`flex flex-col h-full flex-1 overflow-hidden transition-all duration-300 text-white ${
          expand ? 'md:ml-5' : 'md:ml-20'
        }`}
      >
        {/* Mobile header */}
        <div className="sticky top-0 z-20 w-full flex items-center justify-between p-3
                      lg:hidden bg-gradient-to-b from-[#1a1b1e] to-transparent text-white">
          <button
            onClick={() => setExpand(!expand)}
            className="p-2 rounded-full hover:bg-white/10 transition-colors"
            aria-label="Toggle sidebar"
          >
            <Image
              src={assets.openSidebar}
              alt="Menu"
              className="w-6 h-6 filter brightness-0 invert"
            />
          </button>

          <div className="flex items-center justify-center">
            <Image
              src={assets.LogoSmall}
              alt="Aarogya"
              className="w-7 h-7"
            />
          </div>

          <button
            onClick={handleMobileNewChat}
            className="p-2 rounded-full hover:bg-white/10 transition-colors text-white bg-[#1a1b1e]/80"
            aria-label="New chat"
          >
            <Image
              src={assets.newchatIcon}
              alt="New Chat"
              className="w-6 h-6 filter brightness-0 invert"
            />
          </button>
        </div>

        {/* Messages container */}
        <div 
          ref={containerRef}
          className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-transparent px-4 md:px-6 pb-32"
        >
          {!selectedChat || (selectedChat.messages && selectedChat.messages.length === 0) ? (
            // Welcome screen
            <div className="flex flex-col items-center justify-center h-full px-4 py-6">
              {/* Logo animation */}
              <div className="mb-8 animate-pulse">
                <div className="w-24 h-24 md:w-28 md:h-28 rounded-full bg-teal-500/20 flex items-center justify-center">
                  <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-teal-500/40 flex items-center justify-center">
                    <div className="w-12 h-12 md:w-14 md:h-14 rounded-full bg-teal-500 flex items-center justify-center">
                      <Image
                        src={assets.Icon}
                        alt="Aarogya Logo"
                        className="w-8 h-8 md:w-10 md:h-10"
                        width={40}
                        height={40}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Static language display instead of Type Animation */}
              <div className="mb-6 h-16 md:h-20 flex items-center justify-center w-full">
                <h1 
                  aria-label="Welcome message"
                  className="text-2xl md:text-3xl lg:text-4xl font-bold text-center bg-gradient-to-r from-teal-400 to-blue-500 text-transparent bg-clip-text"
                >
                  {indianLanguages[currentLanguageIndex].text}
                </h1>
              </div>

              {/* Description */}
              <div className="max-w-md lg:max-w-lg backdrop-blur-sm px-4">
                <p className="text-sm md:text-base text-center text-white/80 leading-relaxed">
                  Aarogya is your AI-powered medical assistant designed to provide reliable health information,
                  symptom checking, and preliminary medical guidance. Our chatbot helps you understand potential
                  health concerns while always recommending to consult with certified healthcare professionals
                  for proper diagnosis and treatment.
                </p>
              </div>
            </div>
          ) : (
            // Chat messages display
            <div className="flex flex-col items-center w-full mt-20 pb-4">
              <p className="fixed top-8 z-10 border border-transparent hover:border-gray-500/50 py-1 px-3 rounded-lg font-semibold bg-[#1a1b1e]/80 backdrop-blur-sm">
                {selectedChat.name}
              </p>
              
              {selectedChat.messages && selectedChat.messages.map((message, index) => (
                <Message
                  key={index}
                  role={message.role}
                  content={message.content}
                />
              ))}
              
              {isLoading && (
                <div className="flex items-start max-w-3xl w-full py-3 px-4">
                  <Image 
                    src={assets.LogoSmall} 
                    alt="logo" 
                    className="w-7 h-7 border border-white/15 rounded-full mr-3" 
                  />
                  <div className="loader flex justify-center gap-1 items-center">
                    <div className="w-1 h-1 rounded-full bg-white animate-bounce"></div>
                    <div className="w-1 h-1 rounded-full bg-white animate-bounce" 
                         style={{ animationDelay: "0.1s" }}></div>
                    <div className="w-1 h-1 rounded-full bg-white animate-bounce"
                         style={{ animationDelay: "0.2s" }}></div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Search input container - fixed at bottom */}
        <div className="fixed left-0 right-0 bottom-0 z-30 bg-gradient-to-t from-[#1a1b1e] via-[#1a1b1e]/95 to-transparent pt-6 pb-4">
          <div className={`transition-all duration-300 px-4 md:px-6 ${expand ? 'md:ml-80' : 'md:ml-20'}`}>
            <SearchBox isLoading={isLoading} setIsLoading={setIsLoading} />
            <p className="text-xs text-white/40 text-center mt-5">
              AI-generated, for reference only
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}