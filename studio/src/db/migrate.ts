import "dotenv/config";

import { migrate } from "drizzle-orm/libsql/migrator";
import { get_database } from ".";

(async function () {
  const db = get_database();

  // This will run migrations on the database, skipping the ones already applied
  await migrate(db, { migrationsFolder: "./drizzle" });
})()
  .catch(console.error)
  .finally(() => {
    process.exit();
  });
