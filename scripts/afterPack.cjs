const fs = require('fs');
const path = require('path');

exports.default = async function (context) {
    console.log("🛠️  Running afterPack hook to fix better-sqlite3 ABI mismatch...");

    // The correct ABI 132 binary we built in the project root
    const rootSqliteNode = path.join(context.packager.projectDir, "node_modules", "better-sqlite3", "build", "Release", "better_sqlite3.node");

    // The target path inside the unpacked electron build
    let unpackedSqliteNode;
    if (context.packager.platform.name === 'windows') {
        unpackedSqliteNode = path.join(context.appOutDir, "resources", "app.asar.unpacked", "node_modules", "better-sqlite3", "build", "Release", "better_sqlite3.node");
    } else if (context.packager.platform.name === 'mac') {
        unpackedSqliteNode = path.join(context.appOutDir, "Armor & Light.app", "Contents", "Resources", "app.asar.unpacked", "node_modules", "better-sqlite3", "build", "Release", "better_sqlite3.node");
    } else {
        unpackedSqliteNode = path.join(context.appOutDir, "resources", "app.asar.unpacked", "node_modules", "better-sqlite3", "build", "Release", "better_sqlite3.node");
    }

    if (fs.existsSync(rootSqliteNode)) {
        if (fs.existsSync(unpackedSqliteNode)) {
            console.log(`Overwriting bundled sqlite node with root ABI 132 node...`);
            fs.copyFileSync(rootSqliteNode, unpackedSqliteNode);
            console.log("✅ Successfully injected correct better-sqlite3 binary for Electron.");
        } else {
            console.warn(`⚠️ Target sqlite node not found at ${unpackedSqliteNode}`);
        }
    } else {
        console.warn(`⚠️ Root sqlite node not found at ${rootSqliteNode}. Make sure you ran electron-rebuild first!`);
    }
};
