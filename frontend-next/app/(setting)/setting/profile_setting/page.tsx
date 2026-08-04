"use client";

import port from "@/api/api";
import { useUser } from "@/context/useUserContext";
import {
  RiBubbleChartLine,
  RiShieldLine,
  RiPencilLine,
} from "@remixicon/react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState, type ChangeEvent, type FormEvent } from "react";
import { FaRegUser } from "react-icons/fa";

export default function AppSetting() {
  const router = useRouter();
  const { user, refreshUser } = useUser();

  const [isEdit, setIsEdit] = useState(false);

  const avatarSrc = user?.avatar_url
    ? `${port}/${user.avatar_url}`
    : "/default-avata.jpeg";

  const birthdayFormat = new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });

  const userInfo = [
    { label: "Tên đăng nhập", value: user?.username },
    { label: "Nickname", value: user?.nickname },
    { label: "Email", value: user?.email },
    { label: "Giới tính", value: user?.gender },
    {
      label: "Ngày sinh",
      value: user?.birthday
        ? birthdayFormat.format(new Date(user.birthday))
        : "Chưa cập nhật",
    },
  ];

  const [form, setForm] = useState({
    name: "",
  })

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Hàm update tên người dùng
  const handleEditName = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      const response = await fetch(`${port}/api/profile/me`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(form),
      });

      const data = await response.json();
      if (data.success) {
        await refreshUser();
        setForm({ name: "" });
        setIsEdit(false);
      }
    } catch (_err) {
      console.log("Error editing the name", _err);
    }
  };

  return (
    <>
      <section className="relative min-h-screen bg-white text-black md:px-16 md:py-10 lg:px-40">
        <button
          type="button"
          aria-label="Đóng cài đặt"
          className="absolute right-5 top-5 flex h-10 w-10 items-center justify-center rounded-full border border-black/10 text-3xl leading-none transition hover:bg-black hover:text-white md:right-10 md:top-10"
          onClick={() => router.back()}
        >
          &times;
        </button>

        <div className="mx-auto grid min-h-[calc(100vh-5rem)] max-w-6xl grid-cols-1 gap-8 px-5 py-20 md:grid-cols-8 md:px-0 md:py-0">
          <div className="flex flex-col gap-8 border-b border-black/10 pb-8 md:col-span-3 md:border-b-0 md:border-r md:pr-10">
            <div className="flex flex-col gap-3">
              <p className="flex flex-col gap-2">
                <span className="text-2xl font-bold">Trung tâm tài khoản</span>
                <span className="max-w-xs text-sm leading-6 text-black/60">
                  Quản lý tài khoản cá nhân, mật khẩu và các công nghệ của
                  emlovy.
                </span>
              </p>

              <div className="flex cursor-pointer items-center gap-3 rounded-lg border border-black bg-black px-4 py-3 font-semibold text-white">
                <FaRegUser />
                <span>Thông tin cá nhân của tôi</span>
              </div>
            </div>

            <div className="flex flex-col gap-7">
              <p className="font-bold">Cài đặt tài khoản</p>
              <div className="flex flex-col gap-4">
                <div
                  className="flex cursor-pointer items-center gap-3 rounded-lg px-4 py-3 text-black/70 transition hover:bg-black/5 hover:text-black"
                  onClick={() =>
                    router.push("profile_setting/password_setting")
                  }
                >
                  <RiShieldLine />
                  <span>Mật khẩu và bảo mật</span>
                </div>
                <div className="flex cursor-pointer items-center gap-3 rounded-lg px-4 py-3 text-black/70 transition hover:bg-black/5 hover:text-black">
                  <RiBubbleChartLine />
                  <span>Trải nghiệm kết nối</span>
                </div>
              </div>
            </div>
          </div>

          <div className="md:col-span-5 md:pl-4">
            <div className="flex flex-col gap-8">
              <p className="flex max-w-2xl flex-col gap-3">
                <span className="text-2xl font-bold tracking-tight">
                  Trang thông tin cá nhân
                </span>
                <span className="text-sm leading-6 text-black/60">
                  Xem lại trang cá nhân và thông tin cá nhân bạn đã thêm vào
                  Trung tâm tài khoản này. Thêm tài khoản để thêm trang cá nhân
                  khác.
                </span>
              </p>

              <div className="rounded-lg border border-black/10 bg-white p-5 shadow-[0_18px_45px_rgba(0,0,0,0.06)] md:p-6">
                <div className="flex flex-col gap-6 border-b border-black/10 pb-6 sm:flex-row sm:items-center">
                  <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-full border border-black/10 bg-black/5">
                    <Image
                      src={avatarSrc}
                      fill
                      priority
                      alt="Avatar"
                      className="object-cover"
                    />
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-xl font-semibold flex items-center gap-1">
                      {user?.name || "Người dùng emlovy"}{" "}
                      <span
                        className="cursor-pointer"
                        onClick={() => setIsEdit(!isEdit)}
                      >
                        <RiPencilLine size={18} />
                      </span>
                    </p>
                    <p className="mt-1 truncate text-sm text-black/50">
                      {user?.email || "Chưa cập nhật email"}
                    </p>
                  </div>
                </div>

                <div className="divide-y divide-black/10">
                  {userInfo.map((item) => (
                    <div
                      key={item.label}
                      className="grid gap-1 py-4 text-sm sm:grid-cols-[160px_1fr] sm:gap-5"
                    >
                      <p className="font-medium text-black/55">{item.label}</p>
                      <p className="min-w-0 wrap-break-word font-semibold text-black">
                        {item.value || "Chưa cập nhật"}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
        {isEdit && (
          <div className="w-screen h-full backdrop-blur-sm flex justify-center items-center fixed top-0 left-0 z-10000">
            <div className="bg-white shadow-2xl rounded-xl relative">
              <p className="absolute top-0 right-0 text-4xl text-black/50 p-5 cursor-pointer" onClick={() => setIsEdit(!isEdit)}>&times;</p>
              <form className="flex flex-col md:gap-10 p-10 mt-10" onSubmit={handleEditName}>
                <input
                  type="text"
                  name="name"
                  placeholder="Nhập tên của bạn"
                  className="outline-0 border-b border-b-gray-200 md:w-100"
                  onChange={handleChange}
                />

                <div className="flex justify-end">
                  <button className="w-fit bg-black/90 text-white px-2 py-1 rounded-md hover:bg-amber-400" type="submit">Cập nhật</button>
                </div>
              </form>
            </div>
          </div>
        )}
      </section>
    </>
  );
}
