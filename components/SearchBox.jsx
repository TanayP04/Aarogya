import React, { useState } from 'react'
import Image from 'next/image'
import { assets } from '@/assets/assets'

const SearchBox = ({isLoading , setIsLoading}) => {
  const [prompt, setPrompt] = useState("")
  
  return (
    <form className={`w-full max-w-2xl bg-[#404045] p-4 rounded-3xl mt-4 transition-all`}>
      <div className="flex items-center">
        <textarea
          className="outline-none w-full resize-none overflow-hidden break-words bg-transparent text-white placeholder-gray-400"
          rows={3}
          placeholder="Message Aarogya"
          required
          onChange={(e) => setPrompt(e.target.value)}
          value={prompt}
        />
        <div className="flex-shrink-0 ml-2">
          <button
            type="submit"
            className={`${prompt ? "bg-primary" : "bg-[#71717a]"} rounded-full p-2 cursor-pointer transition-colors`}
            aria-label="Send"
            disabled={!prompt}
          >
            <Image
              src={assets.ArrowUp}
              alt="Send"
              className="w-3.5 h-3.5 aspect-square"
            />
          </button>
        </div>
      </div>
    </form>
  )
}

export default SearchBox