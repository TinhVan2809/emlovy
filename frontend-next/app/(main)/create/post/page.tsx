"use client";

import { useState, useRef } from "react";
import { RiAddLargeLine } from "@remixicon/react";
import port from "@/api/api";
import Image from "next/image";
// import { useSocket } from "@/context/SocketContext";

import {
  RiEmotionHappyLine,
  RiAtLine,
  RiHashtag,
  RiMapPinLine,
  RiLinksLine,
  RiTimer2Line,
  RiSendPlaneFill
} from "@remixicon/react";

export default function CreatePost() {
  const [content, setContent] = useState("");
  const [media, setMedia] = useState<File[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  // const { socket } = useSocket();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Hiển thị tên file đã chọn
    if (e.target.files) {
      const fileNames = Array.from(e.target.files)
        .map((file) => file.name)
        .join(", ");
      console.log("Selected files:", fileNames);
      setMedia(Array.from(e.target.files));
    }
  };

  const handleUpload = async () => {
    if (!content && !fileInputRef.current?.files?.length) {
      setError("Bài viết cần nội dung hoặc hình ảnh.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("content", content);

      if (fileInputRef.current?.files) {
        Array.from(fileInputRef.current.files).forEach((file) => {
          formData.append("media", file);
        });
      }

      const response = await fetch(`${port}/api/posts`, {
        method: "POST",
        body: formData,
        credentials: "include",
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.message || "Có lỗi xảy ra khi đăng bài.");
      }

      const data = await response.json();

      if (data.success) {
        console.log(data);
        alert("Đăng bài thành công!");
        setContent("");
      }

      if (fileInputRef.current) fileInputRef.current.value = "";
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (_err: any) {
      setError(_err.message || "Đã xảy ra lỗi không xác định.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-[#f2f3f8] px-10 py-20">
      <div className="bg-white">
        <div className="flex flex-col gap-10 p-5">
          <div className="w-full h-50">
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Nhập cảm nghĩ của bạn"
              className="w-full outline-0 resize-none"
              rows={4}
            />
          </div>

          {error && <div className="text-red-500 text-sm px-2">{error}</div>}

          <div className="w-full">
            <div className="flex flex-wrap gap-4">
              {media.map((m, index) => (
                <div className="" key={index}>
                  {m.type.startsWith("image/") ? (
                    <div className="relative w-30 h-30">
                      <Image
                        src={URL.createObjectURL(m)}
                        fill
                        alt="image"
                        className="rounded-md object-cover"
                        loading="lazy"
                      />
                    </div>
                  ) : (
                    ""
                  )}
                </div>
              ))}
            </div>
          </div>

          <div
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center justify-center px-3 py-2 border border-dashed border-gray-300 rounded-xl opacity-50 gap-2 cursor-pointer hover:opacity-100 transition-opacity"
          >
            <RiAddLargeLine size={22} />
            <span className="text-sm">Add more media</span>
            <input
              type="file"
              multiple
              ref={fileInputRef}
              onChange={handleFileChange}
              className="hidden"
              accept="image/*,video/*"
            />
          </div>
        </div>
        <hr className="h-1 w-full border-black/10" />
        <div className="w-full flex items-center justify-between">
          <div className="flex flex-col gap-3 w-full pt-5">
            <div className="flex items-center gap-3 px-10">
              <button className="p-1 rounded-md hover:bg-[#c0c0cc72]">
                <RiEmotionHappyLine
                  size={18}
                  className="text-[#aaaab6]"
                />
              </button>
              <button className="p-1 rounded-md hover:bg-[#c0c0cc72]">
                <RiAtLine
                  size={18}
                  className="text-[#aaaab6]"
                />
              </button>
              <button className="p-1 rounded-md hover:bg-[#c0c0cc72]">
                <RiHashtag
                  size={18}
                  className="text-[#aaaab6]"
                />
              </button>
              <button className="p-1 rounded-md hover:bg-[#c0c0cc72]">
                <RiMapPinLine
                  size={18}
                  className="text-[#aaaab6]"
                />
              </button>
              <button className="p-1 rounded-md hover:bg-[#c0c0cc72]">
                <RiLinksLine
                  size={18}
                  className="text-[#aaaab6]"
                />
              </button>
              <button className="p-1 rounded-md hover:bg-[#c0c0cc72]">
                <RiTimer2Line
                  size={18}
                  className="text-[#aaaab6]"
                />
              </button>
            </div>
            <div className="flex flex-col md:flex-row gap-2 items-center bg-[#fafafa] p-5 md:px-10 md:py-5 w-full justify-between">
              <div className="flex items-center gap-3">
                <button className="border border-gray-200 px-3 py-1 rounded-2xl text-sm text-black/50">
                  Save draft
                </button>
                <button className="border border-gray-200 px-3 py-1 rounded-2xl text-sm text-black/50">
                  Preview
                </button>
                <button className="border border-gray-200 px-3 py-1 rounded-2xl text-sm text-black/50">
                  Schedule
                </button>
              </div>

              <button
                onClick={handleUpload}
                disabled={loading}
                className={`px-3 py-2 rounded-2xl bg-[#5c4cf8] text-sm text-white duration-150 hover:shadow-xl ${loading ? "opacity-50 cursor-not-allowed" : ""}`}
              >
                {loading ? "Đang tải lên..." : (
                  <div className="flex items-center gap-1">
                    <RiSendPlaneFill size={20}/>
                    <span>Đăng ngay</span>
                  </div>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
