// src/api/saavn.ts
import { Song } from '../store/playerStore';

export const searchSongs = async (query: string, page: number = 1): Promise<Song[]> => {
  try {
    // API Call [cite: 18]
    const response = await fetch(`https://saavn.sumit.co/api/search/songs?query=${query}&page=${page}&limit=20`);
    const json = await response.json();

    // Check status matches PDF [cite: 21]
    if (json.status === "SUCCESS" && json.data.results) {
      return json.data.results.map((item: any) => {
        
        // FIX 1: Extract the highest quality image (500x500 is usually the last index) [cite: 57, 58]
        const imageObj = item.image?.[2] || item.image?.[1] || item.image?.[0];
        
        // FIX 2: Extract the MP4 link (320kbps is usually the last index) [cite: 77, 78]
        const audioObj = item.downloadUrl?.[4] || item.downloadUrl?.[3] || item.downloadUrl?.[2] || item.downloadUrl?.[0];

        return {
          id: item.id,
          name: item.name,
          primaryArtists: item.primaryArtists, // [cite: 37]
          // Use the .link property from the object
          image: imageObj?.link || "", 
          // Use the .link property for the audio player
          downloadUrl: audioObj?.link || "",
          duration: item.duration 
        };
      });
    }
    return [];
  } catch (error) {
    console.error("Search Error:", error);
    return [];
  }
};