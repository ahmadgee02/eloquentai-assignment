import { FC, InputHTMLAttributes } from 'react';
import { ErrorMessage, Field } from 'formik';
import ErrMsg from './ErrMsg';
import { useField } from "formik";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  name: string;
}
const Input: FC<InputProps> = ({
    label,
    name,
    ...props
}) => {
    const [field] = useField(name);

    return (
        <div>
            <label htmlFor={name} className="block text-sm/6 font-medium text-white">
                {label}
            </label>
            <div className="mt-2">
                <Field
                    {...field}
                    {...props}
                    className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-black outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6"
                />
                <ErrorMessage  component={ErrMsg} name={name} />
            </div>
        </div>
    );
}

export default Input;