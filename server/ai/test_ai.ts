
import { tools } from "./tools";

async function runTests() {
    console.log("🧪 Testing AI Tools...");

    // 1. Test Search
    const searchTool = tools.find(t => t.name === "search_scripture") as any;
    if (searchTool) {
        console.log("\n🔎 Testing search_scripture('grace')...");
        const results = await searchTool.execute({ query: "grace", limit: 3 });
        console.log("Results:", results);
    }

    // 2. Test Strong's
    const strongsTool = tools.find(t => t.name === "lookup_strongs") as any;
    if (strongsTool) {
        console.log("\n📖 Testing lookup_strongs('H2617')..."); // Chesed (Mercy/Grace)
        const def = await strongsTool.execute({ strongsNumber: "H2617" });
        console.log("Definition:", def);
    }

    // 3. Test Context Links
    const contextTool = tools.find(t => t.name === "find_contextual_links") as any;
    if (contextTool) {
        // Gen 1:1 is ID 1
        console.log("\n🔗 Testing find_contextual_links(1) [Gen 1:1]...");
        const context = await contextTool.execute({ verseId: 1 });
        console.log("Context:", JSON.stringify(context, null, 2).substring(0, 500) + "...");
    }

    console.log("\n✅ Tests Complete");
}

runTests().catch(console.error);
