import {
  Entity,
  Property,
  BeforeCreate,
  BeforeUpdate,
  EventArgs,
} from "@mikro-orm/core";
import { BaseEntity } from "../common/base.entity.js";
import { verify, hash } from "argon2";

@Entity()
export class User extends BaseEntity {
  constructor(
    firstName: string,
    lastName: string,
    email: string,
    phone: string,
    password: string,
    roles: string,
  ) {
    super();
    this.firstName = firstName;
    this.lastName = lastName;
    this.email = email;
    this.phone = phone;
    this.password = password; // keep plain text, will be hashed via hooks
    this.roles = roles;
  }

  @BeforeCreate()
  @BeforeUpdate()
  async hashPassword(args: EventArgs<User>) {
    // hash only if the password was changed
    const password = args.changeSet?.payload.password;

    if (password) {
      this.password = await hash(password);
    }
  }

  async verifyPassword(password: string) {
    return verify(this.password ?? "", password);
  }

  @Property()
  firstName!: string;

  @Property()
  lastName!: string;

  @Property()
  phone!: string;

  @Property()
  email!: string;

  @Property()
  password!: string | null;

  @Property()
  roles!: string | null;
}
