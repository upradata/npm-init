const path = require('path');

const configsDir = path.resolve(__dirname, '../lib/init-config/');

const settings = {
    npm: {
        file: path.join(configsDir, 'npm.init.js'),
        title: 'npm',
    },
    upradata: {
        file: path.join(configsDir, 'upradata.init.js'),
        title: 'upradata',
    },
    static: {
        file: './package.static.json',
        title: 'static',
    }
};


module.exports = settings;
