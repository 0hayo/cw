const isEnvTest = String(process.env.NODE_ENV) === "test";

module.exports = function (api) {
  api.cache(true);
  const presets = ["react-app"];

  return {
    presets,
    plugins: isEnvTest ? [] : [
      [
        "import",
        {
          "style": true,
          "libraryName": "antd",
          "libraryDirectory": "es"
        }
      ]
    ]
  };
}