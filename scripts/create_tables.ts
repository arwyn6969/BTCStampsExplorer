
import "$/server/config/env.ts";
import { dbManager } from "$server/database/databaseManager.ts";

async function createTables() {
  console.log("Initializing database connection for schema creation...");
  await dbManager.initialize();

  try {
    console.log("Creating tables...");

    // 1. creators table
    await dbManager.executeQuery(`
      CREATE TABLE IF NOT EXISTS creator (
        address VARCHAR(255) PRIMARY KEY,
        creator VARCHAR(255),
        INDEX (creator)
      )
    `, []);
    console.log("Created 'creator' table");

    // 2. src101_owners table - Corrected with 'tick' column
    await dbManager.executeQuery(`
      CREATE TABLE IF NOT EXISTS src101_owners (
        id INT AUTO_INCREMENT PRIMARY KEY,
        owner VARCHAR(255),
        tokenid_utf8 VARCHAR(255),
        prim TINYINT(1),
        expire_timestamp BIGINT,
        last_update VARCHAR(255),
        deploy_hash VARCHAR(64),
        p VARCHAR(255),
        tokenid VARCHAR(255),
        tick VARCHAR(255),
        \`index\` INT,
        INDEX (owner),
        INDEX (deploy_hash),
        INDEX (tick)
      )
    `, []);
    console.log("Created 'src101_owners' table");

    // 3. stamps table
    await dbManager.executeQuery(`
      CREATE TABLE IF NOT EXISTS stamps (
        stamp BIGINT PRIMARY KEY,
        tx_hash VARCHAR(64),
        creator VARCHAR(255),
        block_index BIGINT,
        cpid VARCHAR(255),
        stamp_hash VARCHAR(255),
        stamp_url VARCHAR(255),
        stamp_mimetype VARCHAR(255),
        ident VARCHAR(255) DEFAULT 'STAMP',
        INDEX (creator),
        INDEX (cpid),
        INDEX (tx_hash)
      )
    `, []);
    console.log("Created 'stamps' table");

    // 4. collection_stamps (needed for some queries)
    await dbManager.executeQuery(`
      CREATE TABLE IF NOT EXISTS collection_stamps (
        collection_id BINARY(16),
        stamp BIGINT,
        PRIMARY KEY (collection_id, stamp)
      )
    `, []);
    console.log("Created 'collection_stamps' table");

    console.log("✅ Schema creation complete!");

  } catch (error) {
    console.error("Schema creation failed:", error);
  } finally {
    console.log("Closing connection...");
    Deno.exit(0);
  }
}

createTables();
