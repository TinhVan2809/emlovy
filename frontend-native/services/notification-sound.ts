import { createAudioPlayer, setAudioModeAsync } from 'expo-audio';
import type { AudioPlayer } from 'expo-audio';
import { createLogger } from '@/utils/logger';

const logger = createLogger('NotificationSound');

class NotificationSoundService {
  private player: AudioPlayer | null = null;
  private isEnabled: boolean = true;
  private isLoading: boolean = false;

  /**
   * Khởi tạo audio mode
   */
  async initialize(): Promise<void> {
    try {
      // Set audio mode để sound có thể phát khi app ở background
      await setAudioModeAsync({
        playsInSilentMode: true, // Phát cả khi iPhone ở silent mode
      });

      logger.log('Audio mode configured');
    } catch (error) {
      logger.error('Failed to set audio mode', error);
    }
  }

  /**
   * Load sound file từ assets
   */
  private async loadSound(): Promise<void> {
    if (this.player || this.isLoading) {
      return;
    }

    this.isLoading = true;

    try {
      // Create audio player với URL tạm thời
      // Có thể thay bằng: require('@/assets/sounds/notification.mp3')
      this.player = createAudioPlayer(
        'https://assets.mixkit.co/active_storage/sfx/2354/2354-preview.mp3'
      );

      // Set volume
      this.player.volume = 0.5;

      logger.log('Notification sound loaded');
    } catch (error) {
      logger.error('Failed to load notification sound', error);
    } finally {
      this.isLoading = false;
    }
  }

  /**
   * Phát sound notification
   */
  async play(): Promise<void> {
    if (!this.isEnabled) {
      logger.log('Sound notification is disabled');
      return;
    }

    try {
      // Load sound nếu chưa load
      if (!this.player && !this.isLoading) {
        await this.loadSound();
      }

      if (!this.player) {
        logger.warn('Sound not loaded yet');
        return;
      }

      // Replay từ đầu bằng seekTo() thay vì gán currentTime
      if (this.player.playing) {
        this.player.pause();
      }
      this.player.seekTo(0);
      
      // Phát sound
      this.player.play();
      logger.log('Notification sound played');
    } catch (error) {
      logger.error('Failed to play notification sound', error);
    }
  }

  /**
   * Dừng sound đang phát
   */
  async stop(): Promise<void> {
    try {
      if (this.player) {
        this.player.pause();
        logger.log('Notification sound stopped');
      }
    } catch (error) {
      logger.error('Failed to stop notification sound', error);
    }
  }

  /**
   * Enable/disable sound notification
   */
  setEnabled(enabled: boolean): void {
    this.isEnabled = enabled;
    logger.log(`Sound notification ${enabled ? 'enabled' : 'disabled'}`);
  }

  /**
   * Kiểm tra sound có enabled không
   */
  isNotificationEnabled(): boolean {
    return this.isEnabled;
  }

  /**
   * Cleanup khi không dùng nữa
   */
  async cleanup(): Promise<void> {
    try {
      if (this.player) {
        this.player.remove();
        this.player = null;
        logger.log('Notification sound cleaned up');
      }
    } catch (error) {
      logger.error('Failed to cleanup notification sound', error);
    }
  }

  /**
   * Thay đổi volume (0.0 - 1.0)
   */
  setVolume(volume: number): void {
    try {
      if (this.player) {
        this.player.volume = Math.max(0, Math.min(1, volume));
        logger.log(`Volume set to ${volume}`);
      }
    } catch (error) {
      logger.error('Failed to set volume', error);
    }
  }
}

// Singleton instance
export const notificationSound = new NotificationSoundService();
