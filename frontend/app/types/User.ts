export interface User {
    _id: string
    name: string;
    email: string;
}

export interface RegisterData {
    name: string;
    email: string;
    password: string;
}

export interface LoginData {
    email: string;
    password: string;
}

export interface LoginResponse {
    access_token: string;
    token_type: string;
}