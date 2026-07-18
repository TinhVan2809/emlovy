import * as FileSystem from "expo-file-system/legacy";
import * as Crypto from "expo-crypto";

/**
 * Video Cache Service
 * Quản lý cache video để tối ưu hiệu năng và giảm data usage
 */

const CACHE_FOLDER = `${FileSystem.cacheDirectory}video-cache/`;
const MAX_CACHE_SIZE_MB = 500; // 500MB
const MAX_CACHE_AGE_DAYS = 7; // 7 ngày

interface CacheMetadata {
  url: string;
  filePath: string;
  size: number;
  createdAt: number;
  lastAccessedAt: number;
  accessCount: number;
}

interface CacheInfo {
  totalSize: number;
  fileCount: number;
  oldestFile: number;
}

class VideoCache {
  private metadata: Map<string, CacheMetadata> = new Map();
  private initPromise: Promise<void> | null = null;
  private isInitialized = false;

  /**
   * Khởi tạo cache directory và load metadata
   */
  async initialize(): Promise<void> {
    if (this.isInitialized) {
      return;
    }

    if (this.initPromise) {
      return this.initPromise;
    }

    this.initPromise = this._initialize();
    await this.initPromise;
    this.isInitialized = true;
  }

  private async _initialize(): Promise<void> {
    try {
      // Tạo cache folder nếu chưa tồn tại
      const folderInfo = await FileSystem.getInfoAsync(CACHE_FOLDER);
      if (!folderInfo.exists) {
        await FileSystem.makeDirectoryAsync(CACHE_FOLDER, {
          intermediates: true,
        });
      }

      // Load metadata từ file
      await this.loadMetadata();

      // Cleanup cache cũ
      await this.cleanupOldCache();
    } catch (error) {
      console.error("[VideoCache] Initialization failed:", error);
    }
  }

  /**
   * Hash URL thành filename
   */
  private async getFileNameFromUrl(url: string): Promise<string> {
    const hash = await Crypto.digestStringAsync(
      Crypto.CryptoDigestAlgorithm.SHA256,
      url,
    );
    const extension = url.split(".").pop()?.split("?")[0] || "mp4";
    return `${hash}.${extension}`;
  }

  /**
   * Get cached video hoặc download mới
   */
  async get(url: string): Promise<string> {
    await this.initialize();

    const fileName = await this.getFileNameFromUrl(url);
    const filePath = `${CACHE_FOLDER}${fileName}`;

    // Check nếu file đã được cache
    const fileInfo = await FileSystem.getInfoAsync(filePath);
    if (fileInfo.exists) {
      // Update metadata
      this.updateAccessMetadata(url, filePath);
      return filePath;
    }

    // Download và cache video
    return await this.download(url, filePath);
  }

  /**
   * Download video và lưu vào cache
   */
  private async download(url: string, filePath: string): Promise<string> {
    try {
      // Check cache size trước khi download
      await this.ensureCacheSpace();

      // Download video
      const downloadResult = await FileSystem.downloadAsync(url, filePath);

      if (downloadResult.status === 200) {
        // Lưu metadata
        const fileInfo = await FileSystem.getInfoAsync(filePath);
        const size = fileInfo.exists && "size" in fileInfo ? fileInfo.size : 0;

        this.metadata.set(url, {
          url,
          filePath,
          size,
          createdAt: Date.now(),
          lastAccessedAt: Date.now(),
          accessCount: 1,
        });

        await this.saveMetadata();
        return filePath;
      }

      throw new Error(`Download failed with status ${downloadResult.status}`);
    } catch (error) {
      console.error(`[VideoCache] Download failed for ${url}:`, error);
      // Fallback về URL gốc nếu download fail
      return url;
    }
  }

  /**
   * Update access metadata khi video được xem
   */
  private updateAccessMetadata(url: string, filePath: string): void {
    const meta = this.metadata.get(url);
    if (meta) {
      meta.lastAccessedAt = Date.now();
      meta.accessCount += 1;
      this.saveMetadata();
    }
  }

  /**
   * Đảm bảo có đủ không gian cache
   */
  private async ensureCacheSpace(): Promise<void> {
    const cacheInfo = await this.getCacheInfo();
    const maxSizeBytes = MAX_CACHE_SIZE_MB * 1024 * 1024;

    if (cacheInfo.totalSize > maxSizeBytes * 0.9) {
      // Nếu cache đạt 90% capacity, xóa 30% cache cũ nhất
      await this.evictLeastRecentlyUsed(0.3);
    }
  }

  /**
   * Xóa cache ít được dùng nhất (LRU)
   */
  private async evictLeastRecentlyUsed(percentage: number): Promise<void> {
    const entries = Array.from(this.metadata.entries());
    
    // Sort theo lastAccessedAt và accessCount
    entries.sort((a, b) => {
      const scoreA = a[1].lastAccessedAt + a[1].accessCount * 1000000;
      const scoreB = b[1].lastAccessedAt + b[1].accessCount * 1000000;
      return scoreA - scoreB;
    });

    const toRemove = Math.ceil(entries.length * percentage);

    for (let i = 0; i < toRemove; i++) {
      const [url, meta] = entries[i];
      await this.remove(url);
    }
  }

