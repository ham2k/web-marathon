const reactWebpackConfig = require("@nrwl/react/plugins/webpack")

module.exports = (config, context) => {
  config = reactWebpackConfig(config, context)

  return {
    ...config,
    module: {
      ...config.module,
      rules: [
        ...config.module.rules,
        {
          test: /\.xls$/i,
          use: [
            {
              loader: "url-loader",
              options: {
                encoding: false,
                mimetype: false,
                generator: (content) => {
                  return content
                },
              },
            },
          ],
        },
      ],
    },
  }
}
