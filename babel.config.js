module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      'react-native-reanimated/plugin',
      [
        'module-resolver',
        {
          root: ['.'],
          alias: {
            '@components': './src/components',
            '@screens': './src/screens',
            '@hooks': './src/hooks',
            '@store': './src/store',
            '@services': './src/services',
            '@utils': './src/utils',
            '@types': './src/types',
            '@design': './src/design',
            '@data': './src/data',
          },
        },
      ],
    ],
  };
};
