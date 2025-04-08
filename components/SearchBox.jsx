import React, { useState } from 'react';
import Image from 'next/image';
import { assets } from '@/assets/assets';
import { useAppContext } from '@/context/AppContext';
import axios from 'axios';
import { toast } from 'react-hot-toast';

const SearchBox = ({ isLoading, setIsLoading }) => {
  const [prompt, setPrompt] = useState("");
  const {
    user,
    chat,
    setChat,
    selectedChat,
    setSelectedChat,
    createNewChat
  } = useAppContext();
  
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
  
  return (
    <form 
      onSubmit={sendPrompt} 
      className={`w-full ${selectedChat?.messages?.length > 0 ? "mx-auto md:ml-110" : ""} 
                max-w-full sm:max-w-lg md:max-w-xl lg:max-w-2xl xl:max-w-3xl
                bg-[#404045] p-2 sm:p-3 md:p-4 rounded-2xl sm:rounded-3xl 
                transition-all fixed bottom-8 sm:bottom-10 
                md:bottom-12 left-0 right-0 mx-auto px-4 sm:px-4 z-40 shadow-lg `}
    >
      <div className="flex items-center">
        <textarea
          className="outline-none w-full resize-none overflow-hidden break-words 
                    bg-transparent text-white placeholder-gray-400 text-sm sm:text-base"
          rows={3}
          placeholder="Message Aarogya"
          required
          onChange={(e) => setPrompt(e.target.value)}
          onKeyDown={handleKeyDown}
          value={prompt}
        />
        <div className="flex-shrink-0 ml-1 sm:ml-2">
          <button
            type="submit"
            className={`${prompt ? "bg-primary" : "bg-[#71717a]"} 
                      rounded-full p-1.5 sm:p-2 cursor-pointer transition-colors
                      text-white hover:bg-opacity-90`}
            aria-label="Send"
            disabled={!prompt || isLoading}
          >
            <Image
              src={assets.ArrowUp}
              alt="Send"
              className="w-3 h-3 sm:w-3.5 sm:h-3.5 aspect-square filter brightness-0 invert"
            />
          </button>
        </div>
      </div>
    </form>
  );
};

export default SearchBox;