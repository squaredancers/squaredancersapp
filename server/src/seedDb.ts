import { MikroORM } from "@mikro-orm/core";
import { TestSeeder } from "./seeders/TestSeeder.js";

const seedIt = async () => {
  const orm = await MikroORM.init();

  //await orm.schema.updateSchema();
  await orm.schema.createSchema();
  await orm.seeder.seed(TestSeeder);

  orm.close();
};

seedIt();
