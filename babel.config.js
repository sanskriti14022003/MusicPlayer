module.exports = function(api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      // This line is REQUIRED if you use React Navigation / Reanimated
      'react-native-reanimated/plugin', 
    ],
  };
};