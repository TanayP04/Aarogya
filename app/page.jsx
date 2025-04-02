'use client';
import { useState, useEffect } from 'react';
import { TypeAnimation } from 'react-type-animation';
import Image from 'next/image';
import { assets } from '@/assets/assets';
import Sidebar from "@/components/Sidebar";
import SearchBox from "@/components/SearchBox";
import Message from "@/components/Message";
import { useAppContext } from "@/context/AppContext";
export default function Home() {
  const [expand, setExpand] = useState(false);
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [currentLanguageIndex, setCurrentLanguageIndex] = useState(0);

  const indianLanguages = [
    { language: "English", text: "Welcome to Aarogya" },
    { language: "Hindi", text: "आरोग्य में आपका स्वागत है" },
    { language: "Marathi", text: "आरोग्यामध्ये आपले स्वागत आहे" },
    { language: "Bengali", text: "আরোগ্যে আপনাকে স্বাগতম" },
    { language: "Telugu", text: "ఆరోగ్యకు స్వాగతం" },
    { language: "Sanskrit", text: "आरोग्याय स्वागतम्" },
    { language: "Urdu", text: "آرگيا میں خوش آمدید" },
    { language: "Gujarati", text: "આરોગ્યમાં આપનું સ્વાગત છે" },
    { language: "Kannada", text: "ಆರೋಗ್ಯಕ್ಕೆ ಸುಸ್ವಾಗತ" },
    { language: "Odia", text: "ଆରୋଗ୍ୟରେ ସ୍ୱାଗତ" },
    { language: "Punjabi", text: "ਆਰੋਗ ਵਿੱਚ ਜੀ ਆਇਆਂ ਨੂੰ" },
    { language: "Malayalam", text: "ആരോഗ്യത്തിന് സ്വാഗതം" },
    { language: "Assamese", text: "আৰোগ্যলৈ স্বাগতম" },
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentLanguageIndex((prev) => (prev + 1) % indianLanguages.length);
    }, 3000);
    return () => clearInterval(interval);
  }, [indianLanguages.length]);
  
  return (
    <div className="bg-gradient-to-br from-[#1a1b1e] to-[#2d2e32] min-h-screen">
      <div className="flex h-screen">
        {/* Pass the expand state and setter to Sidebar */}
        <Sidebar expand={expand} setExpand={setExpand} />
        
        <div className={`flex-1 flex flex-col relative items-center justify-center text-white px-6 transition-all duration-300 ${expand ? 'md:ml-64' : 'md:ml-20'}`}>
          {/* Top Navigation Bar - Mobile */}
          <div className="absolute md:hidden px-5 top-7 flex items-center justify-between w-full z-10">
            <button 
              onClick={() => setExpand(!expand)} 
              className="p-2 rounded-full hover:bg-white/10 transition-colors"
            >
              <Image 
                className="rotate-180 w-6 h-6" 
                src={assets.openSidebar} 
                alt="Toggle Sidebar" 
              />
            </button>
            <button className="p-2 rounded-full hover:bg-white/10 transition-colors">
              <Image 
                className="opacity-80 w-6 h-6" 
                src={assets.newchatIcon} 
                alt="New Chat" 
              />
            </button>
          </div>

          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center max-w-2xl mx-auto px-4 py-8">
              {/* Logo/Icon (optional) */}
              <div className="mb-8 animate-pulse">
                <div className="w-30 h-30 rounded-[80%] bg-teal-500/20 flex items-center justify-center">
                  <div className="w-24 h-24 rounded-[80%] bg-teal-500/40 flex items-center justify-center">
                    <div className="w-16 h-16 rounded-[80%] bg-teal-500 flex items-center justify-center">
                      <Image src={assets.Icon} className="w-12 h-12" alt="Aarogya Logo" width={48} height={48} />
                    </div>
                  </div>
                </div>
              </div>

              {/* Typing Animation */}
              <div className="mb-6 h-24 relative w-full">
                <TypeAnimation
                  aria-label="Changing language greetings"
                  sequence={indianLanguages.flatMap((lang) => [
                    lang.text,
                    1000,
                    "",
                    { type: "delete", speed: 99 },
                  ])}
                  speed={50}
                  deletionSpeed={100}
                  repeat={Infinity}
                  className="block text-4xl md:text-5xl min-h-[60px] font-bold text-center bg-gradient-to-r from-teal-400 to-blue-500 text-transparent bg-clip-text"
                />
              </div>

              {/* Description */}
              <div className="mb-12 backdrop-blur-sm">
                <p className="text-base text-center text-white/80 leading-relaxed">
                  Aarogya is your AI-powered medical assistant designed to provide reliable health information,
                  symptom checking, and preliminary medical guidance. Our chatbot helps you understand potential
                  health concerns while always recommending to consult with certified healthcare professionals
                  for proper diagnosis and treatment.
                </p>
              </div>
            </div>
                 
          
          ) : (
            <div className="w-full h-full flex flex-col">
            
              <Message role='ai' content='what is next js'/>
            </div>
          )}
          <SearchBox isLoading={isLoading} setIsLoading={setIsLoading}/>
          <div className="p-3">
          <p className="text-xs text-white/40 absolute text-center bottom-5 ">AI-generated, for reference only</p>

          </div>

        </div>
      </div>
    </div>
  );
}