// src/screens/PlayerScreen.tsx
import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native';
import { usePlayerStore } from '../store/playerStore';
import Slider from '@react-native-community/slider'; // Install this if missing: npx expo install @react-native-community/slider
import { useProgress } from 'react-native-track-player';

const PlayerScreen = () => {
  const { currentTrack, isPlaying, togglePlayPause, playNext, playPrev } = usePlayerStore();
  const { position, duration } = useProgress();

  if (!currentTrack) return <View style={styles.container}><Text style={styles.text}>No Song Playing</Text></View>;

  // Use highest quality image [cite: 57]
  const artwork = currentTrack.image[2]?.link || currentTrack.image[0]?.link;

  return (
    <View style={styles.container}>
      <Image source={{ uri: artwork }} style={styles.artwork} />
      
      <View style={styles.info}>
        <Text style={styles.title}>{currentTrack.name}</Text>
        <Text style={styles.artist}>{currentTrack.primaryArtists}</Text>
      </View>

      {/* Seek Bar */}
      <Slider
        style={{ width: '90%', height: 40, marginTop: 20 }}
        minimumValue={0}
        maximumValue={duration}
        value={position}
        minimumTrackTintColor="#1DB954"
        maximumTrackTintColor="#FFFFFF"
        thumbTintColor="#1DB954"
      />
      
      <View style={styles.controls}>
        <TouchableOpacity onPress={playPrev}><Text style={styles.controlText}>⏮</Text></TouchableOpacity>
        
        <TouchableOpacity onPress={togglePlayPause} style={styles.playButton}>
          <Text style={styles.playButtonText}>{isPlaying ? "||" : "▶"}</Text>
        </TouchableOpacity>
        
        <TouchableOpacity onPress={playNext}><Text style={styles.controlText}>⏭</Text></TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#121212', alignItems: 'center', justifyContent: 'center' },
  artwork: { width: 300, height: 300, borderRadius: 8, marginBottom: 30 },
  info: { alignItems: 'center', marginBottom: 20 },
  title: { color: 'white', fontSize: 24, fontWeight: 'bold', textAlign: 'center' },
  artist: { color: '#b3b3b3', fontSize: 18, marginTop: 8 },
  text: { color: 'white' },
  controls: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-around', width: '60%', marginTop: 30 },
  controlText: { fontSize: 40, color: 'white' },
  playButton: { backgroundColor: 'white', borderRadius: 50, padding: 15 },
  playButtonText: { fontSize: 30, color: 'black', fontWeight: 'bold' },
});

export default PlayerScreen;