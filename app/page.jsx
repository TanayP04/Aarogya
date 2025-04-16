'use client';
import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { assets } from '@/assets/assets';
import Sidebar from "@/components/Sidebar";
import Message from "@/components/Message";
import { useAppContext } from "@/context/AppContext";
import axios from 'axios';
import toast from 'react-hot-toast';

export default function Home() {
  const [expand, setExpand] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [currentLanguageIndex, setCurrentLanguageIndex] = useState(0);
  const containerRef = useRef(null);
  const [prompt, setPrompt] = useState("");
  const {
    user,
    chat,
    setChat,
    selectedChat,
    setSelectedChat,
    createNewChat
  } = useAppContext();

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

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendPrompt(e);
    }
  };
  
  const sendPrompt = async (e) => {
    e.preventDefault();
    const promptCopy = prompt;
    
    try {
      if (!user) {
        return toast.error("Please login to continue");
      }
      
      if (isLoading) {
        return toast.error("Please wait for the response");
      }
      
      // Handle case when no chat is selected
      let currentChat = selectedChat;
      if (!currentChat) {
        try {
          setIsLoading(true);
          // Call API to create a new chat
          const { data } = await axios.post('/api/chat/create', { title: prompt.substring(0, 30) });
          if (data.success) {
            // Update chat list with new chat
            const newChat = data.chat;
            setChat(prevChats => [...prevChats, newChat]);
            // Select the newly created chat
            setSelectedChat(newChat);
            currentChat = newChat;
          } else {
            toast.error(data.message || "Failed to create new chat");
            setIsLoading(false);
            return;
          }
        } catch (error) {
          console.error(error);
          toast.error("Error creating new chat");
          setIsLoading(false);
          return;
        }
      }
      
      setIsLoading(true);
      setPrompt("");
      
      const userPrompt = {
        role: "user",
        content: promptCopy,
        timestamp: Date.now()
      };
      
      // Safely update selected chat state
      if (currentChat && currentChat._id) {
        // First update the UI optimistically
        const updatedChat = {
          ...currentChat,
          messages: [...currentChat.messages, userPrompt]
        };
        
        // Update chat list
        setChat(prevChats => 
          prevChats.map(chat => 
            chat._id === currentChat._id 
              ? updatedChat 
              : chat
          )
        );
        
        // Update selected chat
        setSelectedChat(updatedChat);
        
        // Call API to get AI response
        try {
          const { data } = await axios.post('/api/chat/ai', { 
            chatId: currentChat._id, 
            prompt: promptCopy
          });
          
          if (data.success) {
            // Extract the message content correctly based on your API response structure
            const assistantMessage = data.message || {}; // Using data.message not data.data
            const messageContent = assistantMessage.content || "Sorry, I couldn't process your request.";
            
            // Create typing effect for assistant's response
            const messageTokens = messageContent.split(" ");
            let typingMessage = {
              role: "assistant",
              content: "",
              timestamp: Date.now()
            };
            
            // Set initial empty message
            setSelectedChat(prev => {
              if (!prev) return prev;
              return {
                ...prev, 
                messages: [...prev.messages, typingMessage]
              };
            });
            
            // Also update the chat list
            setChat(prevChats => 
              prevChats.map(chat => 
                chat._id === currentChat._id 
                  ? { 
                      ...chat, 
                      messages: [...chat.messages, typingMessage] 
                    } 
                  : chat
              )
            );
            
            // Gradually update with typing effect
            for (let i = 0; i < messageTokens.length; i++) {
              setTimeout(() => {
                const updatedContent = messageTokens.slice(0, i + 1).join(" ");
                
                setSelectedChat(prev => {
                  if (!prev) return prev;
                  
                  const updatedMessages = [
                    ...prev.messages.slice(0, -1),
                    {
                      ...typingMessage,
                      content: updatedContent
                    }
                  ];
                  return {...prev, messages: updatedMessages};
                });
                
                // Also update the chat list
                setChat(prevChats => 
                  prevChats.map(chat => {
                    if (chat._id !== currentChat._id) return chat;
                    
                    const updatedMessages = [
                      ...chat.messages.slice(0, -1),
                      {
                        ...typingMessage,
                        content: updatedContent
                      }
                    ];
                    return {...chat, messages: updatedMessages};
                  })
                );
              }, i * 100);
            }
          } else {
            toast.error(data.message || "Error receiving AI response");
            setPrompt(promptCopy);
          }
        } catch (error) {
          console.error("API error:", error);
          
          // Remove the user's message if API fails
          setSelectedChat(prev => {
            if (!prev) return prev;
            return {
              ...prev,
              messages: prev.messages.slice(0, -1)
            };
          });
          
          setChat(prevChats => 
            prevChats.map(chat => 
              chat._id === currentChat._id 
                ? { 
                    ...chat, 
                    messages: chat.messages.slice(0, -1) 
                  } 
                : chat
            )
          );
          
          toast.error("Error sending message");
          setPrompt(promptCopy);
        }
      } else {
        toast.error("Chat selection issue. Please try again.");
      }
    } catch (error) {
      console.error("General error:", error);
      toast.error("Error sending message");
      setPrompt(promptCopy);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Dynamically adjust textarea rows based on content
  const handleTextAreaChange = (e) => {
    setPrompt(e.target.value);
    
    // Reset height to auto to properly calculate scrollHeight
    e.target.style.height = 'auto';
    
    // Set the height based on scrollHeight, but cap it
    const newHeight = Math.min(e.target.scrollHeight, 120); // Max height of 120px
    e.target.style.height = `${newHeight}px`;
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
        <Sidebar expand={expand} setExpand={setExpand}  />
      </div>

      {/* Main content area */}
      <div
        className={`flex flex-col h-full flex-1 overflow-hidden transition-all duration-300 text-white ${
          expand ? 'md:ml-5' : 'md:ml-20'
        }`}
      >
        {/* Mobile header */}
    {/* Mobile header */}
<div className="sticky top-0 z-20 w-full flex items-center justify-between p-3
              lg:hidden bg-gradient-to-b from-[#1a1b1e] to-transparent text-white">
  <button
    onClick={() => setExpand(!expand)}
    className="p-2 rounded-full hover:bg-white/10 transition-colors group relative"
    aria-label="Toggle sidebar"
  >
    <Image
      src={assets.openSidebar}
      alt="Menu"
      className="w-6 h-6 filter brightness-0 invert"
    />
    {/* Add tooltip here */}
    <div className="absolute w-max bg-black text-white text-sm px-3 py-2 rounded-lg shadow-lg pointer-events-none transition-opacity duration-200 opacity-0 group-hover:opacity-100 left-0 top-full mt-2">
      Toggle Sidebar
      <div className="absolute w-3 h-3 bg-black rotate-45 top-0 left-4 -translate-y-1/2"></div>
    </div>
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
    className="p-2 rounded-full hover:bg-white/10 transition-colors text-white bg-[#1a1b1e]/80 group relative"
    aria-label="New chat"
  >
    <Image
      src={assets.newchatIcon}
      alt="New Chat"
      className="w-6 h-6 filter brightness-0 invert"
    />
    {/* Add tooltip here */}
    <div className="absolute w-max bg-black text-white text-sm px-3 py-2 rounded-lg shadow-lg pointer-events-none transition-opacity duration-200 opacity-0 group-hover:opacity-100 right-0 top-full mt-2">
      New Chat
      <div className="absolute w-3 h-3 bg-black rotate-45 top-0 right-4 -translate-y-1/2"></div>
    </div>
  </button>
</div>

        {/* Messages container */}
        <div 
          ref={containerRef}
          className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-transparent px-4 md:px-6 pb-32"
        >
          {!selectedChat || (selectedChat.messages && selectedChat.messages.length === 0) ? (
            // Welcome screen
            <div className="flex flex-col items-center justify-center h-full px-4 md:px-8 py-6">
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
              <div className="max-w-md lg:max-w-lg backdrop-blur-sm px-6 py-4 rounded-xl bg-white/5">
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
            <div className="flex flex-col items-center w-full mt-16 md:mt-20 pb-4">
              <p className="fixed top-4 md:top-8 z-10 border border-transparent hover:border-gray-500/50 py-1 px-3 rounded-lg font-semibold bg-[#1a1b1e]/80 backdrop-blur-sm">
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

        {/* Input container - fixed at bottom */}
        <div className="fixed left-0 right-0 bottom-0 z-30 bg-gradient-to-t from-[#1a1b1e] via-[#1a1b1e]/95 to-transparent pt-6 pb-4">
          <div className={`mx-auto flex flex-col items-center transition-all duration-300 px-4 md:px-6 ${expand ? 'md:ml-64' : 'md:ml-20'}`}>
            <form 
              onSubmit={sendPrompt} 
              className="w-full max-w-3xl bg-[#404045] p-2 sm:p-3 rounded-xl sm:rounded-2xl shadow-lg"
            >
              <div className="flex items-center">
                <textarea
                  className="outline-none w-full min-h-[40px] max-h-[120px] resize-none overflow-y-auto
                        bg-transparent text-white placeholder-gray-400 text-sm sm:text-base
                        py-1.5 px-2 sm:px-3"
                  placeholder="Message Aarogya"
                  required
                  onChange={handleTextAreaChange}
                  onKeyDown={handleKeyDown}
                  value={prompt}
                  style={{ height: 'auto' }}
                />
                <div className="flex-shrink-0 ml-1 sm:ml-2">
                  <button
                    type="submit"
                    className={`${prompt ? "bg-teal-500" : "bg-[#71717a]"} 
                            rounded-full p-1.5 sm:p-2 cursor-pointer transition-colors
                            text-white hover:bg-opacity-90 flex items-center justify-center
                            w-8 h-8 sm:w-10 sm:h-10`}
                    aria-label="Send"
                    disabled={!prompt || isLoading}
                  >
                    <Image
                      src={assets.ArrowUp}
                      alt="Send"
                      className="w-3.5 h-3.5 sm:w-4 sm:h-4 aspect-square filter brightness-0 invert"
                    />
                  </button>
                </div>
              </div>
            </form>
            <p className="text-xs text-white/40 text-center mt-3">
              AI-generated, for reference only
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}