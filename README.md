# demo-website
Demo website chat Dapp showcasing how to integrate MatchID into your web Dapp

Step 1 would be to make sure you are using a Node version above or equal to version 20

Step 2 would be to install the latest version of webpack using the command (if needed): yarn add webpack@latest webpack-dev-server@latest

Step 3 would be to install the latest version of axios using the command (if needed): yarn add axios@latest

Step 4 would be to create the file config-overrides.js in the root of your front-end dapp and append the following content to it (if needed):

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

Step 5 would be to install buffer using the command (if needed): yarn add buffer

Step 6 would be to install MatchID SDK using the command: yarn add @matchain/matchid-sdk-react@latest

Step 7 would be to import buffer in your App.js like so: import { Buffer } from 'buffer';

Step 8 would be to set buffer compatibility in your App.js like so: window.Buffer = Buffer;

Step 9 would be to start your dapp

Step 10 would be to play around with your dapp

