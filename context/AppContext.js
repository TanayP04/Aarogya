'use client';
import { useUser, useAuth } from "@clerk/nextjs";
import { createContext, useContext, useState, useEffect, useCallback } from "react";
import toast from "react-hot-toast";
import axios from "axios";

// Configure axios to include auth token in all requests
const setupAxiosInterceptors = (getToken) => {
  axios.interceptors.request.use(async (config) => {
    try {
      const token = await getToken();
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (err) {
      console.error("Error setting auth token:", err);
    }
    return config;
  }, (error) => {
    return Promise.reject(error);
  });
};

export const AppContext = createContext();

export const useAppContext = () => {
  return useContext(AppContext);
};

export const AppContextProvider = ({ children }) => {
  const { user } = useUser();
  const { getToken } = useAuth();
  
  const [chat, setChat] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);
  const [loading, setLoading] = useState(false);
  
  // Set up axios interceptor to add auth token to all requests
  useEffect(() => {
    if (getToken) {
      setupAxiosInterceptors(getToken);
    }
  }, [getToken]);
  
  // Create a new chat
  const createNewChat = useCallback(async () => {
    try {
      setLoading(true);
      
      const response = await axios.post('/api/chat/create', {
        name: "New Chat",
        messages: []
      });
  
      if (response.data.success) {
        await fetchUsersChats();
        setSelectedChat(response.data.chat);
        return response.data.chat;
      } else {
        toast.error(response.data.error || "Failed to create chat");
        return null;
      }
    } catch (error) {
      console.error("Failed to create new chat:", error);
      toast.error("Failed to create new chat");
      return null;
    } finally {
      setLoading(false);
    }
  }, []);
  
  // Fetch user's chats
  const fetchUsersChats = useCallback(async () => {
    try {
      if (!user) {
        return null;
      }
      
      setLoading(true);
      const { data } = await axios.get('/api/chat/get');
      
      if (data.success) {
        // Sort chats by updatedAt date
        const sortedChats = [...data.chats].sort((a, b) => {
          return new Date(b.updatedAt) - new Date(a.updatedAt);
        });
        
        setChat(sortedChats);
        
        // If there's no selected chat, select the first one if available
        if (sortedChats.length > 0 && !selectedChat) {
          setSelectedChat(sortedChats[0]);
        }
        
        return sortedChats;
      } else {
        toast.error(data.message || "Error fetching chats");
        return null;
      }
    } catch (error) {
      console.error("Error fetching chats:", error);
      toast.error("Error fetching chats");
      return null;
    } finally {
      setLoading(false);
    }
  }, [user, selectedChat]);
  
  // Initialize user's data when they log in
  useEffect(() => {
    const initializeUserData = async () => {
      if (user) {
        const chats = await fetchUsersChats();
        if (!chats || chats.length === 0) {
          await createNewChat();
        }
      } else {
        // Clear state when user logs out
        setChat([]);
        setSelectedChat(null);
      }
    };
    
    initializeUserData();
  }, [user, fetchUsersChats, createNewChat]);
  
  const value = {
    user,
    chat,
    setChat,
    selectedChat, 
    setSelectedChat,
    fetchUsersChats,
    createNewChat,
    loading
  };
  
  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
};