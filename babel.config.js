module.exports = function (api) {
  api.cache(true);
  return {
    presets: [
      ["babel-preset-expo", { jsxImportSource: "nativewind" }],
    ],
    plugins: [
      // Move nativewind/babel to plugins and make it conditional for tests
      ...(process.env.NODE_ENV !== 'test' ? ['nativewind/babel'] : []),
    ],
  };
};