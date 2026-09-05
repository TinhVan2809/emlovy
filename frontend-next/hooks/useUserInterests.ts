import { useState, useEffect } from "react";
import { UserInterest } from "@/types/post";
import { DEFAULT_INTERESTS } from "@/utils/recommendation";

/**
 * Hook to manage user interests
 * Can be extended to fetch from API or localStorage
 */
export function useUserInterests() {
  const [interests, setInterests] = useState<UserInterest[]>(DEFAULT_INTERESTS);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Load user interests from localStorage or API
    const loadInterests = async () => {
      try {
        // Try to load from localStorage first
        const stored = localStorage.getItem("userInterests");
        if (stored) {
          setInterests(JSON.parse(stored));
        }

        // TODO: Fetch from API if needed
        // const response = await fetch(`${port}/api/user/interests`, {
        //   credentials: "include",
        // });
        // if (response.ok) {
        //   const data = await response.json();
        //   setInterests(data.interests);
        // }
      } catch (error) {
        console.error("Failed to load user interests:", error);
        // Fallback to defaults
        setInterests(DEFAULT_INTERESTS);
      } finally {
        setIsLoading(false);
      }
    };

    loadInterests();
  }, []);

  const updateInterest = (category: string, score: number) => {
    setInterests((prev) => {
      const existing = prev.find((i) => i.category === category);
      let updated: UserInterest[];

      if (existing) {
        updated = prev.map((i) =>
          i.category === category ? { ...i, score } : i
        );
      } else {
        updated = [...prev, { category, score }];
      }

      // Persist to localStorage
      localStorage.setItem("userInterests", JSON.stringify(updated));
      return updated;
    });
  };

  const resetInterests = () => {
    setInterests(DEFAULT_INTERESTS);
    localStorage.removeItem("userInterests");
  };

  return {
    interests,
    isLoading,
    updateInterest,
    resetInterests,
  };
}
