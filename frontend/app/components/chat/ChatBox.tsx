'use client'

import { FC } from 'react'
import { useFormik, FormikProvider, Field, Form } from 'formik';
import * as Yup from "yup";
import { useAppDispatch } from "@/store/hooks";
import { sendPrompt } from '@/store/redux/chatSlice';

const initialValues = {
    prompt: "",
}

// validation schema
const validationSchema = Yup.object({
    prompt: Yup.string()
        .required("Prompt is required")
});

const ChatBox: FC = () => {
    const dispatch = useAppDispatch();

    const formik = useFormik({
        initialValues,
        validationSchema,
        onSubmit: async (values, actions) => {
            const { prompt } = values;
            if (!prompt) {
                return;
            }

            dispatch(sendPrompt(prompt));
            actions.resetForm()
        },
    });

    const { values, handleSubmit } = formik;
    const { prompt } = values;

    return (
        <FormikProvider value={formik}>
            <Form className="relative">
                <div className="chatbox rounded-4xl p-4">
                    <Field
                        component="textarea"
                        name="prompt"
                        rows={4}
                        placeholder="Write a prompt..."
                        className="block w-full resize-none px-3 py-1.5 text-base placeholder:text-gray-400 focus:outline-none sm:text-sm/6"
                        onKeyDown={(e: React.KeyboardEvent<HTMLTextAreaElement>) => {
                            if (e.key === "Enter" && !e.shiftKey) {
                                e.preventDefault(); 
                                handleSubmit();
                            }
                        }}
                    />

                    {/* Spacer element to match the height of the toolbar */}
                    <div aria-hidden="true">
                        <div className="h-px" />
                        <div className="py-2">
                            <div className="py-px">
                                <div className="h-9" />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="absolute inset-x-px bottom-0 px-4 pb-4">
                    <div className="flex flex-nowrap space-x-2 px-2 py-2 sm:px-3">
                    </div>
                    <div className="flex items-center text-indigo-600 justify-between space-x-3 px-2 py-2 sm:px-3">

                        <div className="shrink-0">
                            <button
                                type="submit"
                                className="cursor-pointer inline-flex items-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-xs hover:bg-indigo-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:bg-gray-300 disabled:text-gray-500 disabled:cursor-not-allowed"
                                disabled={!prompt}
                            >
                                Send
                            </button>
                        </div>
                    </div>
                </div>
            </Form>
        </FormikProvider>
    )
}

export default ChatBox;