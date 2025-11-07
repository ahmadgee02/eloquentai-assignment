"use client";
import { FC } from 'react'
import { ClipLoader } from "react-spinners";

interface LoadingProps {
    loading: boolean;
}

const Loading: FC<LoadingProps> = (props) => {

    return (
        <div className="flex h-screen">
            <div className="m-auto">
                <ClipLoader
                    color={"white"}
                    loading={true}
                    // cssOverride={override}
                    size={150}
                    aria-label="Loading Spinner"
                    data-testid="loader"
                />
            </div>
        </div>
    )
}


export default Loading;