import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { assets } from '@/assets/assets';
import { useClerk, UserButton } from "@clerk/nextjs";
import { useAppContext } from "@/context/AppContext";

const LinkedInIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
    <path d="M20.5 2h-17A1.5 1.5 0 002 3.5v17A1.5 1.5 0 003.5 22h17a1.5 1.5 0 001.5-1.5v-17A1.5 1.5 0 0020.5 2zM8 19H5v-9h3zM6.5 8.25A1.75 1.75 0 118.3 6.5a1.78 1.78 0 01-1.8 1.75zM19 19h-3v-4.74c0-1.42-.6-1.93-1.38-1.93A1.74 1.74 0 0013 14.19a.66.66 0 000 .14V19h-3v-9h2.9v1.3a3.11 3.11 0 012.7-1.4c1.55 0 3.36.86 3.36 3.66z"></path>
  </svg>
);

const ProfileDialog = ({ open, onClose, onDeleteAllChats, onLogin }) => {
  const { openSignIn } = useClerk();
  const { user } = useAppContext();
  const [contactPopoverOpen, setContactPopoverOpen] = useState(false);
  const [deleteConfirmationOpen, setDeleteConfirmationOpen] = useState(false);
  const [logoutConfirmationOpen, setLogoutConfirmationOpen] = useState(false);
  const dialogRef = useRef(null);
  const contactRef = useRef(null);

  const contacts = [
    { name: "Saish Ghatol", link: "https://www.linkedin.com/in/saish-ghatol/" },
    { name: "Sujal Attrade", link: "https://www.linkedin.com/in/sujal-attarde/" },
    { name: "Nakul Kushe", link: "https://www.linkedin.com/in/nakul-kushe-61a9512bb/" },
    { name: "Tanay Palkandwar", link: "https://www.linkedin.com/in/tanay-palkandwar" },
  ];

  // Handle click outside to close dialog
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dialogRef.current && !dialogRef.current.contains(event.target) && 
          (!contactRef.current || !contactRef.current.contains(event.target)) && 
          !deleteConfirmationOpen && !logoutConfirmationOpen) {
        onClose();
      }
    };

    if (open) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [open, onClose, deleteConfirmationOpen, logoutConfirmationOpen, contactPopoverOpen]);

  if (!open) return null;

  return (
    <>
      {/* Profile Popover with enhanced styling */}
      {open && !contactPopoverOpen && (
        <div 
          ref={dialogRef}
          className="absolute bottom-16 left-0 md:left-4 mt-2 w-72 bg-gradient-to-br from-[#2D2D38] to-[#3A3A46] text-blue-50 shadow-xl rounded-xl overflow-hidden border border-[#4A4A56]/30 backdrop-blur-sm z-50"
        >
          <div className="px-4 py-3 border-b border-[#4A4A56]/50">
            <h3 className="text-lg font-medium text-blue-100">Account</h3>
          </div>
          <ul className="py-2">
            <li 
              className="flex items-center px-4 py-3 hover:bg-[#4A4A56]/70 transition-all cursor-pointer group" 
              onClick={user ? null : openSignIn}
            >
              <div className="p-2 rounded-full bg-blue-500/20 group-hover:bg-blue-500/30 transition-all">
                {user ? 
                  <UserButton /> : 
                  <Image 
                    src={assets.ProfileIcon || "/icons/profile.svg"}
                    width={18} 
                    height={18} 
                    alt="Profile"
                    className="w-5 h-5"
                  />
                }
              </div>
              <span className="ml-3 font-medium">{user ? 'My Account' : 'Login'}</span>
            </li>
            <li 
              className="flex items-center px-4 py-3 hover:bg-[#4A4A56]/70 transition-all cursor-pointer group" 
              onClick={() => setDeleteConfirmationOpen(true)}
            >
              <div className="p-2 rounded-full bg-red-500/20 group-hover:bg-red-500/30 transition-all">
                <Image 
                  src={assets.DeleteIcon || "/icons/trash.svg"} 
                  width={18} 
                  height={18} 
                  alt="Delete"
                  className="w-5 h-5"
                />
              </div>
              <span className="ml-3 font-medium">Delete All Chats</span>
            </li>
            <li 
              className="flex items-center px-4 py-3 hover:bg-[#4A4A56]/70 transition-all cursor-pointer group" 
              onClick={() => setContactPopoverOpen(true)}
            >
              <div className="p-2 rounded-full bg-green-500/20 group-hover:bg-green-500/30 transition-all">
                <Image 
                  src={assets.ContactIcon || "/icons/contact.svg"} 
                  width={18} 
                  height={18} 
                  alt="Contact"
                  className="w-5 h-5"
                />
              </div>
              <span className="ml-3 font-medium">Contact Us</span>
            </li>
            <li 
              className="flex items-center px-4 py-3 hover:bg-[#4A4A56]/70 transition-all cursor-pointer group" 
              onClick={() => setLogoutConfirmationOpen(true)}
            >
              <div className="p-2 rounded-full bg-purple-500/20 group-hover:bg-purple-500/30 transition-all">
                <Image 
                  src={assets.LogoutIcon || "/icons/logout.svg"} 
                  width={18} 
                  height={18} 
                  alt="Logout"
                  className="w-5 h-5"
                />
              </div>
              <span className="ml-3 font-medium">Logout</span>
            </li>
          </ul>
        </div>
      )}

      {/* Contact Popover with enhanced styling */}
      {contactPopoverOpen && (
        <div 
          ref={contactRef}
          className="absolute bottom-16 left-0 md:left-4 mt-2 w-72 bg-gradient-to-br from-[#2D2D38] to-[#3A3A46] text-blue-50 shadow-xl rounded-xl overflow-hidden border border-[#4A4A56]/30 backdrop-blur-sm z-50"
        >
          <div className="px-4 py-3 border-b border-[#4A4A56]/50 flex items-center">
            <button 
              onClick={() => setContactPopoverOpen(false)}
              className="mr-2 p-1 rounded-full hover:bg-[#4A4A56]/70 transition-all"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M19 12H5M12 19l-7-7 7-7"/>
              </svg>
            </button>
            <h2 className="text-lg font-medium text-blue-100">Contact Team</h2>
          </div>
          <ul className="py-2">
            {contacts.map((contact, index) => (
              <li key={index} className="px-4 py-3 hover:bg-[#4A4A56]/70 transition-all">
                <div className="flex justify-between items-center">
                  <span className="font-medium">{contact.name}</span>
                  <a 
                    href={contact.link} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="text-blue-300 hover:text-blue-200 p-2 rounded-full hover:bg-blue-500/20 transition-all"
                  >
                    <LinkedInIcon />
                  </a>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Delete Confirmation Dialog with enhanced styling */}
      {deleteConfirmationOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-70 backdrop-blur-sm z-50">
          <div className="bg-gradient-to-br from-[#2D2D38] to-[#3A3A46] text-blue-50 p-6 rounded-xl shadow-2xl max-w-md w-full border border-[#4A4A56]/30 transform transition-all duration-300 scale-100">
            <div className="flex items-center mb-4">
              <div className="p-3 rounded-full bg-red-500/20 mr-4">
                <Image 
                  src={assets.DeleteIcon || "/icons/trash.svg"} 
                  width={24} 
                  height={24} 
                  alt="Delete"
                  className="w-6 h-6"
                />
              </div>
              <h2 className="text-xl font-semibold text-blue-100">Delete All Chats</h2>
            </div>
            <p className="mt-2 text-blue-200">This will permanently remove all your conversation history. This action cannot be undone.</p>
            <div className="mt-6 flex justify-end space-x-3">
              <button 
                className="px-5 py-2 bg-[#4A4A56]/70 hover:bg-[#5A5A66] transition-all rounded-lg font-medium" 
                onClick={() => setDeleteConfirmationOpen(false)}
              >
                Cancel
              </button>
              <button
                className="px-5 py-2 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 transition-all text-white rounded-lg font-medium"
                onClick={() => {
                  if (onDeleteAllChats) onDeleteAllChats();
                  setDeleteConfirmationOpen(false);
                  onClose();
                }}
              >
                Delete All
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Logout Confirmation Dialog with enhanced styling */}
      {logoutConfirmationOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-70 backdrop-blur-sm z-50">
          <div className="bg-gradient-to-br from-[#2D2D38] to-[#3A3A46] text-blue-50 p-6 rounded-xl shadow-2xl max-w-md w-full border border-[#4A4A56]/30 transform transition-all duration-300 scale-100">
            <div className="flex items-center mb-4">
              <div className="p-3 rounded-full bg-purple-500/20 mr-4">
                <Image 
                  src={assets.LogoutIcon || "/icons/logout.svg"} 
                  width={24} 
                  height={24} 
                  alt="Logout"
                  className="w-6 h-6"
                />
              </div>
              <h2 className="text-xl font-semibold text-blue-100">Log Out</h2>
            </div>
            <p className="mt-2 text-blue-200">Are you sure you want to log out of your account?</p>
            <div className="mt-6 flex justify-end space-x-3">
              <button 
                className="px-5 py-2 bg-[#4A4A56]/70 hover:bg-[#5A5A66] transition-all rounded-lg font-medium" 
                onClick={() => setLogoutConfirmationOpen(false)}
              >
                Cancel
              </button>
              <button
                className="px-5 py-2 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 transition-all text-white rounded-lg font-medium"
                onClick={() => {
                  // Add logout logic here
                  setLogoutConfirmationOpen(false);
                  onClose();
                }}
              >
                Log Out
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ProfileDialog;