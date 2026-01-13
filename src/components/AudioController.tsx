import { useEffect, useState } from 'react';
import { Audio } from 'expo-av';
import { usePlayerStore } from '../store/playerStore';

export const AudioController = () => {
  const { currentTrack, isPlaying, playNext } = usePlayerStore();
  const [sound, setSound] = useState<Audio.Sound | null>(null);

  // 1. Setup Audio Mode for Background Playback
  useEffect(() => {
    Audio.setAudioModeAsync({
      staysActiveInBackground: true,
      playsInSilentModeIOS: true,
      shouldDuckAndroid: true,
      playThroughEarpieceAndroid: false,
    });
  }, []);

  // 2. Load and Play Song
  useEffect(() => {
    const loadSound = async () => {
      if (!currentTrack) return;

      // Unload previous
      if (sound) await sound.unloadAsync();

      // Get highest quality URL (last item in array usually 320kbps) [cite: 78]
      const url = currentTrack.downloadUrl[currentTrack.downloadUrl.length - 1]?.link;
      
      if (!url) return;

      const { sound: newSound } = await Audio.Sound.createAsync(
        { uri: url },
        { shouldPlay: isPlaying }
      );

      // Auto-play next when song finishes
      newSound.setOnPlaybackStatusUpdate((status) => {
        if (status.isLoaded && status.didJustFinish) {
          playNext();
        }
      });

      setSound(newSound);
    };

    loadSound();

    return () => {
      if (sound) sound.unloadAsync();
    };
  }, [currentTrack?.id]);

  // 3. Handle Play/Pause Toggle
  useEffect(() => {
    const syncPlayState = async () => {
      if (!sound) return;
      const status = await sound.getStatusAsync();
      if (status.isLoaded) {
        if (isPlaying && !status.isPlaying) {
          await sound.playAsync();
        } else if (!isPlaying && status.isPlaying) {
          await sound.pauseAsync();
        }
      }
    };
    syncPlayState();
  }, [isPlaying]);

  return null; // Renders nothing
};