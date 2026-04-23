import Database from 'better-sqlite3';
import { writeFileSync } from 'fs';
import { join } from 'path';

const db = new Database('./data/armorlight.db');

const entries = db.prepare(`
  SELECT id, verse_id, author, text, source 
  FROM commentaries 
  WHERE author LIKE '%Revised%'
`).all();

const csvHeader = 'id,verse_id,author,text,source\n';
const csvRows = entries.map(row => {
  // Simple CSV escaping for text (quotes and double quotes)
  const escapedText = row.text.replace(/"/g, '""');
  return `${row.id},${row.verse_id},"${row.author}","${escapedText}","${row.source}"`;
}).join('\n');

const outputPath = join(process.cwd(), 'exports', 'commentaries_revised.csv');
writeFileSync(outputPath, csvHeader + csvRows);

console.log(`Successfully exported ${entries.length} modernized entries to ${outputPath}`);
db.close();
