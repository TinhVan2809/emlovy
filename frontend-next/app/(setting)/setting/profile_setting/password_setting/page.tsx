"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import port from "@/api/api";

export default function PasswordSetting() {
    const router = useRouter();
    const [tab, setTab] = useState("");
    const [formData, setFormData] = useState({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
    });
    const [error, setError] = useState("");
    const [successMessage, setSuccessMessage] = useState("");

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
        setError(""); // Clear error on input change
        setSuccessMessage(""); // Clear success message on input change
    };

    const handleSubmit = async (e: React.SubmitEvent) => {
        e.preventDefault();
        setError("");
        setSuccessMessage("");

        if (formData.newPassword !== formData.confirmPassword) {
            setError("Mật khẩu mới và xác nhận mật khẩu không khớp.");
            return;
        }

        if (formData.newPassword.length < 8) {
            setError("Mật khẩu mới phải có ít nhất 8 ký tự.");
            return;
        }

        try {
            const response = await fetch(`${port}/api/auth/change-password`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include', // Gửi cookie cùng với request
                body: JSON.stringify(formData), //  Chuyển sang json để gửi lên server
            });
            const data = await response.json(); // Không cần parse vì fetch đã có sẵn

            if (data.success) {
                console.log("Đổi mật khẩu thành công.");
                router.push("/");
            } else {
                console.log(data.message);
            }
        } catch (_err) {
            console.error("Error fetching change password", _err);
        }

    };

    return (
        <section className="relative h-screen flex justify-center md:px-40 md:py-10">
            <p
                className="absolute top-10 right-10 text-4xl cursor-pointer px-3 rounded-full hover:bg-[#f2f2f2]"
                onClick={() => router.back()}
            >
                &times;
            </p>
            <div className="grid grid-cols-8 w-full">
                <div className="col-span-3 flex flex-col gap-5 px-10">
                    <div className="flex flex-col gap-3">
                        <p className="flex flex-col gap-2">
                            <span className="font-bold text-2xl">Cài đặt tài khoản</span>
                            <span className="text-sm">
                                Quản lý mật khẩu và các cài đặt bảo mật khác.
                            </span>
                        </p>
                    </div>
                    <div className="flex flex-col gap-7">
                        <p className="font-bold">Bảo mật và đăng nhập</p>
                        <div className="flex flex-col gap-4">
                            <div
                                className="flex items-center gap-3 cursor-pointer px-4 py-2 rounded-xl hover:bg-[#f2f2f2]"
                                onClick={() => setTab("changePassword")}
                            >
                                <span>Đổi mật khẩu</span>
                            </div>
                            <div className="flex items-center gap-3 cursor-pointer px-4 py-2 rounded-xl hover:bg-[#f2f2f2]">
                                <span>Xác thực 2 yếu tố</span>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="col-span-5 p-5">
                    {tab === "changePassword" && (
                        <div className="bg-white p-6 rounded-xl">
                            <h2 className="text-xl font-bold mb-4">Đổi mật khẩu</h2>
                            {error && <p className="text-red-500 text-sm mb-3">{error}</p>}
                            {successMessage && (
                                <p className="text-green-500 text-sm mb-3">{successMessage}</p>
                            )}
                            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                                <input
                                    type="password"
                                    name="currentPassword"
                                    placeholder="Mật khẩu hiện tại"
                                    value={formData.currentPassword}
                                    onChange={handleChange}
                                    className="w-full p-3 border-b border-black/10 outline-0"
                                    required
                                />
                                <input
                                    type="password"
                                    name="newPassword"
                                    placeholder="Mật khẩu mới"
                                    value={formData.newPassword}
                                    onChange={handleChange}
                                    className="w-full p-3 border-b border-black/10 outline-0"
                                    required
                                />
                                <input
                                    type="password"
                                    name="confirmPassword"
                                    placeholder="Xác nhận mật khẩu mới"
                                    value={formData.confirmPassword}
                                    onChange={handleChange}
                                    className="w-full p-3 border-b border-black/10 outline-0"
                                    required
                                />
                                <button
                                    type="submit"
                                    className="text-white p-3 rounded-lg font- bg-zinc-700 transition-colors"
                                >
                                    Đổi mật khẩu
                                </button>
                            </form>
                        </div>
                    )}
                </div>
            </div>
        </section>
    );
}