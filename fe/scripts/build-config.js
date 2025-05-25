const fs = require('fs');
const path = require('path');
require('dotenv').config();

const configPath = path.join(__dirname, '../public/firebase-config.js');
let configContent = fs.readFileSync(configPath, 'utf8');

Object.keys(process.env).forEach(key => {
    if (key.startsWith('EXPO_PUBLIC_FIREBASE_')) {
        configContent = configContent.replace(
            new RegExp(key, 'g'),
            `"${process.env[key]}"`
        );
    }
});

fs.writeFileSync(configPath, configContent); 
