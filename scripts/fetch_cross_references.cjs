const fs = require('fs');
const path = require('path');
const readline = require('readline');

const INPUT_TXT = path.join(__dirname, '../exports/tsk/cross_references.txt');
const OUTPUT_CSV = path.join(__dirname, '../exports/lovable_cross_references.csv');

// Mapping typical OSIS / OpenBible abbreviations to our internal numerical Book IDs.
const BOOK_ABBREVIATIONS = {
    "Gen": 1, "Exod": 2, "Lev": 3, "Num": 4, "Deut": 5, "Josh": 6, "Judg": 7, "Ruth": 8,
    "1Sam": 9, "2Sam": 10, "1Kgs": 11, "2Kgs": 12, "1Chr": 13, "2Chr": 14, "Ezra": 15, "Neh": 16,
    "Esth": 17, "Job": 18, "Ps": 19, "Prov": 20, "Eccl": 21, "Song": 22, "Isa": 23, "Jer": 24,
    "Lam": 25, "Ezek": 26, "Dan": 27, "Hos": 28, "Joel": 29, "Amos": 30, "Obad": 31, "Jonah": 32,
    "Mic": 33, "Nah": 34, "Hab": 35, "Zeph": 36, "Hag": 37, "Zech": 38, "Mal": 39,
    "Matt": 40, "Mark": 41, "Luke": 42, "John": 43, "Acts": 44, "Rom": 45, "1Cor": 46, "2Cor": 47,
    "Gal": 48, "Eph": 49, "Phil": 50, "Col": 51, "1Thess": 52, "2Thess": 53, "1Tim": 54, "2Tim": 55,
    "Titus": 56, "Phlm": 57, "Heb": 58, "Jas": 59, "1Pet": 60, "2Pet": 61, "1John": 62, "2John": 63,
    "3John": 64, "Jude": 65, "Rev": 66
};

function parseVerseRef(ref) {
    // Expected format: Gen.1.1
    const parts = ref.split('.');
    if (parts.length < 3) return null;
    const bookAbbr = parts[0];
    const chapter = parseInt(parts[1], 10);
    const verse = parseInt(parts[2], 10);
    
    const bookId = BOOK_ABBREVIATIONS[bookAbbr];
    if (!bookId || isNaN(chapter) || isNaN(verse)) return null;

    return { bookId, chapter, verse };
}

async function processLocalFile() {
    console.log("Processing local Treasury of Scripture Knowledge (TSK) Cross-References...");
    console.log(`Reading from: ${INPUT_TXT}`);

    if (!fs.existsSync(INPUT_TXT)) {
        console.error(`Input file not found: ${INPUT_TXT}`);
        return;
    }

    const outStream = fs.createWriteStream(OUTPUT_CSV);
    // Write CSV Header
    outStream.write("source_book_id,source_chapter,source_verse,target_book_id,target_chapter,target_verse,votes\n");

    const rl = readline.createInterface({
        input: fs.createReadStream(INPUT_TXT),
        crlfDelay: Infinity
    });

    let lineCount = 0;
    let successCount = 0;

    rl.on('line', (line) => {
        lineCount++;
        if (lineCount === 1 || line.startsWith("From Verse")) return; // Skip header

        // Format: From Verse \t To Verse \t Votes
        const parts = line.split('\t');
        if (parts.length < 3) return;

        const fromRef = parts[0].trim();
        const toRef = parts[1].trim();
        let votes = parseInt(parts[2].trim(), 10) || 0;

        const source = parseVerseRef(fromRef);
        const target = parseVerseRef(toRef);

        if (source && target) {
            if (votes >= 1) { 
                outStream.write(`${source.bookId},${source.chapter},${source.verse},${target.bookId},${target.chapter},${target.verse},${votes}\n`);
                successCount++;
            }
        }
    });

    rl.on('close', () => {
        outStream.end();
        console.log(`\n✅ Cross-Reference Processing Complete!`);
        console.log(`Processed ${lineCount} raw lines.`);
        console.log(`Exported ${successCount} high-quality cross-references to: ${OUTPUT_CSV}`);
    });
}

processLocalFile();
