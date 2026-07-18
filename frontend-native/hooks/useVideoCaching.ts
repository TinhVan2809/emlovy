import { useEffect, useState } from "react";
import { getCachedVideoUrl } from "@/services/video-cache";

/**
 * Hook để load cached video URL
 * 
 * @param videoUrl - URL gốc của video
 * @param shouldLoad - Chỉ load khi cần (để tối ưu performance)
 * @returns Cached video URL hoặc URL gốc nếu chưa cache
 *
 */
export function useVideoCaching(
  videoUrl: string | null | undefined,
  shouldLoad = true,
): string | null {
  const [cachedUrl, setCachedUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!videoUrl || !shouldLoad) {
      setCachedUrl(null);
      return;
    }

    let isCancelled = false;

    getCachedVideoUrl(videoUrl)
      .then((url) => {
        if (!isCancelled) {
          setCachedUrl(url);
        }
      })
      .catch((error) => {
        console.warn("[useVideoCaching] Failed to get cached URL:", error);
        if (!isCancelled) {
          // Fallback về URL gốc
          setCachedUrl(videoUrl);
        }
      });

    return () => {
      isCancelled = true;
    };
  }, [videoUrl, shouldLoad]);

  return cachedUrl;
}

/**
 * Hook để track cache status của video
 * 
 * @param videoUrl - URL gốc của video
 * @returns Object với cached status và loading state
 * 
 */
export function useVideoCacheStatus(
  videoUrl: string | null | undefined,
): { isCached: boolean; isLoading: boolean } {
  const [isCached, setIsCached] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!videoUrl) {
      setIsCached(false);
      setIsLoading(false);
      return;
    }

    let isCancelled = false;

    setIsLoading(true);

    // Dynamic import để tránh circular dependency
    import("@/services/video-cache")
      .then(({ isVideoCached }) => isVideoCached(videoUrl))
      .then((cached) => {
        if (!isCancelled) {
          setIsCached(cached);
          setIsLoading(false);
        }
      })
      .catch((error) => {
        console.warn("[useVideoCacheStatus] Check failed:", error);
        if (!isCancelled) {
          setIsCached(false);
          setIsLoading(false);
        }
      });

    return () => {
      isCancelled = true;
    };
  }, [videoUrl]);

  return { isCached, isLoading };
}
