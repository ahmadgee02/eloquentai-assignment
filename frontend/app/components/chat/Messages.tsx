'use client'

import { Message, Role } from "@/types";
import { FC, useMemo, useState } from "react";

interface Props {
    message: Message;
}

const AgentMessage: FC<Props> = (props) => {
    const { message } = props;

    <div className="flex justify-start">
        <div className="bg-neutral-800 text-white rounded-xl px-4 py-3 max-w-2xl">
            This is an AI message.

        </div>
    </div>

    const { parentClass, messageClass }  = useMemo(() => {
        if (message.role === Role.User)
            return {
                parentClass: "justify-end",
                messageClass: "bg-neutral-900",
            }
        
        else 
            return {
                parentClass: "justify-start",
                messageClass: "bg-neutral-800",
            }
    }, [message]);
    

    return (
        <>
            <div className={`flex ${parentClass}`} >
                <div className={`${messageClass} text-white rounded-xl px-4 py-3 max-w-2xl`}>
                    {message.text}
                </div>
            </div>
        </>
    );
}

export default AgentMessage;