  /**
   * Xóa cache cũ hơn MAX_CACHE_AGE_DAYS
   */
  private async cleanupOldCache(): Promise<void> {
    const now = Date.now();
    const maxAge = MAX_CACHE_AGE_DAYS * 24 * 60 * 60 * 1000;

    for (const [url, meta] of this.metadata.entries()) {
      if (now - meta.createdAt > maxAge) {
        await this.remove(url);
      }
    }
  }

  /**
   * Xóa một video khỏi cache
   */
  async remove(url: string): Promise<void> {
    const meta = this.metadata.get(url);
    if (!meta) {
      return;
    }

    try {
      const fileInfo = await FileSystem.getInfoAsync(meta.filePath);
      if (fileInfo.exists) {
        await FileSystem.deleteAsync(meta.filePath, { idempotent: true });
      }
      this.metadata.delete(url);
      await this.saveMetadata();
    } catch (error) {
      console.error(`[VideoCache] Remove failed for ${url}:`, error);
    }
  }

  /**
   * Xóa toàn bộ cache
   */
  async clear(): Promise<void> {
    try {
      await FileSystem.deleteAsync(CACHE_FOLDER, { idempotent: true });
      await FileSystem.makeDirectoryAsync(CACHE_FOLDER, {
        intermediates: true,
      });
      this.metadata.clear();
      await this.saveMetadata();
    } catch (error) {
      console.error("[VideoCache] Clear failed:", error);
    }
  }

  /**
   * Lấy thông tin cache
   */
  async getCacheInfo(): Promise<CacheInfo> {
    let totalSize = 0;
    let oldestFile = Date.now();

    for (const meta of this.metadata.values()) {
      totalSize += meta.size;
      if (meta.createdAt < oldestFile) {
        oldestFile = meta.createdAt;
      }
    }

    return {
      totalSize,
      fileCount: this.metadata.size,
      oldestFile,
    };
  }

  /**
   * Check xem video đã được cache chưa
   */
  async isCached(url: string): Promise<boolean> {
    await this.initialize();
    
    const fileName = await this.getFileNameFromUrl(url);
    const filePath = `${CACHE_FOLDER}${fileName}`;
    const fileInfo = await FileSystem.getInfoAsync(filePath);
    
    return fileInfo.exists;
  }

  /**
   * Preload video (download nhưng không return ngay)
   */
  async preload(url: string): Promise<void> {
    await this.initialize();

    const fileName = await this.getFileNameFromUrl(url);
    const filePath = `${CACHE_FOLDER}${fileName}`;

    // Chỉ download nếu chưa có
    const fileInfo = await FileSystem.getInfoAsync(filePath);
    if (!fileInfo.exists) {
      // Download trong background
      this.download(url, filePath).catch((error) => {
        console.warn(`[VideoCache] Preload failed for ${url}:`, error);
      });
    }
  }

  /**
   * Load metadata từ file
   */
  private async loadMetadata(): Promise<void> {
    const metadataPath = `${CACHE_FOLDER}metadata.json`;

    try {
      const fileInfo = await FileSystem.getInfoAsync(metadataPath);
      if (fileInfo.exists) {
        const content = await FileSystem.readAsStringAsync(metadataPath);
        const data = JSON.parse(content);
        this.metadata = new Map(Object.entries(data));
      }
    } catch (error) {
      console.warn("[VideoCache] Load metadata failed:", error);
      this.metadata.clear();
    }
  }

  /**
   * Save metadata vào file
   */
  private async saveMetadata(): Promise<void> {
    const metadataPath = `${CACHE_FOLDER}metadata.json`;

    try {
      const data = Object.fromEntries(this.metadata.entries());
      await FileSystem.writeAsStringAsync(
        metadataPath,
        JSON.stringify(data, null, 2),
      );
    } catch (error) {
      console.error("[VideoCache] Save metadata failed:", error);
    }
  }

  /**
   * Get cache statistics (cho debug/settings)
   */
  async getStatistics(): Promise<{
    totalSizeMB: number;
    fileCount: number;
    oldestFileDate: Date;
    mostAccessedVideos: Array<{ url: string; accessCount: number }>;
  }> {
    const info = await this.getCacheInfo();
    const entries = Array.from(this.metadata.values());

    const mostAccessed = entries
      .sort((a, b) => b.accessCount - a.accessCount)
      .slice(0, 10)
      .map((meta) => ({
        url: meta.url,
        accessCount: meta.accessCount,
      }));

    return {
      totalSizeMB: info.totalSize / (1024 * 1024),
      fileCount: info.fileCount,
      oldestFileDate: new Date(info.oldestFile),
      mostAccessedVideos: mostAccessed,
    };
  }
}

// Export singleton instance
export const videoCache = new VideoCache();

// Export utility functions
export const getCachedVideoUrl = (url: string) => videoCache.get(url);
export const preloadVideo = (url: string) => videoCache.preload(url);
export const clearVideoCache = () => videoCache.clear();
export const getVideoCacheInfo = () => videoCache.getCacheInfo();
export const getVideoCacheStatistics = () => videoCache.getStatistics();
export const isVideoCached = (url: string) => videoCache.isCached(url);
