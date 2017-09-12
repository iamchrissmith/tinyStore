module.exports = {
    entry: {
      angular: "./app/angular.js",
      app: "./app/app.js",
    },
    output: {
        path: `${__dirname}/build/app`,
        filename: "[name].js"
    },
    module: {
        loaders: [
            {
                test: /\.sol/,
                loader: 'truffle-solidity'
            }
        ]
    }
};
