"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import port from "@/api/api";

type Step = "pick" | "preview";

interface StoryUploadModalProps {
  onClose: () => void;
  onUploaded: () => void;
}

export default function StoryUploadModal({ onClose, onUploaded }: StoryUploadModalProps) {
  const [step, setStep] = useState<Step>("pick");
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [caption, setCaption] = useState("");
  const [bgColor, setBgColor] = useState("#FFE1D6");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const backdropRef = useRef<HTMLDivElement>(null);

  // ── Cleanup preview URL on unmount ──────────────────────────────────────────
  useEffect(() => {
    return () => {
      if (preview) URL.revokeObjectURL(preview);
    };
  }, [preview]);

  // ── Close on Escape key ─────────────────────────────────────────────────────
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [onClose]);

  // ── File selection handler ──────────────────────────────────────────────────
  const handleFile = useCallback((selected: File) => {
    if (preview) URL.revokeObjectURL(preview);
    setFile(selected);
    setPreview(URL.createObjectURL(selected));
    setError(null);
    setStep("preview");
  }, [preview]);

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) handleFile(f);
  };

  // ── Drag & Drop ────────────────────────────────────────────────────────────
  const onDragOver = (e: React.DragEvent) => { e.preventDefault(); setDragActive(true); };
  const onDragLeave = (e: React.DragEvent) => { e.preventDefault(); setDragActive(false); };
  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    const f = e.dataTransfer.files?.[0];
    if (f) handleFile(f);
  };

  // ── Upload ──────────────────────────────────────────────────────────────────
  const handleUpload = async () => {
    if (!file && !caption.trim()) {
      setError("Story cần có ảnh hoặc nội dung.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const formData = new FormData();
      if (file) formData.append("media", file);
      if (caption.trim()) formData.append("content", caption.trim());
      formData.append("background_color", bgColor);

      const res = await fetch(`${port}/api/stories`, {
        method: "POST",
        body: formData,
        credentials: "include",
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.message || "Không thể tạo story.");
      }

      const data = await res.json();
      if (data.success) {
        onUploaded();
        onClose();
      }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      setError(err.message || "Đã xảy ra lỗi.");
    } finally {
      setLoading(false);
    }
  };

  // ── Go back to pick step ────────────────────────────────────────────────────
  const goBack = () => {
    setStep("pick");
    setFile(null);
    if (preview) URL.revokeObjectURL(preview);
    setPreview(null);
    setError(null);
  };

  // ── Predefined background colors ───────────────────────────────────────────
  const bgColors = ["#FFE1D6", "#D9F4FF", "#E8D5F5", "#D5F5E3", "#FFF3CD", "#FFD6E0", "#D6E4FF"];

  const isVideo = file?.type.startsWith("video");

  return (
    <div
      ref={backdropRef}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm"
      onClick={(e) => { if (e.target === backdropRef.current) onClose(); }}
      role="dialog"
      aria-modal="true"
      aria-label="Tạo story"
    >
      {/* ── Close button ─────────────────────────────────────────────────── */}
      <button
        className="absolute right-5 top-5 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-2xl text-white transition-colors hover:bg-white/20"
        onClick={onClose}
        type="button"
        aria-label="Đóng"
      >
        ×
      </button>

      {/* ── Modal card ───────────────────────────────────────────────────── */}
      <div
        className="relative flex h-[min(85vh,720px)] w-full max-w-[420px] flex-col overflow-hidden rounded-2xl bg-white shadow-2xl"
        style={{ animation: "storyModalIn .25s ease-out" }}
      >
        {/* ── Header ───────────────────────────────────────────────────── */}
        <div className="flex shrink-0 items-center justify-between border-b border-slate-100 px-5 py-3">
          {step === "preview" ? (
            <button className="text-sm font-medium text-slate-500 hover:text-slate-800 transition-colors" onClick={goBack} type="button">
              ← Quay lại
            </button>
          ) : (
            <span className="text-sm font-semibold text-slate-700">Tạo story</span>
          )}
          {step === "preview" && (
            <span className="text-sm font-semibold text-slate-700">Xem trước</span>
          )}
          <div className="w-16" />
        </div>

        {/* ── Step 1: Pick file ─────────────────────────────────────── */}
        {step === "pick" && (
          <div className="flex flex-1 flex-col items-center justify-center gap-6 p-8">
            <div
              onDragOver={onDragOver}
              onDragLeave={onDragLeave}
              onDrop={onDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`flex h-64 w-full cursor-pointer flex-col items-center justify-center gap-4 rounded-2xl border-2 border-dashed transition-all duration-200 ${dragActive
                ? "border-sky-400 bg-sky-50 scale-[1.02]"
                : "border-slate-200 bg-slate-50 hover:border-sky-300 hover:bg-sky-50/50"
                }`}
            >
              {/* Camera icon */}
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-sky-400 to-indigo-500 shadow-lg shadow-sky-200">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="white" className="h-8 w-8">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 0 1 5.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 0 0 2.25 2.25h15A2.25 2.25 0 0 0 21.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 0 0-1.134-.175 2.31 2.31 0 0 1-1.64-1.055l-.822-1.316a2.192 2.192 0 0 0-1.736-1.039 48.774 48.774 0 0 0-5.232 0 2.192 2.192 0 0 0-1.736 1.039l-.821 1.316Z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 1 1-9 0 4.5 4.5 0 0 1 9 0ZM18.75 10.5h.008v.008h-.008V10.5Z" />
                </svg>
              </div>
              <div className="text-center">
                <p className="text-sm font-semibold text-slate-700">Chọn ảnh hoặc video</p>
                <p className="mt-1 text-xs text-slate-400">Kéo thả hoặc nhấn để chọn file</p>
              </div>
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*,video/mp4,video/quicktime"
              onChange={onFileChange}
              className="hidden"
            />

            {/* Text-only story option */}
            <div className="w-full space-y-3">
              <p className="text-center text-xs font-medium text-slate-400 uppercase tracking-wider">Hoặc tạo story chữ</p>
              <textarea
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
                placeholder="Viết điều gì đó..."
                rows={3}
                maxLength={500}
                className="w-full resize-none rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 outline-none transition-colors focus:border-sky-300 focus:bg-white placeholder:text-slate-300"
              />
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-400">Màu nền:</span>
                {bgColors.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setBgColor(c)}
                    className={`h-6 w-6 rounded-full border-2 transition-transform hover:scale-110 ${bgColor === c ? "border-slate-700 scale-110" : "border-transparent"}`}
                    style={{ backgroundColor: c }}
                    aria-label={`Màu ${c}`}
                  />
                ))}
              </div>
              {caption.trim() && !file && (
                <button
                  type="button"
                  onClick={handleUpload}
                  disabled={loading}
                  className="w-full rounded-xl bg-gradient-to-r from-sky-500 to-indigo-500 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-sky-200 transition-all hover:shadow-xl hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {loading ? "Đang tải lên..." : "Đăng story chữ"}
                </button>
              )}
            </div>

            {error && <p className="text-center text-xs text-red-500">{error}</p>}
          </div>
        )}

        {/* ── Step 2: Preview & Upload ──────────────────────────────── */}
        {step === "preview" && preview && (
          <div className="flex flex-1 flex-col overflow-hidden">
            {/* Preview area — story ratio */}
            <div className="relative flex-1 bg-slate-900 overflow-hidden">
              {isVideo ? (
                <video
                  src={preview}
                  className="h-full w-full object-contain"
                  controls
                  autoPlay
                  muted
                  playsInline
                />
              ) : (
                <img
                  src={preview}
                  alt="Story preview"
                  className="h-full w-full object-contain"
                />
              )}

              {/* Overlay gradient bottom */}
              <div className="absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-black/60 to-transparent pointer-events-none" />
            </div>

            {/* Caption & Upload controls */}
            <div className="shrink-0 border-t border-slate-100 bg-white p-4 space-y-3">
              <input
                type="text"
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
                placeholder="Thêm chú thích..."
                maxLength={500}
                className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700 outline-none transition-colors focus:border-sky-300 focus:bg-white placeholder:text-slate-300"
              />

              {error && <p className="text-xs text-red-500">{error}</p>}

              <button
                type="button"
                onClick={handleUpload}
                disabled={loading}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-sky-500 to-indigo-500 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-sky-200 transition-all hover:shadow-xl hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    <span>Đang tải lên...</span>
                  </>
                ) : (
                  <>
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="h-4 w-4">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5m-13.5-9L12 3m0 0 4.5 4.5M12 3v13.5" />
                    </svg>
                    <span>Tải lên story</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ── Keyframe animation ──────────────────────────────────────────── */}
      <style>{`
        @keyframes storyModalIn {
          from { opacity: 0; transform: scale(.92) translateY(16px); }
          to   { opacity: 1; transform: scale(1) translateY(0); }
        }
      `}</style>
    </div>
  );
}
