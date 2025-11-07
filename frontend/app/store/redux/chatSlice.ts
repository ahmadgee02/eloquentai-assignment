import { createSlice } from '@reduxjs/toolkit'
import type { PayloadAction } from '@reduxjs/toolkit'
import type { AppDispatch, RootState } from '../index'
import { Role, type Message, Chat } from "@/types"
import { sendPromptService, getChatHistoryService, getChatService, deleteChatService } from '@/services/ChatService';
import { AppRouterInstance } from 'next/dist/shared/lib/app-router-context.shared-runtime'

// Define a type for the slice state
interface ChatState {
    loading: boolean;
    description: string,
    currentChat: Chat | null,
    chats: Chat[],
}

// Define the initial state using that type
const initialState: ChatState = {
    loading: false,
    description: '',
    currentChat: null,
    chats: []
}

export const chatSlice = createSlice({
    name: 'chat',
    initialState,
    reducers: {
        setLoading: (state, action: PayloadAction<boolean>) => {
            state.loading = action.payload;
        },
        setChatTitle: (state, action: PayloadAction<string>) => {
            // it will only run when currentChat not exists
            state.currentChat ??= { title: action.payload }
            state.currentChat.title = action.payload
        },
        setChatId: (state, action: PayloadAction<string>) => {
            state.currentChat ??= { _id: action.payload }
            state.currentChat._id = action.payload
        },
        setNewMessage: (state, action: PayloadAction<Message>) => {
            if (state.currentChat?.messages) {
                state.currentChat.messages.push(action.payload);
            } else {
                state.currentChat = { messages: [action.payload] }
            }
        },
        setPrevChatMessages: (state, action: PayloadAction<Chat>) => {
            state.currentChat = action.payload;
        },
        addNewChat: (state, action: PayloadAction<Chat>) => {
            state.chats = [action.payload, ...state.chats];
        },
        setChatHistory: (state, action: PayloadAction<Chat[]>) => {
            state.chats = action.payload;
        },
        setDeleteChat: (state, action: PayloadAction<string>) => {
            state.chats = state.chats.filter(chat => chat._id !== action.payload);
            if (state.currentChat?._id === action.payload) {
                state.currentChat = {};
            }
        },
        resetCurrentChat: (state) => {
            state.currentChat = {};
        },
    },
})

export const { setLoading, setNewMessage, setChatHistory, setPrevChatMessages, setDeleteChat, setChatTitle,
    setChatId, addNewChat, resetCurrentChat
} = chatSlice.actions

// Other code such as selectors can use the imported `RootState` type
export const selectLoading = (state: RootState) => state.chat.loading
export const selectDescription = (state: RootState) => state.chat.description;
export const selectMessagesHistory = (state: RootState) => state.chat.currentChat?.messages;
export const selectAllChats = (state: RootState) => state.chat.chats;

export default chatSlice.reducer;


export const sendPrompt = (prompt: string) => async (dispatch: AppDispatch, getState: () => RootState) => {
    const state = getState();

    const newMessage: Message = {
        text: prompt,
        role: Role.User,
    };

    dispatch(setLoading(true))
    dispatch(setNewMessage(newMessage));

    const userId = state.auth.user?._id
    const chatId = state.chat.currentChat?._id

    const request = {
        prompt,
        ...(userId && { user_id: userId }),
        ...(chatId && { chat_id: chatId })
    }

    const { response, title, chat_id } = await sendPromptService(request);

    const newSystemMessage: Message = {
        text: response,
        role: Role.System,
    };

    dispatch(setNewMessage(newSystemMessage));
    title && dispatch(setChatTitle(title))
    if (chat_id) {
        dispatch(setChatId(chat_id))
        dispatch(addNewChat({
            _id: chat_id,
            title: title,
            messages: [newMessage, newSystemMessage]
        }))
    }

    dispatch(setLoading(false))
}


export const getAllChatHistory = () => async (dispatch: AppDispatch) => {
    const history = await getChatHistoryService();

    dispatch(setChatHistory(history));
}


export const getChatHistory = (chatId: string) => async (dispatch: AppDispatch) => {
    dispatch(setLoading(true))
    const chat = await getChatService(chatId);

    dispatch(setPrevChatMessages(chat));
    dispatch(setLoading(false))
}


export const deleteChat = (chatId: string, router: AppRouterInstance) => async (dispatch: AppDispatch) => {
    dispatch(setLoading(true))
    const deleted = await deleteChatService(chatId);

    dispatch(setLoading(false))
    if (deleted) {
        dispatch(setDeleteChat(chatId));
        // replace so user can't go back

        router.replace("/");
    }
}