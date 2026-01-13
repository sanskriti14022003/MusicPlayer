import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { MMKV, useMMKV } from 'react-native-mmkv';
import { Audio, InterruptionModeAndroid, InterruptionModeIOS } from 'expo-av';

// Cast to 'any' to silence the error
const storage = new (MMKV as any)();

const mmkvStorage = {
  getItem: (name: string) => {
    const value = storage.getString(name);
    return value ?? null;
  },
  setItem: (name: string, value: string) => {
    storage.set(name, value);
  },
  removeItem: (name: string) => {
    storage.delete(name);
  },
};

export interface Song {
  id: string;
  name: string;
  primaryArtists: string;
  image: { quality: string; link: string }[];
  downloadUrl: { quality: string; link: string }[];
  duration?: string;
}

interface PlayerState {
  soundObject: Audio.Sound | null;
  currentTrack: Song | null;
  queue: Song[];
  isPlaying: boolean;
  isLoading: boolean;
  position: number;
  duration: number;

  // Actions
  setupPlayer: () => Promise<void>;
  playTrack: (track: Song) => Promise<void>;
  togglePlayPause: () => Promise<void>;
  playNext: () => Promise<void>;
  playPrev: () => Promise<void>;
  seekTo: (millis: number) => Promise<void>;
  addToQueue: (track: Song) => void;
  setQueue: (songs: Song[]) => void;
  unloadPlayer: () => Promise<void>;
}

export const usePlayerStore = create<PlayerState>()(
  persist(
    (set, get) => ({
      soundObject: null,
      currentTrack: null,
      queue: [],
      isPlaying: false,
      isLoading: false,
      position: 0,
      duration: 0,

      setupPlayer: async () => {
        try {
          await Audio.setAudioModeAsync({
            allowsRecordingIOS: false,
            staysActiveInBackground: true,
            interruptionModeIOS: InterruptionModeIOS.DoNotMix,
            playsInSilentModeIOS: true,
            shouldDuckAndroid: true,
            interruptionModeAndroid: InterruptionModeAndroid.DoNotMix,
            playThroughEarpieceAndroid: false,
          });
          console.log("Audio Mode Setup Complete");
        } catch (e) {
          console.error("Audio setup failed", e);
        }
      },

      setQueue: (songs) => set({ queue: songs }),

      addToQueue: (track) => {
        const { queue } = get();
        if (!queue.find((s) => s.id === track.id)) {
          set({ queue: [...queue, track] });
        }
      },

      playTrack: async (selectedSong) => {
        const { soundObject, queue } = get();
        
        // Prevent race conditions
        set({ isLoading: true });

        try {
          // 1. Unload existing sound if any
          if (soundObject) {
             const status = await soundObject.getStatusAsync();
             if (status.isLoaded) {
                 await soundObject.unloadAsync();
             }
          }

          // 2. Manage Queue (add if not exists, otherwise keep existing order)
          const exists = queue.find((s) => s.id === selectedSong.id);
          let newQueue = queue;
          if (!exists) {
            newQueue = [selectedSong, ...queue];
          }

          set({ 
            currentTrack: selectedSong, 
            queue: newQueue, 
            isPlaying: false, 
            position: 0,
            duration: 0 
          });

          // 3. Select Best Quality URL safely
          const links = selectedSong.downloadUrl;
          const uri = links[4]?.link || links[links.length - 1]?.link || links[0]?.link;
          
          if (!uri) {
            throw new Error("No audio URL found for this track");
          }

          // 4. Create and Load the new Sound
          const { sound } = await Audio.Sound.createAsync(
            { uri },
            { shouldPlay: true },
            (status) => {
                if(!status.isLoaded) return;
                
                set({ 
                    position: status.positionMillis,
                    duration: status.durationMillis || 0,
                });

                if (status.isPlaying !== get().isPlaying) {
                   set({ isPlaying: status.isPlaying });
                }

                // AUTO-PLAY NEXT SONG LOGIC
                if (status.didJustFinish && !status.isLooping) {
                   get().playNext();
                }
            }
          );
          
          set({ soundObject: sound, isPlaying: true, isLoading: false });

        } catch (error) {
          console.error("Error loading sound:", error);
          set({ isLoading: false, isPlaying: false });
        }
      },

      togglePlayPause: async () => {
        const { soundObject, isPlaying, currentTrack, playTrack } = get();
        
        // Case: Resume playback after app restart (Object is null, but Track exists)
        if (!soundObject && currentTrack) {
            await playTrack(currentTrack);
            return;
        }

        if (!soundObject) return;

        if (isPlaying) {
          await soundObject.pauseAsync();
        } else {
          await soundObject.playAsync();
        }
      },

      playNext: async () => {
        const { queue, currentTrack, isLoading } = get();
        if (isLoading || !currentTrack) return;

        const index = queue.findIndex((s) => s.id === currentTrack.id);
        
        if (index !== -1 && index < queue.length - 1) {
          await get().playTrack(queue[index + 1]);
        } else {
             // End of queue: Stop and reset
             set({ isPlaying: false });
        }
      },

      playPrev: async () => {
        const { queue, currentTrack, isLoading } = get();
        if (isLoading || !currentTrack) return;

        const index = queue.findIndex((s) => s.id === currentTrack.id);
        
        if (index > 0) {
          await get().playTrack(queue[index - 1]);
        } else {
          // If at start, restart song
          const { soundObject } = get();
          if(soundObject) await soundObject.replayAsync();
        }
      },

      seekTo: async (millis) => {
        const { soundObject } = get();
        if (soundObject) {
            await soundObject.setPositionAsync(millis);
        }
      },
      
      unloadPlayer: async () => {
          const { soundObject } = get();
          if(soundObject) {
              try {
                await soundObject.unloadAsync();
              } catch (e) {
                console.log("Error unloading on cleanup", e);
              }
              set({ soundObject: null, isPlaying: false, position: 0 });
          }
      }
    }),
    {
      name: 'music-player-storage', // Key in MMKV
      storage: createJSONStorage(() => mmkvStorage),
      
      // IMPORTANT: Only persist data that can be serialized (JSON)
      // We do NOT persist soundObject (it's a class instance)
      // We do NOT persist isPlaying (we want to start paused on reload)
      partialize: (state) => ({ 
          queue: state.queue, 
          currentTrack: state.currentTrack 
      }),
    }
  )
);