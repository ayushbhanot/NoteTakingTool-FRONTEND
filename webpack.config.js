const path = require('path');

module.exports = {
    resolve: {
        fallback: {
            stream: require.resolve("stream-browserify"),  // Polyfill for stream
            buffer: require.resolve("buffer/"),            // Polyfill for buffer
            crypto: require.resolve("crypto-browserify"),  // Polyfill for crypto
            util: require.resolve("util/"),                // Polyfill for util
            assert: require.resolve("assert/"),            // Polyfill for assert
            querystring: require.resolve("querystring-es3"), // Polyfill for querystring
            os: require.resolve("os-browserify/browser"),  // Polyfill for os
            path: require.resolve("path-browserify"),      // Polyfill for path
            url: require.resolve('url/'),               // Add this line for the URL polyfill
            https: require.resolve('https-browserify'),  // Add this line for the HTTPS polyfill
            http: require.resolve("stream-http"),

        },
    },
    entry: './src/index.js',  // Entry point of your app
    output: {
        path: path.resolve(__dirname, 'dist'),  // Output directory
        filename: 'bundle.js',  // Name of the output file
    },
    module: {
        rules: [
            {
                test: /\.js$/,
                exclude: /node_modules/,
                use: {
                    loader: 'babel-loader',  // Use Babel to transpile your code
                    options: {
                        presets: ['@babel/preset-react']  // Enable React support
                    }
                }
            }
        ]
    }
};
