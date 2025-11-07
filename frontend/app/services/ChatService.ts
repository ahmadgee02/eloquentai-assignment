import http from "./core/HttpService";
import type { Chat, SendPromptRequest, SendPromptResponse } from "@/types";

export const sendPromptService = async (request: SendPromptRequest): Promise<SendPromptResponse> => {
    try {
        const response = await http.post('/chats', request);
        return response.data;
    } catch (error: any) {
        return null!
    }
}

export const getChatHistoryService = async (): Promise<Chat[]> => {
    try {
        const response = await http.get('/chats/history');
        return response.data;
    } catch (error: any) {
        return []
    }
}

export const getChatService = async (chatId: string): Promise<Chat> => {
    try {
        const response = await http.get('/chats/'+ chatId);
        return response.data;
    } catch (error: any) {
        return null!
    }
}

export const deleteChatService = async (chatId: string): Promise<boolean> => {
    try {
        await http.delete(`/chats/${chatId}`);
        return true;
    } catch (error) {
        return false;
    }
}