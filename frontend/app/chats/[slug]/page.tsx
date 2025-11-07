'use client'
import ProtectedRouteLayout from "@/components/common/ProtectedRouteLayout"
import ChatUI from "@/components/chat/ChatUI";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { selectLoading } from "@/store/redux/chatSlice"
import { FC, useEffect } from "react";
import Loading from "@/components/common/Loading";
import { useParams } from "next/navigation";
import { getChatHistory } from "@/store/redux/chatSlice";

const Dashboard: FC = () => {
    const dispatch = useAppDispatch();
    const loading = useAppSelector(selectLoading);
    const { slug } = useParams();

    useEffect(() => {
        const chatId = slug?.toString()
        chatId && dispatch(getChatHistory(chatId));
    }, [])


    return (
        <ProtectedRouteLayout>
            {loading ?
                <Loading loading={loading} />
                :
                <ChatUI />
            }
        </ProtectedRouteLayout>
    );
}

export default Dashboard;