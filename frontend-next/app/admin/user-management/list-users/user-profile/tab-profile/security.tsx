"use client";
import { IUserProfileApiResponse } from "../[user_id]/user";
import { useState } from "react";
import { useParams } from "next/navigation";
import port from "@/api/api";
import { FaKey } from "react-icons/fa";
import {
  RiArrowRightSLine,
  RiCheckLine,
  RiCellphoneLine,
  RiFileCopyLine,
  RiLoader4Line,
} from "@remixicon/react";

export default function Security({
  user,
}: {
  user: IUserProfileApiResponse | null;
}) {
  const params = useParams();
  const userId = params.user_id as string;

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [newPassword, setNewPassword] = useState<string | null>(null);

  const handleResetPassword = async () => {
    if (
      !window.confirm(
        "Bạn có chắc chắn muốn đặt lại mật khẩu cho người dùng này không?",
      )
    ) {
      return;
    }

    setIsLoading(true);
    setError(null);
    setSuccessMessage(null);
    setNewPassword(null);

    try {
      const response = await fetch(`${port}/api/users/${userId}/reset-password`, {
        method: "PUT",
        credentials: "include",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Không thể đặt lại mật khẩu.");
      }

      setNewPassword(data.data.newPassword);
      setSuccessMessage(data.message);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="my-5 shadow-md rounded-2xl p-5 bg-white">
      <div className="flex flex-col gap-4">
        <span className="font-bold text-lg opacity-80">Security Settings</span>

        {successMessage && (
          <div className="bg-green-100 border border-green-200 text-green-800 p-3 rounded-xl text-sm flex flex-col gap-2">
            <p>{successMessage}</p>
            {newPassword && (
              <div className="flex items-center gap-2 bg-green-200 p-2 rounded-lg">
                <span className="font-mono text-green-900 grow">
                  {newPassword}
                </span>
                <button
                  onClick={() => navigator.clipboard.writeText(newPassword)}
                  className="ml-auto flex items-center gap-1 bg-green-700 text-white px-2 py-1 rounded text-xs"
                >
                  <RiFileCopyLine size={14} /> Copy
                </button>
              </div>
            )}
          </div>
        )}
        {error && (
          <div className="bg-red-100 border border-red-200 text-red-800 p-3 rounded-xl text-sm">
            {error}
          </div>
        )}

        <div className="p-4 rounded-2xl shadow-sm border">
          <div className="flex w-full justify-between items-center">
            <div className="flex items-center gap-3">
              <FaKey size={19} className="text-violet-500" />
              <div className="flex flex-col">
                <span className="text-sm font-bold">Password</span>
                <span className="text-sm opacity-50">
                  Đặt lại mật khẩu của người dùng thành một mật khẩu ngẫu nhiên mới.
                </span>
              </div>
            </div>
            <button
              onClick={handleResetPassword}
              disabled={isLoading}
              className="flex rounded-2xl border border-black/20 py-1 px-3 items-center text-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <RiLoader4Line className="animate-spin" />
              ) : (
                "Reset Password"
              )}
              {!isLoading && <RiArrowRightSLine size={18} />}
            </button>
          </div>
        </div>
        <div className="p-4 rounded-2xl shadow-sm border">
          <div className="flex w-full justify-between items-center">
            <div className="flex items-center gap-3">
              <RiCellphoneLine size={19} className="text-emerald-500" />
              <div className="flex flex-col">
                <span className="text-sm font-bold">Two-Factor Authentication</span>
                <span className="text-sm opacity-50">Authenticator app enabled</span>
              </div>
            </div>
            <button className="flex items-center text-sm text-emerald-600 px-2 py-1 rounded-2xl bg-emerald-500/10 cursor-not-allowed opacity-70">
              <RiCheckLine size={18} /> Enabled
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
