const JavaScriptObfuscator = require('javascript-obfuscator');
const fs = require('fs');
const path = require('path');

const filesToObfuscate = [
    path.join(__dirname, '../dist/electron/main.cjs')
];

console.log('🔒 Starting obfuscation...');

filesToObfuscate.forEach(filePath => {
    if (fs.existsSync(filePath)) {
        console.log(`Processing: ${filePath}`);
        const code = fs.readFileSync(filePath, 'utf8');

        const obfuscationResult = JavaScriptObfuscator.obfuscate(code, {
            target: 'node',
            compact: true,
            controlFlowFlattening: true,
            controlFlowFlatteningThreshold: 0.5,
            deadCodeInjection: false,
            debugProtection: false,
            debugProtectionInterval: 0,
            disableConsoleOutput: false, // Keep logs for debugging
            identifierNamesGenerator: 'hexadecimal',
            log: false,
            numbersToExpressions: true,
            renameGlobals: false,
            selfDefending: false,
            simplify: true,
            splitStrings: true,
            splitStringsChunkLength: 10,
            stringArray: true,
            stringArrayEncoding: ['base64'],
            stringArrayThreshold: 0.75,
            unicodeEscapeSequence: false
        });

        fs.writeFileSync(filePath, obfuscationResult.getObfuscatedCode());
        console.log(`✅ Obfuscated: ${filePath}`);
    } else {
        console.warn(`⚠️ File not found: ${filePath}`);
    }
});

console.log('🔒 Obfuscation complete.');

