import React from 'react'
import Image from 'next/image'
import { assets } from '@/assets/assets'

function Message({ role, content }) {
    return (
        <div className='flex flex-col w-full max-w-3xl text-sm'>
            <div className={`flex flex-col w-full mb-8 ${role === "user" && "items-end"}`}>
                <div className={`group relative flex max-w-2xl py-3 rounded-xl ${role === "user" ? "bg-[#414158] px-5" : "gap-3"
                    }`}>
                    <div className={`opacity-0 group-hover:opacity-100 absolute ${role === "user" ? "-left-16 top-2.5" : "left-9 -bottom-6"} transition-all`}>
                        <div className='flex items-center gap-2 opacity-70'>
                            {
                                role === "user" ? (
                                    <>
                                        <Image
                                            src={assets.copyIcon}
                                            alt="avatar"
                                            width={40}
                                            height={40}
                                            className="w-4 cursor-pointer brightness-0 invert"
                                        />
                                        <Image
                                            src={assets.Pencil}
                                            alt="avatar"
                                            className="w-3 cursor-pointer brightness-0 invert"
                                        />
                                    </>
                                ) : (
                                    <>
                                        <Image
                                            src={assets.copyIcon}
                                            alt="avatar"
                                            className="w-4 cursor-pointer brightness-0 invert"
                                        />
                                    </>
                                )
                            }
                        </div>
                    </div>

                    {
                        role === "user" ? (
                            <span className='text-white/90'>{content}</span>
                        ) :
                            (<>
                                <Image
                                    src={assets.LogoSmall}
                                    alt="avatar"
                                    className="w-9 h-9 p-1 border border-white/15  rounded-full"
                                />
                                <div className='space-y-4 w-full overflow-scroll'>
                                 {content}
                                </div>
                            </>

                            )
                    }
                </div>
            </div>
        </div>
    )
}

export default Message