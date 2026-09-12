// webpack.config.js
module.exports = {
  module: {
    rules: [
      {
        test: /\.css$/i,
        exclude: /node_modules/, // ← Add this line
        use: [
          "style-loader",
          "css-loader",
          "postcss-loader", // Loads PostCSS config
        ],
      },
    ],
  },
};
