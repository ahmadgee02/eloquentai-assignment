import { createSlice } from '@reduxjs/toolkit'
import type { PayloadAction } from '@reduxjs/toolkit'
import type { RootState, AppDispatch } from '../index'
import type { User, LoginData, RegisterData } from "@/types"
import { loginService, registerUserService } from '@/services/AuthService'
import { local_storage_web_key } from "@/utils/Constants"
import { decodeToken } from "react-jwt";
import { AppRouterInstance } from 'next/dist/shared/lib/app-router-context.shared-runtime'
import { setAuthToken } from '@/services/core/HttpService'

// Define a type for the slice state
interface AuthState {
    loading: boolean;
    user: User
}

// Define the initial state using that type
const initialState: AuthState = {
    loading: false,
    user: null!,
}

export const authSlice = createSlice({
    name: 'auth',
    // `createSlice` will infer the state type from the `initialState` argument
    initialState,
    reducers: {
        setLoading: (state, action: PayloadAction<boolean>) => {
            state.loading = action.payload;
        },
        setUser: (state, action: PayloadAction<User>) => {
            state.user = action.payload
            state.loading = false
        }
    },
})

export const { setUser, setLoading } = authSlice.actions

// Other code such as selectors can use the imported `RootState` type
export const selectUser = (state: RootState) => state.auth.user
export const selectLoading = (state: RootState) => state.auth.loading
export const selectIsUserSignedIn = (state: RootState) => !!state.auth.user

export default authSlice.reducer

export const loginUser = (data: LoginData, router: AppRouterInstance) => async (dispatch: AppDispatch) => {
    dispatch(setLoading(true))
    const token = await loginService(data);

    if (token) {
        const { access_token } = token

        localStorage.setItem(local_storage_web_key, access_token);
        setAuthToken(access_token);
        const user = decodeToken(access_token) as User;

        dispatch(setUser(user));
        dispatch(setLoading(false))

        router.push("/");
    }
    
    dispatch(setLoading(false))
}


export const registerUser = (data: RegisterData, router: AppRouterInstance) => async (dispatch: AppDispatch) => {
    dispatch(setLoading(true))

    const token = await registerUserService(data);

    if (token) {
        const { access_token } = token
        localStorage.setItem(local_storage_web_key, access_token);
        setAuthToken(access_token);

        const user = decodeToken(access_token) as User;

        dispatch(setUser(user));
        dispatch(setLoading(false))
        router.push("/");
    }

    dispatch(setLoading(false))
}


export const logout = (router: AppRouterInstance) => async (dispatch: AppDispatch) => {
    localStorage.removeItem(local_storage_web_key);
    setAuthToken(null!);
    dispatch(setUser(null!));

    router.push("/login")
}