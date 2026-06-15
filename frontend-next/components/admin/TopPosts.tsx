'use client';
import port from "@/api/api";
import { useEffect, useState } from "react";
function TopPosts() {
   const [topPost, setTopPost] = useState([]);

    useEffect(() => {
        const handleFetchTopPosts = async() => {
            try{
                const response = await fetch(`${port}/api/admin/stats/top-posts`, {
                    method: 'GET',
                    credentials: 'include',
                });
                const data = await response.json();

                if(data.success) {
                    setTopPost(data.data);
                }
            } catch(_err) { 
                console.error("Error fething top posts", _err);
            }
        };
        handleFetchTopPosts();
    },[]);

    return ( <div className="">
        top posts
    </div>  );
}

export default TopPosts;