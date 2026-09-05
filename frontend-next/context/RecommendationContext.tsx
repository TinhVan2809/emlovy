"use client";

import React, { createContext, useContext, ReactNode } from "react";
import { useUserInterests } from "@/hooks/useUserInterests";
import { UserInterest } from "@/types/post";

type RecommendationContextType = {
  interests: UserInterest[];
  isLoading: boolean;
  updateInterest: (category: string, score: number) => void;
  resetInterests: () => void;
};

const RecommendationContext = createContext<
  RecommendationContextType | undefined
>(undefined);

export function RecommendationProvider({ children }: { children: ReactNode }) {
  const { interests, isLoading, updateInterest, resetInterests } =
    useUserInterests();

  return (
    <RecommendationContext.Provider
      value={{ interests, isLoading, updateInterest, resetInterests }}
    >
      {children}
    </RecommendationContext.Provider>
  );
}

export function useRecommendation() {
  const context = useContext(RecommendationContext);
  if (context === undefined) {
    throw new Error(
      "useRecommendation must be used within a RecommendationProvider"
    );
  }
  return context;
}
