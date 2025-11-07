'use client'

import { FC } from 'react'
import { DialogTitle } from '@headlessui/react'
import { ExclamationTriangleIcon } from '@heroicons/react/24/outline'
import Modal from './Modal';

interface Props {
    title: string;
    open: boolean;
    setOpen: (open: string) => void
    onDelete: () => void;
}


const DeleteModal: FC<Props> = (props) => {
    const { open, setOpen, title, onDelete } = props;

    return (
        <Modal open={open} onClose={() => setOpen(null!)}>
            <div className="sm:flex sm:items-start">
                <div className="mx-auto flex size-12 shrink-0 items-center justify-center rounded-full bg-red-100 sm:mx-0 sm:size-10">
                    <ExclamationTriangleIcon aria-hidden="true" className="size-6 text-red-600" />
                </div>
                <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                    <DialogTitle as="h3" className="text-base font-semibold">
                        {title}
                    </DialogTitle>

                    <div className="mt-2">
                        <p className="text-sm text-gray-500">
                            Are you sure you want to delete? All of your data will be permanently removed
                            from our servers forever. This action cannot be undone.
                        </p>
                    </div>
                </div>
            </div>
            <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
                <button
                    type="button"
                    onClick={onDelete}
                    className="cursor-pointer inline-flex w-full justify-center rounded-md bg-red-600 px-3 py-2 text-sm font-semibold text-white shadow-xs hover:bg-red-500 sm:ml-3 sm:w-auto"
                >
                    Delete
                </button>
                <button
                    type="button"
                    data-autofocus
                    onClick={() => setOpen(null!)}
                    className="cursor-pointer mt-3 inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-xs ring-1 ring-gray-300 ring-inset hover:bg-gray-50 sm:mt-0 sm:w-auto"
                >
                    Cancel
                </button>
            </div>
        </Modal>
    )
}

export default DeleteModal;