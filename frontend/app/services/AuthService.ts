import type { LoginData, LoginResponse, RegisterData } from "@/types"
import http from "./core/HttpService";

export const loginService = async (data: LoginData): Promise<LoginResponse> => {
  try {
    const response = await http.post('/auth/login', data);

    return response.data;
  } catch (error) {
    return null!
  }
}

export const registerUserService = async (data: RegisterData): Promise<LoginResponse> => {
  try {
    const response = await http.post('/auth/register', data);

    return response.data;
  } catch (error) {
    return null!
  }
}
