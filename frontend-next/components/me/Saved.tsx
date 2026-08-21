"use client";
import port from "@/api/api";
import { useEffect } from "react";

function Saved() {

    useEffect(() => {
        const handleFetchPostSave = async () => {
            try {
                const response = await fetch(`${port}/api/post-save`, {
                    method: "GET",
                    headers: {
                        "Content-Type": "application",
                    },
                    credentials: "include",
                });

                const data = await response.json();
                console.log(data);

            } catch (_err) {
                console.log("Error fething post save", _err);
            }
        }
        handleFetchPostSave();
    }, []);

    return (

        <div className="">
            Hello world
        </div>
    );
}

export default Saved;