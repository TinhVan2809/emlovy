"use client";

import { useState } from "react";
import port from "@/api/api";

type Props = {
  post_id: number;
  type: string;
  onClose: () => void;
  onDeleted?: () => void;
};

export default function DeletePost({ type, post_id, onClose, onDeleted }: Props) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState("");

  const handleDelete = async () => {
    setIsDeleting(true);
    setError("");

    try {
      const response = await fetch(`${port}/api/posts/${post_id}`, {
        method: "DELETE",
        credentials: "include",
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Không thể xóa bài viết.");
      }

      onDeleted?.();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Có lỗi xảy ra.");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-1100 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-sm rounded-2xl bg-white p-5 shadow-2xl">
        <h3 className="text-lg font-semibold text-gray-900">Gỡ bài viết</h3>
        <p className="mt-2 text-sm text-gray-600">
          {type === "post"
            ? "Bạn có chắc muốn gỡ bài viết này không?"
            : "Bạn có chắc muốn xóa thước phim này không?"}
        </p>

        {error ? <p className="mt-3 text-sm text-red-500">{error}</p> : null}

        <div className="mt-5 flex justify-end gap-2">
          <button
            type="button"
            className="rounded-lg border border-gray-300 px-4 py-2 text-sm hover:bg-gray-50"
            onClick={onClose}
          >
            Hủy
          </button>
          <button
            type="button"
            className="rounded-lg bg-red-600 px-4 py-2 text-sm text-white hover:bg-red-700 disabled:opacity-60"
            onClick={handleDelete}
            disabled={isDeleting}
          >
            {isDeleting ? "Đang xóa..." : "Xóa"}
          </button>
        </div>
      </div>
    </div>
  );
}