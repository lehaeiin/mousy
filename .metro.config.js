const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// 캐시 최적화
config.cacheStores = [
  ...(config.cacheStores || []),
];

// 성능 최적화
config.transformer = {
  ...config.transformer,
  minifierConfig: {
    keep_classnames: true,
    keep_fnames: true,
    mangle: {
      keep_classnames: true,
      keep_fnames: true,
    },
  },
};

module.exports = config;
