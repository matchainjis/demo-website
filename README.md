# matchid-sandbox-demo

A demo chat Dapp showing how to integrate MatchID into your web application.

## Requirements

- Node.js v20 or higher

## Setup

1. **Install Webpack (if needed):**

   ```bash
   yarn add webpack@latest webpack-dev-server@latest
   ```

2. **Install Axios (if needed):**

   ```bash
   yarn add axios@latest
   ```

3. **Create `config-overrides.js`:**  
   In the root of your front-end Dapp, create a file named `config-overrides.js` with the following content:

   ```javascript
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
       });

       config.resolve.fallback = fallback;

       // Remove any alias for process if you want to disable it completely
       if (config.resolve.alias) {
           delete config.resolve.alias['process'];
       }

       // Remove ProvidePlugin for process and Buffer to avoid polyfills
       config.plugins = (config.plugins || []).filter(
           plugin => !(plugin instanceof webpack.ProvidePlugin)
       );

       return config;
   };
   ```

4. **Install Buffer (if needed):**

   ```bash
   yarn add buffer
   ```

5. **Install the MatchID SDK:**

   ```bash
   yarn add @matchain/matchid-sdk-react@latest
   ```

6. **Update Your Application:**  
   In your `App.js`:
   - Import Buffer:

     ```javascript
     import { Buffer } from 'buffer';
     ```

   - Set Buffer for compatibility:

     ```javascript
     window.Buffer = Buffer;
     ```

7. **Start your Dapp.**

8. **Explore and enjoy your Dapp!**
