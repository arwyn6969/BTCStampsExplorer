
import "$/server/config/env.ts";
import { dbManager } from "$server/database/databaseManager.ts";

async function dumpData() {
  console.log("Connecting onto Local DB...");
  await dbManager.initialize();

  try {
    console.log("\n=== 1. MANUAL DATABASE LIST (legacy/overrides) ===");
    console.log("Table: 'creator'");
    const creators = await dbManager.executeQuery(`SELECT * FROM creator`, []);
    console.table(creators);

    console.log("\n=== 2. BLOCKCHAIN LIST (SRC101/Bitnames) ===");
    console.log("Table: 'src101_owners'");
    const bitnames = await dbManager.executeQuery(`SELECT owner, tokenid_utf8, deploy_hash FROM src101_owners`, []);
    console.table(bitnames);

    console.log("\n-------------------------------------------");
    console.log("VERIFICATION NOTE:");
    console.log("If the website shows the name from List #2 instead of List #1,");
    console.log("then the fix is WORKING (Blockchain prioritizes over Manual).");

  } catch (error) {
    console.error("Dump failed:", error);
  } finally {
    Deno.exit(0);
  }
}

dumpData();
