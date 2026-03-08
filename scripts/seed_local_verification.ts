
import "$/server/config/env.ts";
import { dbManager } from "$server/database/databaseManager.ts";

const ADDRESS = "bc1qtestvisual123456789";
const MANUAL_NAME = "ARWYN";
const SRC101_NAME = "VisualVerified.btc";
const STAMP_ID = 999999999;

async function seed() {
  console.log("Initializing database connection...");
  await dbManager.initialize();

  try {
    console.log(`Seeding conflict for address: ${ADDRESS}`);

    // 1. Insert Manual Name (The Conflict)
    console.log(`Inserting into creators: ${MANUAL_NAME}`);
    await dbManager.executeQuery(
      `INSERT INTO creator (address, creator) VALUES (?, ?) ON DUPLICATE KEY UPDATE creator = ?`,
      [ADDRESS, MANUAL_NAME, MANUAL_NAME]
    );

    // 2. Insert SRC101 Name (The Expected Winner)
    // We need 'prim'=1 and valid timestamp
    const futureTime = Math.floor(Date.now() / 1000) + 3600; // 1 hour from now

    // Check if we need to insert dummy valid tx or owner
    // Just inserting into src101_owners should be enough for getPrimaryDomainForAddress
    console.log(`Inserting into src101_owners: ${SRC101_NAME}`);
    // Note: We need a dummy deploy_hash and tokenid_utf8
    await dbManager.executeQuery(
      `INSERT INTO src101_owners
       (owner, tokenid_utf8, prim, expire_timestamp, last_update, deploy_hash, p, tokenid, \`index\`)
       VALUES (?, ?, 1, ?, ?, 'hash', 'src-101', 'token', 1)
       ON DUPLICATE KEY UPDATE tokenid_utf8 = ?`,
      [ADDRESS, "VisualVerified", futureTime, Math.floor(Date.now()/1000), "VisualVerified"]
    );

    // 3. Insert a Stamp so it appears in UI (via /stamp/[id])
    console.log(`Inserting stamp: ${STAMP_ID}`);
    await dbManager.executeQuery(
      `INSERT INTO stamps
       (stamp, tx_hash, creator, block_index, cpid, stamp_hash, stamp_url, stamp_mimetype)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE creator = ?`,
      [STAMP_ID, "tx_hash_visual", ADDRESS, 100000, "A123456789", "stamphashvisual", "https://stampchain.io/stamps/0.png", "image/png", ADDRESS]
    );

    console.log("✅ Seed complete! You can now verify at http://localhost:8000/stamp/" + STAMP_ID);

  } catch (error) {
    console.error("Seed failed:", error);
  } finally {
    // Force close to exit script
    console.log("Closing connection...");
    Deno.exit(0);
  }
}

seed();
