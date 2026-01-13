// src/screens/HomeScreen.tsx
import React, { useState, useEffect } from 'react';
import { View, TextInput, FlatList, Text, Image, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { searchSongs } from '../api/saavn';
import { usePlayerStore, Song } from '../store/playerStore';

const HomeScreen = () => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Song[]>([]);
  const [loading, setLoading] = useState(false);
  const { playTrack } = usePlayerStore();

  const handleSearch = async () => {
    if (!query) return;
    setLoading(true);
    const songs = await searchSongs(query);
    setResults(songs);
    setLoading(false);
  };

  const renderItem = ({ item }: { item: Song }) => (
    <TouchableOpacity style={styles.item} onPress={() => playTrack(item)}>
      <Image 
        source={{ uri: item.image[1]?.link }} 
        style={styles.artwork} 
      />
      <View style={styles.info}>
        <Text style={styles.title} numberOfLines={1}>{item.name}</Text>
        <Text style={styles.artist} numberOfLines={1}>{item.primaryArtists}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.input}
          placeholder="Search Songs..."
          placeholderTextColor="#888"
          value={query}
          onChangeText={setQuery}
          onSubmitEditing={handleSearch}
        />
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#1DB954" style={{ marginTop: 20 }} />
      ) : (
        <FlatList
          data={results}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={{ paddingBottom: 80 }} // Space for MiniPlayer
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#121212' },
  searchContainer: { padding: 16, backgroundColor: '#121212' },
  input: {
    backgroundColor: '#333',
    color: 'white',
    padding: 12,
    borderRadius: 8,
    fontSize: 16,
  },
  item: { flexDirection: 'row', alignItems: 'center', padding: 10, borderBottomWidth: 0.5, borderBottomColor: '#333' },
  artwork: { width: 50, height: 50, borderRadius: 4 },
  info: { marginLeft: 12, flex: 1 },
  title: { color: 'white', fontSize: 16, fontWeight: '500' },
  artist: { color: '#b3b3b3', fontSize: 14, marginTop: 4 },
});

export default HomeScreen;