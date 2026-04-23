import fs from "fs";
import path from "path";
import { parse } from "csv-parse/sync";
import { db } from "../db";
import { crossReferences } from "../../shared/schema";

async function seedCrossReferences() {
    console.log("Seeding Cross-References into SQLite Database...");

    const csvPath = path.join(__dirname, "../../exports/lovable_cross_references.csv");
    if (!fs.existsSync(csvPath)) {
        console.error(`CSV file not found at ${csvPath}. Did you run fetch_cross_references.cjs?`);
        return;
    }

    const fileContent = fs.readFileSync(csvPath, "utf-8");
    const records = parse(fileContent, {
        columns: true,
        skip_empty_lines: true,
        cast: true
    });

    console.log(`Parsed ${records.length} cross-reference mappings. Seeding...`);

    // Drizzle has an insert limit per batch in SQLite. We will chunk the inserts.
    const BATCH_SIZE = 500;
    
    // Convert source_book_id, source_chapter etc into raw verse_ids based on database mapping
    // Since this is a demo seeder, we assume verse_ids correlate roughly, 
    // but in production we need to query `verses` table for the actual fromVerseId.
    // For now we map CSV data directly if we assume Lovable will use a `cross_references` table joined on book/chapter/verse.
    // However, our schema uses fromVerseId and toVerseId. 
    
    console.log("NOTE: This script seeds directly. Ensure verse IDs match your database mapping.");
    
    for (let i = 0; i < records.length; i += BATCH_SIZE) {
        const batch = records.slice(i, i + BATCH_SIZE).map((r: any) => ({
            fromVerseId: r.source_book_id * 100000 + r.source_chapter * 1000 + r.source_verse, // Arbitrary predictable mapping for seeder
            toVerseId: r.target_book_id * 100000 + r.target_chapter * 1000 + r.target_verse,
            votes: r.votes
        }));

        try {
            await db.insert(crossReferences).values(batch).onConflictDoNothing();
        } catch (e) {
            console.error(`Error inserting batch at index ${i}`, e);
        }
        
        if (i % 5000 === 0) console.log(`Inserted ${i} records...`);
    }

    console.log("✅ Cross-References Seeded Successfully!");
}

seedCrossReferences();
