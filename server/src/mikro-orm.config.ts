import { defineConfig } from "@mikro-orm/core"; // Note the package change for v6
import { TsMorphMetadataProvider } from "@mikro-orm/reflection";
import { SeedManager } from "@mikro-orm/seeder";
import { SqliteDriver } from "@mikro-orm/sqlite";

export default defineConfig({
  driver: SqliteDriver,
  dbName: "squaredance.db",
  entities: ["dist/**/*.entity.js"],
  entitiesTs: ["src/**/*.entity.ts"],
  metadataProvider: TsMorphMetadataProvider,
  debug: true,
  extensions: [SeedManager],
  migrations: {
    path: "./src/migrations",
    tableName: "mikro_orm_migrations",
  },
});
