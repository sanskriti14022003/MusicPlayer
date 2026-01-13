// index.ts
import { registerRootComponent } from 'expo';
import TrackPlayer from 'react-native-track-player';
import App from './App';

registerRootComponent(App);
// Register the background service
TrackPlayer.registerPlaybackService(() => require('./service'));