const fs = require('fs');
const path = require('path');

// --- Configuration ---

const CATHOLIC_BOOKS = [
    { id: 67, name: 'Tobit', type: 'macc-json', url: 'https://raw.githubusercontent.com/scrollmapper/bible_databases_deuterocanonical/master/sources/en/book-of-tobit/book-of-tobit.json' },
    { id: 68, name: 'Judith', type: 'macc-json', url: 'https://raw.githubusercontent.com/scrollmapper/bible_databases_deuterocanonical/master/sources/en/book-of-judith/book-of-judith.json' },
    { id: 69, name: 'Wisdom of Solomon', type: 'macc-json', url: 'https://raw.githubusercontent.com/scrollmapper/bible_databases_deuterocanonical/master/sources/en/wisdom-of-solomon/wisdom-of-solomon.json' },
    { id: 70, name: 'Sirach', type: 'macc-json', url: 'https://raw.githubusercontent.com/scrollmapper/bible_databases_deuterocanonical/master/sources/en/book-of-sirach/book-of-sirach.json' },
    { id: 71, name: 'Baruch', type: 'macc-json', url: 'https://raw.githubusercontent.com/scrollmapper/bible_databases_deuterocanonical/master/sources/en/1-baruch/1-baruch.json' },
    { id: 72, name: '1 Maccabees', type: 'macc-json', url: 'https://raw.githubusercontent.com/scrollmapper/bible_databases_deuterocanonical/master/sources/en/1-maccabees/1-maccabees.json' },
    { id: 73, name: '2 Maccabees', type: 'macc-json', url: 'https://raw.githubusercontent.com/scrollmapper/bible_databases_deuterocanonical/master/sources/en/2-maccabees/2-maccabees.json' },
    { id: 74, name: 'Additions to Esther', type: 'macc-json', url: 'https://raw.githubusercontent.com/scrollmapper/bible_databases_deuterocanonical/master/sources/en/greek-esther/greek-esther.json' },
    { id: 75, name: 'Susanna', type: 'macc-json', url: 'https://raw.githubusercontent.com/scrollmapper/bible_databases_deuterocanonical/master/sources/en/susanna/susanna.json' },
    { id: 76, name: 'Bel and the Dragon', type: 'macc-json', url: 'https://raw.githubusercontent.com/scrollmapper/bible_databases_deuterocanonical/master/sources/en/bel-and-the-dragon/bel-and-the-dragon.json' }
];

const TRANSLATIONS = [
    { lang: 'cn', name: 'CUV', type: 'csv', urls: ['https://raw.githubusercontent.com/scrollmapper/bible_databases/master/formats/csv/ChiUn.csv'] },
    { lang: 'es', name: 'RV1909', type: 'csv', urls: ['https://raw.githubusercontent.com/scrollmapper/bible_databases/master/formats/csv/SpaRV.csv'] },
    { lang: 'pt', name: 'Almeida', type: 'thiago-json', urls: ['https://raw.githubusercontent.com/thiagobodruk/bible/master/json/pt_aa.json'] },
    { lang: 'ar', name: 'Arabic', type: 'thiago-json', urls: ['https://raw.githubusercontent.com/thiagobodruk/bible/master/json/ar_svd.json'] }
];

// --- Utilities ---

async function fetchWithRetry(url, retries = 5) {
    for (let i = 0; i < retries; i++) {
        try {
            console.log(`Fetching ${url} (Attempt ${i + 1})...`);
            const response = await fetch(url);
            if (response.ok) return await response.text();
            console.warn(`HTTP ${response.status} for ${url}`);
            if (response.status === 404) return null;
        } catch (e) {
            console.error(`Error for ${url}: ${e.message}`);
        }
        await new Promise(r => setTimeout(r, 2000));
    }
    return null;
}

function parseMaccabeesJSON(jsonText) {
    const data = JSON.parse(jsonText);
    const results = [];
    data.books[0].chapters.forEach(chap => {
        chap.verses.forEach(v => {
            results.push({
                chapter: v.chapter,
                verse: v.verse,
                text: v.text
            });
        });
    });
    return results;
}

function convertThiagoJSONToCSV(jsonText) {
    const data = JSON.parse(jsonText.replace(/^\ufeff/, ''));
    let csv = "book_id,chapter,verse,text\n";
    data.forEach((book, bookIdx) => {
        const bookId = bookIdx + 1;
        book.chapters.forEach((chapter, chapIdx) => {
            const chapterNum = chapIdx + 1;
            chapter.forEach((verseText, verseIdx) => {
                const verseNum = verseIdx + 1;
                const cleanText = verseText.replace(/"/g, '""');
                csv += `${bookId},${chapterNum},${verseNum},"${cleanText}"\n`;
            });
        });
    });
    return csv;
}

// --- Main Execution ---

async function runExpansion() {
    console.log("Starting Bible Expansion Tasks...");
    if (!fs.existsSync('exports')) fs.mkdirSync('exports');

    // --- Catholic Extension (Deuterocanon) ---
    console.log("\n[1] Processing Catholic Deuterocanon...");
    const versesHeader = "id,book_id,chapter,verse,text,text_web,text_kjv\n";
    let versesData = "";
    let verseIdOffset = 31103;

    // Also update books list
    const booksHeader = "id,name,slug,testament,book_order,chapter_count\n";
    let booksDataLines = [];

    for (const book of CATHOLIC_BOOKS) {
        console.log(`Processing ${book.name}...`);
        const content = await fetchWithRetry(book.url);
        if (content) {
            const verses = parseMaccabeesJSON(content);
            let maxChapter = 0;
            for (const v of verses) {
                versesData += `${verseIdOffset},${book.id},${v.chapter},${v.verse},"${v.text.replace(/"/g, '""')}", "${v.text.replace(/"/g, '""')}", ""\n`;
                verseIdOffset++;
                if (v.chapter > maxChapter) maxChapter = v.chapter;
            }
            const slug = book.name.toLowerCase().replace(/ /g, '-');
            booksDataLines.push(`${book.id},"${book.name}",${slug},OT,${book.id},${maxChapter}`);
        } else {
            console.error(`CRITICAL: Failed to fetch ${book.name}`);
        }
    }
    
    fs.writeFileSync('exports/verses_catholic.csv', versesHeader + versesData);
    fs.writeFileSync('exports/books_catholic.csv', booksHeader + booksDataLines.join('\n'));
    console.log("Successfully saved exports/verses_catholic.csv and exports/books_catholic.csv");

    // --- International Translations ---
    console.log("\n[2] Processing International Versions...");
    for (const trans of TRANSLATIONS) {
        console.log(`\nProcessing ${trans.name} (${trans.lang})...`);
        const content = await fetchWithRetry(trans.urls[0]);
        if (content) {
            let csvText;
            if (trans.type === 'thiago-json') {
                csvText = convertThiagoJSONToCSV(content);
            } else {
                csvText = content;
            }
            fs.writeFileSync(`exports/verses_intl_${trans.lang}.csv`, csvText);
            console.log(`Successfully saved exports/verses_intl_${trans.lang}.csv`);
        } else {
            console.error(`FAILED to fetch ${trans.name}.`);
        }
    }
    
    console.log("\nExpansion complete! Check the 'exports/' folder.");
}

runExpansion().catch(console.error);
