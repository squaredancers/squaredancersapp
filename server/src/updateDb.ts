import { MikroORM } from "@mikro-orm/core";

const seedIt = async () => {
  const orm = await MikroORM.init();

  await orm.schema.updateSchema();

  orm.close();
};

seedIt();
