export enum Role {
    System = "system",
    User = "user"
}

export interface Message {
    text: string;
    role: Role;
}

export interface Chat {
    _id?: string;
    userId?: string;
    title?: string;
    messages?: Message[];
}


export interface SendPromptRequest {
    prompt: string;
    user_id?: string;
    chat_id?: string;
}

export interface SendPromptResponse {
    title?: string;
    chat_id?: string;
    response: string;
}