// src/components/MiniPlayer.tsx
import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { usePlayerStore } from '../store/playerStore';
import { useNavigation } from '@react-navigation/native';

const MiniPlayer = () => {
  const { currentTrack, isPlaying, togglePlayPause } = usePlayerStore();
  const navigation = useNavigation<any>();

  if (!currentTrack) return null; // Don't show if nothing is playing

  return (
    <TouchableOpacity 
      style={styles.container} 
      onPress={() => navigation.navigate('Player')}
      activeOpacity={0.9}
    >
      {/* Artwork [cite: 57] */}
      <Image 
        source={{ uri: currentTrack.image[1]?.link || currentTrack.image[0]?.link }} 
        style={styles.image} 
      />
      
      <View style={styles.textContainer}>
        <Text style={styles.title} numberOfLines={1}>{currentTrack.name}</Text>
        <Text style={styles.artist} numberOfLines={1}>{currentTrack.primaryArtists}</Text>
      </View>

      <TouchableOpacity onPress={togglePlayPause} style={styles.button}>
        <Text style={styles.buttonText}>{isPlaying ? "||" : "▶"}</Text>
      </TouchableOpacity>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#222',
    padding: 10,
    borderTopWidth: 1,
    borderTopColor: '#333',
    position: 'absolute',
    bottom: 0, // Sticks to bottom
    width: '100%',
    zIndex: 100,
  },
  image: { width: 50, height: 50, borderRadius: 4 },
  textContainer: { flex: 1, marginLeft: 10, justifyContent: 'center' },
  title: { color: 'white', fontWeight: 'bold', fontSize: 14 },
  artist: { color: '#ccc', fontSize: 12 },
  button: { padding: 10 },
  buttonText: { color: 'white', fontSize: 24, fontWeight: 'bold' },
});

export default MiniPlayer;