import type { EntityManager } from "@mikro-orm/core";
import { Seeder } from "@mikro-orm/seeder";
import { User } from "../modules/user/user.entity.js";
import { RolesType } from "../modules/role/roleType.js";

export class TestSeeder extends Seeder {
  async run(em: EntityManager): Promise<void> {
    em.create(User, {
      firstName: "First",
      lastName: "Name",
      phone: "12345",
      email: "test@yahoo.com",
      password: "1234",
      roles: RolesType.AdminModifier,
    });
  }
}
