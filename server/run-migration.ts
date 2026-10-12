import { MikroORM } from "@mikro-orm/core";
import config from "./src/mikro-orm.config.js";

async function run() {
  console.log("🔄 Initializing MikroORM instances...");

  // 1. Connect to your backup database
  const oldOrm = await MikroORM.init({
    ...config,
    dbName: "squaredance.db", // 👈 Path to your saved backup
    allowGlobalContext: true,
  });

  // 2. Connect to the new database file
  const newOrm = await MikroORM.init({
    ...config,
    dbName: "new_squaredance.db", // 👈 Path where the new DB will be created
    allowGlobalContext: true,
  });

  try {
    console.log("🏗️ Creating fresh schema in the new database...");
    const generator = newOrm.schema;
    await generator.ensureDatabase();
    await generator.dropSchema(); // Clear it if it already exists
    await generator.createSchema(); // Generates the new schema with the nullable field

    // 3. Disable foreign key constraints during migration to avoid insertion order errors
    console.log("🔓 Disabling foreign key checks for migration...");
    await newOrm.em.getConnection().execute("PRAGMA foreign_keys = OFF;");

    // 4. Get all registered entities dynamically from Mikro-ORM metadata
    const metadata = oldOrm.getMetadata().getAll();
    const entityNames = Object.keys(metadata);

    for (const entityName of entityNames) {
      const meta = metadata[entityName];
      if (meta.embeddable || meta.virtual) continue;

      console.log(`📦 Migrating table data for: ${meta.className}...`);

      // Fetch all raw data from the old database to bypass entity state maps
      const oldData = await oldOrm.em
        .getConnection()
        .execute(`SELECT * FROM ${meta.collection}`);

      if (oldData.length === 0) {
        console.log(`ℹ️ ${meta.className} is empty. Skipping.`);
        continue;
      }

      // Generate localized column placeholders for raw insertion
      const columns = Object.keys(oldData[0]).join(", ");
      const placeholders = Object.keys(oldData[0])
        .map(() => "?")
        .join(", ");

      // Insert rows in bulk into the new database
      for (const row of oldData) {
        const values = Object.values(row);
        await newOrm.em
          .getConnection()
          .execute(
            `INSERT INTO ${meta.collection} (${columns}) VALUES (${placeholders})`,
            values,
          );
      }

      console.log(
        `✅ Successfully copied ${oldData.length} rows for ${meta.className}.`,
      );
    }

    // 5. Re-enable foreign key constraints
    console.log("🔒 Re-enabling foreign key checks...");
    await newOrm.em.getConnection().execute("PRAGMA foreign_keys = ON;");

    console.log("🎉 Migration completed successfully! All data ported safely.");
  } catch (error) {
    console.error("❌ Data migration failed:", error);
  } finally {
    await oldOrm.close();
    await newOrm.close();
  }
}

run();
