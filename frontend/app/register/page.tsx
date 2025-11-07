"use client";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
    selectLoading,
    registerUser,
    setUser,
    logout,
    selectUser
} from "@/store/redux/authSlice";
import { FC, useEffect } from 'react'
import Loading from "../components/common/Loading";
import { useRouter } from 'next/navigation';
import { local_storage_web_key } from "@/utils/Constants";
import { isExpired, decodeToken } from "react-jwt";
import { User } from "@/types";
import Link from "next/link";
import { useFormik, Form, FormikProvider } from 'formik';
import * as Yup from "yup";
import Input from '@/components/common/form/Input';

const initialValues = {
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
}

// validation schema
const validationSchema = Yup.object({
    name: Yup.string()
        .required("Name is required"),
    email: Yup.string()
        .email("Invalid email format")
        .required("Email is required"),
    password: Yup.string()
        .min(6, "Password must be at least 6 characters")
        .required("Password is required"),
    confirmPassword: Yup.string()
        .oneOf([Yup.ref('password')], "Passwords must match")
        .required("Confirm Password is required")
});


const RegisterPage: FC = () => {
    const router = useRouter();
    const dispatch = useAppDispatch();
    const loading = useAppSelector(selectLoading);
    const user = useAppSelector(selectUser);

    const formik = useFormik({
        initialValues,
        validationSchema,
        onSubmit: async (values) => {

            dispatch(registerUser(values, router));
        },
    });

    useEffect(() => {
        // getting JWT token from local storage
        const token = localStorage.getItem(local_storage_web_key);

        if (token) {
            const myDecodedToken = decodeToken(token) as User;
            const isMyTokenExpired = isExpired(token);

            if (isMyTokenExpired) {
                dispatch(logout(router))
            }

            dispatch(setUser(myDecodedToken));
        }
    }, []);

    useEffect(() => {
        if (user) {
            router.push("/")
        }
    }, [user])

    const { values } = formik;

    if (loading) {
        return <Loading loading={loading} />
    }


    return (
        <>
            <div className="flex min-h-full flex-1 flex-col justify-center px-6 py-12 lg:px-8">
                <div className="sm:mx-auto sm:w-full sm:max-w-sm">
                    <img
                        alt="Your Company"
                        src="https://tailwindcss.com/plus-assets/img/logos/mark.svg?color=indigo&shade=600"
                        className="mx-auto h-10 w-auto"
                    />
                    <h2 className="mt-10 text-center text-2xl/9 font-bold tracking-tight text-white">
                        Sign in to your account
                    </h2>
                </div>

                <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
                    <FormikProvider value={formik}>
                        <Form className="space-y-6">
                            <Input name="name" label="Name" />
                            <Input name="email" label="Email" />
                            <Input name="password" label="Password" type="password" />
                            <Input name="confirmPassword" label="Confirm Password" type="password" />

                            <div>
                                <button
                                    type="submit"
                                    className="flex w-full justify-center rounded-md bg-indigo-600 px-3 py-1.5 text-sm/6 font-semibold text-white shadow-xs hover:bg-indigo-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                                >
                                    Register
                                </button>
                            </div>
                        </Form>
                    </FormikProvider>
                </div>

                <p className="mt-10 text-center text-sm/6 text-gray-500 dark:text-gray-400">
                    Already a member?{' '}
                    <Link
                        href="/login"
                        className="font-semibold text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300"
                    >
                        Sign in now
                    </Link>
                </p>
            </div>
        </>
    )
}

export default RegisterPage;