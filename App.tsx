import { useEffect } from 'react';
import { usePlayerStore } from './playerStore';

export default function RootComponent() {
  const setupPlayer = usePlayerStore((state) => state.setupPlayer);
  const unloadPlayer = usePlayerStore((state) => state.unloadPlayer);

  useEffect(() => {
    setupPlayer();
    
    // Cleanup on app unmount (optional, but good for hot reload/dev)
    return () => {
      // unloadPlayer(); 
      // Note: In production, you might want to keep playing in background 
      // so you might not want to unload here depending on your nav structure.
    };
  }, []);

  return <YourAppNavigation />;
}