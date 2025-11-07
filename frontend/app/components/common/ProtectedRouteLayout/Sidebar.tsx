'use client';

import { FC, useEffect, useState } from 'react';
import {
    Dialog,
    DialogBackdrop,
    DialogPanel,
    TransitionChild,
} from '@headlessui/react';
import {
    HomeIcon,
    XMarkIcon,
    TrashIcon
} from '@heroicons/react/24/outline';
import { classNames } from "@/utils";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { usePathname } from 'next/navigation'
import DeleteModal from "@/components/common/DeleteModal";
import { selectAllChats, getAllChatHistory, deleteChat } from '@/store/redux/chatSlice';
import { selectUser } from '@/store/redux/authSlice';


const navigation = [
    { name: 'Start New Chat', href: '/', icon: HomeIcon }
];

interface Props {
    sidebarOpen: boolean;
    setSidebarOpen: (open: boolean) => void;
}

const Sidebar: FC<Props> = (props) => {
    const { sidebarOpen, setSidebarOpen } = props;
    const dispatch = useAppDispatch();
    const pathname = usePathname()
    const chatHistory = useAppSelector(selectAllChats);
    const user = useAppSelector(selectUser)

    const [deleteOpen, setDeleteOpen] = useState<string>(null!);

    useEffect(() => {
        user && dispatch(getAllChatHistory())
    }, [])


    const onDelete = () => {
        dispatch(deleteChat(deleteOpen))
        setDeleteOpen(null!)
    }

    const onTrashIconClick = (chatId: string) => {
        setSidebarOpen(false)
        setDeleteOpen(chatId)
    }

    return (
        <>
            <Dialog open={sidebarOpen} onClose={setSidebarOpen} className="relative z-50 xl:hidden">
                <DialogBackdrop
                    transition
                    className="fixed inset-0 bg-gray-900/80 transition-opacity duration-300 ease-linear data-closed:opacity-0"
                />

                <div className="fixed inset-0 flex">
                    <DialogPanel
                        transition
                        className="relative mr-16 flex w-full max-w-xs flex-1 transform transition duration-300 ease-in-out data-closed:-translate-x-full"
                    >
                        <TransitionChild>
                            <div className=" absolute top-0 right-0 z-10 flex w-16 justify-center pt-5 duration-300 ease-in-out data-closed:opacity-0">
                                <button type="button" onClick={() => setSidebarOpen(false)} className="-m-2.5 p-2.5">
                                    <span className="sr-only">Close sidebar</span>
                                    <XMarkIcon aria-hidden="true" className="cursor-pointer size-6 text-white" />
                                </button>
                            </div>
                        </TransitionChild>

                        <div className="flex grow flex-col gap-y-5 bg-gray-900 px-6 pb-4 ring-1 ring-white/10 relative h-[100vh]">
                            <div className="flex h-16 shrink-0 items-center">
                                <img
                                    alt="Your Company"
                                    src="https://tailwindcss.com/plus-assets/img/logos/mark.svg?color=indigo&shade=500"
                                    className="h-8 w-auto"
                                />
                            </div>
                            <nav className="flex flex-1 flex-col">
                                <ul role="list" className="flex flex-1 flex-col gap-y-7">
                                    <li>
                                        <ul role="list" className="-mx-2 space-y-1">
                                            {navigation.map((item) => (
                                                <li key={item.name}>
                                                    <a
                                                        href={item.href}
                                                        className={'text-white group flex gap-x-3 rounded-md p-2 text-sm/6 font-semibold hover:bg-gray-800'}
                                                    >
                                                        <item.icon aria-hidden="true" className="size-6 shrink-0" />
                                                        {item.name}
                                                    </a>
                                                </li>
                                            ))}
                                        </ul>
                                    </li>

                                    <li>
                                        <div className="text-xs/6 font-semibold text-gray-400">History</div>
                                        <ul role="list" className="-mx-2 mt-2 space-y-1 h-[calc(100vh-440px)] overflow-y-auto hide-scrollbar">
                                            {chatHistory.map(({ _id, title }) => (
                                                <li key={_id}
                                                    className={classNames(
                                                        pathname === `/chats/${_id}`? 'bg-gray-700': '',
                                                        'flex items-center justify-between hover:bg-gray-800 hover:text-white pr-2 rounded cursor-pointer'
                                                    )}>
                                                    <a
                                                        href={`/chats/${_id}`}
                                                        className='group flex gap-x-3 rounded-md p-2 text-sm/6 font-semibold text-white'
                                                    >
                                                        <span className="truncate">{title}</span>
                                                    </a>
                                                    <TrashIcon onClick={() => onTrashIconClick(_id || "")} aria-hidden="true" className="ml-auto size-6 shrink-0 flex-end" />
                                                </li>
                                            ))}
                                        </ul>
                                    </li>
                                </ul>
                            </nav>
                        </div>
                    </DialogPanel>
                </div>
            </Dialog>

            {/* Static sidebar for desktop */}
            <div className="hidden xl:fixed xl:inset-y-0 xl:z-50 xl:flex xl:w-72 xl:flex-col sidebar">
                <div className="flex grow flex-col gap-y-5 h-[100vh] px-6 pb-4">
                    <div className="flex h-16 shrink-0 items-center">
                        <img
                            alt="Your Company"
                            src="https://tailwindcss.com/plus-assets/img/logos/mark.svg?color=indigo&shade=500"
                            className="h-8 w-auto"
                        />
                    </div>
                    <nav className="flex flex-1 flex-col">
                        <ul role="list" className="flex flex-1 flex-col gap-y-7">
                            <li>
                                <ul role="list" className="-mx-2 space-y-1">
                                    {navigation.map((item) => (
                                        <li key={item.name} className='flex justify-between items-center hover:bg-gray-800 hover:text-white pr-2 rounded '>
                                            <a
                                                href={item.href}
                                                className={'group flex gap-x-3 rounded-md p-2 text-sm/6 font-semibold'}
                                            >
                                                <item.icon aria-hidden="true" className="size-6 shrink-0" />
                                                {item.name}
                                            </a>
                                        </li>
                                    ))}
                                </ul>
                            </li>
                            <li>
                                <div className="text-xs/6 font-semibold">History</div>
                                <ul role="list" className="-mx-2 mt-2 space-y-1 h-[calc(100vh-440px)] overflow-y-auto hide-scrollbar">
                                    {chatHistory.map(({ _id, title }) => (
                                        <li key={_id} className={classNames(
                                            pathname === `/chats/${_id}` ? 'bg-gray-700 ' : '',
                                            'flex items-center justify-between hover:bg-gray-800 hover:text-white pr-2 rounded cursor-pointer hover:bg-gray-800 '
                                        )}>
                                            <a
                                                href={`/chats/${_id}`}
                                                className={'group flex gap-x-3 rounded-md p-2 text-sm/6 font-semibold text-white'}
                                            >
                                                <span className="truncate">{title}</span>
                                            </a>
                                            <TrashIcon onClick={() => onTrashIconClick(_id || "")} aria-hidden="true" className="ml-auto cursor-pointer size-6 shrink-0 flex-end" />
                                        </li>
                                    ))}
                                </ul>
                            </li>
                        </ul>
                    </nav>
                </div>

                <DeleteModal
                    title={`Delete Chat`}
                    open={!!deleteOpen}
                    setOpen={setDeleteOpen}
                    onDelete={onDelete}
                />
            </div>
        </>
    )
}


export default Sidebar;