'use client';

import { ChangeEvent, FormEvent, useState, useRef } from "react";
import port from "@/api/api";

export default function CreateReel() {
    const [videoPreview, setVideoPreview] = useState<string | null>(null);
    const [content, setContent] = useState("");
    const [videoFile, setVideoFile] = useState<File | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [error, setError] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];

        if (!file) {
            setVideoPreview(null);
            setVideoFile(null);
            return;
        }

        // Dọn dẹp object URL cũ để tránh rò rỉ bộ nhớ
        if (videoPreview) {
            URL.revokeObjectURL(videoPreview);
        }

        const videoUrl = URL.createObjectURL(file);
        setVideoPreview(videoUrl);
        setVideoFile(file);
    };

    const handleRemoveVideo = () => {
        if (videoPreview) {
            URL.revokeObjectURL(videoPreview);
        }
        setVideoPreview(null);
        setVideoFile(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    };

    const handleUpload = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setError(null);
        setUploadProgress(0);

        if (!videoFile) {
            alert("Vui lòng chọn video trước khi đăng");
            return;
        }

        setIsLoading(true);
        
        const formData = new FormData();
        formData.append("content", content);
        formData.append("video", videoFile, videoFile.name);

        const xhr = new XMLHttpRequest();

        xhr.open("POST", `${port}/api/reels`, true);
        xhr.withCredentials = true;

        xhr.upload.onprogress = (event) => {
            if (event.lengthComputable) {
                const percentComplete = (event.loaded / event.total) * 100;
                setUploadProgress(percentComplete);
            }
        };

        xhr.onload = () => {
            setIsLoading(false);
            setUploadProgress(0);

            try {
                const data = JSON.parse(xhr.responseText);
                if (xhr.status >= 200 && xhr.status < 300) {
                    console.log(data);
                    alert("Đăng reel thành công!");

                    // Reset form
                    setContent("");
                    setVideoFile(null);
                    setVideoPreview(null);
                    if (fileInputRef.current) {
                        fileInputRef.current.value = "";
                    }
                } else {
                    throw new Error(data.message || `Yêu cầu thất bại với mã trạng thái ${xhr.status}`);
                }
            } catch (err) {
                const errorMessage = err instanceof Error ? err.message : "Đã xảy ra lỗi không xác định.";
                console.error(err);
                setError(errorMessage);
                alert(errorMessage);
            }
        };

        xhr.onerror = () => {
            setIsLoading(false);
            setUploadProgress(0);
            const errorMessage = "Lỗi mạng hoặc không thể kết nối đến máy chủ.";
            setError(errorMessage);
            alert(errorMessage);
        };

        xhr.send(formData);
    };

    return (
        <div className="bg-[#f2f3f8] min-h-screen px-4 py-10 sm:px-6 lg:px-8">
            <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-lg overflow-hidden">
                <div className="px-6 py-5">
                    <h2 className="text-2xl font-bold text-gray-800">Tạo Reel mới</h2>
                    <p className="text-sm text-gray-500 mt-1">Tải lên một video và chia sẻ với mọi người</p>
                </div>
                <hr />
                <div className="p-6">
                    <form onSubmit={handleUpload} className="space-y-6">
                        <div>
                            {videoPreview ? (
                                <div className="space-y-4">
                                    <div className="w-full aspect-9/16 rounded-xl overflow-hidden bg-black relative">
                                        <video src={videoPreview} autoPlay controls loop muted className="w-full h-full object-contain" />
                                    </div>
                                    <button type="button" onClick={handleRemoveVideo} disabled={isLoading} className="text-sm text-red-500 hover:underline disabled:opacity-50">
                                        Xóa và chọn video khác
                                    </button>
                                </div>
                            ) : (
                                <div onClick={() => !isLoading && fileInputRef.current?.click()} className="flex flex-col items-center justify-center w-full h-64 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer hover:bg-gray-50 transition-colors">
                                    <svg className="w-12 h-12 text-gray-400 mb-3" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 16">
                                        <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2"/>
                                    </svg>
                                    <p className="text-sm text-gray-500">Kéo và thả hoặc nhấp để chọn video</p>
                                    <p className="text-xs text-gray-400 mt-1">MP4, MOV, WebM, OGG</p>
                                    <input ref={fileInputRef} type="file" accept="video/*" name="video" onChange={handleFileChange} className="hidden" disabled={isLoading} />
                                </div>
                            )}
                        </div>

                        <div>
                            <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-1">Chú thích (không bắt buộc)</label>
                            <textarea id="content" name="content" rows={3} placeholder="Viết chú thích của bạn..." value={content} onChange={(e) => setContent(e.target.value)} disabled={isLoading} className="w-full rounded-lg border border-gray-300 p-2 focus:ring-blue-500 focus:border-blue-500 transition" />
                        </div>

                        {isLoading && (
                            <div className="space-y-2">
                                <div className="flex justify-between text-sm font-medium text-gray-600">
                                    <span>Đang tải lên...</span>
                                    <span>{Math.round(uploadProgress)}%</span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-2.5">
                                    <div className="bg-blue-600 h-2.5 rounded-full transition-all duration-300 ease-in-out" style={{ width: `${uploadProgress}%` }}></div>
                                </div>
                            </div>
                        )}

                        {error && <p className="text-sm text-red-600 bg-red-100 p-3 rounded-lg">{error}</p>}

                        <div className="flex justify-end">
                            <button type="submit" disabled={isLoading || !videoFile} className="inline-flex items-center justify-center px-6 py-2.5 border border-transparent text-base font-medium rounded-full shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all">
                                {isLoading ? "Đang đăng..." : "Đăng Reel"}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}