"use client";
import port from "@/api/api";
import { RiSearchLine } from "@remixicon/react";
import React, { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";

type Users = {
  user_id: number;
  name: string;
  username: string;
  avata?: string | null;
};

function SearchUsers() {
  const [isSearch, setIsSearch] = useState(false);
  const [keyword, setKeyWord] = useState("");
  const [result, setResults] = useState<Users[]>([]);
  const [loading, setLoading] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isSearch) {
      inputRef.current?.focus();
    } else {
      // Reset khi đóng
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setKeyWord("");
      setResults([]);
    }
  }, [isSearch]); // Thêm isSearch vào dependency array

  // Đóng modal bằng phím Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsSearch(false);
    };

    if (isSearch) {
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isSearch]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setKeyWord(value);
    if (value === "") {
      setResults([]);
    }
  };
  useEffect(() => {
    if (!keyword) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setResults([]);
      return;
    }
    const controller = new AbortController();
    const timerId = setTimeout(() => {
      setLoading(true);
      const handleSearch = async () => {
        try {
          const response = await fetch(
            `${port}/api/search/users?q=${keyword}`,
            {
              method: "GET",
              credentials: "include",
              signal: controller.signal,
            },
          );

          const data = await response.json();
          setResults(data.data.results || []);
          console.log("user", data);
        } catch (_err) {
          console.error("Error searching", _err);
        } finally {
          setLoading(false);
        }
      };
      handleSearch();
    }, 300); // Giảm xuống 300ms để nhạy hơn
    return () => {
      controller.abort();
      clearTimeout(timerId);
    };
  }, [keyword]);

  return (
    <>
      <div className="cursor-pointer" onClick={() => setIsSearch((v) => !v)}>
        <RiSearchLine />
      </div>

      {isSearch && (
        <div
          className="fixed top-0 left-0 w-full h-screen z-50 bg-black/40 backdrop-blur-sm flex justify-center items-start pt-20"
          onClick={() => setIsSearch((v) => !v)}
        >
          <div
            className="bg-white p-6 rounded-xl shadow-2xl w-full max-w-2xl relative"
            onClick={(e) => e.stopPropagation()} // Ngăn đóng khi click vào bên trong content
          >
            <div
              className="absolute top-4 right-4 p-1 cursor-pointer hover:bg-slate-100 rounded-full transition-colors"
              onClick={() => setIsSearch((v) => !v)}
            >
              <span className="text-2xl leading-none">&times;</span>
            </div>
            <input
              type="text"
              placeholder="Tìm kiếm theo tên hoặc username..."
              className="border border-slate-200 outline-none focus:ring-2 focus:ring-indigo-500 rounded-lg py-3 px-4 w-full text-lg mb-4"
              onChange={handleChange}
              ref={inputRef}
            />
            {!loading ? (
              <div className="max-h-[60vh] overflow-y-auto">
                {result && result.length > 0 ? (
                  <div className="flex flex-col gap-1">
                    {result.map((user) => (
                      <Link
                        href={`/admin/user-management/list-users/user-profile/${user.user_id}`}
                        className="flex items-center gap-3 p-3 hover:bg-slate-50 rounded-lg transition-colors border border-transparent hover:border-slate-100"
                        key={user.user_id}
                      >
                        <div className="relative w-10 h-10">
                             <Image
                            src={user.avata ? `${port}${user.avata}` : "/Profile-Default.webp"}
                            fill
                            priority
                            alt="avatar"
                            className="object-cover rounded-full"
                          />
                        </div>
                        <div className="flex flex-col">
                          <span className="font-semibold text-slate-900 leading-tight">
                            {user.name}
                          </span>
                          <span className="text-sm text-slate-500">
                            @{user.username}
                          </span>
                        </div>
                      </Link>
                    ))}
                  </div>
                ) : (
                  <div className="">Tìm kiếm người dùng</div>
                )}
              </div>
            ) : (
              <div className="py-10 text-center text-slate-500 italic">
                Đang tìm kiếm...
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}

export default SearchUsers;
