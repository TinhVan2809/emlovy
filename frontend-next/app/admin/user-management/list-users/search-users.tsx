"use client";
import port from "@/api/api";
import { RiSearchLine } from "@remixicon/react";
import React, { useEffect, useState } from "react";
import Link from "next/link";

type Users = {
  user_id: number;
  name: string;
  username: string;
};

function SearchUsers() {
  const [isSearch, setIsSearch] = useState(false);
  const [keyword, setKeyWord] = useState("");
  const [result, setResults] = useState<Users[]>([]);
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setKeyWord(value);
    if (value === "") {
      setResults([]);
    }
  };
  useEffect(() => {
    if (!keyword) {
      return;
    }
    const controller = new AbortController();
    const timerId = setTimeout(() => {
      setLoading(true);
      const handleSearch = async () => {
        try {
          const response = await fetch(
            `${port}/api/search/users?q=${keyword}%`,
            {
              method: "GET",
              credentials: "include",
              signal: controller.signal,
            },
          );

          const data = await response.json();
          setResults(data.data.results || []);
          console.log(data);
        } catch (_err) {
          console.error("Error searching", _err);
        } finally {
          setLoading(false);
        }
      };
      handleSearch();
    }, 1000);
    return () => {
      controller.abort();
      clearTimeout(timerId);
    };
  }, [keyword]);

  return (
    <>
      <div className="" onClick={() => setIsSearch((v) => !v)}>
        <RiSearchLine />
      </div>

      {isSearch && (
        <div className="fixed top-0 left-0 w-full h-screen z-100000 bg-[color-mix(in_oklab,var(--color-black)_20%,transparent)] flex justify-center items-center">
          <div className="bg-white p-10">
            <input
              type="text"
              className="border border-black/50 outline-0 rounded-3xl py-2 px-4 w-70 md:w-150"
              onChange={handleChange}
            />
            {!loading ? (
              <div className="">
                {result && result.length > 0 ? (
                  <div className="flex flex-col">
                    {result.map((result) => (
                      <Link href={`/admin/user-management/list-users/user-profile/${result.user_id}`} className="" key={result.user_id}>
                        <span>{result.name}</span>
                        <span>@{result.username}</span>
                      </Link>
                    ))}
                  </div>
                ) : (
                  <div className="">Tìm kiếm người dùng</div>
                )}
              </div>
            ) : (
              <div className="">Dang tai...</div>
            )}
          </div>
        </div>
      )}
    </>
  );
}

export default SearchUsers;
