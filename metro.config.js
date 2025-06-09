const { getDefaultConfig } = require('expo/metro-config');
const config = getDefaultConfig(__dirname);
config.resolver.assetExts.push("cjs");
config.resolver.resolveRequest = (context, moduleImport, platform) => {
  if (moduleImport.startsWith('@firebase/')) {
    return context.resolveRequest(
      { ...context, isESMImport: true },
      moduleImport,
      platform
    );
  }
  return context.resolveRequest(context, moduleImport, platform);
};
module.exports = config;
