import { Audio } from 'expo-av';
import { createLogger } from '@/utils/logger';

const logger = createLogger('NotificationSound');

class NotificationSoundService {
  private sound: Audio.Sound | null = null;
  private isEnabled: boolean = true;
  private isLoading: boolean = false;

  /**
   * Khởi tạo audio mode và load sound file
   */
  async initialize(): Promise<void> {
    try {
      // Set audio mode để sound có thể phát khi app ở background
      await Audio.setAudioModeAsync({
        playsInSilentModeIOS: true, // Phát cả khi iPhone ở silent mode
        staysActiveInBackground: false, // Không cần active khi background
        shouldDuckAndroid: true, // Giảm âm lượng các app khác khi phát
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
    if (this.sound || this.isLoading) {
      return;
    }

    this.isLoading = true;

    try {
      // Load sound file từ assets
      const { sound } = await Audio.Sound.createAsync(
        // require('@/assets/sounds/message-notification.mp3'),
        // Tạm thời dùng system sound (beep short)
        { uri: 'https://assets.mixkit.co/active_storage/sfx/2354/2354-preview.mp3' },
        { shouldPlay: false, volume: 0.5 }
      );

      this.sound = sound;
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
      if (!this.sound && !this.isLoading) {
        await this.loadSound();
      }

      if (!this.sound) {
        logger.warn('Sound not loaded yet');
        return;
      }

      // Kiểm tra sound có đang phát không
      const status = await this.sound.getStatusAsync();
      
      if (status.isLoaded && status.isPlaying) {
        // Đang phát, stop và replay
        await this.sound.stopAsync();
        await this.sound.setPositionAsync(0);
      }

      // Phát sound
      await this.sound.playAsync();
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
      if (this.sound) {
        await this.sound.stopAsync();
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
      if (this.sound) {
        await this.sound.unloadAsync();
        this.sound = null;
        logger.log('Notification sound cleaned up');
      }
    } catch (error) {
      logger.error('Failed to cleanup notification sound', error);
    }
  }

  /**
   * Thay đổi volume (0.0 - 1.0)
   */
  async setVolume(volume: number): Promise<void> {
    try {
      if (this.sound) {
        await this.sound.setVolumeAsync(Math.max(0, Math.min(1, volume)));
        logger.log(`Volume set to ${volume}`);
      }
    } catch (error) {
      logger.error('Failed to set volume', error);
    }
  }
}

// Singleton instance
export const notificationSound = new NotificationSoundService();
