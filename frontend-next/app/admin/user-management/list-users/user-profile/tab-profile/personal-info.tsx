"use client";
import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { IUserProfileApiResponse } from "../[user_id]/user";
import port from "@/api/api";

import { useRouter } from "next/navigation";
import { RiEditLine } from "@remixicon/react";

export default function PersonalInfo({
  user,
}: {
  user: IUserProfileApiResponse | null;
}) {
  const router = useRouter();
  const [isEdit, setIsEdit] = useState(false);
  const params = useParams();
  const userId = params.user_id as string;

  // State for form fields
  const [name, setName] = useState(user?.data?.profile?.name || "");
  const [username, setUsername] = useState(user?.data?.profile?.username || "");
  const [email, setEmail] = useState(user?.data?.profile?.email || "");
  const [phone, setPhone] = useState(
    user?.data?.profile?.phone?.toString() || "",
  );
  const [gender, setGender] = useState(user?.data?.profile?.gender || "");
  const [birthday, setBirthday] = useState(user?.data?.profile?.birthday || "");
  const [address, setAddress] = useState(user?.data?.profile?.address || "");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Update form fields when user prop changes (e.g., initial load or re-fetch)
  useEffect(() => {
    if (user?.data?.profile) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setName(user.data.profile.name || "");
      setUsername(user.data.profile.username || "");
      setEmail(user.data.profile.email || "");
      setPhone(user.data.profile.phone?.toString() || "");
      setGender(user.data.profile.gender || "");
      setBirthday(user.data.profile.birthday || "");
      setAddress(user.data.profile.address || "");
    }
  }, [user]);

  const handleEditToggle = () => {
    setIsEdit((v) => !v);
    // Reset form fields to current user data if canceling edit
    if (isEdit) {
      setName(user?.data?.profile?.name || "");
      setUsername(user?.data?.profile?.username || "");
      setEmail(user?.data?.profile?.email || "");
      setPhone(user?.data?.profile?.phone?.toString() || "");
      setGender(user?.data?.profile?.gender || "");
      setBirthday(user?.data?.profile?.birthday || "");
      setAddress(user?.data?.profile?.address || "");
      setError(null);
      setSuccessMessage(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccessMessage(null);

    try {
      const response = await fetch(`${port}/api/profile/${userId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          username,
          email: email || null, // Send null if empty string
          phone: phone || null, // Send null if empty string
          gender: gender || null, // Send null if empty string
          birthday: birthday || null, // Send null if empty string
          address: address || null,
        }),
        credentials: "include",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Cập nhật thất bại.");
      }

      setSuccessMessage(data.message || "Cập nhật thông tin thành công!");
      setIsEdit(false);
      router.refresh();
      // Optionally, trigger a re-fetch of user data in the parent component
      // or update the `user` prop directly if it's mutable.
      // For now, we'll rely on the parent to re-fetch if needed.
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 bg-white rounded-xl shadow-sm my-5">
      <div className="flex flex-col gap-5">
        <div className="flex justify-between items-center">
          <div className="flex flex-col">
            <p className="text-lg font-semibold">Personal Information</p>
            <span className="text-sm text-gray-500">
              Thông tin cá nhân và thông tin liên hệ của người dùng
            </span>
          </div>
          <button
            onClick={handleEditToggle}
            className="flex items-center border border-black/20 px-2 py-1 rounded-2xl"
          >
            <RiEditLine size={18} />
            {isEdit ? "Hủy" : "Chỉnh sửa"}
          </button>
        </div>

        {successMessage && (
          <div className="bg-green-100 text-green-700 p-3 rounded-[20px] mb-4">
            {successMessage}
          </div>
        )}
        {error && (
          <div className="bg-red-100 text-red-700 p-3 rounded-[20px] mb-4">
            {error}
          </div>
        )}

        {isEdit === false ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex flex-col">
              <span className="text-[12px] text-gray-500">NAME</span>
              <span className="text-base font-semibold">
                {user?.data?.profile?.name || "N/A"}
              </span>
            </div>
            <div className="flex flex-col">
              <span className="text-[12px] text-gray-500">USERNAME</span>
              <span className="text-base font-semibold">
                @{user?.data?.profile?.username || "N/A"}
              </span>
            </div>
            <div className="flex flex-col">
              <span className="text-[12px] text-gray-500">EMAIL</span>
              <span className="text-base font-semibold">
                {user?.data?.profile?.email || "N/A"}
              </span>
            </div>
            <div className="flex flex-col">
              <span className="text-[12px] text-gray-500">PHONE NUMBER</span>
              <span className="text-base font-semibold">
                {user?.data?.profile?.phone || "N/A"}
              </span>
            </div>
            <div className="flex flex-col">
              <span className="text-[12px] text-gray-500">GENDER</span>
              <span className="text-base font-semibold">
                {user?.data?.profile?.gender === "0"
                  ? "Nữ"
                  : user?.data?.profile?.gender === "1"
                    ? "Nam"
                    : user?.data?.profile?.gender === "2"
                      ? "Khác"
                      : "N/A"}
              </span>
            </div>
            <div className="flex flex-col">
              <span className="text-[12px] text-gray-500">DATE OF BIRTH</span>
              <span className="text-base font-semibold">
                {user?.data?.profile?.birthday || "N/A"}
              </span>
            </div>
            <div className="flex flex-col">
              <span className="text-[12px] text-gray-500">LOCATION</span>
              <span className="text-base font-semibold">
                {user?.data?.profile?.address || "N/A"}
              </span>
            </div>
          </div>
        ) : (
          <div className="">
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex flex-col">
                  <label
                    htmlFor="name"
                    className="text-[12px] text-gray-500"
                  >
                    NAME
                  </label>
                  <input
                    type="text"
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="mt-1 py-2 px-3 border border-gray-300 rounded-[20px] focus:ring-indigo-500 focus:border-indigo-500"
                    required
                  />
                </div>
                <div className="flex flex-col">
                  <label
                    htmlFor="username"
                    className="text-[12px] text-gray-500"
                  >
                    USERNAME
                  </label>
                  <input
                    type="text"
                    id="username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="mt-1 py-2 px-3 border border-gray-300 rounded-[20px] focus:ring-indigo-500 focus:border-indigo-500"
                    required
                  />
                </div>
                <div className="flex flex-col">
                  <label
                    htmlFor="email"
                    className="text-[12px] text-gray-500"
                  >
                    EMAIL
                  </label>
                  <input
                    type="email"
                    id="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="mt-1 py-2 px-3 border border-gray-300 rounded-[20px] focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>
                <div className="flex flex-col">
                  <label
                    htmlFor="phone"
                    className="text-[12px] text-gray-500"
                  >
                    PHONE NUMBER
                  </label>
                  <input
                    type="text"
                    id="phone"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="mt-1 py-2 px-3 border border-gray-300 rounded-[20px] focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>
                <div className="flex flex-col">
                  <label
                    htmlFor="gender"
                    className="text-[12px] text-gray-500"
                  >
                    GENDER
                  </label>
                  <select
                    id="gender"
                    value={gender}
                    onChange={(e) => setGender(e.target.value)}
                    className="mt-1 py-2 px-3 border border-gray-300 rounded-[20px] focus:ring-indigo-500 focus:border-indigo-500"
                  >
                    <option value="">Chọn giới tính</option>
                    <option value="1">Nam</option>
                    <option value="0">Nữ</option>
                    <option value="2">Khác</option>
                  </select>
                </div>
                <div className="flex flex-col">
                  <label
                    htmlFor="birthday"
                    className="text-[12px] text-gray-500"
                  >
                    DATE OF BIRTH
                  </label>
                  <input
                    type="date"
                    id="birthday"
                    value={birthday}
                    onChange={(e) => setBirthday(e.target.value)}
                    className="mt-1 py-2 px-3 border border-gray-300 rounded-[20px] focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>
                <div className="flex flex-col">
                  <label
                    htmlFor="address"
                    className="text-[12px] text-gray-500"
                  >
                    ADDRESS
                  </label>
                  <input
                    type="text"
                    id="address"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="mt-1 py-2 px-3 border border-gray-300 rounded-[20px] focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>
              </div>
              <div className="flex gap-3 mt-4">
                <button
                  type="submit"
                  className="px-4 py-2 rounded-2xl bg-violet-700 text-white"
                  disabled={loading}
                >
                  {loading ? "Đang lưu..." : "Lưu thay đổi"}
                </button>
                <button
                  type="button"
                  onClick={handleEditToggle}
                  className="px-4 py-2 rounded-2xl border border-black/20 text-sm"
                  disabled={loading}
                >
                  Hủy
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
