import React, { useState, useRef, useEffect } from "react";
import { useClerk, UserButton } from "@clerk/nextjs";
import { useAppContext } from "@/context/AppContext";
import { X, User, Trash2, Users, LogOut, ChevronRight, Settings } from "lucide-react";
import Image from "next/image";
import { assets, teamContacts } from "@/assets/assets";

const ProfileDialog = ({ open, onClose, onDeleteAllChats }) => {
  const { openSignIn, signOut, openUserProfile } = useClerk();
  const { user } = useAppContext();
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [logoutConfirmOpen, setLogoutConfirmOpen] = useState(false);
  const dialogRef = useRef(null);

  // Close dialog when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dialogRef.current && !dialogRef.current.contains(event.target) &&
        !deleteConfirmOpen && !logoutConfirmOpen) {
        onClose();
      }
    };

    if (open) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [open, onClose, deleteConfirmOpen, logoutConfirmOpen]);

  if (!open) return null;

  return (
    <>
      {/* Main Profile Dialog */}
      {open && (
        <div
          ref={dialogRef}
          className="absolute bottom-16 left-0 md:left-4 w-72  bg-gray-700 text-gray-100 shadow-xl rounded-lg border border-gray-800 z-50 overflow-hidden"
        >
          <div className="p-3 border-b border-gray-800 flex items-center justify-between bg-gray-950">
            <h3 className="text-base font-medium flex items-center">
              <Settings size={16} className="mr-2" />
              Settings
            </h3>
            <button onClick={onClose} className="p-1 hover:bg-gray-500/20 rounded-full transition-colors">
              <X size={16} />
            </button>
          </div>

          <ul className="py-1">
            {/* Account option */}
            <li
              className="flex items-center px-4 py-3 hover:bg-gray-500/20 cursor-pointer transition-colors"
              onClick={() => {
                user ? openUserProfile() : openSignIn();
                onClose();
              }}
            >
              <div className="mr-3 flex items-center justify-center w-8 h-8 rounded-full bg-neutral-500">
                {user ? (
                  <UserButton />
                ) : (
                  <Image
                    src={assets.ProfileIcon}
                    alt="Profile Icon"
                    className="w-5 h-5 filter brightness-0 invert"
                    width={20}
                    height={20}
                  />
                )}
              </div>
              <span className="flex-1">{user ? 'My Account' : 'Login'}</span>
              <ChevronRight size={16} className="text-gray-500" />
            </li>

            {/* Delete all chats option */}
            <li
              className="flex items-center px-4 py-3 hover:bg-gray-500/20 cursor-pointer transition-colors"
              onClick={() => setDeleteConfirmOpen(true)}
            >
              <div className="mr-3 flex items-center justify-center w-8 h-8 rounded-full bg-neutral-500 ">
                <Trash2 size={16} />
              </div>
              <span className="flex-1">Delete All Chats</span>
              <ChevronRight size={16} className="text-gray-500" />
            </li>

            {/* Contact info option */}
            <li className="px-4 py-3 hover:bg-gray-500/20 transition-colors">
              <details className="group">
                <summary className="flex items-center cursor-pointer list-none">
                  <div className="mr-3 flex items-center justify-center w-8 h-8 rounded-full bg-neutral-500">
                    <Users size={16} className="text-white" />
                  </div>
                  <span className="flex-1">Contact Team</span>
                  <ChevronRight size={16} className="text-gray-500 group-open:rotate-90 transition-transform" />
                </summary>
                <div className="mt-2 ml-11 text-sm text-gray-300 space-y-2 py-2">
                  {teamContacts.map((contact, i) => (
                    <div key={i} className="flex items-center justify-between py-1">
                      <div className="flex items-center">
                        <div className="w-2 h-2 bg-purple-500 rounded-full mr-2"></div>
                        <span>{contact.name}</span>
                      </div>
                      <a
                        href={contact.linkedinUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center hover:bg-gray-700/50 p-1 rounded-full transition-colors"
                        aria-label={`${contact.name}'s LinkedIn profile`}
                      >
                        <Image
                          src={assets.LinkedInIcon}
                          width={20} height={20}
                          alt="LinkedIn"
                          className="w-5 h-5 rounded-full filter brightness-0 invert cursor-pointer"
                        />
                      </a>
                    </div>
                  ))}
                </div>
              </details>
            </li>
            {/* Logout option */}
            {user && (
              <li
                className="flex items-center px-4 py-3 hover:bg-gray-500/20 cursor-pointer border-t border-gray-800 transition-colors"
                onClick={() => setLogoutConfirmOpen(true)}
              >
                <div className="mr-3 flex items-center justify-center w-8 h-8 rounded-full bg-neutral-500">
                  <LogOut size={16} />
                </div>
                <span className="flex-1">Logout</span>
                <ChevronRight size={16} className="text-gray-500" />
              </li>
            )}
          </ul>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      {deleteConfirmOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-[#1a1b1e]/80 bg-opacity-30 z-50">
          <div className="bg-[#404045] p-6 rounded-lg shadow-lg max-w-sm w-full border border-gray-800">
            <h2 className="text-lg font-medium text-white mb-3">Delete All Chats?</h2>
            <p className="text-gray-300 text-sm">This will permanently remove all your conversation history and cannot be undone.</p>
            <div className="mt-6 flex justify-end space-x-3">
              <button
                className="px-4 py-2 bg-gray-600  text-white hover:bg-gray-700 rounded text-sm transition-colors"
                onClick={() => setDeleteConfirmOpen(false)}
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded text-sm transition-colors"
                onClick={() => {
                  onDeleteAllChats();
                  setDeleteConfirmOpen(false);
                  onClose();
                }}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Logout Confirmation Dialog */}
      {logoutConfirmOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-[#1a1b1e]/80 bg-opacity-60 z-50">
          <div className="bg-[#404045] p-6 rounded-lg shadow-lg max-w-sm w-full border border-gray-800">
            <h2 className="text-lg font-medium text-white mb-3">Log Out?</h2>
            <p className="text-gray-300 text-sm">Are you sure you want to log out of your account?</p>
            <div className="mt-6 flex justify-end space-x-3">
              <button
                className="px-4 py-2 bg-gray-600 text-white hover:bg-gray-700 rounded text-sm transition-colors"
                onClick={() => setLogoutConfirmOpen(false)}
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm transition-colors"
                onClick={() => {
                  signOut();
                  setLogoutConfirmOpen(false);
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