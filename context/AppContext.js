'use client';
import { useUser, useAuth } from "@clerk/nextjs";
import { createContext, useContext, useState, useEffect } from "react";
import toast from "react-hot-toast";
import axios from "axios";

export const AppContext = createContext();

export const useAppContext = () => {
  return useContext(AppContext);
};

export const AppContextProvider = ({ children }) => {
  const { user } = useUser();
  const { getToken } = useAuth();
  
  const [chat, setChat] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);
  
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

  const fetchChats = async () => {
    try {
      if (!user) {
        return null;
      }

      const token = await getToken();
      const { data } = await axios.get('/api/chat/get', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (data.success) {
        const sortedChats = [...data.chats].sort((a, b) => {
          return new Date(b.updatedAt) - new Date(a.updatedAt);
        });

        setChat(sortedChats);

        if (sortedChats.length === 0) {
          await createNewChat();
        } else {
          setSelectedChat(sortedChats[0]);
        }
      } else {
        toast.error(data.message || "Error fetching chats");
      }
    } catch (error) {
      console.error(error);
      toast.error("Error fetching chats");
    }
  };

  useEffect(() => {
    if (user) {
      fetchChats(); 
    }
  }, [user]);

  const value = {
    user,
    chat,
    setChat,
    selectedChat,
    setSelectedChat,
    fetchChats,     
    createNewChat,
  };

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
};
