"use client";

import port from "@/api/api";
import { useEffect, useState } from "react";

type Props = {
  onClose: React.MouseEventHandler<HTMLDivElement>;
  post_id: number | null;
  kind: string;
};
export default function CommentSheet({ onClose, post_id, kind }: Props) {
  const [comment, setComment] = useState([]);
  const [isLoading, setIsLaoding] = useState(false);

  useEffect(() => {
    const handleFetchCommnent = async (nextPage = 1) => {
      setIsLaoding(true);
      try {
        const response = await fetch(`${port}/api/posts/${post_id}/comments?page=${nextPage}&limit=10`, {
          credentials: "include",
        });

        if (!response.ok) throw new Error(`ERROR HTTP ${response.status}`);

        const data = await response.json();

        if (data.success) {
          setComment(data.data.items);
        }
      } catch (_err) {
        console.error("Error fething comment", _err);
      } finally {
        setIsLaoding(false);
      }
    };
    handleFetchCommnent();
  }, [post_id]);
  return (
    <div
      className="w-full h-screen fixed top-0 right-0 z-10000 bg-black/20 flex justify-center items-center"
      onClick={onClose}
    >
      <div
        className="w-[60%] h-[90%] bg-white shadow-2xl rounded-md"
        onClick={(e) => e.stopPropagation()}
      ></div>
    </div>
  );
}
