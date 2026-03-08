
import "$/server/config/env.ts";
import { dbManager } from "$server/database/databaseManager.ts";

// REAL DATA from Stamp 1374849 (Fetched via curl)
const STAMP_ID = 1374849;
const CREATOR_ADDR = "bc1qujj5tuh5pdx6ezhauw0daxvhhmnqnhaxvsayf9";
const TX_HASH = "60c0c9a8dc7b4f3a857a66fd1e8032da5c10f41e76d08d1e4c9f7d652edf749a";
const STAMP_URL = "https://stampchain.io/stamps/60c0c9a8dc7b4f3a857a66fd1e8032da5c10f41e76d08d1e4c9f7d652edf749a.png";
const CPID = "A303012015459266100";

// CONFLICT SETUP
const MANUAL_DB_NAME = "ARWYN";      // The "Bug" name
const REAL_CHAIN_NAME = "BitcoinFan.btc"; // The "Correct" name (Simulated SRC101)

async function seed() {
  console.log("Initializing database connection...");
  await dbManager.initialize();

  try {
    console.log(`Seeding REAL stamp ${STAMP_ID} with conflict...`);

    // 1. Insert Legacy/Manual Name (The Conflict Source)
    await dbManager.executeQuery(
      `INSERT INTO creator (address, creator) VALUES (?, ?) ON DUPLICATE KEY UPDATE creator = ?`,
      [CREATOR_ADDR, MANUAL_DB_NAME, MANUAL_DB_NAME]
    );

    // 2. Insert SRC101 Bitname (The Expected Winner)
    const futureTime = Math.floor(Date.now() / 1000) + 3600;
    await dbManager.executeQuery(
      `INSERT INTO src101_owners
       (owner, tokenid_utf8, prim, expire_timestamp, last_update, deploy_hash, p, tokenid, tick, \`index\`)
       VALUES (?, ?, 1, ?, ?, 'real_deploy_hash', 'src-101', 'realtoken', 'btc', 1)
       ON DUPLICATE KEY UPDATE tokenid_utf8 = ?`,
      [CREATOR_ADDR, REAL_CHAIN_NAME, futureTime, Math.floor(Date.now()/1000), REAL_CHAIN_NAME]
    );

    // 3. Insert The Real Stamp Record
    await dbManager.executeQuery(
      `INSERT INTO stamps
       (stamp, tx_hash, creator, block_index, cpid, stamp_hash, stamp_url, stamp_mimetype)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE creator = ?`,
      [STAMP_ID, TX_HASH, CREATOR_ADDR, 930934, CPID, "rFCJfSmaaU9Mycsj80ma", STAMP_URL, "image/png", CREATOR_ADDR]
    );

    console.log("✅ Seed complete!");
    console.log(`Test URL: http://localhost:8000/stamp/${STAMP_ID}`);

  } catch (error) {
    console.error("Seed failed:", error);
  } finally {
    console.log("Closing connection...");
    Deno.exit(0);
  }
}

seed();
