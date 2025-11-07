import { FC, useEffect, useRef } from 'react';
import ChatBox from './ChatBox';
import { selectMessagesHistory, selectLoading } from '../../store/redux/chatSlice';
import { useAppSelector } from "@/store/hooks";
import Messages from './Messages';

const ChatScreen: FC = () => {
    const loading = useAppSelector(selectLoading);
    const messages = useAppSelector(selectMessagesHistory);

    const messagesEndRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);


    return (
        <div className="flex flex-col chat-screen">
            <div className="flex-1 overflow-y-auto px-4 py-6 space-y-4 hide-scrollbar">
                {messages.length === 0 && !loading && (
                    <div className="flex items-center justify-center mt-12">
                        <p className="text-xl font-medium text-gray-500">
                            Ready when you are.
                        </p>
                    </div>
                )}
                {messages.map((msg, index) => (
                    <Messages message={msg} key={index} />
                ))}

                {loading && (
                    <div className="flex items-center justify-center mt-12">
                        <p className="text-xl font-medium animate-bounce transform transition-transform duration-500 ease-in-out">
                            Thinking
                        </p>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            <div className="sticky bottom-0 p-4">
                <ChatBox />
            </div>

        </div>
    );
}

export default ChatScreen;