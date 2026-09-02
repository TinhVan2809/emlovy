"use client";

import { useEffect, useMemo, useState } from "react";
import port from "@/api/api";
import Image from "next/image";

export interface EditPostMedia {
  post_media_id?: number;
  media_url: string;
  type?: string;
}

export interface EditPostData {
  post_id: number;
  content?: string;
  media?: EditPostMedia[];
}

interface EditPostModalProps {
  open: boolean;
  post: EditPostData | null;
  onClose: () => void;
  onSaved: (updatedPost: EditPostData) => void;
}

function EditPostModal({ open, post, onClose, onSaved }: EditPostModalProps) {
  const [content, setContent] = useState("");
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!open || !post) {
      return;
    }

    // eslint-disable-next-line react-hooks/set-state-in-effect
    setContent(post.content || "");
    setSelectedFiles([]);
    setPreviewUrls([]);
    setError("");
  }, [open, post]);

  useEffect(() => {
    if (!selectedFiles.length) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setPreviewUrls([]); // Xóa preview nếu không còn file nào được chọn
      return;
    }

    const urls = selectedFiles.map((file) => URL.createObjectURL(file));
    setPreviewUrls(urls);

    return () => {
      urls.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [selectedFiles]);

  const existingMedia = useMemo(() => post?.media || [], [post?.media]);

  if (!open || !post) {
    return null;
  }
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    setSelectedFiles(files);
  };

  const handleSubmit = async () => {
    if (
      !content.trim() &&
      !selectedFiles.length &&
      existingMedia.length === 0
    ) {
      setError("Vui lòng nhập nội dung hoặc chọn ảnh mới.");
      return;
    }

    setIsSaving(true);
    setError("");

    try {
      const formData = new FormData();
      formData.append("content", content.trim());
      formData.append("replaceMedia", String(selectedFiles.length > 0));

      selectedFiles.forEach((file) => {
        formData.append("media", file);
      });

      const response = await fetch(`${port}/api/posts/${post.post_id}`, {
        method: "PATCH",
        credentials: "include",
        body: formData,
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Không thể cập nhật bài viết.");
      }

      onSaved(result.data);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Có lỗi xảy ra.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-1100 flex items-center justify-center bg-black/50 p-4">
      <div
        className="w-full max-w-2xl rounded-2xl bg-white shadow-2xl"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-gray-200 px-4 py-3">
          <h3 className="text-lg font-semibold">Chỉnh sửa bài viết</h3>
          <button
            type="button"
            className="rounded-full px-2 py-1 text-sm text-gray-500 hover:bg-gray-100"
            onClick={onClose}
          >
            ×
          </button>
        </div>

        <div className="max-h-[75vh] overflow-y-auto p-4">
          <label className="mb-3 block text-sm font-medium text-gray-700">
            Nội dung
            <textarea
              value={content}
              onChange={(event) => setContent(event.target.value)}
              rows={5}
              className="mt-1 w-full rounded-xl border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500"
              placeholder="Bạn đang nghĩ gì?"
            />
          </label>

          <div className="mb-3">
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Thay đổi hình ảnh
            </label>
            <input
              type="file"
              accept="image/*,video/*"
              multiple
              onChange={handleFileChange}
              className="w-full rounded-xl border border-dashed border-gray-300 px-3 py-2 text-sm"
            />
          </div>

          {error ? <p className="mb-3 text-sm text-red-500">{error}</p> : null}

          <div className="grid grid-cols-2 gap-3">
            {existingMedia.length > 0 &&
              existingMedia.map((media, index) => {
                const mediaUrl = media.media_url
                  ? `${port}${media.media_url}`
                  : "";

                return (
                  <div
                    key={media.post_media_id || `${media.media_url}-${index}`}
                    className="overflow-hidden rounded-xl border border-gray-200 bg-gray-50"
                  >
                    {media.type === "video" ||
                    /\.(mp4|mov|webm|ogg)$/i.test(media.media_url || "") ? (
                      <video
                        src={mediaUrl}
                        className="h-40 w-full object-cover"
                        controls
                        muted
                      />
                    ) : (
                      <div className="relative h-40 w-full">
                        <Image
                          src={mediaUrl}
                          alt="existing media"
                          className=" object-cover"
                          fill
                        />
                      </div>
                    )}
                  </div>
                );
              })}

            {previewUrls.map((url, index) => (
              <div
                key={`${url}-${index}`}
                className="overflow-hidden rounded-xl border border-gray-200 bg-gray-50"
              >
                {selectedFiles[index]?.type?.startsWith("video") ? (
                  <video
                    src={url}
                    className="h-40 w-full object-cover"
                    controls
                    playsInline
                    preload="metadata"
                    muted
                  />
                ) : (
                  <div className="relative h-40 w-full">
                    <Image
                      src={url}
                      alt="new preview"
                      className="object-cover"
                      fill
                    />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="flex justify-end gap-2 border-t border-gray-200 px-4 py-3">
          <button
            type="button"
            className="rounded-lg border border-gray-300 px-4 py-2 text-sm hover:bg-gray-50"
            onClick={onClose}
          >
            Hủy
          </button>
          <button
            type="button"
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700 disabled:opacity-60"
            onClick={handleSubmit}
            disabled={isSaving}
          >
            {isSaving ? "Đang lưu..." : "Lưu thay đổi"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default EditPostModal;
