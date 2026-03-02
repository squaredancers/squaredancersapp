import { Entity, ManyToOne, Property } from "@mikro-orm/core";
import { BaseEntity } from "../common/base.entity.js";
import { User } from "../user/user.entity.js";

@Entity()
export class Caller extends BaseEntity {
  @ManyToOne(() => User)
  user!: User;

  @Property()
  hourlyRate!: number;

  @Property()
  active!: boolean;
}
