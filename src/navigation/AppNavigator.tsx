// src/navigation/AppNavigator.tsx
import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import HomeScreen from '../screens/HomeScreen';
import PlayerScreen from '../screens/PlayerScreen';

const Stack = createStackNavigator();

export default function AppNavigator() {
  return (
    <Stack.Navigator screenOptions={{ 
      headerStyle: { backgroundColor: '#121212' }, 
      headerTintColor: 'white',
      cardStyle: { backgroundColor: 'white' },
    }}>
      <Stack.Screen name="Home" component={HomeScreen} options={{ title: 'Music Player' }} />
      <Stack.Screen name="Player" component={PlayerScreen} options={{ title: 'Now Playing' }} />
    </Stack.Navigator>
  );
}