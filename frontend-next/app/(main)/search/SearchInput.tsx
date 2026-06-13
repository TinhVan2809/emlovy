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
    <>
      <div className="">
        <input
          type="text"
          placeholder="search for..."
          onChange={handleChange}
        />
      </div>

      {/* Sử dụng optional chaining để an toàn tuyệt đối */}
      {results?.length > 0 ? (
        <div className="">
          {results.map((r) => (
            <SearchResult results={r} key={r.user_id} />
          ))}
        </div>
      ) : null}
    </>
  );
}

export default SearchInput;
