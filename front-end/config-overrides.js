const webpack = require('webpack');

module.exports = function override(config) {
    // Disable polyfills by setting the fallback to `false`
    const fallback = config.resolve.fallback || {};
    Object.assign(fallback, {
        "crypto": false,
        "stream": false,
        "http": false,
        "https": false,
        "zlib": false,
        "url": false,
        "process": false,
        "buffer": false
        // "buffer": require.resolve("buffer"), // Ensure Buffer is properly polyfilled
    });

    config.resolve.fallback = fallback;

    // Remove any existing alias for process if you want to completely disable
    if (config.resolve.alias) {
        delete config.resolve.alias['process'];  // Remove alias for process
    }

    // Remove the ProvidePlugin for process and Buffer, if you want to avoid polyfills
    config.plugins = (config.plugins || []).filter(
        plugin => !(plugin instanceof webpack.ProvidePlugin)
    );
    // Add ProvidePlugin for Buffer
    // config.plugins = (config.plugins || []).concat([
    //     new webpack.ProvidePlugin({
    //         Buffer: ['buffer', 'Buffer'],  // Explicitly provide Buffer from buffer package
    //     }),
    // ]);

    return config;
};
