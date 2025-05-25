const createExpoWebpackConfigAsync = require('@expo/webpack-config');
const path = require('path');

module.exports = async function (env, argv) {
    const config = await createExpoWebpackConfigAsync(env, argv);

    config.output.publicPath = '/';

    config.plugins.push({
        apply: (compiler) => {
            compiler.hooks.emit.tapAsync('CopyServiceWorker', (compilation, callback) => {
                const source = path.resolve(__dirname, 'public/firebase-messaging-sw.js');
                const content = require('fs').readFileSync(source, 'utf8');
                compilation.assets['firebase-messaging-sw.js'] = {
                    source: () => content,
                    size: () => content.length
                };
                callback();
            });
        }
    });

    return config;
}; 