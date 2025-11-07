'use client'
import { FC } from 'react'
import { Dialog, DialogBackdrop, DialogPanel } from '@headlessui/react'

interface Props {
    open: boolean;
    onClose: (open: boolean) => void;
    children: React.ReactNode;
}

const Modal: FC<Props> = (props) => {
    const { open, onClose, children } = props;

    return (
        <Dialog open={open} onClose={onClose} className="relative z-10">
            <DialogBackdrop
                transition
                className="fixed inset-0 bg-gray-500/75 transition-opacity data-closed:opacity-0 data-enter:duration-300 data-enter:ease-out data-leave:duration-200 data-leave:ease-in"
            />

            <div className="fixed inset-0 z-10 w-screen overflow-y-auto">
                <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
                    <DialogPanel
                        transition
                        className="bg-gray-900 relative transform overflow-hidden rounded-lg px-4 pt-5 pb-4 text-left shadow-xl transition-all data-closed:translate-y-4 data-closed:opacity-0 data-enter:duration-300 data-enter:ease-out data-leave:duration-200 data-leave:ease-in sm:my-8 sm:w-full sm:max-w-3xl sm:p-6 data-closed:sm:translate-y-0 data-closed:sm:scale-95"
                    >
                        {children}
                    </DialogPanel>
                </div>
            </div>
        </Dialog>
    )
}

export default Modal;