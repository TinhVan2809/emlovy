"use client";

import port from "@/api/api";
import SearchResult from "@/components/search/SearchResults";
import React, { useEffect, useState } from "react";

type Users = {
  user_id: number;
  name: string;
  username: string;
};

function SearchInput() {
  const [keyword, setKeyword] = useState("");
  const [results, setResults] = useState<Users[]>([]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setKeyword(value);
    if (value === "") {
      setResults([]);
    }
  };
  useEffect(() => {
    if (!keyword) {
      return;
    }
    const controller = new AbortController();
    const signal = controller.signal;
    const timer = setTimeout(() => {
      const handleSearch = async () => {
        const response = await fetch(`${port}/api/search/users?q=${keyword}%`, {
          method: "GET",
          credentials: "include",
          signal,
        });

        const data = await response.json();

        if (data.success) {
          // Đảm bảo result luôn là mảng, kể cả khi backend trả về rỗng
          setResults(data.data?.results || []);
          console.log(data);
        }
      };
      handleSearch();
    }, 500);
    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [keyword]);

  return (
    <div className="w-full">
      <div className="relative w-full max-w-2xl mx-auto">
        <input
          type="text"
          placeholder="Tìm kiếm người dùng..."
          onChange={handleChange}
          className="w-full px-4 py-3 pl-12 rounded-full border border-gray-300 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all"
        />
        <svg
          className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
      </div>

      {/* Sử dụng optional chaining để an toàn tuyệt đối */}
      {results?.length > 0 ? (
        <div className="mt-4 max-w-2xl mx-auto bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden">
          {results.map((r) => (
            <SearchResult results={r} key={r.user_id} />
          ))}
        </div>
      ) : null}
    </div>
  );
}

export default SearchInput;
