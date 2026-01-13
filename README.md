# React Native Music Player

## Architecture
- **State Management**: Zustand (chosen for simplicity and performance with minimal boilerplate).
- **Navigation**: React Navigation v6 (Native stack for performance).
- **Storage**: MMKV (Fastest key-value storage for persisting the queue).
- **Audio**: Expo-AV for reliable playback.

## Features
- Background Audio Playback.
- Mini Player synced with Full Player.
- Persistent Queue.

## Setup
1. `npm install`
2. `npx expo run:android`