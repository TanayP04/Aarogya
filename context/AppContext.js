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
      if (!user) {
        toast.error("Please login to continue");
        return null;
      }
      
      const token = await getToken();
      const { data } = await axios.post('/api/chat/create', {}, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      if (data.success) {
        await fetchUsersChats();
      } else {
        toast.error(data.message || "Error creating chat");
      }
    } catch (error) {
      console.error(error);
      toast.error("Error creating chat");
    }
  };
  
  const fetchUsersChats = async () => {
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
        console.log(data.chats);
        
        // Sort chats by updatedAt date
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
      fetchUsersChats();
    }
  }, [user]);
  
  const value = {
    user,
    chat,
    setChat,
    selectedChat,
    setSelectedChat,
    fetchUsersChats,
    createNewChat,
  };
  
  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};