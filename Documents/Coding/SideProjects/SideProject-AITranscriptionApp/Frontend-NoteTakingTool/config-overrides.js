const path = require('path');

module.exports = function override(config) {
    config.resolve.fallback = {
        ...config.resolve.fallback,
        stream: require.resolve("stream-browserify"),
        buffer: require.resolve("buffer/"),
        crypto: require.resolve("crypto-browserify"),
        util: require.resolve("util/"),
        assert: require.resolve("assert/"),
        querystring: require.resolve("querystring-es3"),
        os: require.resolve("os-browserify/browser"),
        path: require.resolve("path-browserify")
    };

    return config;
};
