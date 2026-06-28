"use client";
import { IUserProfileApiResponse } from "../[user_id]/user";
import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import port from "@/api/api";
import {
  RiCheckboxCircleLine,
  RiProhibited2Line,
  RiVerifiedBadgeLine,
  RiLoader4Line,
  RiCheckLine,
} from "@remixicon/react";

function AccountStatus({ user }: { user: IUserProfileApiResponse | null }) {
  const router = useRouter();
  const params = useParams();
  const userId = params.user_id as string;

  // Component State
  const [status, setStatus] = useState(user?.data?.profile?.status);
  const [isVerified, setIsVerified] = useState(
    Boolean(user?.data?.profile?.is_verified),
  );
  const [isStatusDropdownOpen, setIsStatusDropdownOpen] = useState(false);

  // API State
  const [loadingStatus, setLoadingStatus] = useState(false);
  const [loadingVerified, setLoadingVerified] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Sync state with prop changes
  useEffect(() => {
    if (user?.data?.profile) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setStatus(user.data.profile.status);
      setIsVerified(Boolean(user.data.profile.is_verified));
    }
  }, [user]);

  const showSuccessMessage = (message: string) => {
    setSuccess(message);
    setTimeout(() => setSuccess(null), 3000);
  };

  const showErrorMessage = (message: string) => {
    setError(message);
    setTimeout(() => setError(null), 3000);
  };

  // Handler for updating account status (Active/Block)
  const handleStatusChange = async (newStatus: 0 | 1) => {
    if (loadingStatus || newStatus === status) return;

    setLoadingStatus(true);
    setError(null);
    setIsStatusDropdownOpen(false);

    try {
      const response = await fetch(`${port}/api/users/${userId}/status`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: newStatus }),
        credentials: "include",
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || "Failed to update status.");
      }

      setStatus(newStatus);
      showSuccessMessage("Cập nhật trạng thái tài khoản thành công!");
      router.refresh();
    } catch (err) {
      showErrorMessage((err as Error).message);
    } finally {
      setLoadingStatus(false);
    }
  };

  // Handler for updating verification status
  const handleVerificationChange = async (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const newIsVerified = e.target.checked;
    if (loadingVerified) return;

    setLoadingVerified(true);
    setError(null);

    try {
      const response = await fetch(`${port}/api/users/${userId}/verification`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ isVerified: newIsVerified }),
        credentials: "include",
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || "Cập nhật xác minh thất bại.");
      }

      setIsVerified(newIsVerified);
      showSuccessMessage("Cập nhật xác minh tài khoản thành công!");
      router.refresh();
    } catch (err) {
      // Revert checkbox on failure
      showErrorMessage((err as Error).message);
    } finally {
      setLoadingVerified(false);
    }
  };

  return (
    <div className="flex flex-col p-5 gap-10 shadow-md rounded-2xl my-5 bg-white">
      <div className="">
        <p className="flex flex-col">
          <span className="text-[18px] font-bold opacity-55">
            Account Status
          </span>
          <span className="text-sm opacity-60">
            Manage account standing and privileges
          </span>
        </p>
      </div>

      {success && (
        <div className="bg-green-100 text-green-700 p-3 rounded-lg text-sm">
          {success}
        </div>
      )}
      {error && (
        <div className="bg-red-100 text-red-700 p-3 rounded-lg text-sm">
          {error}
        </div>
      )}

      <div className="flex flex-col">
        <span className="text-[12px] font-semibold opacity-55">
          ACCOUNT STATUS
        </span>
        <div
          className="relative flex flex-col mt-2 cursor-pointer"
          onClick={() => setIsStatusDropdownOpen((v) => !v)}
        >
          <div className="flex items-center gap-3">
            {loadingStatus ? (
              <RiLoader4Line size={19} className="animate-spin" />
            ) : status === 1 ? (
              <RiCheckboxCircleLine size={19} className="text-green-700" />
            ) : (
              <RiProhibited2Line size={19} className="text-red-700" />
            )}
            <p className="flex flex-col">
              <span
                className={`font-bold ${
                  status === 1 ? "text-green-700" : "text-red-700"
                }`}
              >
                {status === 1 ? "Active" : "Blocked"}
              </span>
              <span className="text-sm opacity-65">
                {status === 1
                  ? "Account is in good standing and fully accessible"
                  : "Account temporarily disabled due to policy violations"}
              </span>
            </p>
          </div>

          {isStatusDropdownOpen && (
            <div
              className="absolute top-12 p-3 left-0 z-10 shadow-2xl bg-white w-full rounded-2xl border border-gray-100"
            >
              <div className="flex flex-col gap-3">
                <div
                  className="flex items-center gap-3 cursor-pointer justify-between p-2 hover:bg-gray-50 rounded-lg"
                  onClick={() => handleStatusChange(1)}
                >
                  <div className="flex items-center gap-3">
                    <RiCheckboxCircleLine
                      size={19}
                      className="text-green-700"
                    />
                    <p className="flex flex-col">
                      <span className="font-bold text-green-700">Active</span>
                      <span className="text-sm opacity-65">
                        Set account to active
                      </span>
                    </p>
                  </div>
                  {status === 1 && <RiCheckLine size={17} />}
                </div>

                <div
                  className="flex items-center gap-3 cursor-pointer justify-between p-2 hover:bg-gray-50 rounded-lg"
                  onClick={() => handleStatusChange(0)}
                >
                  <div className="flex items-center gap-3">
                    <RiProhibited2Line size={19} className="text-red-700" />
                    <p className="flex flex-col">
                      <span className="font-bold text-red-700">Block</span>
                      <span className="text-sm opacity-65">
                        Disable this account
                      </span>
                    </p>
                  </div>
                  {status === 0 && <RiCheckLine size={17} />}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="flex flex-col gap-4">
        <span className="text-[12px] font-semibold opacity-55">PRIVILEGES</span>
        <div className="flex flex-col gap-2">
          <div className="flex gap-5 w-full justify-between items-center shadow-sm p-3 rounded-[20px]">
            <div className="flex gap-3 items-center">
              <RiVerifiedBadgeLine size={18} className="text-blue-600" />
              <p className="flex flex-col">
                <span className="font-semibold">Verified Account</span>
                <span className="text-sm opacity-50">
                  Blue checkmark is visible on the profile
                </span>
              </p>
            </div>
            <div className="flex items-center gap-2">
              {loadingVerified && (
                <RiLoader4Line size={16} className="animate-spin" />
              )}
              <label className="inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={isVerified}
                  onChange={handleVerificationChange}
                  disabled={loadingVerified}
                  className="sr-only peer"
                />
                <div className="relative w-9 h-5 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:inset-s-0.5 after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AccountStatus;
