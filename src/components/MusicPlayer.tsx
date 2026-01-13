import React, { useState, useEffect } from 'react';
import { View, Button, Text } from 'react-native';
import { Audio, AVPlaybackStatus } from 'expo-av';

export default function AudioPlayer() {
  const [sound, setSound] = useState<Audio.Sound | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  // --- THIS IS WHERE YOUR FUNCTION GOES ---
  const onPlaybackStatusUpdate = (status: AVPlaybackStatus) => {
    if (!status.isLoaded) {
      if (status.error) {
        console.log(`Error on playback: ${status.error}`);
      }
      return;
    }

    // Now you can update state based on the status
    setIsPlaying(status.isPlaying);
    console.log('Position:', status.positionMillis);
  };

  async function playSound() {
    console.log('Loading Sound');
    
    // We load the sound and pass the status update function here
    const { sound } = await Audio.Sound.createAsync(
       require('./assets/hello.mp3'),
       { shouldPlay: true },
       onPlaybackStatusUpdate // <--- Attached here
    );
    
    setSound(sound);
  }

  // Cleanup when component unmounts
  useEffect(() => {
    return sound
      ? () => { sound.unloadAsync(); }
      : undefined;
  }, [sound]);

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Button title="Play Sound" onPress={playSound} />
      <Text>{isPlaying ? "Playing" : "Stopped"}</Text>
    </View>
  );
}