'use client'

import { useState, useEffect } from "react";
import { useAppDispatch } from "@/store/hooks";
import {
    logout,
    setUser
} from "@/store/redux/authSlice";
import Header from "./Header";
import { useRouter } from 'next/navigation';
import { local_storage_web_key } from "@/utils/Constants";
import { isExpired, decodeToken } from "react-jwt";
import { User } from "@/types";
import { setAuthToken } from "@/services/core/HttpService";
import dynamic from "next/dynamic";
const Sidebar = dynamic(() => import('./Sidebar'), { ssr: false });

const ProtectedRouteLayout = (props: any) => {
    const router = useRouter()
    const dispatch = useAppDispatch();
    const [sidebarOpen, setSidebarOpen] = useState(true)

    useEffect(() => {
        const token = localStorage.getItem(local_storage_web_key);

        if (token) {
            const myDecodedToken = decodeToken(token) as User;
            const isMyTokenExpired = isExpired(token);

            if (isMyTokenExpired) {
                dispatch(logout(router))
            }
            setAuthToken(token);
            dispatch(setUser(myDecodedToken));
        } else {
            dispatch(logout(router))
        }
    }, []);

    return (
        <div>
            {/* Only show sidebar if user is signed in */}
            <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
            <div className={"xl:pl-72"}>

                <main className="relative w-full h-full">
                    <Header setSidebarOpen={setSidebarOpen} />
                    

                    <div className="mx-auto max-w-4xl">{props.children}</div>
                </main>

            </div>
            
        </div>
    );
}

export default ProtectedRouteLayout;