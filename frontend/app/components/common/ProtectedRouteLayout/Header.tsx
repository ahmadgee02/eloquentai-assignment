'use client'

import { FC } from 'react';
import {
    Menu,
    MenuButton,
    MenuItem,
    MenuItems
} from '@headlessui/react';
import {
    Bars3Icon
} from '@heroicons/react/24/outline';
import { ChevronDownIcon } from '@heroicons/react/20/solid';
import { useRouter } from 'next/navigation';
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
    selectUser,
    logout,
    selectIsUserSignedIn
} from "@/store/redux/authSlice";
import {
    resetCurrentChat
} from "@/store/redux/chatSlice"

interface Props {
    setSidebarOpen: (open: boolean) => void
}

const Header: FC<Props> = (props) => {
    const { setSidebarOpen } = props
    const router = useRouter()
    const dispatch = useAppDispatch();
    const user = useAppSelector(selectUser);
    const isUserSignedIn = useAppSelector(selectIsUserSignedIn)

    const onSignout = () => {
        dispatch(logout(router))
    }

    const onSIgninClick = () => {
        router.push("/login")
    }

    const onStartNewChat = () => {
        dispatch(resetCurrentChat())
    }

    return (
        <div className="sticky top-0 z-40 flex h-16 shrink-0 items-center gap-x-4 px-4 shadow-xs sm:gap-x-6 sm:px-6 lg:px-8">
            {isUserSignedIn && <button type="button" onClick={() => setSidebarOpen(true)} className="cursor-pointer -m-2.5 p-2.5 text-gray-400 xl:hidden">
                <span className="sr-only">Open sidebar</span>
                <Bars3Icon aria-hidden="true" className="size-6" />
            </button>
            }

            {/* Separator */}
            <div aria-hidden="true" className="h-6 w-px bg-gray-900/10 lg:hidden" />

            <div className="flex flex-1 gap-x-4 self-stretch lg:gap-x-6">
                <div className="grid flex-1 grid-cols-1">

                </div>
                <div className="flex items-center gap-x-4 lg:gap-x-6">
                    {/* Profile dropdown */}
                    {isUserSignedIn ?
                        <Menu as="div" className="relative">
                            <MenuButton className="relative flex items-center cursor-pointer">
                                <span className="absolute -inset-1.5" />
                                <span className="sr-only">Open user menu</span>
                                <img
                                    alt=""
                                    src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
                                    className="size-8 rounded-full bg-gray-50"
                                />
                                <span className="hidden lg:flex lg:items-center">
                                    <span aria-hidden="true" className="ml-4 text-sm/6 font-semibold">
                                        {user?.name}
                                    </span>
                                    <ChevronDownIcon aria-hidden="true" className="ml-2 size-5 text-gray-400" />
                                </span>
                            </MenuButton>
                            <MenuItems
                                transition
                                className="absolute right-0 z-10 mt-2.5 w-36 origin-top-right rounded-md bg-white py-2 shadow-lg ring-1 ring-gray-900/5 transition focus:outline-hidden data-closed:scale-95 data-closed:transform data-closed:opacity-0 data-enter:duration-100 data-enter:ease-out data-leave:duration-75 data-leave:ease-in"
                            >
                                <MenuItem>
                                    <a
                                        onClick={onSignout}
                                        className="cursor-pointer block px-3 py-1 text-sm/6 text-gray-900 data-focus:bg-gray-50 data-focus:outline-hidden"
                                    >
                                        Sign out
                                    </a>
                                </MenuItem>
                            </MenuItems>
                        </Menu>
                        :
                        <>
                            <button
                                onClick={onStartNewChat}
                                className="cursor-pointer inline-flex items-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-xs hover:bg-indigo-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:bg-gray-300 disabled:text-gray-500 disabled:cursor-not-allowed"
                            >
                                Start New Chat
                            </button>

                            <button
                                onClick={onSIgninClick}
                                className="cursor-pointer inline-flex items-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-xs hover:bg-indigo-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:bg-gray-300 disabled:text-gray-500 disabled:cursor-not-allowed"
                            >
                                Sign in
                            </button>

                        </>
                    }
                </div>
            </div>
        </div>
    )
}

export default Header;