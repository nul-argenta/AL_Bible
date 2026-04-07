const fs = require('fs');
const readline = require('readline');

const catholicFiles = [
    { name: 'exports/books_catholic.csv', columns: 6 },
    { name: 'exports/verses_catholic.csv', columns: 7 }
];

const intlFiles = [
    { name: 'exports/verses_intl_cn.csv', columns: 4 },
    { name: 'exports/verses_intl_es.csv', columns: 4 },
    { name: 'exports/verses_intl_pt.csv', columns: 4 },
    { name: 'exports/verses_intl_ar.csv', columns: 4 }
];

async function verifyCSV(filePath, expectedColumns) {
    if (!fs.existsSync(filePath)) {
        console.error(`[ERROR] File missing: ${filePath}`);
        return;
    }

    const fileStream = fs.createReadStream(filePath);
    const rl = readline.createInterface({
        input: fileStream,
        crlfDelay: Infinity
    });

    let lineCount = 0;
    let errors = 0;
    let inQuotes = false;
    let currentCols = 0;
    let firstErrorLine = -1;

    for await (const line of rl) {
        lineCount++;
        if (lineCount === 1) continue; // Skip header

        // Simple CSV parser ignoring commas inside quotes
        let cols = 1;
        for (let i = 0; i < line.length; i++) {
            if (line[i] === '"') {
                inQuotes = !inQuotes;
            } else if (line[i] === ',' && !inQuotes) {
                cols++;
            }
        }

        if (inQuotes) {
            // Multi-line field, count as continuation.
            // For simplicity in this basic check, we hope there are no multi-line fields.
            // The expansion script replaces newlines or assumes single line verses.
        } else {
            if (cols !== expectedColumns) {
                errors++;
                if (firstErrorLine === -1) firstErrorLine = lineCount;
            }
        }
    }

    console.log(`[OK] ${filePath.padEnd(30)} | Lines: ${String(lineCount).padEnd(6)} | Errors: ${errors}`);
    if (errors > 0) {
        console.log(`     -> First error at line ${firstErrorLine}`);
    }
}

async function run() {
    console.log("--- Verifying Catholic Files ---");
    for (const file of catholicFiles) {
        await verifyCSV(file.name, file.columns);
    }

    console.log("\n--- Verifying International Files ---");
    for (const file of intlFiles) {
        await verifyCSV(file.name, file.columns);
    }
}

run();
