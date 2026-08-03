import { useEffect, useState } from 'react';
import { notificationSound } from '@/services/notification-sound';

/**
 * Hook để control notification sound settings
 * 
 * @example
 * const { isEnabled, toggleSound, playTestSound } = useNotificationSound();
 * 
 */
export function useNotificationSound() {
  const [isEnabled, setIsEnabled] = useState(
    notificationSound.isNotificationEnabled()
  );

  const toggleSound = (enabled: boolean) => {
    notificationSound.setEnabled(enabled);
    setIsEnabled(enabled);
  };

  const playTestSound = async () => {
    await notificationSound.play();
  };

  const setVolume = async (volume: number) => {
    await notificationSound.setVolume(volume);
  };

  // Sync state khi component mount
  useEffect(() => {
    setIsEnabled(notificationSound.isNotificationEnabled());
  }, []);

  return {
    isEnabled,
    toggleSound,
    playTestSound,
    setVolume,
  };
}
