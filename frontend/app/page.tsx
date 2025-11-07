'use client'

import ProtectedRouteLayout from "@/components/common/ProtectedRouteLayout"
import ChatUI from "@/components/chat/ChatUI";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { FC, useEffect } from "react";
import {
  selectIsUserSignedIn,
  setUser,
} from "@/store/redux/authSlice";
import Header from "./components/common/ProtectedRouteLayout/Header";
import { decodeToken, isExpired } from "react-jwt";
import { local_storage_web_key } from "./utils/Constants";
import { User } from "./types";
import { setAuthToken } from "./services/core/HttpService";


const Dashboard: FC = () => {
  const dispatch = useAppDispatch();
  
  const isUserSignedIn = useAppSelector(selectIsUserSignedIn)
    useEffect(() => {
        const token = localStorage.getItem(local_storage_web_key);

        if (token) {
            const myDecodedToken = decodeToken(token) as User;

            setAuthToken(token);
            dispatch(setUser(myDecodedToken));
        }
    }, []);

  if (isUserSignedIn) {
    return (
      <ProtectedRouteLayout>
        <ChatUI />
      </ProtectedRouteLayout>
    )
  }

  return (
    <>
      <main className="relative w-full h-full">
        <Header setSidebarOpen={() => { }} />
        <div className="mx-auto max-w-4xl">
          <ChatUI />
        </div>
      </main>
    </>
  );
}

export default Dashboard;

function dispatch(arg0: any) {
  throw new Error("Function not implemented.");
}
