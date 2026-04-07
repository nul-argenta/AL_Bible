const fs = require('fs');
const path = require('path');
const https = require('https');

const EXPORTS_DIR = path.join(__dirname, '..', 'exports');
const VERSES_CSV_PATH = path.join(EXPORTS_DIR, 'verses_catholic.csv');
const OUTPUT_CSV_PATH = path.join(EXPORTS_DIR, 'commentaries_catholic.csv');

// SFM files from cmahte/ENG-B-Haydock1883-pd-PSFM
const HAYDOCK_FILES = [
    { name: 'TOB', id: 67, url: 'https://raw.githubusercontent.com/cmahte/ENG-B-Haydock1883-pd-PSFM/master/17-TOB-ENG%5BB%5DDRC1750%5Bpd%5D.p.sfm' },
    { name: 'JDT', id: 68, url: 'https://raw.githubusercontent.com/cmahte/ENG-B-Haydock1883-pd-PSFM/master/18-JDT-ENG%5BB%5DDRC1750%5Bpd%5D.p.sfm' },
    { name: 'EST', id: 17, url: 'https://raw.githubusercontent.com/cmahte/ENG-B-Haydock1883-pd-PSFM/master/19-EST-ENG%5BB%5DDRC1750%5Bpd%5D.p.sfm' },
    { name: 'WIS', id: 69, url: 'https://raw.githubusercontent.com/cmahte/ENG-B-Haydock1883-pd-PSFM/master/25-WIS-ENG%5BB%5DDRC1750%5Bpd%5D.p.sfm' },
    { name: 'SIR', id: 70, url: 'https://raw.githubusercontent.com/cmahte/ENG-B-Haydock1883-pd-PSFM/master/26-SIR-ENG%5BB%5DDRC1750%5Bpd%5D.p.sfm' },
    { name: 'BAR', id: 71, url: 'https://raw.githubusercontent.com/cmahte/ENG-B-Haydock1883-pd-PSFM/master/30-BAR-ENG%5BB%5DDRC1750%5Bpd%5D.p.sfm' },
    { name: 'DAN', id: 27, url: 'https://raw.githubusercontent.com/cmahte/ENG-B-Haydock1883-pd-PSFM/master/32-DAN-ENG%5BB%5DDRC1750%5Bpd%5D.p.sfm' },
    { name: '1MA', id: 72, url: 'https://raw.githubusercontent.com/cmahte/ENG-B-Haydock1883-pd-PSFM/master/45-1MA-ENG%5BB%5DDRC1750%5Bpd%5D.p.sfm' },
    { name: '2MA', id: 73, url: 'https://raw.githubusercontent.com/cmahte/ENG-B-Haydock1883-pd-PSFM/master/46-2MA-ENG%5BB%5DDRC1750%5Bpd%5D.p.sfm' },
];

function fetchUrl(url) {
    return new Promise((resolve, reject) => {
        https.get(url, (res) => {
            if (res.statusCode < 200 || res.statusCode >= 300) {
                return reject(new Error(`Status Code: ${res.statusCode}`));
            }
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => resolve(data));
        }).on('error', reject);
    });
}

function escapeCsvField(field) {
    if (field === null || field === undefined) return '';
    const stringField = String(field);
    if (stringField.includes('"') || stringField.includes(',') || stringField.includes('\n')) {
        return `"${stringField.replace(/"/g, '""')}"`;
    }
    return stringField;
}

async function run() {
    // 1. Load verse ID map from verses_catholic.csv
    console.log("Loading verse mappings...");
    const verseMap = new Map(); // "bookId:chapter:verse" => verse_id
    if (fs.existsSync(VERSES_CSV_PATH)) {
        const versesCsv = fs.readFileSync(VERSES_CSV_PATH, 'utf-8');
        const lines = versesCsv.split('\n');
        for (let i = 1; i < lines.length; i++) { // Skip header
            const line = lines[i].trim();
            if (!line) continue;
            // id,book_id,chapter,verse,text
            // Need to parse CSV carefully to avoid splitting on commas inside quotes
            const row = [];
            let inQuotes = false;
            let currentField = '';
            for (let j = 0; j < line.length; j++) {
                const char = line[j];
                if (char === '"') {
                    inQuotes = !inQuotes;
                } else if (char === ',' && !inQuotes) {
                    row.push(currentField);
                    currentField = '';
                } else {
                    currentField += char;
                }
            }
            row.push(currentField);
            
            if (row.length >= 4) {
                const id = row[0];
                const bookId = row[1];
                const chapter = row[2];
                const verse = row[3];
                verseMap.set(`${bookId}:${chapter}:${verse}`, id);
            }
        }
        console.log(`Loaded ${verseMap.size} Catholic verses for mapping.`);
    } else {
        console.error("verses_catholic.csv not found! Must run after bible expansion.");
        return;
    }

    // 2. Process each Haydock SFM file
    let commentariesOutput = "id,verse_id,author,text,source\n";
    let commentaryId = 66000; // Start ID safely past the 65583 from Protestant commentaries
    let matchesCount = 0;

    for (const book of HAYDOCK_FILES) {
        console.log(`Fetching ${book.name} from Haydock repository...`);
        try {
            const data = await fetchUrl(book.url);
            
            // Format of footnote:
            // \f + \fr 1:2\ft Year of the World 3283, Year before Christ 721.\f*
            // Sometime they span multiple lines, so we parse carefully.
            
            const regex = /\\f[^+]*\+ \s*\\fr (\d+):(\d+(?:-\d+)?)\s*\\ft ([\s\S]*?)\\f\*/g;
            let match;
            
            while ((match = regex.exec(data)) !== null) {
                const chapter = match[1];
                const verseStr = match[2]; // e.g. "2" or "2-3"
                // Clean up the text by removing line breaks and extra spaces
                const text = match[3].replace(/\n/g, ' ').replace(/\s+/g, ' ').trim();
                
                // For ranges like "1-3", map it to the first verse. It's common in commentaries.
                const firstVerse = verseStr.split('-')[0];
                
                const lookupKey = `${book.id}:${chapter}:${firstVerse}`;
                const mappedVerseId = verseMap.get(lookupKey);
                
                if (mappedVerseId) {
                    commentariesOutput += `${commentaryId},${mappedVerseId},Rev. George Leo Haydock,${escapeCsvField(text)},Haydock Catholic Bible Commentary (1859)\n`;
                    commentaryId++;
                    matchesCount++;
                } else {
                    // Only log warnings for entirely new Catholic books where we expect a match.
                    // For Esther/Daniel, there are missing matches because Haydock has the full book 
                    // and we only appended the deuterocanonical chapter/verse additions.
                    if (book.id !== 17 && book.id !== 27) {
                        // console.log(`Warning: Could not map ${book.name} ${chapter}:${firstVerse}`);
                    }
                }
            }
        } catch(err) {
            console.error(`Error processing ${book.name}:`, err.message);
        }
    }

    // 3. Write output
    fs.writeFileSync(OUTPUT_CSV_PATH, commentariesOutput);
    console.log(`Successfully generated ${OUTPUT_CSV_PATH} with ${matchesCount} commentary entries.`);
}

run();
